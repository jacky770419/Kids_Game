/* 小水滴的旅行：分鏡（手寫）。格式見 js/story-data.js 開頭與 addBook 的說明；文字與時間在 water-drop-script.js。
   海的三張背景（早上／中午／傍晚）海平面約在 y 22～24，下面是海水、最下面是沙；第 1～3 頁加 waves: 23 讓小水滴、小魚站在浪上
   （傍晚那頁不加：藍色的浪跟深色的海不搭）。天上、雨裡、溪裡的水滴都用 loop float 飄著。
   頁碼點在畫面上緣 x 24～76、y 0～9，那一塊不要放角色的頭（海的那幾頁小水滴靠左站就是為了這個）。
   cloud 的 white／dark、flower 的 drink、drops 的 hug／sniff 是「好幾個角色畫在同一張」，換上去時要把單獨的小水滴、水滴妹妹藏起來。
   wdMob1～3 是一起飛上天、一起流進大河的「好多小水滴」（借用小水滴的圖、縮小）。 */
StoryData.addBook('water-drop', {
  color: '#8FD3F5',
  cover: { bg: 'bg-garden-rainbow.jpg', actor: 'wdDrop', pose: 'bounce' },
  voices: {
    '小水滴': { actor: 'wdDrop', color: '#A8DDF7' },
    '小魚': { actor: 'wdFish', color: '#FFC08A' },
    '太陽公公': { actor: 'wdSun', color: '#FFD86B' },
    '水滴妹妹': { actor: 'wdSister', color: '#F7C6DA' },
    '小花': { actor: 'wdFlower', color: '#FFB3C8' }
  },
  sprites: {
    wdDrop: {
      wave: { src: 'drop-wave.png' },
      bounce: { src: 'drop-bounce.png' },
      hot: { src: 'drop-hot.png' },
      float: { src: 'drop-float.png' },
      shiver: { src: 'drop-shiver.png' },
      whee: { src: 'drop-whee.png' },
      talk: { src: 'drop-talk.png' },
      yawn: { src: 'drop-yawn.png', k: 0.7 }
    },
    wdSister: {
      wave: { src: 'sister-wave.png' },
      whee: { src: 'sister-whee.png' }
    },
    // 小水滴和水滴妹妹畫在同一張
    wdDrops: {
      hug: { src: 'drops-hug.png' },
      sniff: { src: 'drops-sniff.png', k: 0.75 }
    },
    wdFish: {
      swim: { src: 'fish-swim.png' },
      bye: { src: 'fish-bye.png' },
      happy: { src: 'fish-happy.png' },
      sleep: { src: 'fish-sleep.png' }
    },
    wdSun: {
      smile: { src: 'sun-smile.png' },
      wink: { src: 'sun-wink.png' }
    },
    // 雲裡面畫了好多小水滴（白雲）、小水滴和水滴妹妹抱在一起（烏雲）
    wdCloud: {
      white: { src: 'cloud-white.png' },
      dark: { src: 'cloud-dark.png' }
    },
    // drink 那張也畫了坐在葉子上的小水滴；字幕圓框用第一個姿勢的臉，所以 wave 放第一個
    wdFlower: {
      wave: { src: 'flower-wave.png' },
      droop: { src: 'flower-droop.png' },
      drink: { src: 'flower-drink.png' }
    },
    wdMob1: { float: { src: 'drop-float.png' }, wave: { src: 'drop-wave.png' } },
    wdMob2: { float: { src: 'drop-float.png' }, wave: { src: 'drop-wave.png' } },
    wdMob3: { float: { src: 'drop-float.png' }, wave: { src: 'drop-wave.png' } }
  },
  taps: {
    wdDrop: ['hop', 'sparkle'],
    wdSister: ['hop', 'hearts'],
    wdDrops: ['hop', 'hearts'],
    wdFish: ['wiggle', 'spout'],
    wdSun: ['nod', 'sparkle'],
    wdCloud: ['wiggle', 'spout'],
    wdFlower: ['nod', 'hearts'],
    wdMob1: ['hop', 'sparkle'],
    wdMob2: ['hop', 'sparkle'],
    wdMob3: ['hop', 'sparkle']
  },
  pages: [
    { // 1 早上的大海：小水滴在海浪上跳，小魚在水裡游
      bg: 'bg-sea-morning.jpg',
      waves: 23,
      actors: [
        { id: 'wdDrop', pose: 'bounce', x: 18, y: 30, h: 24 },
        { id: 'wdFish', pose: 'swim', x: 50, y: 58, h: 18, loop: 'float' }
      ],
      cues: [
        { l: 0, at: 1.6, id: 'wdDrop', anim: 'hop' },
        { l: 1, id: 'wdFish', x: 70, dur: 2.2 },
        { l: 1, at: 0.6, id: 'wdDrop', anim: 'hop' },
        { l: 1, at: 1.6, id: 'wdDrop', anim: 'hop' },
        { l: 2, id: 'wdFish', flip: true, anim: 'wiggle' },
        { l: 2, at: 0.6, id: 'wdFish', x: 52, dur: 1.4 },
        { l: 3, id: 'wdDrop', pose: 'talk' },
        { l: 3, at: 1.6, fx: 'sparkle', x: 72, y: 12 },
        { l: 4, id: 'wdFish', anim: 'nod' }
      ]
    },
    { // 2 中午，太陽公公照著大海；小水滴熱熱的、變輕了
      bg: 'bg-sea-noon.jpg',
      waves: 23,
      actors: [
        { id: 'wdSun', pose: 'smile', x: 84, y: 42, h: 32, loop: 'float' },
        { id: 'wdDrop', pose: 'wave', x: 18, y: 31, h: 24 }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'wdSun', anim: 'hop' },
        { l: 0, at: 1.0, fx: 'sparkle', id: 'wdSun' },
        { l: 1, id: 'wdSun', anim: 'nod' },
        { l: 1, at: 1.0, fx: 'sparkle', x: 50, y: 30 },
        { l: 2, id: 'wdDrop', pose: 'hot', anim: 'wiggle' },
        { l: 2, at: 1.4, id: 'wdDrop', anim: 'wiggle' },
        { l: 3, id: 'wdSun', anim: 'nod' },
        { l: 3, at: 1.2, fx: 'sparkle', id: 'wdSun' },
        { l: 4, id: 'wdDrop', pose: 'float', loop: 'float' },
        { l: 4, at: 0.6, id: 'wdDrop', y: 27, dur: 2 }
      ]
    },
    { // 3 變成水氣往上飄；小魚探出頭說再見，越來越小
      bg: 'bg-sea-noon.jpg',
      waves: 23,
      actors: [
        { id: 'wdDrop', pose: 'float', x: 18, y: 28, h: 24, loop: 'float' },
        { id: 'wdFish', pose: 'bye', x: 68, y: 30, h: 20 }
      ],
      cues: [
        { l: 0, at: 1.6, id: 'wdDrop', x: 17, y: 23, h: 21, dur: 2.4 },
        { l: 1, id: 'wdDrop', anim: 'hop' },
        { l: 2, id: 'wdFish', anim: 'wiggle' },
        { l: 2, at: 1.2, id: 'wdFish', anim: 'wiggle' },
        { l: 3, id: 'wdDrop', x: 13, y: 18, h: 14, dur: 3.2 },
        { l: 4, id: 'wdFish', h: 6, y: 27, dur: 2.4 },
        { l: 4, at: 0.6, id: 'wdDrop', x: 8, y: 9, h: 7, dur: 2.2 },
        { l: 4, at: 2.6, id: 'wdFish', hide: true }
      ]
    },
    { // 4 高高的天上好冷；變回小水滴，遇到水滴妹妹
      bg: 'bg-sky-high.jpg',
      actors: [
        { id: 'wdDrop', pose: 'float', x: 34, y: 72, h: 40, loop: 'float' },
        { id: 'wdSister', pose: 'wave', x: 112, y: 64, h: 34, flip: true, loop: 'float' }
      ],
      cues: [
        { l: 0, at: 1.8, fx: 'puff', x: 8, y: 40 },
        { l: 0, at: 2.8, fx: 'puff', x: 12, y: 56 },
        { l: 1, id: 'wdDrop', pose: 'shiver', anim: 'wiggle' },
        { l: 1, at: 1.2, id: 'wdDrop', anim: 'wiggle' },
        { l: 2, at: 1.6, id: 'wdDrop', pose: 'wave', h: 32, y: 70, dur: 1.2 },
        { l: 2, at: 2.2, fx: 'sparkle', id: 'wdDrop' },
        { l: 2, at: 2.6, id: 'wdSister', x: 70, dur: 1.6 },
        { l: 3, id: 'wdSister', anim: 'hop' },
        { l: 4, id: 'wdDrop', anim: 'hop' },
        { l: 4, at: 0.6, fx: 'hearts', x: 52, y: 34 }
      ]
    },
    { // 5 好多小水滴飛上來，擠成一朵白雲
      bg: 'bg-sky-high.jpg',
      actors: [
        { id: 'wdDrop', pose: 'wave', x: 30, y: 70, h: 30, loop: 'float' },
        { id: 'wdSister', pose: 'wave', x: 70, y: 68, h: 26, flip: true, loop: 'float' },
        { id: 'wdMob1', pose: 'float', x: 42, y: 112, h: 14, loop: 'float' },
        { id: 'wdMob2', pose: 'float', x: 56, y: 116, h: 13, loop: 'float' },
        { id: 'wdMob3', pose: 'float', x: 84, y: 114, h: 14, loop: 'float' },
        { id: 'wdCloud', pose: 'white', x: 50, y: 86, h: 66, hidden: true, loop: 'float' }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'wdMob1', y: 64, dur: 2.6 },
        { l: 0, at: 0.8, id: 'wdMob2', y: 52, dur: 2.6 },
        { l: 0, at: 1.2, id: 'wdMob3', y: 82, dur: 2.6 },
        { l: 1, id: 'wdDrop', x: 42, y: 66, dur: 1.6 },
        { l: 1, id: 'wdSister', x: 58, y: 66, dur: 1.6 },
        { l: 1, id: 'wdMob1', x: 46, y: 56, dur: 1.6 },
        { l: 1, id: 'wdMob2', x: 52, y: 50, dur: 1.6 },
        { l: 1, id: 'wdMob3', x: 60, y: 58, dur: 1.6 },
        { l: 1, at: 2.4, id: 'wdDrop', hide: true },
        { l: 1, at: 2.4, id: 'wdSister', hide: true },
        { l: 1, at: 2.4, id: 'wdMob1', hide: true },
        { l: 1, at: 2.4, id: 'wdMob2', hide: true },
        { l: 1, at: 2.4, id: 'wdMob3', hide: true },
        { l: 1, at: 2.4, id: 'wdCloud', show: true, anim: 'hop' },
        { l: 1, at: 2.6, fx: 'sparkle', x: 50, y: 50 },
        { l: 2, id: 'wdCloud', anim: 'wiggle' },
        { l: 3, id: 'wdCloud', anim: 'nod' },
        { l: 3, at: 1.2, fx: 'hearts', x: 50, y: 34 },
        { l: 4, id: 'wdCloud', anim: 'hop' }
      ]
    },
    { // 6 白雲變成又黑又鼓的烏雲；小水滴們抱在一起，雲往下垂
      bg: 'bg-sky-hills.jpg',
      actors: [
        { id: 'wdCloud', pose: 'white', x: 50, y: 70, h: 56, loop: 'float' }
      ],
      cues: [
        { l: 0, at: 2.2, id: 'wdCloud', pose: 'dark', anim: 'wiggle' },
        { l: 0, at: 2.2, id: 'wdCloud', h: 58, y: 68, dur: 1.2 },
        { l: 1, at: 0.8, id: 'wdCloud', anim: 'hop' },
        { l: 1, at: 1.4, fx: 'hearts', x: 50, y: 56 },
        { l: 2, id: 'wdCloud', y: 73, dur: 1.6 },
        { l: 2, at: 0.6, id: 'wdCloud', anim: 'wiggle' },
        { l: 3, id: 'wdCloud', anim: 'wiggle' },
        { l: 4, id: 'wdCloud', anim: 'hop' },
        { l: 4, at: 1.0, fx: 'spout', x: 50, y: 70 }
      ]
    },
    { // 7 滴答滴答，從雲裡掉下來變成雨
      bg: 'bg-garden.jpg',
      actors: [
        { id: 'wdDrop', pose: 'whee', x: 34, y: 38, h: 26, loop: 'float' },
        { id: 'wdSister', pose: 'whee', x: 64, y: 34, h: 22, loop: 'float' }
      ],
      cues: [
        { l: 0, at: 0.2, fx: 'spout', x: 30, y: 12 },
        { l: 0, at: 1.0, fx: 'spout', x: 70, y: 12 },
        { l: 1, id: 'wdDrop', y: 56, dur: 3 },
        { l: 1, at: 0.6, id: 'wdSister', y: 48, dur: 3 },
        { l: 2, id: 'wdDrop', anim: 'wiggle' },
        { l: 2, at: 0.4, fx: 'sparkle', id: 'wdDrop' },
        { l: 3, id: 'wdSister', anim: 'wiggle' },
        { l: 3, at: 0.6, id: 'wdSister', y: 60, dur: 1.4 },
        { l: 4, id: 'wdDrop', y: 68, dur: 1.2 },
        { l: 4, at: 0.2, id: 'wdDrop', anim: 'hop' }
      ]
    },
    { // 8 咚！掉在口渴的小花上；喝了水抬起頭（drink 那張已經有小水滴）
      bg: 'bg-garden.jpg',
      actors: [
        { id: 'wdFlower', pose: 'droop', x: 34, y: 96, h: 54 },
        { id: 'wdDrop', pose: 'whee', x: 36, y: -2, h: 16, loop: 'float' }
      ],
      cues: [
        { l: 0, id: 'wdDrop', y: 46, dur: 0.7 },
        { l: 0, at: 0.7, id: 'wdDrop', pose: 'wave', h: 14, loop: 'none', anim: 'hop' },
        { l: 0, at: 0.8, fx: 'spout', x: 36, y: 44 },
        { l: 1, id: 'wdFlower', anim: 'wiggle' },
        { l: 2, id: 'wdDrop', anim: 'hop' },
        { l: 2, at: 0.6, fx: 'sparkle', id: 'wdDrop' },
        { l: 3, at: 0.6, id: 'wdDrop', hide: true },
        { l: 3, at: 0.6, id: 'wdFlower', pose: 'drink', anim: 'nod' },
        { l: 3, at: 1.2, fx: 'sparkle', id: 'wdFlower' },
        { l: 4, id: 'wdFlower', anim: 'hop' },
        { l: 4, at: 0.8, fx: 'hearts', id: 'wdFlower' }
      ]
    },
    { // 9 雨停了出彩虹；小水滴從葉子滑進小溪，小花揮手再見
      bg: 'bg-garden-rainbow.jpg',
      actors: [
        { id: 'wdFlower', pose: 'wave', x: 30, y: 96, h: 54 },
        { id: 'wdDrop', pose: 'wave', x: 43, y: 56, h: 12 }
      ],
      cues: [
        { l: 0, at: 2.0, fx: 'sparkle', x: 60, y: 18 },
        { l: 1, at: 0.6, id: 'wdDrop', pose: 'whee', loop: 'float' },
        { l: 1, at: 0.8, id: 'wdDrop', x: 74, y: 94, h: 18, dur: 1.4 },
        { l: 1, at: 2.2, id: 'wdDrop', pose: 'wave', anim: 'hop' },
        { l: 1, at: 2.4, fx: 'spout', x: 74, y: 86 },
        { l: 2, id: 'wdDrop', anim: 'nod' },
        { l: 3, id: 'wdFlower', anim: 'nod' },
        { l: 3, at: 1.0, id: 'wdFlower', anim: 'wiggle' },
        { l: 4, id: 'wdDrop', anim: 'hop' },
        { l: 4, at: 0.4, id: 'wdFlower', anim: 'wiggle' },
        { l: 4, at: 1.4, id: 'wdDrop', x: 106, y: 99, dur: 1.6 }
      ]
    },
    { // 10 小溪裡又見到水滴妹妹，抱一下；一起順著溪水流、跳過石頭
      bg: 'bg-creek.jpg',
      actors: [
        { id: 'wdDrop', pose: 'wave', x: 24, y: 56, h: 22, loop: 'float' },
        { id: 'wdSister', pose: 'wave', x: 48, y: 64, h: 20, flip: true, hidden: true, loop: 'float' },
        { id: 'wdDrops', pose: 'hug', x: 36, y: 60, h: 26, hidden: true, loop: 'float' }
      ],
      cues: [
        { l: 0, at: 2.0, id: 'wdSister', show: true, anim: 'hop' },
        { l: 1, id: 'wdSister', anim: 'hop' },
        { l: 1, at: 1.0, id: 'wdDrop', hide: true },
        { l: 1, at: 1.0, id: 'wdSister', hide: true },
        { l: 1, at: 1.0, id: 'wdDrops', show: true, anim: 'hop' },
        { l: 1, at: 1.4, fx: 'hearts', id: 'wdDrops' },
        { l: 2, id: 'wdDrops', x: 52, y: 68, dur: 3 },
        { l: 3, id: 'wdDrops', x: 74, y: 77, dur: 3.4 },
        { l: 3, at: 1.0, id: 'wdDrops', anim: 'hop' },
        { l: 3, at: 1.9, id: 'wdDrops', anim: 'hop' },
        { l: 3, at: 2.8, id: 'wdDrops', anim: 'hop' },
        { l: 4, id: 'wdDrops', anim: 'wiggle' },
        { l: 4, at: 0.4, fx: 'sparkle', id: 'wdDrops' }
      ]
    },
    { // 11 好多小溪流進大河；流過紅色的橋；水滴妹妹聞到海的味道
      bg: 'bg-river-bridge.jpg',
      actors: [
        { id: 'wdMob1', pose: 'wave', x: 30, y: 44, h: 9, hidden: true, loop: 'float' },
        { id: 'wdMob2', pose: 'wave', x: 52, y: 38, h: 9, hidden: true, loop: 'float' },
        { id: 'wdMob3', pose: 'wave', x: 76, y: 44, h: 9, hidden: true, loop: 'float' },
        { id: 'wdDrop', pose: 'wave', x: 14, y: 72, h: 22, loop: 'float' },
        { id: 'wdSister', pose: 'wave', x: 26, y: 72, h: 19, loop: 'float' },
        { id: 'wdDrops', pose: 'sniff', x: 76, y: 74, h: 30, hidden: true, loop: 'float' }
      ],
      cues: [
        { l: 0, id: 'wdMob1', show: true },
        { l: 0, id: 'wdMob2', show: true },
        { l: 0, id: 'wdMob3', show: true },
        { l: 0, at: 0.6, id: 'wdMob1', x: 34, y: 64, dur: 2.4 },
        { l: 0, at: 0.8, id: 'wdMob2', x: 50, y: 62, dur: 2.4 },
        { l: 0, at: 1.0, id: 'wdMob3', x: 70, y: 64, dur: 2.4 },
        { l: 1, id: 'wdDrop', x: 36, dur: 3.6 },
        { l: 1, id: 'wdSister', x: 48, dur: 3.6 },
        { l: 1, id: 'wdMob1', x: 62, dur: 3.6 },
        { l: 1, id: 'wdMob2', x: 80, dur: 3.6 },
        { l: 1, id: 'wdMob3', x: 98, dur: 3.6 },
        { l: 1, at: 3.6, id: 'wdMob1', hide: true },
        { l: 1, at: 3.6, id: 'wdMob2', hide: true },
        { l: 1, at: 3.6, id: 'wdMob3', hide: true },
        { l: 2, id: 'wdDrop', x: 60, dur: 3 },
        { l: 2, id: 'wdSister', x: 72, dur: 3 },
        { l: 3, id: 'wdDrop', pose: 'talk', anim: 'nod' },
        { l: 4, id: 'wdDrop', hide: true },
        { l: 4, id: 'wdSister', hide: true },
        { l: 4, id: 'wdDrops', show: true, anim: 'nod' },
        { l: 4, at: 1.4, fx: 'sparkle', x: 90, y: 40 }
      ]
    },
    { // 12 黃昏的河口，流回大海；小魚游過來歡迎，小水滴比手畫腳講旅行
      bg: 'bg-estuary.jpg',
      actors: [
        { id: 'wdDrop', pose: 'wave', x: 16, y: 54, h: 20, loop: 'float' },
        { id: 'wdFish', pose: 'happy', x: 112, y: 56, h: 22, loop: 'float' }
      ],
      cues: [
        { l: 0, id: 'wdDrop', x: 46, y: 56, h: 24, dur: 2.6 },
        { l: 0, at: 2.6, id: 'wdDrop', anim: 'hop' },
        { l: 0, at: 2.8, fx: 'spout', x: 46, y: 50 },
        { l: 1, id: 'wdFish', x: 72, dur: 1.4 },
        { l: 1, at: 1.4, fx: 'hearts', id: 'wdFish' },
        { l: 2, id: 'wdDrop', pose: 'talk', anim: 'hop' },
        { l: 3, id: 'wdDrop', anim: 'wiggle' },
        { l: 3, at: 2.0, id: 'wdDrop', anim: 'wiggle' },
        { l: 3, at: 2.2, fx: 'spout', x: 40, y: 22 },
        { l: 4, id: 'wdFish', anim: 'hop' },
        { l: 4, at: 0.4, fx: 'hearts', id: 'wdFish' }
      ]
    },
    { // 13 傍晚，太陽公公下山；小水滴躺在海浪上打哈欠，小魚睡著了
      bg: 'bg-sea-dusk.jpg',
      actors: [
        { id: 'wdSun', pose: 'wink', x: 87, y: 22, h: 21 },
        { id: 'wdDrop', pose: 'wave', x: 20, y: 31, h: 22 },
        { id: 'wdFish', pose: 'swim', x: 40, y: 50, h: 16, loop: 'float' }
      ],
      cues: [
        { l: 0, id: 'wdSun', y: 26, dur: 3.4 },
        { l: 1, id: 'wdSun', anim: 'nod' },
        { l: 2, id: 'wdDrop', anim: 'hop' },
        { l: 3, id: 'wdSun', anim: 'nod' },
        { l: 3, at: 1.0, id: 'wdDrop', pose: 'yawn', anim: 'nod' },
        { l: 4, id: 'wdFish', pose: 'sleep' },
        { l: 4, at: 0.4, fx: 'zzz', id: 'wdFish' },
        { l: 4, at: 1.8, fx: 'zzz', id: 'wdDrop' }
      ]
    },
    { // 14 下雨的窗邊：窗上的一顆雨滴就是小水滴，眨眼揮手，又滑下去出發了
      bg: 'bg-window-rain.jpg',
      actors: [
        { id: 'wdDrop', pose: 'wave', x: 46, y: 37, h: 16, hidden: true }
      ],
      cues: [
        { l: 0, at: 2.4, fx: 'sparkle', x: 52, y: 30 },
        { l: 1, at: 1.0, id: 'wdDrop', show: true, anim: 'hop' },
        { l: 2, id: 'wdDrop', anim: 'wiggle' },
        { l: 2, at: 0.4, fx: 'hearts', id: 'wdDrop' },
        { l: 3, at: 0.6, id: 'wdDrop', y: 56, dur: 2.2 }
      ]
    }
  ]
});
