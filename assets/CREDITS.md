# 素材來源與授權

本專案使用的第三方素材如下。轉檔（OGG→M4A、MP3 重壓、SVG 切割與線稿化）皆為本專案所做，原始授權允許改作。

## 背景音樂（`assets/music/`）

| 檔案 | 曲名 | 作者 | 授權 |
|---|---|---|---|
| `childrens-march.mp3` | Children's March Theme | Cleyton Kauffman（https://soundcloud.com/cleytonkauffman） | CC0 — https://opengameart.org/content/childrens-march-theme |
| `fluffing-a-duck.mp3` | Fluffing a Duck | Kevin MacLeod (incompetech.com) | CC BY 4.0 |
| `monkeys-spinning-monkeys.mp3` | Monkeys Spinning Monkeys | Kevin MacLeod (incompetech.com) | CC BY 4.0 |

Kevin MacLeod 曲目的官方標註格式：

```
Fluffing a Duck Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0
https://creativecommons.org/licenses/by/4.0/

Monkeys Spinning Monkeys Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0
https://creativecommons.org/licenses/by/4.0/
```

## 音效（`assets/sfx/`）

| 檔案 | 原始檔 | 來源 | 授權 |
|---|---|---|---|
| `click.m4a` | `click_001.ogg` | Kenney「Interface Sounds」 https://kenney.nl/assets/interface-sounds | CC0 |
| `pop.m4a` | `drop_002.ogg` | 同上 | CC0 |
| `snap.m4a` | `pluck_002.ogg` | 同上 | CC0 |
| `win.m4a` | `jingles_PIZZI07.ogg` | Kenney「Music Jingles」 https://kenney.nl/assets/music-jingles | CC0 |

## 字型

| 字型 | 用途 | 來源 | 授權 |
|---|---|---|---|
| Lilita One | 英文標題與單字（中文走系統字型） | Google Fonts https://fonts.google.com/specimen/Lilita+One （以 `<link>` 載入，未收進 repo；離線時退回系統字） | SIL Open Font License 1.1 |

## 圖片

| 位置 | 來源 | 授權 |
|---|---|---|
| `assets/puzzle-src/*.png`、`assets/puzzle/*.jpg`（拼圖用滿版場景 28 張：動物、車、公主、美人魚、城堡） | 本專案以 AI 生圖產出：2026-11 由 OpenAI Codex 內建生圖，依 `assets/color-src/` 的上色圖重畫成滿版場景，再縮成 1024 JPEG | 隨專案 |
| `assets/pictures/animals/*.png`（單字用，12 隻）、`assets/pictures/vehicles/*.png`（12 台車）、`assets/pictures/{princess,princess-braid,mermaid,castle}.png` | 本專案以 AI 生圖產出：2026-11 由 OpenAI Codex 內建生圖把著色線稿上色（原圖 `assets/color-src/`），再用 `tools/make_color_art.py` 疊淡色底框 | 隨專案 |
| `assets/pictures/*.svg`（小屋、海底、小熊、火箭） | 本專案自製 | 隨專案 |
| `assets/pictures/fruits/*.svg`（單字遊戲用） | 本專案自製：由 `js/lineart-food.js` 的水果線稿上色另存 | 隨專案 |
| `assets/stickers/*.png`（12 隻動物、公主、辮子公主、美人魚、獨角獸、12 台車） | 本專案以 AI 生圖產出：Codex 把著色線稿上色（原圖 `assets/color-src/`），再用 `tools/make_color_art.py` 去白底 | 隨專案 |
| `assets/stickers/*.svg`（水果） | 本專案自製；由 `tools/make_stickers.js` 從 `assets/pictures/fruits/` 剝掉底色方框改作 | 隨專案 |
| `assets/stickers/{cupcake,icecream,donut,cake,rainbow}.svg` | 本專案自製手繪 | 隨專案 |
| `assets/backgrounds/*.svg`（貼紙場景背景） | 本專案自製手繪 | 隨專案 |
| `assets/data/words.json` | 本專案自製 | 隨專案 |
| `js/lineart-data.js`（太陽小花、小汽車）、`js/lineart-food.js` | 本專案自製 | 隨專案 |
| `assets/lineart-src/*.png`、`assets/lineart/*.png`（著色用點陣線稿：場景 8 張、動物 15 隻、彩虹獨角獸、公主與城堡 14 張、車車 12 台） | 本專案以 AI 生圖產出（動物、獨角獸、公主與城堡、車車為 2026-11 由 OpenAI Codex 內建生圖），再用 `tools/make_stencil.py` 轉檔 | 隨專案 |

> `js/lineart-animals.js` 早期版本是由 Kenney 的向量總表改作的，但那套用「放大版剪影墊底」
> 做外框，轉成可上色線稿後會出現大量重疊線，已於 2026-08 整批手繪重畫；2026-11 再整批換成點陣線稿
> （手繪版認得出是什麼動物但很不像），現在只是一份 PNG 清單，不含 Kenney 素材。
> 拼圖／單字／貼紙的動物圖原本是 Kenney「Animal Pack Redux」（CC0），2026-11 已整批換成上色點陣圖，
> 目前圖片已不含 Kenney 素材（音效仍用 Kenney 的 CC0 音檔）。

Kenney 素材的授權原文（License.txt）：「You may use these assets in personal and commercial projects. Credit (Kenney or www.kenney.nl) would be nice but is not mandatory.」
