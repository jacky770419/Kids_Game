# -*- coding: utf-8 -*-
"""
Kaggle kernel：有聲故事書錄音核對（從 C:/Novel/tools/tts/kaggle_eval/tts_eval_kernel.py 改來，只留 ASR＋比對）
輸入：/kaggle/input/**/manifest.json＋同一層的 mp3（由 story_eval.py 打包上傳；一頁一檔，檔名 <故事>__<zh|en>__p<頁>.mp3）
做法：faster-whisper large-v3 轉寫（中文 language=zh、英文 language=en；不帶腳本當提示，免得辨識被腳本帶著走）
  中文：繁轉簡、去標點空白、阿拉伯數字轉國字 → pypinyin 帶聲調（TONE3、輕聲記 5）逐字跟腳本比；
        同音不同字不算錯（ASR 挑字的問題），字一樣也不算錯；破音字照故事檔 polyphones 的 read 當標準答案。
        擬聲詞（呼呼呼、滴答、噹…）、語氣詞（喔、呀、呢…）、輕聲差異另外記，不算錯。
  英文：小寫、去標點、數字轉英文字、拉長的字母縮短 → 逐字算 WER；擬聲詞、感嘆詞另外記，不算錯。
  每頁：逐句對齊（哪段轉寫屬於哪一句）、每句對不上的地方、頁的錯誤率、判定（通過／留意／可疑）。
輸出：/kaggle/working/story_eval_result.json（每跑完一頁就寫一次）
本機測比對邏輯：exec(LIB) 以後呼叫 compare_zh／compare_en（這個檔在 Kaggle 以外 import 不會做任何事）。
"""
import os
import subprocess
import sys
import time

LIB = r'''
import re, unicodedata

# ---------- 門檻（報告開頭會印出來）
THRESH = {
    "zh_page_rate": 0.05,   # 中文：算錯的字數／腳本字數 ≥ 這個 → 可疑
    "en_page_rate": 0.10,   # 英文：算錯的字數／腳本字數（WER）≥ 這個 → 可疑
    "span": 2,              # 同一處連續錯 ≥ 這麼多字（中文字／英文字）→ 可疑（整詞念錯、漏念、多念）
    "line_rate": 0.30,      # 某一句錯 ≥ 這個比例 → 可疑（整句念歪或漏掉）
}
COUNTED = {"念錯", "聲調", "漏念", "多念"}      # 算錯的種類；其餘（擬聲詞、語氣詞、輕聲、辨識幻覺）只列不算

_CC = {}
def cc(cfg, s):
    if cfg not in _CC:
        from opencc import OpenCC
        _CC[cfg] = OpenCC(cfg)
    return _CC[cfg].convert(s)

DIG = "零一二三四五六七八九"
def num2zh(n):
    if n < 10: return DIG[n]
    if n < 20: return "十" + (DIG[n % 10] if n % 10 else "")
    if n >= 100000: return "".join(DIG[int(c)] for c in str(n))
    s, zero = "", False
    for u, name in ((10000, "萬"), (1000, "千"), (100, "百"), (10, "十")):
        q, n = divmod(n, u)
        if q:
            if zero and s: s += "零"
            s += DIG[q] + name; zero = False
        elif s: zero = True
    if n:
        if zero and s: s += "零"
        s += DIG[n]
    return s

_EN1 = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
_EN10 = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def num2en(n):
    if n < 20: return _EN1[n]
    if n < 100: return _EN10[n // 10] + ("" if n % 10 == 0 else " " + _EN1[n % 10])
    if n < 1000: return _EN1[n // 100] + " hundred" + ("" if n % 100 == 0 else " " + num2en(n % 100))
    if n < 1000000: return num2en(n // 1000) + " thousand" + ("" if n % 1000 == 0 else " " + num2en(n % 1000))
    return " ".join(_EN1[int(c)] for c in str(n))

TAG = re.compile(r"\[[^\]]*\]")      # 腳本裡若有 [語氣標籤] 不會念出來
def norm_zh(s):
    s = unicodedata.normalize("NFKC", TAG.sub("", s))
    s = re.sub(r"\d+", lambda m: num2zh(int(m.group())), s)
    return re.sub(r"[\W_]+", "", s).lower()

# ---------- 擬聲詞、語氣詞（繁簡都放）
ONO_ZH = set("呼滴答噹咚叮嘩哗啦沙吱喔哞汪喵咩嘶呱啾砰碰轟轰嘟咕嚕噜哈嘻呵嗚呜咿叩噗咻唰嘰叽喳嗡啪嘎噠哒哐鏘锵噼啵嘿刷")
ONO_ZH_ONE = set("噹咚叮砰轟轰啪汪喵哞咩呱啾咻唰嘶噠哒啵吱")   # 單獨一個字也算擬聲詞
PART_ZH = set("啊呀喔哦噢嗎吗呢吧啦囉啰咯嘍喽了耶哇欸誒诶嗯唷喲哟哎咦嘛嗨呦哈哼")   # 句尾語氣詞、感嘆詞互換（囉／嘍／了、哈／哼）不算錯
_ONO_RUN = re.compile("[" + "".join(sorted(ONO_ZH)) + "]{2,}")
ONO_EN = set("""whoosh woosh swoosh squeak squeaks ding dong drip pitter patter plop whee wee knock bang boom splash splish
tick tock moo woof meow baa quack oink neigh hiss ribbit tweet chirp buzz cluck cock doodle doo zzz brr shh achoo
hee haha hehe ha ho hoo la tra""".split())
INTERJ_EN = set("oh ah ooh aah aw aww uh um huh hmm hm wow whoa oops yay hey eh oho ahh ohh mm mmm yum yummy ow ouch".split())
EN_MAP = {"ok": "okay", "mr": "mister", "wanna": "want to", "gonna": "going to", "gotta": "got to", "lemme": "let me", "gimme": "give me"}
DE_ZH = set("的得地")   # 結構助詞都念輕聲 de，pypinyin 常給錯（開心得→de2、開心地→di4），三個互換不算錯
HALLU = re.compile(r"字幕|訂閱|订阅|點贊|点赞|打賞|打赏|明鏡|明镜|amara|subtitles|thanks for watching|thank you for watching", re.I)

def strip_tone(p): return p[:-1] if p and p[-1].isdigit() else p

_TONE_MARK = {"\u0304": "1", "\u0301": "2", "\u030c": "3", "\u0300": "4"}
def tone3(read):
    """jiě → jie3、nǚ → nv3（跟 pypinyin TONE3 同一種寫法）；本來就是 jie3 的照用。"""
    r = read.strip().lower().replace("u:", "v").replace("ü", "v") if re.fullmatch(r"[a-zü:]+[1-5]", read.strip().lower()) else None
    if r: return r
    out, tone = "", "5"
    for ch in unicodedata.normalize("NFD", read.strip().lower()):
        if ch in _TONE_MARK: tone = _TONE_MARK[ch]
        elif ch == "\u0308": out = out[:-1] + "v" if out.endswith("u") else out
        elif ch.isalpha(): out += ch
    return out + tone

def parse_polys(polys):
    """故事檔的 polyphones（char／where／read）→ 每個字的標準讀音＋出現在哪些詞（從 where 的『』「」裡抓；抓不到就全書都算）。"""
    out = []
    for p in polys or []:
        ch = p.get("char", "")
        if len(ch) != 1: continue
        phrases = set()
        for q in re.findall(r"[『「]([^』」]+)[』」]", p.get("where", "")):
            for x in re.split(r"[、，,／/]", q):
                x = norm_zh(x)
                if ch in x: phrases.add(x)
        if "全書" in p.get("where", "") or not phrases: phrases = {ch}     # 「全書」或沒寫詞：這個字每次出現都照 read
        out.append({"char": ch, "read": p.get("read", ""), "py": tone3(p.get("read", "")),
                    "phrases": sorted(phrases), "where": p.get("where", "")})
    return out

def poly_marks(t, polys):
    m = {}
    for k, p in enumerate(polys):
        for ph in p["phrases"]:
            i = t.find(ph)
            while i >= 0:
                for j, c in enumerate(ph):
                    if c == p["char"]: m[i + j] = k
                i = t.find(ph, i + 1)
    return m

def pinyin_of(t, polys):
    """t＝去標點後的繁體字串。回 (簡體字串, 每字一個 TONE3 拼音, 破音字位置→polys 編號)。"""
    from pypinyin import lazy_pinyin, Style
    kw = dict(style=Style.TONE3, neutral_tone_with_five=True, errors=lambda x: list(x))
    s = cc("t2s", t)
    if len(s) != len(t): s = t
    toks = lazy_pinyin(s, **kw)
    if len(toks) != len(s):
        toks = [(lazy_pinyin(c, **kw) or [c])[0] for c in s]
    marks = poly_marks(t, polys)
    for i, k in marks.items(): toks[i] = polys[k]["py"]
    return s, toks, marks

def ono_marks(t, extra=()):
    o = set()
    for m in _ONO_RUN.finditer(t): o.update(range(m.start(), m.end()))
    for i, c in enumerate(t):
        if c in ONO_ZH_ONE: o.add(i)
    for ph in extra:
        ph = norm_zh(ph); i = t.find(ph) if ph else -1
        while i >= 0:
            o.update(range(i, i + len(ph))); i = t.find(ph, i + 1)
    return o

def align(ref, hyp, owner):
    """逐 token 對齊，非 equal 的段照句子切開。回 (pieces, h2r, r2h)。piece＝(tag, 第幾句, 腳本位置list, 轉寫位置list)。"""
    from rapidfuzz.distance import Levenshtein
    h2r = [0] * len(hyp); r2h = [None] * len(ref); pieces = []
    for op in Levenshtein.opcodes(ref, hyp):
        a0, a1, b0, b1 = op.src_start, op.src_end, op.dest_start, op.dest_end
        la, lb = a1 - a0, b1 - b0
        if op.tag == "equal":
            for k in range(la): h2r[b0 + k] = a0 + k; r2h[a0 + k] = b0 + k
            continue
        if op.tag == "replace":
            for j in range(b0, b1): h2r[j] = a0 + (j - b0) * la // lb
            for i in range(a0, a1): r2h[i] = b0 + (i - a0) * lb // la
        elif op.tag == "insert":
            for j in range(b0, b1): h2r[j] = max(0, a0 - 1)
        src, dst = list(range(a0, a1)), list(range(b0, b1))
        for L in sorted({owner[i] for i in src} | {owner[h2r[j]] for j in dst}):
            s = [i for i in src if owner[i] == L]; d = [j for j in dst if owner[h2r[j]] == L]
            pieces.append(("replace" if s and d else "delete" if s else "insert", L, s, d))
    return pieces, h2r, r2h

def _verdict(lang, n_ref, n_err, lines, poly_bad, max_span):
    rate = n_err / max(1, n_ref)
    why = []
    lim = THRESH["zh_page_rate" if lang == "zh" else "en_page_rate"]
    if rate >= lim: why.append(f"錯誤率 {rate:.1%}（門檻 {lim:.0%}）")
    if max_span >= THRESH["span"]: why.append(f"有一處連續錯 {max_span} 個{'字' if lang == 'zh' else '詞'}")
    bad_lines = [l["i"] + 1 for l in lines if l["n_ref"] and l["n_err"] / l["n_ref"] >= THRESH["line_rate"]]
    if bad_lines: why.append("第 " + "、".join(map(str, bad_lines)) + " 句錯超過三成")
    if poly_bad: why.append(f"破音字對不上 {poly_bad} 處")
    v = "可疑" if why else ("留意" if n_err else "通過")
    if v == "留意": why.append(f"有 {n_err} 個{'字' if lang == 'zh' else '詞'}對不上，但沒過門檻（多半是辨識誤差）")
    return round(rate, 4), v, why

def _lines_skeleton(lines, owner_lens, H_text, h2r, owner, times, sep):
    out = []
    for k, l in enumerate(lines):
        js = [j for j in range(len(H_text)) if owner[h2r[j]] == k] if owner else []
        out.append({"i": k, "who": l.get("who", ""), "text": l["text"], "hyp": sep.join(H_text[j] for j in js),
                    "t": (round(times[js[0]], 1) if js and times and times[js[0]] is not None else None), "n_ref": owner_lens[k], "n_err": 0, "errs": []})
    return out

def compare_zh(lines, words, polys=(), ono_extra=()):
    """lines＝[{who,text}]；words＝whisper 逐詞 [{w,s,e,p}]；polys＝parse_polys 的結果。"""
    polys = list(polys)
    # 腳本
    R_t, owner, R_py, R_s, R_ono, R_poly, lens = "", [], [], "", set(), {}, []
    for k, l in enumerate(lines):
        t = norm_zh(l["text"]); s, py, marks = pinyin_of(t, polys)
        R_ono.update(len(R_t) + i for i in ono_marks(t, ono_extra))
        R_poly.update({len(R_t) + i: v for i, v in marks.items()})
        R_t += t; R_s += s; R_py += py; owner += [k] * len(t); lens.append(len(t))
    # 轉寫：逐詞轉繁、去標點，每個字帶時間和信心
    H_t, probs, times = "", [], []
    for w in words:
        t = norm_zh(cc("s2tw", w["w"]))
        H_t += t; probs += [w.get("p")] * len(t); times += [w.get("s")] * len(t)
    whole = norm_zh(cc("s2tw", "".join(w["w"] for w in words)))
    if len(whole) == len(H_t): H_t = whole
    H_s, H_py, _ = pinyin_of(H_t, polys)
    pieces, h2r, r2h = align(R_py, H_py, owner)
    out_lines = _lines_skeleton(lines, lens, H_t, h2r, owner, times, "")
    poly_py = {p["char"]: p["py"] for p in polys}
    def kind_of(tag, s_idx, d_idx):
        rc = "".join(R_t[i] for i in s_idx); hc = "".join(H_t[j] for j in d_idx)
        if s_idx and sum(i in R_ono for i in s_idx) * 2 >= len(s_idx): return "擬聲詞"
        if all(c in PART_ZH for c in rc + hc): return "語氣詞"
        if rc and hc and all(c in DE_ZH for c in rc + hc): return "輕聲"
        if not s_idx and all(H_t[j] in ONO_ZH or H_s[j] in ONO_ZH for j in d_idx): return "擬聲詞"
        if tag == "insert" and HALLU.search(hc): return "辨識幻覺"
        if tag == "replace" and len(s_idx) == len(d_idx) and all(strip_tone(R_py[i]) == strip_tone(H_py[j]) for i, j in zip(s_idx, d_idx)):
            diff = [(R_py[i], H_py[j]) for i, j in zip(s_idx, d_idx) if R_py[i] != H_py[j]]
            return "輕聲" if all(a.endswith("5") or b.endswith("5") for a, b in diff) else "聲調"
        return {"replace": "念錯", "delete": "漏念", "insert": "多念"}[tag]
    n_err, max_span, minor = 0, 0, []
    groups = []   # [kind, s_idx, d_idx, 第幾句]
    for tag, L, s_idx, d_idx in pieces:
        if tag == "replace" and len(s_idx) == len(d_idx):
            # 一字對一字：逐字判，字一樣（只是拼音前後文不同）或念成故事檔指定的破音字讀音都不算；同種的相鄰字併成一處
            cur = None
            for i, j in zip(s_idx, d_idx):
                if R_s[i] == H_s[j] or poly_py.get(R_t[i]) == H_py[j]:
                    cur = None; continue
                kd = kind_of("replace", [i], [j])
                if cur and cur[0] == kd and cur[1][-1] == i - 1: cur[1].append(i); cur[2].append(j)
                else: cur = [kd, [i], [j], L]; groups.append(cur)
        else:
            groups.append([kind_of(tag, s_idx, d_idx), s_idx, d_idx, L])
    for kind, s_idx, d_idx, L in groups:
        rc = "".join(R_t[i] for i in s_idx); hc = "".join(H_t[j] for j in d_idx)
        n = max(len(s_idx), len(d_idx))
        e = {"kind": kind, "ref": rc, "hyp": hc, "ref_py": " ".join(R_py[i] for i in s_idx), "hyp_py": " ".join(H_py[j] for j in d_idx),
             "n": n, "t": (round(times[d_idx[0]], 1) if d_idx and times[d_idx[0]] is not None else None),
             "ctx": R_t[max(0, (s_idx or [0])[0] - 4):(s_idx or [0])[0]] if s_idx else R_t[max(0, h2r[d_idx[0]] - 3):h2r[d_idx[0]] + 1]}
        e["counted"] = kind in COUNTED
        e["pos"] = list(s_idx) if s_idx else [h2r[d_idx[0]]]      # 腳本位置（多念的記前一個字），兩個模型比對「同一處」用
        out_lines[L]["errs"].append(e)
        if e["counted"]:
            out_lines[L]["n_err"] += n; n_err += n; max_span = max(max_span, n)
        else: minor.append(dict(e, line=L + 1))
    # 破音字
    poly_res, poly_bad = [], 0
    for i, k in sorted(R_poly.items()):
        j = r2h[i]; p = polys[k]
        if j is None: st = "沒念到"
        elif H_s[j] == R_s[i]: st = "對上（同字）"
        elif H_py[j] == R_py[i]: st = "對上（同音字）"
        elif strip_tone(H_py[j]) == strip_tone(R_py[i]): st = "聲調不同"
        else: st = "讀音不同"
        ok = st.startswith("對上")
        poly_bad += not ok
        poly_res.append({"line": owner[i] + 1, "text": lines[owner[i]]["text"], "char": p["char"], "read": p["read"], "want": R_py[i],
                         "hyp": H_t[j] if j is not None else "", "hyp_py": H_py[j] if j is not None else "",
                         "prob": probs[j] if j is not None else None, "status": st, "ok": ok})
    rate, v, why = _verdict("zh", len(R_t), n_err, out_lines, poly_bad, max_span)
    return {"n_ref": len(R_t), "n_err": n_err, "rate": rate, "verdict": v, "why": why, "lines": out_lines,
            "minor": minor, "polyphones": poly_res, "hyp_text": H_t}

def combine_zh(r1, r2, name2):
    """r1＝Whisper、r2＝第二個模型（SenseVoice／Paraformer）的 compare_zh 結果。
    同一處（同一句、腳本位置重疊；多念的差 1 字內）兩個都算錯 → 可疑；只有一個算錯 → 留意。回合併後的 r1（加 hyp2／errs2／second）。"""
    def spots(r):
        return [(L["i"], e) for L in r["lines"] for e in L["errs"] if e["counted"]]
    s1, s2 = spots(r1), spots(r2)
    def near(la, a, lb, b):   # 同一句、腳本位置重疊；有一邊是「多念」（只有錨點）才放寬到差 1 字
        if la != lb: return False
        tol = 1 if (a["kind"] == "多念" or b["kind"] == "多念") else 0
        return min(abs(x - y) for x in a["pos"] for y in b["pos"]) <= tol
    for la, e in s1: e["both"] = any(near(la, e, lb, f) for lb, f in s2)
    for lb, f in s2: f["both"] = any(near(lb, f, la, e) for la, e in s1)
    for L1, L2 in zip(r1["lines"], r2["lines"]):
        L1["hyp2"] = L2["hyp"]; L1["errs2"] = L2["errs"]; L1["n_err2"] = L2["n_err"]
    for p1, p2 in zip(r1["polyphones"], r2["polyphones"]):
        p1["hyp2"], p1["hyp2_py"], p1["status2"], p1["ok2"] = p2["hyp"], p2["hyp_py"], p2["status"], p2["ok"]
    both = [e for _, e in s1 if e["both"]]
    poly_both = sum(1 for p in r1["polyphones"] if not p["ok"] and not p.get("ok2", True))
    poly_one = sum(1 for p in r1["polyphones"] if p["ok"] != p.get("ok2", p["ok"]) or (not p["ok"] and "ok2" not in p))
    why = []
    if both: why.append(f"兩個模型都在同一處對不上：{len(both)} 處（" + "、".join(f"「{e['ref'] or e['hyp']}」" for e in both[:4]) + "）")
    if poly_both: why.append(f"破音字兩個模型都對不上 {poly_both} 處")
    only1 = sum(1 for _, e in s1 if not e["both"]); only2 = sum(1 for _, f in s2 if not f["both"])
    if why: v = "可疑"
    elif only1 or only2 or poly_one: v = "留意"
    else: v = "通過"
    if only1: why.append(f"只有 Whisper 對不上 {only1} 處")
    if only2: why.append(f"只有 {name2} 對不上 {only2} 處")
    if poly_one and not poly_both: why.append(f"破音字只有一個模型對不上 {poly_one} 處")
    r1["whisper_verdict"], r1["whisper_why"] = r1["verdict"], r1["why"]
    r1["verdict"], r1["why"] = v, why
    r1["second"] = {"model": name2, "rate": r2["rate"], "n_err": r2["n_err"], "verdict_alone": r2["verdict"], "hyp_text": r2["hyp_text"],
                    "minor": r2["minor"]}
    return r1

# ---------- --ask：找時間段、聲調判斷（純計算，本機也能測）
def chars_from_timing(tj):
    """ElevenLabs timing.json → [(字, 起, 迄)]：跳過 [tag] 和它後面那個空白；保留標點（之後 norm 再去）。"""
    al = tj.get("alignment") or tj.get("normalized_alignment") or {}
    out, depth, skip_sp = [], 0, False
    for c, a, b in zip(al.get("characters", []), al.get("character_start_times_seconds", []), al.get("character_end_times_seconds", [])):
        if c == "[": depth += 1; continue
        if c == "]": depth = max(0, depth - 1); skip_sp = True; continue
        if depth: continue
        if skip_sp and c == " ": skip_sp = False; continue
        skip_sp = False
        out.append((c, float(a), float(b)))
    return out

def zh_units(chars):
    """[(字, 起, 迄)] → 去標點後的 [(繁體字, 起, 迄)]。"""
    out = []
    for c, a, b in chars:
        t = norm_zh(c)
        for k, x in enumerate(t):
            out.append((x, a + (b - a) * k / len(t), a + (b - a) * (k + 1) / len(t)))
    return out

def units_from_words(words, lang):
    """whisper 逐詞 → 每個字（中文）／每個詞（英文）一筆 (token, 起, 迄)；一個詞有幾個字就把時間平分。"""
    out = []
    for w in words:
        toks = list(norm_zh(cc("s2tw", w["w"]))) if lang == "zh" else norm_en(w["w"])
        a, b = w.get("s") or 0.0, w.get("e") or w.get("s") or 0.0
        for k, x in enumerate(toks):
            out.append((x, a + (b - a) * k / len(toks), a + (b - a) * (k + 1) / len(toks)))
    return out

def keys_of(tokens, lang):
    if lang != "zh": return list(tokens)
    return [strip_tone(p) for p in pinyin_of("".join(tokens), [])[1]]

def cand_tokens(text, lang):
    return list(norm_zh(text)) if lang == "zh" else norm_en(text)

def locate(cand, units, lang):
    """在 units 裡找最像 cand 的一段（中文比無聲調拼音，所以「藍／懶」「嘩／哇」也找得到）。
    回 {i, n, dist（0～1）, map：cand 位置→units 位置}；找不到回 None。"""
    from rapidfuzz.distance import Levenshtein
    if not cand or not units: return None
    ck, uk = keys_of(cand, lang), keys_of([u[0] for u in units], lang)
    best = None
    for L in range(max(1, len(ck) - 3), len(ck) + 4):
        for i in range(0, max(1, len(uk) - L + 1)):
            d = Levenshtein.distance(ck, uk[i:i + L]) / max(len(ck), 1)
            key = (round(d, 6), abs(L - len(ck)), i)      # 一樣像時取長度最接近候選的那段
            if best is None or key < best[0]: best = (key, i, L)
    (d, _, _), i, L = best
    m = [None] * len(ck)
    for op in Levenshtein.opcodes(ck, uk[i:i + L]):
        if op.tag in ("equal", "replace"):
            for k in range(op.src_start, op.src_end):
                m[k] = i + op.dest_start + min(k - op.src_start, op.dest_end - op.dest_start - 1)
    return {"i": i, "n": L, "dist": round(d, 3), "map": m, "s": units[i][1], "e": units[min(i + L, len(units)) - 1][2]}

def tone_summary(st):
    """st＝這個字有聲音框的音高（半音，相對整句中位數），照時間排好。回曲線摘要和判定（1～4 聲或 None）。
    規則（按順序）：末－起 ≥ 1.5 且（起到最低降 < 1 或最低點在前半）→ 二聲（升；TTS 的二聲開頭常先小降一下）；
    起到最低降 ≥ 1、最低點在 25% 以後、末比最低回升 ≥ 1 → 三聲（先降後升）；
    末－起 ≤ -1.5 → 起點高（≥ +1）是四聲（高降），不高是三聲（降到低）；平均 ≤ -1.5 且起伏 < 1.5 → 三聲（低平）；
    起伏 < 1 → 一聲；其餘判不出來。"""
    v = [x for x in st if x is not None]
    if len(v) < 4: return {"n": len(v), "tone": None, "shape": "有聲音高點太少，判不出來"}
    w = [sorted(v[max(0, k - 1):k + 2])[len(v[max(0, k - 1):k + 2]) // 2] for k in range(len(v))]   # 3 點中位數平滑
    n = len(w); k = max(1, n // 5)
    start, end = sum(w[:k]) / k, sum(w[-k:]) / k
    mi = min(w); pos = w.index(mi) / max(1, n - 1); level = sum(w) / n
    rise, dip, back = end - start, start - mi, end - mi
    if rise >= 1.5 and (dip < 1.0 or pos <= 0.5): tone, shape = 2, "升"
    elif dip >= 1.0 and pos >= 0.25 and back >= 1.0: tone, shape = 3, "先降後升"
    elif rise <= -1.5: tone, shape = (4, "高降") if start >= 1.0 else (3, "降到低")
    elif level <= -1.5 and abs(rise) < 1.5: tone, shape = 3, "低平"
    elif abs(rise) < 1.0: tone, shape = 1, "平"
    else: tone, shape = None, "判不出來"
    r = lambda x: round(x, 2)
    return {"n": n, "start": r(start), "min": r(mi), "end": r(end), "min_pos": r(pos), "level": r(level), "rise": r(rise),
            "dip": r(dip), "tone": tone, "shape": shape}

def voiced_segments(ts, hz, gap=2, jump=2.5, min_len=0.04):
    """F0 軌跡切成一段段有聲段（≈音節）：連續 ≥ gap 格沒音高、或相鄰兩格跳 ≥ jump 半音就切。回 [(起, 迄)]。"""
    import math
    segs, cur, miss, prev = [], [], 0, None
    for t, h in zip(ts, hz):
        if not h:
            miss += 1
            if miss >= gap and cur: segs.append(cur); cur, prev = [], None
            continue
        if cur and prev and abs(12 * math.log2(h / prev)) >= jump:
            segs.append(cur); cur = []
        miss = 0; cur.append(t); prev = h
    if cur: segs.append(cur)
    return [(c[0], c[-1]) for c in segs if c[-1] - c[0] >= min_len]

def snap(segs, t0, t1, near=0.15):
    """字的時間 [t0, t1]（來源可能不準）→ 重疊最多的那個有聲段；都沒重疊就取中心最近、距離 ≤ near 的。"""
    best = max(segs, key=lambda s: max(0.0, min(s[1], t1) - max(s[0], t0)), default=None)
    if best and min(best[1], t1) - max(best[0], t0) > 0: return best
    mid = (t0 + t1) / 2
    best = min(segs, key=lambda s: abs((s[0] + s[1]) / 2 - mid), default=None)
    return best if best and abs((best[0] + best[1]) / 2 - mid) <= near else None

def calibrate(units, loc_src, loc_ref):
    """把 timing.json 的時間線性對到 whisper 找到的同一句（ElevenLabs 的 [tag] 會在句首吃掉約 0.3 秒假時間）。"""
    if not loc_src or not loc_ref or loc_src["e"] <= loc_src["s"]: return units
    a, b, c, d = loc_src["s"], loc_src["e"], loc_ref["s"], loc_ref["e"]
    f = lambda t: c + (t - a) * (d - c) / (b - a)
    return [(x, f(s), f(e)) for x, s, e in units]

def norm_en(s):
    s = unicodedata.normalize("NFKC", TAG.sub("", s)).lower().replace("\u2019", "'").replace("\u2018", "'")
    s = re.sub(r"\d+", lambda m: " " + num2en(int(m.group())) + " ", s)
    out = []
    for w in re.sub(r"[^a-z']+", " ", s).split():
        w = w.strip("'").replace("'", "")
        if not w: continue
        w = re.sub(r"(.)\1{2,}", r"\1\1", w)
        out += EN_MAP.get(w, w).split()
    return out

def compare_en(lines, words):
    R, owner, lens = [], [], []
    for k, l in enumerate(lines):
        ws = norm_en(l["text"]); R += ws; owner += [k] * len(ws); lens.append(len(ws))
    H, probs, times = [], [], []
    for w in words:
        ws = norm_en(w["w"]); H += ws; probs += [w.get("p")] * len(ws); times += [w.get("s")] * len(ws)
    pieces, h2r, r2h = align(R, H, owner)
    out_lines = _lines_skeleton(lines, lens, H, h2r, owner, times, " ")
    n_err, max_span, minor = 0, 0, []
    for tag, L, s_idx, d_idx in pieces:
        rw = [R[i] for i in s_idx]; hw = [H[j] for j in d_idx]
        if rw and hw and "".join(rw) == "".join(hw): continue          # grand pa／grandpa 這種拆字不算
        if rw and sum(w in ONO_EN for w in rw) * 2 >= len(rw): kind = "擬聲詞"
        elif not rw and all(w in ONO_EN for w in hw): kind = "擬聲詞"
        elif all(w in INTERJ_EN for w in rw + hw): kind = "語氣詞"
        elif tag == "insert" and HALLU.search(" ".join(hw)): kind = "辨識幻覺"
        else: kind = {"replace": "念錯", "delete": "漏念", "insert": "多念"}[tag]
        n = max(len(rw), len(hw))
        e = {"kind": kind, "ref": " ".join(rw), "hyp": " ".join(hw), "n": n,
             "t": (round(times[d_idx[0]], 1) if d_idx and times[d_idx[0]] is not None else None),
             "ctx": " ".join(R[max(0, s_idx[0] - 3):s_idx[0]]) if s_idx else " ".join(R[max(0, h2r[d_idx[0]] - 2):h2r[d_idx[0]] + 1])}
        e["counted"] = kind in COUNTED
        out_lines[L]["errs"].append(e)
        if e["counted"]:
            out_lines[L]["n_err"] += n; n_err += n; max_span = max(max_span, n)
        else: minor.append(dict(e, line=L + 1))
    rate, v, why = _verdict("en", len(R), n_err, out_lines, 0, max_span)
    return {"n_ref": len(R), "n_err": n_err, "rate": rate, "verdict": v, "why": why, "lines": out_lines,
            "minor": minor, "polyphones": [], "hyp_text": " ".join(H)}
'''

MAIN = r'''
import glob, json, os, sys, time, traceback
T0 = float(os.environ.get("STORY_EVAL_T0") or time.time())
mf = sorted(glob.glob("/kaggle/input/**/manifest.json", recursive=True))
if not mf: print("找不到 manifest.json", flush=True); sys.exit(2)
root = os.path.dirname(mf[0])
man = json.load(open(mf[0], encoding="utf-8"))
MODE = man.get("mode", "eval")
OUT = "/kaggle/working/" + ("story_ask_result.json" if MODE == "ask" else "story_eval_result.json")
res = {"run_id": man["run_id"], "mode": MODE, "model": "faster-whisper large-v3（float16、beam 5、不帶腳本提示、不切靜音）",
       "thresholds": THRESH, "counted": sorted(COUNTED), "items": [], "errors": [], "notes": []}
def dump(): json.dump(res, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
import numpy as np
try:
    import torch   # 先載 torch，cuDNN 才找得到（ctranslate2 用）
    res["gpu"] = torch.cuda.get_device_name(0)
    from faster_whisper import WhisperModel
    asr = WhisperModel("large-v3", device="cuda", compute_type="float16")
    list(asr.transcribe(np.zeros(16000, dtype=np.float32), language="en")[0])   # 先試跑一次，cuDNN 有問題在這裡就會炸
except Exception as e:
    print("WHISPER_INIT_FAIL", repr(e)[:800], flush=True)
    sys.exit(42)

def fw_words(path_or_wav, lang):
    segs, info = asr.transcribe(path_or_wav, language=lang, beam_size=5, vad_filter=False,
                                condition_on_previous_text=False, word_timestamps=True)
    segs = list(segs)
    words = [{"w": w.word, "s": round(w.start, 2), "e": round(w.end, 2), "p": round(w.probability, 3)} for s in segs for w in (s.words or [])]
    return words, "".join(s.text for s in segs).strip(), info.duration

# ---------- 第二個中文模型：SenseVoiceSmall（funasr），載不起來改 Paraformer-zh
SV = None; SV_NAME = None
def load_second():
    global SV, SV_NAME
    from funasr import AutoModel
    tries = [("SenseVoiceSmall", dict(model="FunAudioLLM/SenseVoiceSmall", hub="hf")),
             ("SenseVoiceSmall", dict(model="iic/SenseVoiceSmall")),
             ("Paraformer-zh", dict(model="paraformer-zh"))]
    for name, kw in tries:
        try:
            m = AutoModel(device="cuda:0", disable_update=True, **kw)
            m.generate(input=np.zeros(16000, dtype=np.float32), cache={}, language="zh", use_itn=False)
            SV, SV_NAME = m, name
            print("第二模型：", name, kw, flush=True)
            return
        except Exception as e:
            res["notes"].append(f"{name} {kw} 載不起來：{repr(e)[:300]}")
            print("第二模型載不起來", name, kw, repr(e)[:300], flush=True)
TAGS = re.compile(r"<\|[^|]*\|>")
def second_text(wav):
    r = SV.generate(input=wav, cache={}, language="zh", use_itn=False, batch_size_s=60)
    t = r[0]["text"] if r else ""
    return TAGS.sub("", t).replace(" ", "")

def load_wav(path):
    import librosa
    return librosa.load(path, sr=16000, mono=True)[0].astype(np.float32)

# =====================================================================  核對模式
def run_eval():
    try:
        load_second()
    except Exception as e:
        res["notes"].append("funasr 載不起來：" + repr(e)[:300])
    res["second_model"] = SV_NAME
    polys = {sid: parse_polys(p) for sid, p in man.get("polyphones", {}).items()}
    onos = man.get("onomatopoeia", {})
    for it in man["items"]:
        t1 = time.time()
        try:
            path = os.path.join(root, it["file"])
            words, raw, dur = fw_words(path, it["lang"])
            if it["lang"] == "zh":
                r = compare_zh(it["lines"], words, polys.get(it["sid"], []), onos.get(it["sid"], []))
                if SV is not None:
                    raw2 = second_text(load_wav(path))
                    r2 = compare_zh(it["lines"], [{"w": raw2}], polys.get(it["sid"], []), onos.get(it["sid"], []))
                    r = combine_zh(r, r2, SV_NAME)
                    r["raw2"] = raw2; r["raw2_t"] = cc("s2tw", raw2)
            else:
                r = compare_en(it["lines"], words)
            r.update(key=it["key"], sid=it["sid"], lang=it["lang"], page=it["page"], raw=raw, words=words,
                     raw_t=(cc("s2tw", raw) if it["lang"] == "zh" else raw), dur=round(dur, 2), asr_s=round(time.time() - t1, 1))
            res["items"].append(r)
            print(it["key"], r["verdict"], f"{r['rate']:.1%}", raw[:80], "|", r.get("raw2", "")[:80], flush=True)
        except Exception as e:
            traceback.print_exc()
            res["errors"].append({"key": it["key"], "error": repr(e)[:500]})
        dump()

# =====================================================================  二選一（--ask）
HF = {}
def hf_whisper():
    if not HF:
        from transformers import WhisperProcessor, WhisperForConditionalGeneration
        HF["proc"] = WhisperProcessor.from_pretrained("openai/whisper-large-v3")
        HF["model"] = WhisperForConditionalGeneration.from_pretrained("openai/whisper-large-v3", torch_dtype=torch.float16).cuda().eval()
    return HF["proc"], HF["model"]

def wh_score(wav, text, lang):
    """teacher forcing：給定音訊，算 whisper 寫出這串字（含結尾 <|endoftext|>）每個 token 的 log 機率。"""
    proc, model = hf_whisper(); tok = proc.tokenizer
    feats = proc.feature_extractor(wav, sampling_rate=16000, return_tensors="pt").input_features.to("cuda", torch.float16)
    pre = tok.convert_tokens_to_ids(["<|startoftranscript|>", f"<|{lang}|>", "<|transcribe|>", "<|notimestamps|>"])
    ids = tok.encode(text if lang == "zh" else " " + text.strip(), add_special_tokens=False) + [tok.eos_token_id]
    dec = torch.tensor([pre + ids[:-1]], device="cuda")
    with torch.no_grad():
        logits = model(input_features=feats, decoder_input_ids=dec).logits.float()
    lp = torch.log_softmax(logits[0, len(pre) - 1:], -1)
    tl = lp[torch.arange(len(ids), device="cuda"), torch.tensor(ids, device="cuda")].cpu().numpy()
    return {"sum": round(float(tl.sum()), 3), "mean": round(float(tl.mean()), 4), "n": len(ids),
            "tokens": [[tok.decode([i]), round(float(x), 3)] for i, x in zip(ids, tl)]}

def sv_ctc(wav, text):
    """SenseVoice 的 CTC：給定音訊，這串字（簡體、去標點）的 -CTC loss／token 數。沒有語言模型，不會照常見詞猜。"""
    import torch.nn.functional as F
    m = SV.model; kw = SV.kwargs; tok = kw["tokenizer"]; fe = kw["frontend"]
    from funasr.utils.load_utils import extract_fbank
    speech, lens = extract_fbank([torch.from_numpy(wav)], data_type="sound", frontend=fe)
    dev = next(m.parameters()).device
    speech, lens = speech.to(dev), lens.to(dev)
    q = lambda ids: m.embed(torch.LongTensor([ids]).to(dev)).repeat(speech.size(0), 1, 1)
    speech = torch.cat((q([m.textnorm_dict["woitn"]]), speech), 1)
    speech = torch.cat((torch.cat((q([m.lid_dict["zh"]]), q([1, 2])), 1), speech), 1)
    lens = lens + 4
    with torch.no_grad():
        enc, enc_lens = m.encoder(speech, lens)
        if isinstance(enc, tuple): enc = enc[0]
        lp = m.ctc.log_softmax(enc)[:, 4:, :].float()
    t = cc("t2s", norm_zh(text))
    ids = tok.encode(t)
    T = int(enc_lens[0].item()) - 4
    loss = F.ctc_loss(lp.transpose(0, 1)[:T], torch.tensor([ids], device=dev), torch.tensor([T]), torch.tensor([len(ids)]),
                      blank=getattr(m, "blank_id", 0), reduction="sum", zero_infinity=True)
    return {"sum": round(-float(loss), 3), "mean": round(-float(loss) / max(1, len(ids)), 4), "n": len(ids), "text": t}

PYIN = {}
def f0_track(wav, a, b, loose=False):
    """整句的 F0（pyin，5ms 一格）。回 (時間, Hz 或 None)。loose＝放寬有聲判定（有聲機率 ≥ 0.1；給 [softly] 那種氣音用，較不可靠）。"""
    import librosa
    a, b = max(0.0, a), min(len(wav) / 16000, b)
    key = (round(a, 3), round(b, 3))
    if key not in PYIN:
        i0, i1 = max(0, int(a * 16000)), min(len(wav), int(b * 16000))
        f0, vf, vp = librosa.pyin(wav[i0:i1], fmin=70, fmax=700, sr=16000, frame_length=512, hop_length=80, fill_na=None)
        ts = [a + k * 80 / 16000 for k in range(len(f0))]
        PYIN[key] = (ts, [float(x) if v else None for x, v in zip(f0, vf)], [float(x) if p >= 0.1 else None for x, p in zip(f0, vp)])
    ts, strict, lo = PYIN[key]
    return ts, (lo if loose else strict)

def tone_check(wav, tc, cands, lang, sources):
    ci = tc.get("candidate", 0); cand = cands[ci]; idx = int(tc["index"])
    out = {"char": tc.get("char"), "index": idx, "want_tone": tc.get("want_tone"), "candidate": ci, "by": {}}
    if not (0 <= idx < len(cand)) or (tc.get("char") and cand[idx] != tc["char"]):
        hit = [k for k, c in enumerate(cand) if c == tc.get("char")]
        out["note"] = f"index {idx} 不是「{tc.get('char')}」" + (f"，改用第 {hit[0]} 個字" if hit else "，候選裡也找不到這個字")
        if not hit: return out
        idx = hit[0]
    ni = len(norm_zh(cand[:idx]))
    ct = cand_tokens(cand, lang)
    locs = {name: locate(ct, units, lang) for name, units in sources}
    wloc = locs.get("whisper")
    for name, units in sources:
        loc = locs[name]
        if name == "timing.json" and wloc and loc:          # timing.json 句首有 [tag] 的假時間：整句線性對到 whisper 找到的同一句
            units = calibrate(units, loc, wloc); loc = locate(ct, units, lang)
        if not loc or loc["map"][ni] is None:
            out["by"][name] = {"note": "找不到這個字的時間"}; continue
        u = units[loc["map"][ni]]
        sa, sb = loc["s"] - 0.15, loc["e"] + 0.15
        for loose in (False, True):     # 先照一般有聲判定；這個字幾乎沒有音高（氣音）才放寬再試一次
            ts, hz = f0_track(wav, sa, sb, loose)
            voiced = sorted(x for x in hz if x)
            ref = voiced[len(voiced) // 2] if voiced else None
            sn = snap(voiced_segments(ts, hz), u[1], u[2])      # 來源給的字時間只當錨點，實際分析它落在的那個有聲段（≈整個音節）
            a, b = (sn[0], sn[1]) if sn else (u[1] - 0.02, u[2] + 0.02)
            st = [float(12 * np.log2(x / ref)) if (x and ref) else None for t, x in zip(ts, hz) if a <= t <= b]
            summ = tone_summary(st)
            if summ["tone"] is not None or summ["n"] >= 4: break
        if loose:
            summ["loose"] = True
            summ["shape"] = summ["shape"] + "（這個字幾乎是氣音，放寬有聲判定才抓到音高，可信度低）"
        summ.update(src_char=u[0], t0=round(u[1], 3), t1=round(u[2], 3), seg=[round(a, 3), round(b, 3)], snapped=bool(sn),
                    ref_hz=round(ref, 1) if ref else None, locate_dist=loc["dist"],
                    ok=(summ["tone"] == tc.get("want_tone")) if summ["tone"] else None,
                    track=[[round(t, 3), (round(x, 1) if x else None)] for t, x in zip(ts, hz)])
        out["by"][name] = summ
    out["primary"] = next((n for n, _ in sources if out["by"].get(n, {}).get("tone") is not None), None)
    return out

def run_ask():
    try:
        load_second()
    except Exception as e:
        res["notes"].append("funasr 載不起來：" + repr(e)[:300])
    res["second_model"] = SV_NAME
    sil = np.zeros(16000 * 2, dtype=np.float32)
    for q in man["questions"]:
        t1 = time.time(); lang = q.get("lang", "zh"); cands = q["candidates"]
        r = {"id": q["id"], "label": q.get("label", ""), "lang": lang, "candidates": cands}
        try:
            wav = load_wav(os.path.join(root, q["file"]))
            words, raw, dur = fw_words(wav, lang)
            r.update(raw=raw, raw_t=cc("s2tw", raw) if lang == "zh" else raw, dur=round(dur, 2))
            wunits = units_from_words(words, lang)
            tunits = None
            if q.get("timing") and lang == "zh":
                tunits = zh_units(chars_from_timing(json.load(open(os.path.join(root, q["timing"]), encoding="utf-8"))))
            # 時間段：有給 start／end 就照用；否則用 timing.json（稿子的時間）＋ whisper 逐詞時間（實際念的）把各候選找出來取聯集
            if q.get("start") is not None or q.get("end") is not None:
                s0, s1, how = float(q.get("start") or 0), float(q.get("end") or len(wav) / 16000), "題目給的 start／end"
            else:
                spans, how, tspan = [], [], None
                if tunits:
                    for c in cands:
                        loc = locate(cand_tokens(c, lang), tunits, lang)
                        if loc and loc["dist"] <= 0.34:
                            spans.append((loc["s"], loc["e"]))
                            tspan = (min(tspan[0], loc["s"]), max(tspan[1], loc["e"])) if tspan else (loc["s"], loc["e"])
                    if tspan: how.append("timing.json")
                for c in cands:
                    loc = locate(cand_tokens(c, lang), wunits, lang)
                    if loc and loc["dist"] <= 0.5 and (tspan is None or (loc["e"] > tspan[0] - 1.5 and loc["s"] < tspan[1] + 1.5)):
                        spans.append((loc["s"], loc["e"]))
                        if "whisper 逐詞時間" not in how: how.append("whisper 逐詞時間")
                if spans:
                    s0, s1, how = min(a for a, _ in spans) - 0.2, max(b for _, b in spans) + 0.25, "＋".join(how)
                else:
                    s0, s1, how = 0.0, len(wav) / 16000, "找不到，用整個檔"
            s0, s1 = max(0.0, s0), min(len(wav) / 16000, s1)
            seg = wav[int(s0 * 16000):int(s1 * 16000)]
            r["segment"] = {"start": round(s0, 2), "end": round(s1, 2), "how": how}
            sw, sraw, _ = fw_words(seg, lang)
            r["segment_whisper"] = cc("s2tw", sraw) if lang == "zh" else sraw
            # 1. Whisper teacher forcing（原文字、簡體各算一次；另算「靜音」時的分數＝語言模型先驗）
            sc = []
            for c in cands:
                d = {"text": c, "as_given": wh_score(seg, c, lang)}
                if lang == "zh":
                    d["simplified"] = wh_score(seg, cc("t2s", c), lang)
                    d["prior"] = wh_score(sil, cc("t2s", c), lang)["sum"]
                else:
                    d["prior"] = wh_score(sil, c, lang)["sum"]
                sc.append(d)
            r["whisper_ll"] = sc
            # 2. SenseVoice CTC
            if lang == "zh" and SV is not None and SV_NAME.startswith("SenseVoice"):
                try:
                    r["segment_second"] = cc("s2tw", second_text(seg))
                    r["sv_ctc"] = [sv_ctc(seg, c) for c in cands]
                except Exception as e:
                    traceback.print_exc(); r["sv_ctc_error"] = repr(e)[:400]
            elif lang == "zh":
                r["sv_ctc_error"] = f"第二模型是 {SV_NAME}，沒有做 CTC 分數"
            # 3. 聲調
            tcs = q.get("tone_check")
            if tcs:
                sources = ([("timing.json", tunits)] if tunits else []) + [("whisper", wunits)]
                r["tone"] = [tone_check(wav, tc, cands, lang, sources) for tc in (tcs if isinstance(tcs, list) else [tcs])]
        except Exception as e:
            traceback.print_exc()
            r["error"] = repr(e)[:500]
        r["sec"] = round(time.time() - t1, 1)
        res["items"].append(r)
        print("ask", q["id"], json.dumps({k: v for k, v in r.items() if k not in ("tone", "whisper_ll")}, ensure_ascii=False)[:600], flush=True)
        dump()

t_ready = time.time()
print("whisper ready", round(t_ready - T0), "s", flush=True)
if MODE == "ask": run_ask()
else: run_eval()
res["timing"] = {"setup_s": round(t_ready - T0), "asr_s": round(time.time() - t_ready), "total_s": round(time.time() - T0)}
dump()
print("done", res["timing"], flush=True)
'''


def sh(c, env=None):
    print("$", c, flush=True)
    return subprocess.run(c, shell=True, env=env).returncode


def kaggle_main():
    t0 = time.time()
    sh("nvidia-smi --query-gpu=name,memory.total --format=csv")
    open("/tmp/story_eval_inner.py", "w", encoding="utf-8").write(LIB + MAIN)
    env = dict(os.environ, STORY_EVAL_T0=str(t0))
    pk = ("faster-whisper pypinyin rapidfuzz opencc-python-reimplemented librosa soundfile funasr modelscope "
          "'transformers>=4.45,<4.58' accelerate huggingface_hub")
    # 照參考腳本另開 venv 裝 torch cu124（2026-11-13 試過直接用 Kaggle 本來的 Python：找不到 libcublas.so.12，ctranslate2 起不來）
    venv_env = dict(env, UV_LINK_MODE="copy"); venv_env.pop("VIRTUAL_ENV", None)
    sh(f"{sys.executable} -m pip install -q -U uv", env=venv_env)
    sh("uv venv -p 3.11 /tmp/ev", env=venv_env)
    vpy = "/tmp/ev/bin/python"
    sh(f"uv pip install -p {vpy} -q torch torchaudio --index-url https://download.pytorch.org/whl/cu124", env=venv_env)
    sh(f"uv pip install -p {vpy} -q numpy {pk}", env=venv_env)
    rc = sh(f"cd /tmp && {vpy} /tmp/story_eval_inner.py", env=env)
    if rc != 0:
        sys.exit(rc)


if os.path.isdir("/kaggle/working") and os.path.isdir("/kaggle/input"):
    kaggle_main()
