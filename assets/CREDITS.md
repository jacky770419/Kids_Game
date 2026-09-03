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
| `assets/pictures/animals/*.svg`（拼圖用） | Kenney「Animal Pack Redux」 https://kenney.nl/assets/animal-pack-redux（由向量總表切割） | CC0 |
| `assets/pictures/*.svg`（其餘） | 本專案自製 | 隨專案 |
| `assets/pictures/fruits/*.svg`（單字遊戲用） | 本專案自製：由 `js/lineart-food.js` 的水果線稿上色另存 | 隨專案 |
| `assets/stickers/*.svg`（貼紙場景用，12 隻動物） | 同上，Kenney「Animal Pack Redux」；由 `tools/make_stickers.js` 剝掉底色方框改作 | CC0 |
| `assets/stickers/*.svg`（其餘：水果、公主、人魚） | 本專案自製；由 `tools/make_stickers.js` 從 `assets/pictures/` 剝掉底色方框改作 | 隨專案 |
| `assets/stickers/{unicorn,cupcake,icecream,donut,cake,rainbow}.svg` | 本專案自製手繪 | 隨專案 |
| `assets/backgrounds/*.svg`（貼紙場景背景） | 本專案自製手繪 | 隨專案 |
| `assets/data/words.json` | 本專案自製 | 隨專案 |
| `js/lineart-data.js`、`js/lineart-animals.js`、`js/lineart-fantasy.js`、`js/lineart-food.js` | 本專案自製 | 隨專案 |

> `js/lineart-animals.js` 早期版本是由 Kenney 的向量總表改作的，但那套用「放大版剪影墊底」
> 做外框，轉成可上色線稿後會出現大量重疊線，已於 2026-08 整批手繪重畫，現在不含 Kenney 素材。
> 拼圖用的 `assets/pictures/animals/*.svg` 仍是 Kenney 原作。

Kenney 素材的授權原文（License.txt）：「You may use these assets in personal and commercial projects. Credit (Kenney or www.kenney.nl) would be nice but is not mandatory.」
