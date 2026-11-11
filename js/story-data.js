/* 有聲故事書的手寫資料：注音表、角色的圖、每一頁的分鏡（誰站哪裡、哪一句話時做什麼）。
   文字、誰說、時間在 js/story-script.js（由 tools/tts/build_story.py 從錄音產生），兩邊用故事 id 和頁碼對起來。

   座標一律是舞台的百分比（舞台固定 3:2）：
     x  角色腳底中心的水平位置（0＝左邊、100＝右邊）
     y  腳底的垂直位置（0＝上緣、100＝下緣）
     h  角色的高度佔舞台高度的百分比（站姿為準；坐、睡的姿勢在 SPRITES 用 k 縮小）

   分鏡 cues 每一筆：
     l     第幾句開始時觸發（0 起算；不寫＝這一頁一開始）
     at    再晚幾秒（可省略）
     id    哪個角色；下面幾個欄位都是可省略的動作：
       pose   換姿勢          x／y／h＋dur  用 dur 秒移到那裡（移動中自動加走路的搖晃）
       flip   true＝左右翻面  anim  做一次的小動作：hop／wiggle／nod／spin
       loop   持續的動作：float／sway／none      show／hide  出現／消失
       glow   小星星的亮度：dim／glow／bright
     fx    特效：hearts／notes／sparkle／spout；位置用 id（那個角色的頭上）或 x、y
     tint  換整個畫面的色調：day／sunset／night */
(function (global) {
  'use strict';

  /* 字幕的注音。她不識漢字、認注音，所以每個字旁邊都要有。
     一字一音查 ZY；讀音跟著詞變的（輕聲、破音字）寫在 ZY_PHRASES，整詞優先。
     新故事用到表裡沒有的字，tools/check_story.js 會擋下來。 */
  var ZY = {
    '一': 'ㄧ', '三': 'ㄙㄢ', '上': 'ㄕㄤˋ', '下': 'ㄒㄧㄚˋ', '不': 'ㄅㄨˋ', '主': 'ㄓㄨˇ', '也': 'ㄧㄝˇ', '了': '˙ㄌㄜ',
    '亮': 'ㄌㄧㄤˋ', '今': 'ㄐㄧㄣ', '他': 'ㄊㄚ', '以': 'ㄧˇ', '伸': 'ㄕㄣ', '住': 'ㄓㄨˋ', '你': 'ㄋㄧˇ', '來': 'ㄌㄞˊ',
    '個': 'ㄍㄜˋ', '們': '˙ㄇㄣ', '候': 'ㄏㄡˋ', '光': 'ㄍㄨㄤ', '全': 'ㄑㄩㄢˊ', '兩': 'ㄌㄧㄤˇ', '公': 'ㄍㄨㄥ', '出': 'ㄔㄨ',
    '到': 'ㄉㄠˋ', '前': 'ㄑㄧㄢˊ', '加': 'ㄐㄧㄚ', '去': 'ㄑㄩˋ', '友': 'ㄧㄡˇ', '叢': 'ㄘㄨㄥˊ', '可': 'ㄎㄜˇ', '吧': '˙ㄅㄚ',
    '呀': '˙ㄧㄚ', '呢': '˙ㄋㄜ', '呱': 'ㄍㄨㄚ', '和': 'ㄏㄢˋ', '哇': 'ㄨㄚ', '哎': 'ㄞ', '唱': 'ㄔㄤˋ', '喔': 'ㄛ',
    '嘻': 'ㄒㄧ', '囉': '˙ㄌㄨㄛ', '回': 'ㄏㄨㄟˊ', '園': 'ㄩㄢˊ', '在': 'ㄗㄞˋ', '地': '˙ㄉㄜ', '城': 'ㄔㄥˊ', '堡': 'ㄅㄠˇ',
    '多': 'ㄉㄨㄛ', '夜': 'ㄧㄝˋ', '大': 'ㄉㄚˋ', '天': 'ㄊㄧㄢ', '太': 'ㄊㄞˋ', '她': 'ㄊㄚ', '好': 'ㄏㄠˇ', '它': 'ㄊㄚ',
    '安': 'ㄢ', '家': 'ㄐㄧㄚ', '對': 'ㄉㄨㄟˋ', '小': 'ㄒㄧㄠˇ', '尖': 'ㄐㄧㄢ', '山': 'ㄕㄢ', '岸': 'ㄢˋ', '帶': 'ㄉㄞˋ',
    '幫': 'ㄅㄤ', '張': 'ㄓㄤ', '彎': 'ㄨㄢ', '彩': 'ㄘㄞˇ', '得': '˙ㄉㄜ', '從': 'ㄘㄨㄥˊ', '心': 'ㄒㄧㄣ', '忽': 'ㄏㄨ',
    '怎': 'ㄗㄣˇ', '怕': 'ㄆㄚˋ', '悄': 'ㄑㄧㄠˇ', '想': 'ㄒㄧㄤˇ', '懶': 'ㄌㄢˇ', '我': 'ㄨㄛˇ', '戶': 'ㄏㄨˋ', '手': 'ㄕㄡˇ',
    '把': 'ㄅㄚˇ', '抱': 'ㄅㄠˋ', '指': 'ㄓˇ', '捧': 'ㄆㄥˇ', '掉': 'ㄉㄧㄠˋ', '換': 'ㄏㄨㄢˋ', '數': 'ㄕㄨˇ', '早': 'ㄗㄠˇ',
    '星': 'ㄒㄧㄥ', '是': 'ㄕˋ', '時': 'ㄕˊ', '晚': 'ㄨㄢˇ', '暗': 'ㄢˋ', '更': 'ㄍㄥˋ', '最': 'ㄗㄨㄟˋ', '有': 'ㄧㄡˇ',
    '朋': 'ㄆㄥˊ', '服': 'ㄈㄨˊ', '根': 'ㄍㄣ', '棒': 'ㄅㄤˋ', '歌': 'ㄍㄜ', '每': 'ㄇㄟˇ', '比': 'ㄅㄧˇ', '沒': 'ㄇㄟˊ',
    '海': 'ㄏㄞˇ', '游': 'ㄧㄡˊ', '然': 'ㄖㄢˊ', '熊': 'ㄒㄩㄥˊ', '獨': 'ㄉㄨˊ', '獸': 'ㄕㄡˋ', '癢': 'ㄧㄤˇ', '的': '˙ㄉㄜ',
    '眨': 'ㄓㄚˇ', '眼': 'ㄧㄢˇ', '睛': 'ㄐㄧㄥ', '睡': 'ㄕㄨㄟˋ', '碰': 'ㄆㄥˋ', '空': 'ㄎㄨㄥ', '窗': 'ㄔㄨㄤ', '給': 'ㄍㄟˇ',
    '緊': 'ㄐㄧㄣˇ', '聽': 'ㄊㄧㄥ', '腰': 'ㄧㄠ', '腳': 'ㄐㄧㄠˇ', '臉': 'ㄌㄧㄢˇ', '舉': 'ㄐㄩˇ', '舒': 'ㄕㄨ', '花': 'ㄏㄨㄚ',
    '著': '˙ㄓㄜ', '虹': 'ㄏㄨㄥˊ', '蛙': 'ㄨㄚ', '裡': 'ㄌㄧˇ', '要': 'ㄧㄠˋ', '見': 'ㄐㄧㄢˋ', '角': 'ㄐㄧㄠˇ', '誰': 'ㄕㄟˊ',
    '謝': 'ㄒㄧㄝˋ', '變': 'ㄅㄧㄢˋ', '貼': 'ㄊㄧㄝ', '走': 'ㄗㄡˇ', '起': 'ㄑㄧˇ', '趴': 'ㄆㄚ', '跑': 'ㄆㄠˇ', '跳': 'ㄊㄧㄠˋ',
    '踮': 'ㄉㄧㄢˇ', '躺': 'ㄊㄤˇ', '輕': 'ㄑㄧㄥ', '這': 'ㄓㄜˋ', '進': 'ㄐㄧㄣˋ', '遇': 'ㄩˋ', '過': 'ㄍㄨㄛˋ', '還': 'ㄏㄞˊ',
    '邊': 'ㄅㄧㄢ', '那': 'ㄋㄚˋ', '部': 'ㄅㄨˋ', '都': 'ㄉㄡ', '醒': 'ㄒㄧㄥˇ', '長': 'ㄔㄤˊ', '閃': 'ㄕㄢˇ', '開': 'ㄎㄞ',
    '陽': 'ㄧㄤˊ', '雲': 'ㄩㄣˊ', '青': 'ㄑㄧㄥ', '靜': 'ㄐㄧㄥˋ', '面': 'ㄇㄧㄢˋ', '頭': 'ㄊㄡˊ', '頸': 'ㄐㄧㄥˇ', '顆': 'ㄎㄜ',
    '飛': 'ㄈㄟ', '高': 'ㄍㄠ', '魚': 'ㄩˊ', '鯨': 'ㄐㄧㄥ', '鹿': 'ㄌㄨˋ', '麼': '˙ㄇㄜ', '點': 'ㄉㄧㄢˇ'
  };

  var ZY_PHRASES = {
    '謝謝': ['ㄒㄧㄝˋ', '˙ㄒㄧㄝ'],
    '朋友': ['ㄆㄥˊ', '˙ㄧㄡ'],
    '眼睛': ['ㄧㄢˇ', '˙ㄐㄧㄥ'],
    '時候': ['ㄕˊ', '˙ㄏㄡ'],
    '舒服': ['ㄕㄨ', '˙ㄈㄨ'],
    '窗戶': ['ㄔㄨㄤ', '˙ㄏㄨ'],
    '指頭': ['ㄓˇ', '˙ㄊㄡ'],
    '太陽': ['ㄊㄞˋ', '˙ㄧㄤ'],
    '不了家': ['ㄅㄨˋ', 'ㄌㄧㄠˇ', 'ㄐㄧㄚ']   // 「回不了家」的了念ㄌㄧㄠˇ
  };

  /* 角色的圖。k＝這個姿勢相對站姿的高度（坐著、躺著比較矮）；left:true＝這張圖本來就面朝左。
     路徑寫成完整字面而不是拼字串，tools/check_precache.js 才掃得到（跟 cake-data.js 同一個理由）。 */
  var SPRITES = {
    bear: {
      walk: { src: 'assets/story/chars/bear-walk.png' },
      hug: { src: 'assets/story/chars/bear-hug.png' },
      point: { src: 'assets/story/chars/bear-point.png' },
      wake: { src: 'assets/story/chars/bear-wake.png', k: 0.92 },
      sad: { src: 'assets/story/chars/bear-sad.png', k: 0.84 },
      sleep: { src: 'assets/story/chars/bear-sleep.png', k: 0.6 }
    },
    frog: {
      sit: { src: 'assets/story/chars/frog-sit.png', left: true },
      jump: { src: 'assets/story/chars/frog-jump.png', left: true }
    },
    giraffe: {
      stand: { src: 'assets/story/chars/giraffe-stand.png', left: true },
      bend: { src: 'assets/story/chars/giraffe-bend.png', left: true, k: 0.68 }
    },
    whale: {
      happy: { src: 'assets/story/chars/whale-happy.png', left: true }
    },
    princess: {
      stand: { src: 'assets/stickers/princess.png' },
      cup: { src: 'assets/story/chars/princess-cup.png' },
      reach: { src: 'assets/story/chars/princess-reach.png', k: 1.14 },
      lean: { src: 'assets/story/chars/princess-lean.png', k: 0.6 },
      run: { src: 'assets/story/chars/princess-run.png' },
      bed: { src: 'assets/story/chars/princess-bed.png', k: 0.7 },
      ride: { src: 'assets/story/chars/unicorn-ride.png', k: 1.25 }
    },
    unicorn: {
      walk: { src: 'assets/story/chars/unicorn-walk.png', left: true }
    },
    star: { dim: { svg: true }, glow: { svg: true }, bright: { svg: true } }
  };

  /* 說話的人 → 畫面上哪個角色跟著動、字幕框用什麼顏色 */
  var VOICES = {
    '旁白': { color: '#FFD93D' },
    '小熊': { actor: 'bear', color: '#E8A85C' },
    '小青蛙': { actor: 'frog', color: '#8EDB8A' },
    '長頸鹿': { actor: 'giraffe', color: '#FFB05C' },
    '大鯨魚': { actor: 'whale', color: '#7CC8F5' },
    '小公主': { actor: 'princess', color: '#FF9EC4' },
    '小星星': { actor: 'star', color: '#FFE98A' },
    '獨角獸': { actor: 'unicorn', color: '#B79CFF' }
  };

  var STAGING = {
    'bear-hug': {
      color: '#8EDB8A',
      cover: { bg: 'assets/story/bg/forest-morning.jpg', actor: 'bear', pose: 'hug' },
      pages: [
        { // 1 早上醒來
          bg: 'assets/story/bg/forest-morning.jpg',
          actors: [{ id: 'bear', pose: 'wake', x: 50, y: 92, h: 50 }],
          cues: [
            { l: 0, at: 2.2, id: 'bear', anim: 'wiggle' },
            { l: 1, id: 'bear', pose: 'hug', anim: 'hop' },
            { l: 1, at: 1.4, fx: 'hearts', id: 'bear' }
          ]
        },
        { // 2 小青蛙
          bg: 'assets/story/bg/pond.jpg',
          actors: [
            { id: 'frog', pose: 'sit', x: 66, y: 66, h: 15 },
            { id: 'bear', pose: 'walk', x: -14, y: 93, h: 46 }
          ],
          cues: [
            { id: 'bear', x: 30, dur: 2.6 },
            { l: 0, at: 2.6, id: 'frog', anim: 'hop' },
            { l: 2, id: 'bear', pose: 'point', x: 40, dur: 1.2 },
            { l: 2, at: 0.9, id: 'frog', pose: 'jump', x: 55, y: 74, dur: 0.7 },
            { l: 2, at: 1.7, id: 'frog', pose: 'sit' },
            { l: 2, at: 2.6, fx: 'hearts', x: 53, y: 56 },
            { l: 3, id: 'frog', anim: 'hop' },
            { l: 3, at: 1.2, id: 'frog', anim: 'hop' }
          ]
        },
        { // 3 長頸鹿
          bg: 'assets/story/bg/meadow.jpg',
          actors: [
            { id: 'giraffe', pose: 'stand', x: 70, y: 93, h: 90 },
            { id: 'bear', pose: 'walk', x: -14, y: 95, h: 34 }
          ],
          cues: [
            { id: 'bear', x: 30, dur: 2.6 },
            { l: 0, at: 2.6, id: 'giraffe', anim: 'nod' },
            { l: 2, id: 'bear', x: 69, dur: 1.5 },
            { l: 2, at: 1.4, id: 'bear', pose: 'hug', anim: 'wiggle' },
            { l: 2, at: 2.6, fx: 'hearts', x: 69, y: 54 },
            { l: 3, id: 'giraffe', pose: 'bend', anim: 'wiggle' },
            { l: 3, at: 1.2, id: 'giraffe', anim: 'wiggle' }
          ]
        },
        { // 4 大鯨魚
          bg: 'assets/story/bg/beach.jpg',
          waves: 63,
          actors: [
            { id: 'whale', pose: 'happy', x: 68, y: 70, h: 34, loop: 'float' },
            { id: 'bear', pose: 'walk', x: -14, y: 94, h: 34 }
          ],
          cues: [
            { id: 'bear', x: 22, dur: 2.4 },
            { l: 0, at: 3.4, id: 'whale', anim: 'nod' },
            { l: 0, at: 3.6, fx: 'spout', id: 'whale' },
            { l: 2, id: 'bear', pose: 'hug', x: 40, y: 86, dur: 1.4 },
            { l: 2, at: 0.4, id: 'whale', x: 58, dur: 1.6 },
            { l: 2, at: 3.0, fx: 'hearts', x: 47, y: 50 },
            { l: 3, at: 0.2, fx: 'spout', id: 'whale' }
          ]
        },
        { // 5 太陽下山，小熊一個人
          bg: 'assets/story/bg/beach.jpg',
          tint: 'day',
          actors: [{ id: 'bear', pose: 'hug', x: 40, y: 95, h: 36 }],
          cues: [
            { at: 0.3, tint: 'sunset' },
            { l: 0, at: 1.6, id: 'bear', pose: 'walk' },
            { l: 1, id: 'bear', pose: 'sad' }
          ]
        },
        { // 6 朋友們回來
          bg: 'assets/story/bg/beach.jpg',
          tint: 'sunset',
          waves: 63,
          actors: [
            { id: 'whale', pose: 'happy', x: 124, y: 70, h: 32, loop: 'float' },
            { id: 'giraffe', pose: 'stand', x: 125, y: 93, h: 84 },
            { id: 'bear', pose: 'sad', x: 40, y: 95, h: 36 },
            { id: 'frog', pose: 'jump', x: -8, y: 95, h: 13, flip: true }
          ],
          cues: [
            { l: 0, at: 1.2, id: 'frog', x: 22, dur: 1.0 },
            { l: 0, at: 2.3, id: 'frog', pose: 'sit' },
            { l: 0, at: 2.6, id: 'giraffe', x: 84, dur: 1.4 },
            { l: 0, at: 4.0, id: 'giraffe', pose: 'bend' },
            { l: 0, at: 4.2, id: 'whale', x: 56, dur: 1.6 },
            { l: 1, id: 'bear', pose: 'walk', flip: true },
            { l: 1, at: 0.1, id: 'frog', anim: 'hop' },
            { l: 1, at: 0.9, id: 'frog', anim: 'hop' }
          ]
        },
        { // 7 大家抱在一起
          bg: 'assets/story/bg/beach.jpg',
          tint: 'sunset',
          waves: 63,
          actors: [
            { id: 'whale', pose: 'happy', x: 56, y: 70, h: 32, loop: 'float' },
            { id: 'giraffe', pose: 'bend', x: 84, y: 93, h: 84 },
            { id: 'bear', pose: 'hug', x: 40, y: 95, h: 38, loop: 'sway' },
            { id: 'frog', pose: 'sit', x: 22, y: 95, h: 13 }
          ],
          cues: [
            { at: 0.2, id: 'frog', pose: 'jump', x: 27, y: 78, dur: 0.8 },
            { at: 0.3, id: 'giraffe', x: 76, dur: 1.2 },
            { l: 0, at: 0.6, fx: 'hearts', x: 28, y: 60 },
            { l: 0, at: 2.0, fx: 'hearts', x: 70, y: 30 },
            { l: 0, at: 3.4, fx: 'hearts', x: 56, y: 38 },
            { l: 1, id: 'bear', anim: 'hop' },
            { l: 1, at: 0.6, fx: 'hearts', id: 'bear' },
            { l: 1, at: 1.4, fx: 'sparkle', x: 42, y: 44 }
          ]
        },
        { // 8 晚安
          bg: 'assets/story/bg/beach.jpg',
          tint: 'night',
          stars: [0, 0, 100, 34],
          actors: [{ id: 'bear', pose: 'sleep', x: 46, y: 93, h: 40 }],
          cues: [
            { l: 1, at: 0.4, fx: 'hearts', x: 50, y: 60 }
          ]
        }
      ]
    },

    'princess-star': {
      color: '#B79CFF',
      cover: { bg: 'assets/story/bg/garden-night.jpg', actor: 'princess', pose: 'cup', star: true },
      pages: [
        { // 1 窗邊數星星
          bg: 'assets/story/bg/bedroom-night.jpg',
          stars: [56, 15, 85, 32],
          starsLate: true,
          actors: [{ id: 'princess', pose: 'lean', x: 70, y: 62, h: 60 }],
          cues: [
            { l: 1, at: 0.1, stars: 1 },
            { l: 1, at: 1.2, stars: 2 },
            { l: 1, at: 2.2, stars: 3 },
            { l: 1, at: 3.0, stars: 99 }
          ]
        },
        { // 2 小星星掉下來
          bg: 'assets/story/bg/bedroom-night.jpg',
          stars: [56, 15, 85, 32],
          actors: [
            { id: 'star', pose: 'bright', x: 58, y: 24, h: 8 },
            { id: 'princess', pose: 'lean', x: 70, y: 62, h: 60 }
          ],
          cues: [
            { l: 0, at: 0.5, id: 'star', anim: 'spin' },
            { l: 0, at: 1.0, id: 'star', x: 85, y: 58, dur: 1.1 },
            { l: 0, at: 2.1, id: 'star', hide: true },
            { l: 0, at: 2.1, fx: 'sparkle', x: 85, y: 55 },
            { l: 1, id: 'princess', anim: 'hop' }
          ]
        },
        { // 3 花園裡的小星星
          bg: 'assets/story/bg/garden-night.jpg',
          actors: [
            { id: 'star', pose: 'dim', x: 74, y: 84, h: 12 },
            { id: 'princess', pose: 'run', x: -14, y: 93, h: 48 }
          ],
          cues: [
            { id: 'princess', x: 34, dur: 2.2 },
            { l: 0, at: 2.4, id: 'princess', pose: 'stand' },
            { l: 1, id: 'star', anim: 'wiggle' }
          ]
        },
        { // 4 捧在手心唱歌
          bg: 'assets/story/bg/garden-night.jpg',
          actors: [
            { id: 'princess', pose: 'stand', x: 40, y: 93, h: 50 },
            { id: 'star', pose: 'dim', x: 74, y: 84, h: 12 }
          ],
          cues: [
            { l: 0, at: 0.2, id: 'princess', x: 60, dur: 1.2 },
            { l: 1, id: 'princess', pose: 'cup' },
            { l: 1, at: 0.2, id: 'star', x: 60, y: 71, h: 9, dur: 0.8 },
            { l: 1, at: 2.6, fx: 'notes', x: 67, y: 46 },
            { l: 1, at: 3.8, fx: 'notes', x: 53, y: 46 },
            { l: 1, at: 5.4, id: 'star', glow: 'glow', anim: 'hop' }
          ]
        },
        { // 5 獨角獸來了
          bg: 'assets/story/bg/garden-night.jpg',
          actors: [
            { id: 'princess', pose: 'reach', x: 36, y: 93, h: 50 },
            { id: 'star', pose: 'glow', x: 36, y: 35, h: 9, loop: 'float' },
            { id: 'unicorn', pose: 'walk', x: 122, y: 94, h: 56 }
          ],
          cues: [
            { l: 0, id: 'princess', anim: 'hop' },
            { l: 1, id: 'unicorn', x: 74, dur: 1.8 },
            { l: 1, at: 0.3, id: 'princess', pose: 'cup' },
            { l: 1, at: 0.3, id: 'star', x: 36, y: 71, dur: 0.5 },
            { l: 2, id: 'unicorn', anim: 'nod' }
          ]
        },
        { // 6 跑上彩虹
          bg: 'assets/story/bg/sky-night.jpg',
          stars: [0, 2, 62, 40],
          actors: [{ id: 'princess', pose: 'ride', x: -14, y: 88, h: 30 }],
          cues: [
            { id: 'princess', x: 30, y: 58, dur: 2.4 },
            { l: 0, at: 2.4, id: 'princess', x: 62, y: 36, dur: 2.2 },
            { l: 0, at: 1.4, fx: 'sparkle', x: 14, y: 70 },
            { l: 0, at: 3.4, fx: 'sparkle', x: 42, y: 50 },
            { l: 1, id: 'princess', loop: 'float' }
          ]
        },
        { // 7 回家囉
          bg: 'assets/story/bg/sky-night.jpg',
          stars: [0, 2, 62, 40],
          actors: [
            { id: 'unicorn', pose: 'walk', x: 76, y: 84, h: 44 },
            { id: 'princess', pose: 'cup', x: 44, y: 84, h: 44 },
            { id: 'star', pose: 'glow', x: 44, y: 64, h: 8 }
          ],
          cues: [
            { l: 0, at: 1.6, id: 'princess', pose: 'reach' },
            { l: 0, at: 1.6, id: 'star', x: 44, y: 33, dur: 0.6 },
            { l: 1, at: 0.6, id: 'star', x: 30, y: 16, dur: 1.6, anim: 'spin' },
            { l: 2, id: 'star', glow: 'bright' },
            { l: 2, at: 0.6, fx: 'sparkle', x: 30, y: 12 },
            { l: 2, at: 2.0, fx: 'sparkle', x: 30, y: 12 }
          ]
        },
        { // 8 晚安
          bg: 'assets/story/bg/bedroom-night.jpg',
          stars: [56, 15, 85, 32],
          actors: [
            { id: 'star', pose: 'bright', x: 70, y: 36, h: 10, loop: 'float' },
            { id: 'princess', pose: 'bed', x: 27, y: 96, h: 52 }
          ],
          cues: [
            { l: 0, at: 4.4, id: 'star', anim: 'blink' },
            { l: 1, id: 'star', anim: 'blink' },
            { l: 2, at: 1.0, fx: 'hearts', x: 24, y: 58 }
          ]
        }
      ]
    }
  };

  var StoryData = { ZY: ZY, ZY_PHRASES: ZY_PHRASES, SPRITES: SPRITES, VOICES: VOICES, STAGING: STAGING };
  if (typeof module !== 'undefined' && module.exports) module.exports = StoryData;
  global.StoryData = StoryData;
})(typeof window !== 'undefined' ? window : globalThis);
