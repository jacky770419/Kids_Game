# 動動腦題目語音的試聽頁：把已經收進網站的音檔（assets/logic/audio/）列成一頁，給大人抽聽。
#
#   python tools/logic-tts/listen_page.py   → 產生 _logic_tts/試聽_動動腦_全部.html（直接用瀏覽器打開）
#
# 最上面是「先聽這幾句」：校稿時列出 TTS 容易念錯的字（載、划、當、乾、只、漂亮的輕聲、疊字動詞、句尾的「會滾」）。
# 我（寫程式的 AI）聽不到音檔，所以念得對不對要靠人聽；聽到念錯的，改台詞避開那個字或重錄那一句
# （刪掉 _logic_tts/raw/<zh|en>/<編號>.mp3 再跑 el_logic.py record all、build）。
import html, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, '_logic_tts', '試聽_動動腦_全部.html')

# 編號 → 要注意聽什麼
FIRST = [
    ('river.intro1', '「載」要念 ㄗㄞˋ、「只」ㄓˇ'),
    ('river.first', '「載」要念 ㄗㄞˋ'),
    ('river.ask4', '「划」ㄏㄨㄚˊ、「當老師」的當 ㄉㄤ、「試試看」有沒有多念少念'),
    ('river.win4', '「划」ㄏㄨㄚˊ、「七趟」'),
    ('river.r.wolf', '「捉弄」'),
    ('detective.intro1', '「哎呀！」的語氣'),
    ('detective.intro2', '「當偵探」的當 ㄉㄤ'),
    ('detective.adult', '「當偵探」的當 ㄉㄤ'),
    ('detective.c.dry', '「乾」ㄍㄢ'),
    ('detective.last', '「只剩下」的只 ㄓˇ'),
    ('detective.pick', '「偷偷」有沒有多念少念'),
    ('beads.next', '「漂亮」的亮是輕聲'),
    ('beads.hint', '「聽聽看」'),
    ('beads.hint3', '「試試看」'),
    ('beads.done6', '「猜猜看」'),
    ('tidy.done4', '「猜猜看」'),
    ('tidy.t.ball', '句尾的「會滾。」有沒有被吞掉'),
    ('sys.good1', '很短的一句，有沒有吞字或拖尾'),
]


def main():
    r = subprocess.run(['node', os.path.join(HERE, 'export_lines.js')], capture_output=True, check=True)
    lines = {l['id']: l for l in json.loads(r.stdout.decode('utf-8'))}

    def row(lid, note=''):
        l = lines[lid]
        cells = []
        for lang, name in (('zh', '中文'), ('en', '英文')):
            rel = 'assets/logic/audio/%s/%s.mp3' % (lang, lid)
            if os.path.exists(os.path.join(ROOT, rel)):
                cells.append('<div class="a"><span>%s</span> %s<br><audio controls preload="none" src="../%s"></audio></div>' % (
                    name, html.escape(l[lang]), rel))
            else:
                cells.append('<div class="a"><span>%s</span> %s<br><i>（還沒錄）</i></div>' % (name, html.escape(l[lang])))
        return '<section><h3>%s%s</h3>%s</section>' % (
            html.escape(lid), ('　<small>注意：' + html.escape(note) + '</small>') if note else '', ''.join(cells))

    first_ids = [i for i, _ in FIRST if i in lines]
    body = ['<h2>先聽這幾句（%d 句，容易念錯的字）</h2>' % len(first_ids)]
    body += [row(i, n) for i, n in FIRST if i in lines]
    body.append('<h2>全部（%d 句）</h2>' % len(lines))
    body += [row(i) for i in lines]
    page = ('<!doctype html><meta charset="utf-8"><title>試聽：動動腦題目語音（全部）</title>'
            '<style>body{font:17px/1.6 sans-serif;max-width:860px;margin:24px auto;padding:0 16px}'
            'section{border-top:1px solid #ddd;padding:10px 0}h3{margin:0 0 6px;font-size:16px}small{color:#b04;font-weight:normal}'
            '.a{margin:6px 0}.a span{display:inline-block;min-width:3em;color:#666}audio{height:34px;width:100%;max-width:520px}</style>'
            '<h1>試聽：動動腦題目語音</h1><p>中文、英文都是故事書的旁白 Yui。聽到念錯的，記下編號（例如 river.first 的中文）告訴我。</p>'
            + ''.join(body))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, 'w', encoding='utf-8').write(page)
    print('試聽頁：', OUT, '（先聽 %d 句、全部 %d 句）' % (len(first_ids), len(lines)))


if __name__ == '__main__':
    main()
