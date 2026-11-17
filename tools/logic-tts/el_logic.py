# 動動腦（邏輯小遊戲）的題目語音：用 ElevenLabs 把台詞一句一檔錄下來，再轉成網站用的小檔。
#
#   python tools/logic-tts/el_logic.py dry                 只算：幾句幾字、估多少點、帳號還剩多少（不扣點）
#   python tools/logic-tts/el_logic.py trial <id> [<id>…]  試錄幾句（中英各一份），做一頁試聽頁
#   python tools/logic-tts/el_logic.py record zh|en|all    整批錄（已經錄過、台詞也沒改的會跳過）
#   python tools/logic-tts/el_logic.py build               轉成單聲道 64k 放進 assets/logic/audio/，重新產生 js/logic-audio.js
#
# 規矩（使用者定的）：花點數之前先 dry 估點、先問；同意後先 trial 一兩句給他聽，再 record。
# 台詞的唯一來源是 js/logic*.js 的 Logic.lines()（export_lines.js 讀出來），這裡不另外抄。
# 聲音：中文、英文都用故事書的旁白 Yui（帳號裡叫 tdj_封鈴笙_Yui），模型跟故事書一樣；
#       一句一次請求（只有一個人說話，還是走故事書用的 text-to-dialogue，音色才會一樣）。
# 母帶放 repo 根的 _logic_tts/（不進版本庫）；錄過哪一句、當時的台詞是什麼記在 _logic_tts/done.json，
# 台詞改了就會重錄，build 也只收「跟現在台詞一樣」的檔——沒收的句子，網站會退回系統語音，不會念出舊台詞。
# 金鑰不在這個 repo（見 tools/tts/el_common.py），這支不印、不存金鑰。
import hashlib, html, json, os, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'tts'))
from el_common import api, subscription  # noqa: E402  （只有函式，載入時不做事）

WORK = os.path.join(ROOT, '_logic_tts')
DONE = os.path.join(WORK, 'done.json')
OUT = os.path.join(ROOT, 'assets', 'logic', 'audio')
MANIFEST = os.path.join(ROOT, 'js', 'logic-audio.js')
MODEL = 'eleven_v4'
FMT = 'mp3_44100_128'
VOICE = {'zh': 'tdj_封鈴笙_Yui', 'en': 'tdj_封鈴笙_Yui'}
RATE = {'zh': 0.44, 'en': 0.49}     # 每個送出的字元扣幾點（2026-11-13 用 /v1/history 回推的）
LANGS = ('zh', 'en')


def lines():
    r = subprocess.run(['node', os.path.join(HERE, 'export_lines.js')], capture_output=True, check=True)
    return json.loads(r.stdout.decode('utf-8'))


def sig(lang, text):
    return hashlib.sha1((MODEL + '|' + VOICE[lang] + '|' + text).encode('utf-8')).hexdigest()[:16]


def load_done():
    try:
        return json.load(open(DONE, encoding='utf-8'))
    except (OSError, ValueError):
        return {}


def save_done(d):
    os.makedirs(WORK, exist_ok=True)
    json.dump(d, open(DONE, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)


def raw_path(lang, lid):
    return os.path.join(WORK, 'raw', lang, lid + '.mp3')


def todo(lang, ls, done):
    """還沒錄、或台詞改過的句子"""
    return [l for l in ls if done.get(lang + '/' + l['id']) != sig(lang, l[lang]) or not os.path.exists(raw_path(lang, l['id']))]


def voice_id(name_part):
    for v in api('/v1/voices')['voices']:
        if name_part in v['name']:
            return v['voice_id']
    raise SystemExit('帳號裡找不到聲音：' + name_part)


def tts(text, vid):
    body = {'model_id': MODEL, 'inputs': [{'text': text, 'voice_id': vid}]}
    return api('/v1/text-to-dialogue?output_format=' + FMT, body, raw=True)


def cmd_dry():
    ls = lines()
    done = load_done()
    total = 0
    for lang in LANGS:
        chars = sum(len(l[lang]) for l in ls)
        rest = todo(lang, ls, done)
        rchars = sum(len(l[lang]) for l in rest)
        pts = round(rchars * RATE[lang])
        total += pts
        print('%s：共 %d 句 %d 字元；還要錄 %d 句 %d 字元，估 %d 點' % ('中文' if lang == 'zh' else '英文', len(ls), chars, len(rest), rchars, pts))
    print('合計估 %d 點' % total)
    used, limit, reset, tier, status = subscription()
    print('帳號：%s／%s，已用 %s／%s，剩 %s 點，重置 %s' % (
        tier, status, used, limit, (limit or 0) - (used or 0),
        time.strftime('%Y-%m-%d %H:%M', time.localtime(reset)) if reset else '?'))


def cmd_trial(ids):
    ls = {l['id']: l for l in lines()}
    bad = [i for i in ids if i not in ls]
    if bad or not ids:
        raise SystemExit('請給要試錄的台詞編號（例如 tidy.ask1 river.first）。找不到：' + ' '.join(bad))
    vids = {lang: voice_id(VOICE[lang]) for lang in LANGS}
    d = os.path.join(WORK, 'trial')
    os.makedirs(d, exist_ok=True)
    rows = []
    for i in ids:
        for lang in LANGS:
            fn = os.path.join(d, i + '-' + lang + '.mp3')
            open(fn, 'wb').write(tts(ls[i][lang], vids[lang]))
            rows.append('<p><b>%s（%s）</b>　%s<br><audio controls src="%s"></audio></p>' % (
                html.escape(i), '中文' if lang == 'zh' else '英文', html.escape(ls[i][lang]), os.path.basename(fn)))
            print('試錄', i, lang)
    page = os.path.join(d, '試聽_動動腦.html')
    open(page, 'w', encoding='utf-8').write(
        '<!doctype html><meta charset="utf-8"><title>試聽：動動腦題目語音</title>'
        '<body style="font:18px/1.7 sans-serif;max-width:760px;margin:24px auto">'
        '<h1>試聽：動動腦題目語音</h1><p>中文、英文都是故事書的旁白 Yui。聽完告訴我可不可以整批錄。</p>' + ''.join(rows))
    print('試聽頁：', page)


def cmd_record(which):
    langs = LANGS if which == 'all' else (which,)
    ls = lines()
    done = load_done()
    vids = {lang: voice_id(VOICE[lang]) for lang in langs}
    for lang in langs:
        rest = todo(lang, ls, done)
        print('%s：要錄 %d 句' % (lang, len(rest)))
        os.makedirs(os.path.join(WORK, 'raw', lang), exist_ok=True)
        for n, l in enumerate(rest, 1):
            open(raw_path(lang, l['id']), 'wb').write(tts(l[lang], vids[lang]))
            done[lang + '/' + l['id']] = sig(lang, l[lang])
            save_done(done)             # 一句存一次：中途被打斷，下次從斷掉的地方接著錄
            print('  %d/%d %s' % (n, len(rest), l['id']))
    used, limit = subscription()[:2]
    print('錄完。帳號已用 %s／%s（這個數字會慢一點才更新）' % (used, limit))


def cmd_build():
    import imageio_ffmpeg
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    ls = lines()
    done = load_done()
    paths = []
    stale = 0
    for lang in LANGS:
        d = os.path.join(OUT, lang)
        os.makedirs(d, exist_ok=True)
        keep = set()
        for l in ls:
            src = raw_path(lang, l['id'])
            if not os.path.exists(src) or done.get(lang + '/' + l['id']) != sig(lang, l[lang]):
                stale += 1
                continue
            dst = os.path.join(d, l['id'] + '.mp3')
            subprocess.run([ff, '-loglevel', 'error', '-y', '-i', src, '-ac', '1', '-ar', '44100', '-b:a', '64k', dst], check=True)
            keep.add(l['id'] + '.mp3')
            paths.append('assets/logic/audio/%s/%s.mp3' % (lang, l['id']))
        for f in os.listdir(d):          # 台詞刪掉或改掉的舊檔不留
            if f.endswith('.mp3') and f not in keep:
                os.remove(os.path.join(d, f))
    body = ''.join("  '%s',\n" % p for p in sorted(paths))
    open(MANIFEST, 'w', encoding='utf-8', newline='\n').write(
        '/* 動動腦：已經錄好的題目語音清單（由 tools/logic-tts/el_logic.py build 產生，不要手改）。\n'
        '   這裡沒列的句子，js/logic.js 會退回系統語音。 */\n'
        'window.LogicAudio = [\n' + body + '];\n')
    size = sum(os.path.getsize(os.path.join(ROOT, p)) for p in paths)
    print('收進 %d 個檔，共 %.2f MB；還沒錄或台詞改過的 %d 句（網站會用系統語音）' % (len(paths), size / 1048576, stale))
    print('接著：新增的檔加進 sw.js 的 PRECACHE（已經上線過的版本才要升 CACHE_VERSION），再跑 node tools/check_precache.js 和 node tools/check_logic.js')


if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['dry']:
        cmd_dry()
    elif a[:1] == ['trial']:
        cmd_trial(a[1:])
    elif a[:1] == ['record'] and a[1:2] and a[1] in ('zh', 'en', 'all'):
        cmd_record(a[1])
    elif a[:1] == ['build']:
        cmd_build()
    else:
        raise SystemExit(__doc__ or '用法：python tools/logic-tts/el_logic.py dry | trial <id>… | record zh|en|all | build')
