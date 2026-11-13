# 有疑問的頁請 Gemini 複聽（做法抄自另一個專案的 transcribe.py）。Gemini 免費版每個模型一天約 20 次，只拿來複聽 Whisper 判不準的頁。
# 用法：python gemini_check.py <音檔> "<要它特別回答的問題>" [模型]
# 金鑰讀 keys.json 的 gemini 欄（路徑同 el_common.py），不印、不寫進任何檔。
import base64, json, os, sys, time, urllib.request, urllib.error

KEYS_PATH = os.environ.get('KIDS_TTS_KEYS', 'C:/Novel/tools/tts/keys.json')
path, question = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else 'gemini-3.8-flash'
key = json.load(open(KEYS_PATH, encoding='utf-8'))['gemini']
prompt = ('先把這段語音逐字轉寫成文字（中文用繁體），照實寫下聽到的每一個字，包括念錯、多念、少念的，不要修飾。'
          '寫完之後另起一段，根據你實際聽到的聲音回答下面的問題；聽不出來就說聽不出來，不要用常理去猜。\n問題：' + question)
body = {'contents': [{'parts': [
    {'inline_data': {'mime_type': 'audio/mpeg', 'data': base64.b64encode(open(path, 'rb').read()).decode()}},
    {'text': prompt}]}]}
req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
                             data=json.dumps(body).encode(), headers={'x-goog-api-key': key, 'Content-Type': 'application/json'})
for k in range(4):
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            d = json.loads(r.read())
        print(d['candidates'][0]['content']['parts'][0]['text'])
        break
    except urllib.error.HTTPError as e:
        print('HTTP', e.code, e.read()[:200].decode(errors='replace'), file=sys.stderr)
        if e.code in (429, 500, 503):
            time.sleep(15 * (k + 1))
            continue
        break
