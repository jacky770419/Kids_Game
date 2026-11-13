# -*- coding: utf-8 -*-
"""故事書錄音核對（本機驅動）：把錄好的頁打包上 Kaggle，用 GPU 跑 whisper 轉寫、跟腳本比，下載結果、寫報告。
Kaggle 那邊跑的是同資料夾的 story_eval_kernel.py（比對邏輯、門檻都在那個檔的 LIB 裡）。

  python story_eval.py --new cinderella water-drop wind-sun zodiac --lang all
  python story_eval.py --new cinderella --lang zh --pages 2,7
  python story_eval.py bear-hug --lang en                    不加 --new＝讀舊的 stories.json
  python story_eval.py --new cinderella --dry                只列要核對哪些頁、查 GPU 時數，不上傳
  python story_eval.py --report-only _tts/eval/run_XXXX       用已下載的結果重寫報告（不用 GPU）
  python story_eval.py --ask questions.json                   二選一評分＋聲調檢查（Whisper 判不準時的第二意見；格式見 ASK_DOC）
  python story_eval.py --ask questions.json --report-only _tts/eval/ask_run_XXXX
中文頁另外用 SenseVoiceSmall（載不起來改 Paraformer-zh）轉一次：兩個模型在同一處都對不上才算「可疑」，只有一個對不上算「留意」。

只收已經有 mp3 的頁（中文 _tts/stories/<id>/pN.mp3、英文 _tts/stories/<id>/en/pN.mp3）。
報告：_tts/eval/report_<時間>.md／.json；Kaggle 原始輸出（含 log）留在 _tts/eval/run_<時間>/。
Kaggle 帳號讀 keys.json 的 kaggle_user／kaggle_token（路徑同 el_common.py，可用環境變數 KIDS_TTS_KEYS 覆寫），
只放進 kaggle 子行程的環境變數；kaggle 指令的輸出印出來前會把帳號遮掉。上傳的 dataset、kernel 都是 private。
Kaggle 每週約 30 小時 GPU、同時最多 2 個 GPU session；這支每次只開 1 個。
"""
import argparse
import datetime as dt
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.normpath(os.path.join(HERE, '..', '..', '_tts'))
EVAL = os.path.join(WORK, 'eval')
KEYS_PATH = os.environ.get('KIDS_TTS_KEYS', 'C:/Novel/tools/tts/keys.json')
DATASET = 'kids-story-eval'          # <帳號>/kids-story-eval（private）
KERNEL = 'kids-story-eval-run'       # <帳號>/kids-story-eval-run（private、T4）
KERNEL_FILE = os.path.join(HERE, 'story_eval_kernel.py')
LANG_NAME = {'zh': '中文', 'en': '英文'}

# ---------------------------------------------------------------- Kaggle
_cred = None


def cred():
    global _cred
    if _cred is None:
        k = json.load(open(KEYS_PATH, encoding='utf-8'))
        _cred = (k['kaggle_user'], k['kaggle_token'])
    return _cred


def mask(s):
    u, t = cred()
    return s.replace(t, '***').replace(u, '<帳號>')


def kg(*args, timeout=600):
    """跑 kaggle CLI（同一個 python 的 -m kaggle），帳密只放在子行程環境變數。回 (returncode, 遮過帳號的輸出)。"""
    u, t = cred()
    env = dict(os.environ, KAGGLE_USERNAME=u, PYTHONUTF8='1', PYTHONIOENCODING='utf-8')
    if t.startswith('KGAT_'):      # 新式 API token 走 KAGGLE_API_TOKEN（舊式 key 才是 KAGGLE_KEY）
        env['KAGGLE_API_TOKEN'] = t
        env.pop('KAGGLE_KEY', None)
    else:
        env['KAGGLE_KEY'] = t
    r = subprocess.run([sys.executable, '-m', 'kaggle', '-W', *args], env=env, capture_output=True,
                       text=True, encoding='utf-8', errors='replace', timeout=timeout)
    return r.returncode, mask((r.stdout or '') + (r.stderr or '')).strip()


def slug(name):
    return cred()[0] + '/' + name


def quota():
    """回 GPU 那一列 {used, remaining, total, refreshAt}；查不到回 None。"""
    rc, out = kg('quota', '--format', 'json', timeout=120)
    if rc != 0:
        print('查不到 Kaggle GPU 時數：', out[-300:])
        return None
    try:
        rows = json.loads(out[out.index('['):])
        return next((r for r in rows if r.get('resource') == 'GPU'), None)
    except Exception:
        print('Kaggle quota 的輸出看不懂：', out[-300:])
        return None


def hours(s):
    try:
        return float(str(s).rstrip('h'))
    except ValueError:
        return None


def quota_line(q):
    if not q:
        return '查不到'
    when = q.get('refreshAt', '')
    try:
        local = dt.datetime.fromisoformat(when).replace(tzinfo=dt.timezone.utc).astimezone().strftime('%m/%d %H:%M')
        when = f'{when}（UTC；本機時間 {local}）'
    except Exception:
        pass
    return f"已用 {q.get('used')}、剩 {q.get('remaining')}／共 {q.get('total')}，下次重置 {when}"


def kernel_state():
    rc, out = kg('kernels', 'status', slug(KERNEL), timeout=120)
    if rc != 0:
        return 'NONE' if ('404' in out or 'not found' in out.lower()) else 'UNKNOWN:' + out[-200:]
    m = re.search(r'status "?(?:KernelWorkerStatus\.)?([A-Z_]+)', out)
    return m.group(1) if m else 'UNKNOWN:' + out[-200:]


def upload_dataset(pack_dir, note):
    rc, out = kg('datasets', 'status', slug(DATASET), timeout=120)
    exists = rc == 0 and 'not found' not in out.lower() and '404' not in out
    if exists:
        rc, out = kg('datasets', 'version', '-p', pack_dir, '-m', note, '-d', timeout=1800)
    else:
        rc, out = kg('datasets', 'create', '-p', pack_dir, timeout=1800)     # 沒加 --public＝private
    print('  ', out.splitlines()[-1] if out else rc)
    if rc != 0 or 'error' in out.lower():
        raise SystemExit('上傳 dataset 失敗：\n' + out[-1500:])
    for _ in range(60):          # 等 Kaggle 處理完（通常一兩分鐘）
        rc, out = kg('datasets', 'status', slug(DATASET), timeout=120)
        if 'ready' in out.lower():
            return
        time.sleep(10)
    raise SystemExit('dataset 十分鐘還沒 ready：' + out[-300:])


def push_kernel():
    with tempfile.TemporaryDirectory() as d:       # 中繼資料要寫帳號，放暫存資料夾、推完就刪
        shutil.copy(KERNEL_FILE, os.path.join(d, 'story_eval_kernel.py'))
        meta = {'id': slug(KERNEL), 'title': KERNEL.replace('-', ' '), 'code_file': 'story_eval_kernel.py',
                'language': 'python', 'kernel_type': 'script', 'is_private': True, 'enable_gpu': True,
                'enable_tpu': False, 'enable_internet': True, 'machine_shape': 'NvidiaTeslaT4',
                'dataset_sources': [slug(DATASET)], 'competition_sources': [], 'kernel_sources': [], 'model_sources': []}
        json.dump(meta, open(os.path.join(d, 'kernel-metadata.json'), 'w', encoding='utf-8'), indent=1)
        rc, out = kg('kernels', 'push', '-p', d, timeout=600)
    print('  ', out.splitlines()[-1] if out else rc)
    if rc != 0 or 'error' in out.lower():
        raise SystemExit('推 kernel 失敗：\n' + out[-1500:])


def wait_kernel(t0, timeout_min):
    last, active = None, False
    while True:
        st = kernel_state()
        mins = (time.time() - t0) / 60
        if st != last:
            print(f'  {dt.datetime.now():%H:%M:%S}（{mins:.1f} 分）{st}', flush=True)
            last = st
        active = active or st in ('QUEUED', 'RUNNING')
        # 剛推完的頭幾分鐘，狀態可能還是上一次的 COMPLETE：沒看到 QUEUED／RUNNING 前先不信
        if st in ('COMPLETE', 'ERROR', 'CANCEL_ACKNOWLEDGED', 'CANCEL_REQUESTED', 'CANCELLED') and (active or mins > 3):
            return st
        if mins > timeout_min:
            print(f'  等超過 {timeout_min} 分鐘，先停止等待（kernel 可能還在跑；之後可用 kaggle kernels output 取回）')
            return 'TIMEOUT'
        time.sleep(30)


def log_tail(run_dir, n=3000):
    for f in os.listdir(run_dir):
        if f.endswith('.log'):
            raw = open(os.path.join(run_dir, f), encoding='utf-8', errors='replace').read()
            try:
                txt = ''.join(x.get('data', '') for x in json.loads(raw))
            except Exception:
                txt = raw
            return mask(txt[-n:])
    return '（沒有 log）'


# ---------------------------------------------------------------- 故事與音檔
def load_stories(new):
    if new:
        d = os.path.join(HERE, 'stories-new')
        out = {}
        for f in sorted(os.listdir(d)):
            if f.endswith('.json') and not f.startswith('_'):
                s = json.load(open(os.path.join(d, f), encoding='utf-8'))
                out[s['id']] = s
        return out
    return {s['id']: s for s in json.load(open(os.path.join(HERE, 'stories.json'), encoding='utf-8'))['stories']}


def mp3_path(sid, lang, n):
    base = os.path.join(WORK, 'stories', sid)
    return os.path.join(base, f'p{n}.mp3') if lang == 'zh' else os.path.join(base, 'en', f'p{n}.mp3')


def collect(stories, ids, langs, pages):
    items = []
    for sid in ids:
        s = stories[sid]
        for lang in langs:
            for n, pg in enumerate(s['pages'], 1):
                if pages and n not in pages:
                    continue
                f = mp3_path(sid, lang, n)
                if not os.path.exists(f):
                    continue
                items.append({'key': f'{sid}|{lang}|p{n}', 'sid': sid, 'lang': lang, 'page': n, 'src': f,
                              'file': f'{sid}__{lang}__p{n}.mp3',
                              'lines': [{'who': l.get('who', ''), 'text': l['text'] if lang == 'zh' else l.get('en', '')}
                                        for l in pg['lines']]})
    return items


def run_on_kaggle(manifest, files, run_dir, result_name, timeout_min):
    """打包 files（[(本機路徑, 上傳檔名)]）＋manifest 成 dataset、推 kernel、等它跑完、下載。回 (結果 dict, 分鐘)。"""
    run_id = manifest['run_id']
    print('打包上傳 dataset …')
    with tempfile.TemporaryDirectory() as pack:
        for src, name in files:
            shutil.copy(src, os.path.join(pack, name))
        json.dump(manifest, open(os.path.join(pack, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False)
        json.dump({'title': DATASET.replace('-', ' '), 'id': slug(DATASET), 'licenses': [{'name': 'other'}]},
                  open(os.path.join(pack, 'dataset-metadata.json'), 'w', encoding='utf-8'))
        upload_dataset(pack, 'run ' + run_id)
    t0 = time.time()
    for attempt in (1, 2):
        print('推 kernel（GPU T4）…')
        push_kernel()
        time.sleep(20)
        st = wait_kernel(t0, timeout_min)
        kg('kernels', 'output', slug(KERNEL), '-p', run_dir, '-o', timeout=600)
        f = os.path.join(run_dir, result_name)
        if st != 'COMPLETE' or not os.path.exists(f):
            print('kernel 沒有正常跑完：', st)
            print(log_tail(run_dir))
            raise SystemExit(1)
        res = json.load(open(f, encoding='utf-8'))
        if res.get('run_id') == run_id:
            return res, (time.time() - t0) / 60
        print(f"kernel 讀到的是舊資料（{res.get('run_id')}），一分鐘後重推")   # Kaggle 偶爾會拿到上一版 dataset
        time.sleep(60)
    raise SystemExit('兩次都讀到舊的 dataset，請稍後再跑')


def preflight(q_need=0.5):
    q0 = quota()
    print('Kaggle 本週 GPU：', quota_line(q0))
    return q0


def check_can_run(q0):
    if q0 and (hours(q0.get('remaining')) or 0) < 0.5:
        raise SystemExit('本週 GPU 剩不到半小時，先不跑')
    st = kernel_state()
    if st in ('RUNNING', 'QUEUED'):
        raise SystemExit(f'上一次的 kernel 還在跑（{st}），等它跑完再來')


# ---------------------------------------------------------------- 報告
def esc(s):
    return str(s).replace('|', '／').replace('\n', ' ')


def fmt_err(e):
    k = e['kind']
    if k in ('漏念',):
        return f"漏念「{e['ref']}」"
    if k in ('多念', '辨識幻覺'):
        return f"{k}「{e['hyp']}」"
    s = f"{k}：「{e['ref']}」→「{e['hyp']}」"
    if e.get('ref_py') and k in ('念錯', '聲調', '輕聲'):
        s += f"（{e['ref_py']} → {e['hyp_py']}）"
    return s


def write_report(res, info, stories, stamp):
    th = res.get('thresholds', {})
    items = sorted(res['items'], key=lambda r: (list(info['ids']).index(r['sid']) if r['sid'] in info['ids'] else 99,
                                                 r['page'], r['lang'] != 'zh'))
    title = lambda sid: stories[sid]['title'] if sid in stories else sid
    L = [f'# 故事書錄音核對報告　{stamp}', '']
    pages_by = {}
    for r in items:
        pages_by.setdefault(r['sid'], set()).add(r['page'])
    L.append('- 核對：' + '；'.join(f"{title(sid)}（{sid}）第 {'、'.join(map(str, sorted(p)))} 頁" for sid, p in pages_by.items()))
    nz = sum(r['lang'] == 'zh' for r in items); ne = sum(r['lang'] == 'en' for r in items)
    L.append(f'- 音檔：{len(items)} 個（中文 {nz}、英文 {ne}；還沒錄的頁不列）')
    L.append(f"- 辨識：{res.get('model', '')}，GPU {res.get('gpu', '?')}")
    name2 = res.get('second_model')
    L.append(f"- 中文第二個模型：{name2 or '沒有（載不起來，中文頁只看 Whisper）'}" + (f"（{'；'.join(res['notes'])}）" if res.get('notes') else ''))
    tm = res.get('timing', {})
    if info.get('wall_min') is not None:
        L.append(f"- Kaggle 這次：從推上去到跑完 {info['wall_min']:.1f} 分鐘（kernel 內：裝套件＋載模型 {tm.get('setup_s', '?')} 秒、轉寫比對 {tm.get('asr_s', '?')} 秒）")
    L.append(f"- 開跑前本週 GPU：{info.get('quota_before') or '查不到'}")
    if info.get('quota_after'):
        L.append(f"- 跑完後本週 GPU：{info['quota_after']}（Kaggle 的用量有時會晚幾分鐘才更新）")
    if res.get('errors'):
        L.append(f"- **沒跑成的頁**：" + '；'.join(f"{e['key']}：{e['error']}" for e in res['errors']))
    L += ['', '## 門檻', '']
    if name2:
        L += [f"- **中文頁**：Whisper 和 {name2} 各轉一次，各自跟腳本比拼音。**兩個模型在同一處（同一句、同樣的字；多念的話差 1 字內）都對不上 → 可疑**；"
              f"只有一個模型對不上 → 留意（多半是那個模型自己聽錯）；破音字兩個都對不上 → 可疑。下面的錯誤率門檻只用在英文頁。"]
    L += [f"- 中文頁（沒有第二模型時）：算錯的字數 ÷ 腳本字數（去標點）≥ {th.get('zh_page_rate', 0):.0%} → **可疑**",
          f"- 英文頁：算錯的詞數 ÷ 腳本詞數（WER）≥ {th.get('en_page_rate', 0):.0%} → **可疑**",
          f"- 同一處連續錯 ≥ {th.get('span', 2)} 個字（詞），或某一句錯 ≥ {th.get('line_rate', 0):.0%}，或破音字對不上 → **可疑**",
          '- 有對不上但沒到上面門檻 → **留意**（多半是辨識誤差，單字聽錯居多）；全對 → **通過**',
          '- 算錯的種類：念錯、聲調（拼音一樣、聲調不同）、漏念、多念。',
          '- 不算錯、只列出來：擬聲詞（呼呼呼、滴答、噹、吱吱…辨識常常不準）、語氣詞（喔／哦、呀／啊…）、輕聲差異、辨識幻覺（whisper 在結尾自己編的「字幕由…」之類）。',
          '- 中文比的是拼音（含聲調）：同音不同字（梳／書、他／她）不算錯；語氣標籤 [..] 不會念出來，不比。',
          '- 破音字：照故事檔 `polyphones` 的 read 當標準答案。「對上（同字）」＝辨識寫出同一個字（whisper 會用前後文猜字，讀音只能算大致對上，信心低的建議人工聽）；「對上（同音字）」＝寫成另一個同音字，讀音確實對。',
          '']
    # 總表
    n2 = name2 or '第二模型'
    L += ['## 總表', '', f'| 故事 | 頁 | 語言 | Whisper 錯誤率 | {n2} 錯誤率 | 判定 | 原因 |', '|---|---|---|---|---|---|---|']
    for r in items:
        sec = r.get('second')
        L.append(f"| {esc(title(r['sid']))} | {r['page']} | {LANG_NAME[r['lang']]} | {r['rate']:.1%}（{r['n_err']}/{r['n_ref']}） | "
                 f"{(format(sec['rate'], '.1%') + '（' + str(sec['n_err']) + '）') if sec else '—'} | "
                 f"{'**' + r['verdict'] + '**' if r['verdict'] == '可疑' else r['verdict']} | {esc('；'.join(r['why'])) or '—'} |")
    # 可疑、留意的句子
    L += ['', '## 可疑的句子', '']
    any_bad = False
    for r in items:
        two = 'second' in r
        bad = [l for l in r['lines'] if l['n_err'] or l.get('n_err2')]
        if not bad:
            continue
        any_bad = True
        L += [f"### {title(r['sid'])} 第 {r['page']} 頁 {LANG_NAME[r['lang']]}（{r['verdict']}）", '']
        if two:
            L += [f'| 句 | 角色 | 腳本 | Whisper | {n2} | 問題 | 約在第幾秒 |', '|---|---|---|---|---|---|---|']
        else:
            L += ['| 句 | 角色 | 腳本 | 辨識結果 | 問題 | 約在第幾秒 |', '|---|---|---|---|---|---|']
        for l in bad:
            errs = [e for e in l['errs'] if e['counted']]
            t = next((e['t'] for e in errs if e.get('t') is not None), l.get('t'))
            if two:
                probs = [('**［兩個都錯］**' if e.get('both') else '［只有 Whisper］') + fmt_err(e) for e in errs]
                probs += [f'［只有 {n2}］' + fmt_err(e) for e in l.get('errs2', []) if e['counted'] and not e.get('both')]
                L.append(f"| {l['i'] + 1} | {esc(l['who'])} | {esc(l['text'])} | {esc(l['hyp']) or '（沒有）'} | {esc(l.get('hyp2', '')) or '（沒有）'} | "
                         f"{esc('；'.join(probs))} | {t if t is not None else '—'} |")
            else:
                L.append(f"| {l['i'] + 1} | {esc(l['who'])} | {esc(l['text'])} | {esc(l['hyp']) or '（沒有）'} | "
                         f"{esc('；'.join(fmt_err(e) for e in errs))} | {t if t is not None else '—'} |")
        L.append('')
    if not any_bad:
        L += ['沒有。', '']
    # 破音字
    L += ['## 破音字', '']
    polys = [(r, p) for r in items for p in r.get('polyphones', [])]
    if polys:
        L += [f'| 故事 | 頁 | 句 | 字 | 該念 | Whisper | 結果 | 信心 | {n2} | 結果 | 句子 |', '|---|---|---|---|---|---|---|---|---|---|---|']
        for r, p in polys:
            st = p['status'] if p['ok'] else f"**{p['status']}**"
            st2 = '—' if 'status2' not in p else (p['status2'] if p['ok2'] else f"**{p['status2']}**")
            pr = f"{p['prob']:.2f}" if p.get('prob') is not None else '—'
            L.append(f"| {esc(title(r['sid']))} | {r['page']} | {p['line']} | {p['char']} | {p['read']}（{p['want']}） | "
                     f"{p['hyp'] or '—'} {p['hyp_py']} | {st} | {pr} | {(p.get('hyp2') or '—') + ' ' + p.get('hyp2_py', '')} | {st2} | {esc(p['text'])} |")
        L.append('')
        lists = {sid: stories[sid].get('polyphones') for sid in pages_by if stories.get(sid, {}).get('polyphones')}
        if lists:
            miss = {sid: [p['char'] for p in pl if not any(x['char'] == p['char'] for r, x in polys if r['sid'] == sid)]
                    for sid, pl in lists.items()}
            miss = {sid: cs for sid, cs in miss.items() if cs}
            if miss:
                L.append('這幾頁沒出現的破音字（故事檔有列，但不在這次核對的頁）：' + '；'.join(
                    f"{title(sid)}：" + '、'.join(cs) for sid, cs in miss.items()))
                L.append('')
    else:
        L += ['這次核對的頁裡沒有故事檔列出的破音字。', '']
    # 不算錯的差異
    L += ['## 不算錯的差異（擬聲詞、語氣詞、輕聲、辨識幻覺）', '']
    minors = [(r, 'Whisper', m) for r in items for m in r.get('minor', [])]
    minors += [(r, n2, m) for r in items for m in (r.get('second') or {}).get('minor', [])]
    if minors:
        L += ['| 故事 | 頁 | 語言 | 模型 | 句 | 種類 | 腳本 | 辨識 |', '|---|---|---|---|---|---|---|---|']
        for r, mn, m in minors:
            L.append(f"| {esc(title(r['sid']))} | {r['page']} | {LANG_NAME[r['lang']]} | {mn} | {m['line']} | {m['kind']} | {esc(m['ref']) or '—'} | {esc(m['hyp']) or '—'} |")
        L.append('')
    else:
        L += ['沒有。', '']
    # 全文對照
    L += ['## 附錄：每頁辨識全文', '']
    for r in items:
        L.append(f"- **{title(r['sid'])} 第 {r['page']} 頁 {LANG_NAME[r['lang']]}**（{r.get('dur', '?')} 秒）Whisper：{esc(r.get('raw_t') or r.get('raw', ''))}")
        if r.get('raw2_t'):
            L.append(f"  - {n2}：{esc(r['raw2_t'])}")
    L.append('')
    md = os.path.join(EVAL, f'report_{stamp}.md')
    open(md, 'w', encoding='utf-8').write('\n'.join(L))
    out = {'stamp': stamp, 'info': {k: v for k, v in info.items() if k != 'ids'}, 'ids': list(info['ids']),
           'thresholds': th, 'model': res.get('model'), 'gpu': res.get('gpu'), 'timing': tm, 'errors': res.get('errors', []),
           'pages': [{k: v for k, v in r.items() if k != 'words'} for r in items]}
    js = os.path.join(EVAL, f'report_{stamp}.json')
    json.dump(out, open(js, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return md, js


# ---------------------------------------------------------------- --ask：Whisper 判不準時的第二意見
ASK_DOC = """questions.json：一個 list（或 {"questions": [...]}），每題：
  {"id": "名字（可省）", "file": "mp3 路徑（絕對，或相對 questions.json 所在資料夾／repo 根目錄）", "lang": "zh"|"en",
   "candidates": ["稿子的念法（放第一個）", "可能被念成的樣子", ...],
   "start": 秒, "end": 秒,                      ← 可省；省略時用 timing.json＋whisper 逐詞時間自動找候選句的位置
   "timing": "timing.json 路徑",                 ← 可省；省略時找 mp3 旁邊同名的 .timing.json
   "tone_check": {"char": "藍", "index": 0, "want_tone": 2, "candidate": 0}   ← 可省、可給 list；index＝字在候選文字裡的位置（含標點）
  }
三種方法：
  1. Whisper large-v3（transformers）teacher forcing：每個候選的平均 log-likelihood（每 token），最高的＝最像；
     另列「扣掉語言先驗」：同一串字在 2 秒靜音上的分數當先驗，相減（PMI）＝音訊本身支持哪個。
  2. SenseVoiceSmall 的 CTC 分數（-CTC loss／token）：CTC 沒有語言模型，不會照常見詞猜字。
  3. 聲調：用 timing.json（有就優先）和 whisper 逐詞時間找出那個字的時間段，librosa.pyin 抓 F0，
     換成相對整句中位數的半音，看起、最低、末判斷升調（二聲）或先降後升／低平（三聲）。"""


def resolve(path, base):
    for c in (path, os.path.join(base, path), os.path.join(HERE, '..', '..', path), os.path.join(os.getcwd(), path)):
        if os.path.isfile(c):
            return os.path.normpath(os.path.abspath(c))
    return None


def load_questions(qpath):
    base = os.path.dirname(os.path.abspath(qpath))
    data = json.load(open(qpath, encoding='utf-8'))
    qs = data['questions'] if isinstance(data, dict) else data
    out = []
    for n, q in enumerate(qs, 1):
        f = resolve(q['file'], base)
        if not f:
            raise SystemExit(f"第 {n} 題找不到音檔：{q['file']}")
        if len(q.get('candidates', [])) < 2:
            raise SystemExit(f'第 {n} 題至少要兩個 candidates')
        tj = resolve(q['timing'], base) if q.get('timing') else None
        if not tj:
            guess = os.path.splitext(f)[0] + '.timing.json'
            tj = guess if os.path.isfile(guess) else None
        out.append(dict(q, id=q.get('id') or f'q{n}', src=f, timing_src=tj, lang=q.get('lang', 'zh')))
    return out


def ask_verdict(r):
    """把三種方法整理成 [(方法, 結果文字, 是否符合稿子 True/False/None)] 和結論。"""
    cands = r['candidates']
    rows = []
    if r.get('whisper_ll'):
        vs = ['as_given', 'simplified'] if 'simplified' in r['whisper_ll'][0] else ['as_given']
        v = max(vs, key=lambda k: sum(c[k]['mean'] for c in r['whisper_ll']))
        means = [c[v]['mean'] for c in r['whisper_ll']]
        sums = [c[v]['sum'] for c in r['whisper_ll']]
        pmi = [c[v]['sum'] - c['prior'] for c in r['whisper_ll']]
        b = max(range(len(means)), key=lambda k: means[k])
        other = max(means[k] for k in range(len(means)) if k != b)
        bp = max(range(len(pmi)), key=lambda k: pmi[k])
        txt = (f"最像「{cands[b]}」：平均 log-likelihood " + '／'.join(f'{x:.3f}' for x in means) +
               f"（差 {means[b] - other:.3f}／token；總分 " + '／'.join(f'{x:.2f}' for x in sums) + '）'
               f"；扣掉語言先驗（PMI）" + '／'.join(f'{x:.2f}' for x in pmi) + f" → 最像「{cands[bp]}」"
               f"（{'繁體' if v == 'as_given' else '簡體'}字算）")
        if b != bp:      # 平均似然度和扣掉先驗的 PMI 指向不同：多半是 Whisper 的語言先驗在拉，不採計
            txt += '。兩個指標指向不同的候選，這一票不算'
        rows.append(('Whisper 似然度', txt, (b == 0) if b == bp else None))
    if r.get('sv_ctc'):
        means = [c['mean'] for c in r['sv_ctc']]
        b = max(range(len(means)), key=lambda k: means[k])
        other = max(means[k] for k in range(len(means)) if k != b)
        rows.append(('SenseVoice CTC', f"最像「{cands[b]}」：" + '／'.join(f'{x:.3f}' for x in means) + f"（差 {means[b] - other:.3f}／token）", b == 0))
    elif r.get('sv_ctc_error'):
        rows.append(('SenseVoice CTC', '沒算成：' + r['sv_ctc_error'][:200], None))
    ref_rows = []
    for t in r.get('tone', []):
        if t.get('note'):
            ref_rows.append((f"聲調「{t['char']}」", t['note'], None))
        for src, d in t.get('by', {}).items():
            main = src == t.get('primary')
            name = f"聲調「{t['char']}」（{src}{'' if main else '，參考'}）"
            if d.get('tone') is None:
                (rows if main else ref_rows).append((name, d.get('note') or d.get('shape') or '判不出來', None))
                continue
            seg = d.get('seg') or [d['t0'], d['t1']]
            txt = (f"判 {d['tone']} 聲（{d['shape']}），要 {t['want_tone']} 聲；起 {d['start']:+.1f}、最低 {d['min']:+.1f}（在 {d['min_pos']:.0%}）、"
                   f"末 {d['end']:+.1f} 半音，{d['n']} 點；分析 {seg[0]:.2f}～{seg[1]:.2f} 秒"
                   f"（來源給的字時間 {d['t0']:.2f}～{d['t1']:.2f}，{'已對齊到那個有聲音節' if d.get('snapped') else '沒對到有聲段，直接用'}；對到「{d['src_char']}」）")
            (rows if main else ref_rows).append((name, txt, d['ok']))
    votes = [ok for _, _, ok in rows if ok is not None]
    rows += ref_rows        # 參考列只顯示、不投票
    if not votes:
        concl = '判不出來'
    elif all(votes):
        concl = '念對（各方法都指向稿子）' if len(votes) > 1 else '偏向念對（只有 1 個方法判得出來）'
    elif not any(votes):
        concl = '念錯（各方法都指向別的念法）' if len(votes) > 1 else '偏向念錯（只有 1 個方法判得出來）'
    else:
        concl = f"不一致（{sum(votes)} 個方法說對、{len(votes) - sum(votes)} 個說不對），建議人工聽"
    return rows, concl


def write_ask_report(res, info, stamp):
    L = [f'# 二選一評分＋聲調檢查　{stamp}', '',
         f"- 題目：{info.get('questions')}",
         f"- 模型：Whisper large-v3（transformers，fp16）；第二模型 {res.get('second_model') or '沒有'}；GPU {res.get('gpu', '?')}"]
    if res.get('notes'):
        L.append('- 備註：' + '；'.join(res['notes']))
    tm = res.get('timing', {})
    if info.get('wall_min') is not None:
        L.append(f"- Kaggle 這次：{info['wall_min']:.1f} 分鐘（kernel 內：裝套件＋載模型 {tm.get('setup_s', '?')} 秒、評分 {tm.get('asr_s', '?')} 秒）")
    L.append(f"- 開跑前本週 GPU：{info.get('quota_before') or '查不到'}")
    if info.get('quota_after'):
        L.append(f"- 跑完後本週 GPU：{info['quota_after']}")
    L += ['', '說明：候選第一個＝稿子。平均 log-likelihood 越接近 0 越像；PMI＝同一串字在靜音上的分數扣掉後剩下的，'
          '數字越大代表「這段聲音」越支持它（排除 Whisper 照常見詞猜的部分）。聲調半音值都是相對整句的音高中位數。', '']
    summary = ['## 總結', '', '| 題目 | 結論 | ' + ' | '.join(['Whisper', 'SenseVoice', '聲調']) + ' |', '|---|---|---|---|---|']
    body = []
    for r in res['items']:
        if r.get('error'):
            body += [f"## {r['id']}　{r.get('label', '')}", '', f"**出錯**：{r['error']}", '']
            summary.append(f"| {r['id']} | 出錯 | — | — | — |")
            continue
        rows, concl = ask_verdict(r)
        mark = lambda name: next(('對' if ok else '不對') if ok is not None else '不採計' for n, _, ok in rows if n.startswith(name)) \
            if any(n.startswith(name) for n, _, _ in rows) else '—'
        tones = [('對' if ok else '不對') if ok is not None else '—' for n, _, ok in rows if n.startswith('聲調') and '參考' not in n]
        summary.append(f"| {r['id']} | {concl} | {mark('Whisper')} | {mark('SenseVoice')} | {'／'.join(tones) or '—'} |")
        seg = r.get('segment', {})
        body += [f"## {r['id']}　{r.get('label', '')}", '',
                 '- 候選：' + '　'.join(f"{k}.「{c}」" for k, c in enumerate(r['candidates'], 1)),
                 f"- 評分用的時間段：{seg.get('start')}～{seg.get('end')} 秒（{seg.get('how')}）",
                 f"- 這段 Whisper 轉寫：{r.get('segment_whisper', '')}" + (f"；SenseVoice：{r['segment_second']}" if r.get('segment_second') else ''),
                 f"- **結論：{concl}**", '', '| 方法 | 結果 | 符合稿子 |', '|---|---|---|']
        for n, txt, ok in rows:
            body.append(f"| {n} | {esc(txt)} | {'是' if ok else ('**否**' if ok is not None else '—')} |")
        body.append('')
    L += summary + [''] + body
    os.makedirs(EVAL, exist_ok=True)
    md = os.path.join(EVAL, f'ask_{stamp}.md')
    open(md, 'w', encoding='utf-8').write('\n'.join(L))
    js = os.path.join(EVAL, f'ask_{stamp}.json')
    json.dump({'stamp': stamp, 'info': info, 'result': res,
               'verdicts': {r['id']: ask_verdict(r)[1] for r in res['items'] if not r.get('error')}},
              open(js, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return md, js


def ask_main(qpath, dry, timeout, report_only):
    if report_only:
        d = os.path.abspath(report_only)
        res = json.load(open(os.path.join(d, 'story_ask_result.json'), encoding='utf-8'))
        info = json.load(open(os.path.join(d, 'run_info.json'), encoding='utf-8'))
        md, js = write_ask_report(res, info, dt.datetime.now().strftime('%Y%m%d-%H%M'))
        print('報告：', md)
        return
    qs = load_questions(qpath)
    print(f'{len(qs)} 題：')
    for q in qs:
        print(f"  {q['id']}：{os.path.relpath(q['src'], os.path.join(HERE, '..', '..'))}，{len(q['candidates'])} 個候選"
              f"{'，有 timing.json' if q['timing_src'] else ''}{'，聲調檢查' if q.get('tone_check') else ''}")
    q0 = preflight()
    if dry:
        return
    check_can_run(q0)
    stamp = dt.datetime.now().strftime('%Y%m%d-%H%M')
    run_id = stamp + '-ask-' + os.urandom(3).hex()
    run_dir = os.path.join(EVAL, f'ask_run_{stamp}')
    os.makedirs(run_dir, exist_ok=True)
    files, mq = [], []
    for k, q in enumerate(qs, 1):
        m = {x: q[x] for x in ('id', 'label', 'lang', 'candidates', 'start', 'end', 'tone_check') if x in q}
        m['file'] = f'q{k}.mp3'; files.append((q['src'], m['file']))
        if q['timing_src']:
            m['timing'] = f'q{k}.timing.json'; files.append((q['timing_src'], m['timing']))
        m['src'] = os.path.relpath(q['src'], os.path.join(HERE, '..', '..'))
        mq.append(m)
    manifest = {'run_id': run_id, 'mode': 'ask', 'questions': mq}
    json.dump(manifest, open(os.path.join(run_dir, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    res, wall = run_on_kaggle(manifest, files, run_dir, 'story_ask_result.json', timeout)
    q1 = quota()
    info = {'questions': os.path.abspath(qpath), 'run_id': run_id, 'wall_min': round(wall, 1),
            'quota_before': quota_line(q0) if q0 else None, 'quota_after': quota_line(q1) if q1 else None}
    json.dump(info, open(os.path.join(run_dir, 'run_info.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    md, js = write_ask_report(res, info, stamp)
    print(f'跑完：{wall:.1f} 分鐘；kernel 內 {res.get("timing")}')
    print('本週 GPU（跑完後）：', quota_line(q1))
    for r in res['items']:
        print(f"  {r['id']}：{r.get('error') or ask_verdict(r)[1]}")
    print('報告：', md)


# ---------------------------------------------------------------- 主程式
def main():
    ap = argparse.ArgumentParser(description='故事書錄音核對（Kaggle GPU whisper）')
    ap.add_argument('ids', nargs='*', help='故事 id（可多個）')
    ap.add_argument('--new', action='store_true', help='讀 stories-new/（不加＝舊的 stories.json）')
    ap.add_argument('--lang', default='all', choices=['zh', 'en', 'all'])
    ap.add_argument('--pages', help='只核對這幾頁，例如 1,2,5')
    ap.add_argument('--dry', action='store_true', help='只列要核對的頁、查 GPU 時數，不上傳')
    ap.add_argument('--timeout', type=int, default=60, help='最多等 kernel 幾分鐘（預設 60）')
    ap.add_argument('--report-only', metavar='RUN_DIR', help='用已下載的 run 資料夾重寫報告')
    ap.add_argument('--ask', metavar='QUESTIONS_JSON', help='二選一評分＋聲調檢查（見 ask_main 說明）')
    a = ap.parse_args()
    if a.ask:
        return ask_main(a.ask, a.dry, a.timeout, a.report_only)

    stories = load_stories(a.new)
    if a.report_only:
        d = os.path.abspath(a.report_only)
        res = json.load(open(os.path.join(d, 'story_eval_result.json'), encoding='utf-8'))
        info = json.load(open(os.path.join(d, 'run_info.json'), encoding='utf-8'))
        md, js = write_report(res, info, stories, dt.datetime.now().strftime('%Y%m%d-%H%M'))
        print('報告：', md)
        return

    if not a.ids:
        ap.error('要給故事 id')
    bad = [i for i in a.ids if i not in stories]
    if bad:
        raise SystemExit(f"沒有這個故事：{'、'.join(bad)}（{'stories-new' if a.new else 'stories.json'} 裡有：{'、'.join(stories)}）")
    langs = ('zh', 'en') if a.lang == 'all' else (a.lang,)
    pages = {int(x) for x in a.pages.split(',')} if a.pages else None
    items = collect(stories, a.ids, langs, pages)
    if not items:
        raise SystemExit('這些故事／頁還沒有錄好的 mp3')
    print(f'要核對 {len(items)} 個音檔：')
    for sid in a.ids:
        for lang in langs:
            ps = [it['page'] for it in items if it['sid'] == sid and it['lang'] == lang]
            print(f"  {sid} {LANG_NAME[lang]}：{'、'.join(map(str, ps)) if ps else '（沒有錄好的頁）'}")

    q0 = preflight()
    if a.dry:
        return
    check_can_run(q0)

    stamp = dt.datetime.now().strftime('%Y%m%d-%H%M')
    run_id = stamp + '-' + os.urandom(3).hex()
    os.makedirs(EVAL, exist_ok=True)
    run_dir = os.path.join(EVAL, f'run_{stamp}')
    os.makedirs(run_dir, exist_ok=True)
    polys = {sid: stories[sid].get('polyphones', []) for sid in a.ids if stories[sid].get('polyphones')}
    onos = {sid: stories[sid].get('onomatopoeia', []) for sid in a.ids if stories[sid].get('onomatopoeia')}
    manifest = {'run_id': run_id, 'polyphones': polys, 'onomatopoeia': onos,
                'items': [{k: v for k, v in it.items() if k != 'src'} for it in items]}
    json.dump(manifest, open(os.path.join(run_dir, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    res, wall = run_on_kaggle(manifest, [(it['src'], it['file']) for it in items], run_dir, 'story_eval_result.json', a.timeout)
    q1 = quota()
    info = {'ids': a.ids, 'new': a.new, 'lang': a.lang, 'pages': sorted(pages) if pages else None, 'run_id': run_id,
            'wall_min': round(wall, 1), 'quota_before': quota_line(q0) if q0 else None, 'quota_after': quota_line(q1) if q1 else None}
    json.dump(info, open(os.path.join(run_dir, 'run_info.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    md, js = write_report(res, info, stories, stamp)
    print(f'跑完：{wall:.1f} 分鐘；kernel 內 {res.get("timing")}')
    print('本週 GPU（跑完後）：', quota_line(q1))
    for r in sorted(res['items'], key=lambda r: (r['sid'], r['page'], r['lang'] != 'zh')):
        print(f"  {r['sid']} p{r['page']} {r['lang']}：{r['verdict']} {r['rate']:.1%} {'；'.join(r['why'])}")
    print('報告：', md)
    print('      ', js)


if __name__ == '__main__':
    main()
