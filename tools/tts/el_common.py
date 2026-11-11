# ElevenLabs 共用小工具（做法抄自另一個專案的 el_ch10.py，urllib 版、零額外依賴）。
# 金鑰不放在這個 repo：預設讀 C:/Novel/tools/tts/keys.json 的 eleven 欄，
# 換機器時用環境變數 KIDS_TTS_KEYS 指到別的 keys.json。金鑰值不印、不寫進任何輸出檔。
import json, os, time, urllib.request, urllib.error, urllib.parse

KEYS_PATH = os.environ.get('KIDS_TTS_KEYS', 'C:/Novel/tools/tts/keys.json')
_KEY = None


def _key():
    global _KEY
    if _KEY is None:
        _KEY = json.load(open(KEYS_PATH, encoding='utf-8'))['eleven']
    return _KEY


def api(path, body=None, raw=False, query=None):
    """呼叫 ElevenLabs。body 給了就是 POST；raw=True 回 bytes（音檔）。429／5xx 重試兩次。"""
    url = 'https://api.elevenlabs.io' + path
    if query:
        url += ('&' if '?' in url else '?') + urllib.parse.urlencode(query)
    req = urllib.request.Request(
        url, data=json.dumps(body).encode() if body is not None else None,
        headers={'xi-api-key': _key(), 'Content-Type': 'application/json'})
    for k in range(3):
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                return r.read() if raw else json.load(r)
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')[:400]
            if e.code in (429, 500, 502, 503) and k < 2:
                time.sleep(10)
                continue
            raise SystemExit(f'HTTP {e.code} {path}: {msg}')


def subscription():
    """回 (已用, 上限, 下次重置的 unix 秒, 方案, 狀態)。查詢不扣點。"""
    s = api('/v1/user/subscription')
    return (s.get('character_count'), s.get('character_limit'),
            s.get('next_character_count_reset_unix'), s.get('tier'), s.get('status'))
