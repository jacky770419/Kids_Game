/* 白雪公主：分鏡（手寫）。格式見 js/story-data.js 開頭與 addBook 的說明；文字與時間在 snow-white-script.js。
   圖是畫成「雪兒公主」（提示詞避開原名），故事裡一律叫白雪公主。第 1 頁是七八歲的小時候（snow-small-wave），第 3 頁起長大。
   小矮人六個合在一張群像（dwarfs-*，swDwarfs），最小的小不點另外一個角色（swDot）。群像裡排成一排的
   welcome／march／cheer 人比較小，h 要給大一點（小矮人身高大約到公主的腰）。
   方向：王后 mirror 朝右看、point 往右指（籃子在左手）；queen-hag 往左上遞蘋果；王子 horse 往左走、lift 王子在左；
   小不點 wave 往右走回頭往左揮手、petals 往右灑；dwarfs-march 往右走。
   魔鏡 plain＝王后問話時平靜的臉、gentle＝笑著回答；第 11 頁 snow-window 只有上半身（下緣平的），擺在背景的窗口裡。
   合在一起的圖：prince-lift（王子扶公主）算王子的姿勢、queen-sorry（王后牽公主）算王后的姿勢。 */
StoryData.addBook('snow-white', {
  color: '#F48C94',
  cover: { bg: 'bg-castle-garden.jpg', actor: 'swSnow', pose: 'happy' },
  voices: {
    '白雪公主': { actor: 'swSnow', color: '#F48C94' },
    '王后': { actor: 'swQueen', color: '#C59BE8' },
    '魔鏡': { actor: 'swMirror', color: '#8FD3F0' },
    '小矮人們': { actor: 'swDwarfs', color: '#D9B07A' },
    '小不點': { actor: 'swDot', color: '#B7A6F5' },
    '王子': { actor: 'swPrince', color: '#9ED48A' }
  },
  sprites: {
    swSnow: {
      happy: { src: 'snow-happy.png' },
      bite: { src: 'snow-bite.png' },
      small: { src: 'snow-small-wave.png' },
      basket: { src: 'snow-basket.png' },
      lost: { src: 'snow-lost.png' },
      apron: { src: 'snow-apron.png' },
      bed: { src: 'snow-bed.png' },
      wake: { src: 'snow-wake.png' },
      shy: { src: 'snow-shy.png' },
      window: { src: 'snow-window.png' },
      asleep: { src: 'snow-asleep.png' },
      flowerbed: { src: 'snow-flowerbed.png' }
    },
    swQueen: {
      mirror: { src: 'queen-mirror.png' },
      stomp: { src: 'queen-stomp.png' },
      point: { src: 'queen-point.png' },
      apple: { src: 'queen-apple.png' },
      hag: { src: 'queen-hag.png' },
      sad: { src: 'queen-sad.png' },
      sorry: { src: 'queen-sorry.png' },
      clap: { src: 'queen-clap.png' }
    },
    swMirror: {
      plain: { src: 'mirror-plain.png' },
      gentle: { src: 'mirror-gentle.png' },
      snow: { src: 'mirror-snow.png' },
      cottage: { src: 'mirror-cottage.png' }
    },
    // 六個小矮人的群像
    swDwarfs: {
      surprise: { src: 'dwarfs-surprise.png' },
      welcome: { src: 'dwarfs-welcome.png' },
      march: { src: 'dwarfs-march.png' },
      worry: { src: 'dwarfs-worry.png' },
      cheer: { src: 'dwarfs-cheer.png' },
      party: { src: 'dwarfs-party.png' }
    },
    swDot: {
      shh: { src: 'dot-shh.png' },
      jump: { src: 'dot-jump.png' },
      wave: { src: 'dot-wave.png' },
      cry: { src: 'dot-cry.png' },
      petals: { src: 'dot-petals.png' },
      cake: { src: 'dot-cake.png' }
    },
    swPrince: {
      smile: { src: 'prince-smile.png' },
      horse: { src: 'prince-horse.png' },
      lift: { src: 'prince-lift.png' }
    },
    swCauldron: { pot: { src: 'cauldron.png' } }
  },
  taps: {
    swSnow: ['hop', 'hearts'],
    swMirror: ['wiggle', 'sparkle'],
    swDwarfs: ['hop', 'notes'],
    swDot: ['hop', 'hearts'],
    swCauldron: ['wiggle', 'sparkle']
  },
  pages: [
    { // 1 王宮花園的早上：小時候的白雪公主往右上揮手，跟小鳥、小花說早安
      bg: 'bg-castle-garden.jpg',
      actors: [
        { id: 'swSnow', pose: 'small', x: 42, y: 95, h: 46 }
      ],
      cues: [
        { l: 0, at: 1.2, id: 'swSnow', anim: 'hop' },
        { l: 1, at: 1.0, fx: 'sparkle', id: 'swSnow' },
        { l: 2, at: 1.4, id: 'swSnow', anim: 'nod' },
        { l: 2, at: 1.8, fx: 'notes', x: 70, y: 30 },
        { l: 3, at: 0.8, fx: 'hearts', id: 'swSnow' },
        { l: 4, id: 'swSnow', anim: 'hop' },
        { l: 4, at: 1.2, fx: 'sparkle', x: 78, y: 26 },
        { l: 4, at: 1.4, fx: 'hearts', x: 20, y: 70 }
      ]
    },
    { // 2 晚上王后的房間：王后（左）叉腰照魔鏡（右），魔鏡說她最美
      bg: 'bg-queen-room.jpg',
      actors: [
        { id: 'swQueen', pose: 'mirror', x: 36, y: 96, h: 64 },
        { id: 'swMirror', pose: 'plain', x: 73, y: 95, h: 64 }
      ],
      cues: [
        { l: 0, at: 1.2, id: 'swQueen', anim: 'nod' },
        { l: 1, at: 0.6, id: 'swQueen', anim: 'hop' },
        { l: 1, at: 1.8, id: 'swQueen', anim: 'wiggle' },
        { l: 2, at: 0.8, fx: 'sparkle', id: 'swMirror' },
        { l: 4, id: 'swMirror', pose: 'gentle', anim: 'nod' },
        { l: 4, at: 2.2, id: 'swQueen', anim: 'hop' },
        { l: 4, at: 2.4, fx: 'hearts', id: 'swQueen' }
      ]
    },
    { // 3 很多年過去了：魔鏡裡出現長大的白雪公主；王后氣得跺腳，皇冠歪了
      bg: 'bg-queen-room.jpg',
      actors: [
        { id: 'swQueen', pose: 'mirror', x: 36, y: 96, h: 64 },
        { id: 'swMirror', pose: 'snow', x: 73, y: 95, h: 64 }
      ],
      cues: [
        { l: 0, at: 0.4, fx: 'sparkle', id: 'swMirror' },
        { l: 1, id: 'swMirror', pose: 'plain' },
        { l: 1, at: 0.4, id: 'swQueen', anim: 'nod' },
        { l: 2, at: 2.2, id: 'swMirror', pose: 'snow', anim: 'wiggle' },
        { l: 2, at: 2.4, fx: 'sparkle', id: 'swMirror' },
        { l: 3, id: 'swQueen', pose: 'stomp', anim: 'hop' },
        { l: 3, at: 1.6, id: 'swQueen', anim: 'wiggle' },
        { l: 4, at: 1.0, id: 'swQueen', anim: 'wiggle' },
        { l: 4, at: 1.2, fx: 'puff', x: 44, y: 34 }
      ]
    },
    { // 4 王宮後門：王后指著森林、把籃子遞給白雪公主；她提著籃子走進森林
      bg: 'bg-palace-backdoor.jpg',
      actors: [
        { id: 'swSnow', pose: 'happy', x: 25, y: 95, h: 52 },
        { id: 'swQueen', pose: 'point', x: 55, y: 97, h: 62 }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'swQueen', anim: 'nod' },
        { l: 1, id: 'swQueen', anim: 'wiggle' },
        { l: 1, at: 1.6, id: 'swQueen', pose: 'mirror' },
        { l: 1, at: 1.6, id: 'swSnow', pose: 'basket' },
        { l: 2, id: 'swSnow', anim: 'nod' },
        { l: 3, at: 0.8, id: 'swSnow', x: 86, y: 78, h: 28, dur: 2.6 }
      ]
    },
    { // 5 森林深處，天黑了：白雪公主抱著花籃左看右看，迷路了
      bg: 'bg-dark-forest.jpg',
      actors: [
        { id: 'swSnow', pose: 'lost', x: 22, y: 92, h: 50 }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'swSnow', x: 40, dur: 2.4 },
        { l: 2, id: 'swSnow', flip: true, anim: 'wiggle' },
        { l: 2, at: 1.4, id: 'swSnow', flip: false },
        { l: 3, id: 'swSnow', x: 55, y: 94, dur: 2.2 },
        { l: 4, id: 'swSnow', anim: 'wiggle' }
      ]
    },
    { // 6 小木屋裡（晚上）：七張小椅子、七個小碗、七張小床；喝一口湯，躺在小床上睡著了
      bg: 'bg-dwarf-room.jpg',
      actors: [
        { id: 'swSnow', pose: 'lost', x: 56, y: 93, h: 50 }
      ],
      cues: [
        { l: 0, at: 1.6, fx: 'sparkle', x: 50, y: 40 },
        { l: 1, at: 0.4, fx: 'sparkle', x: 22, y: 60 },
        { l: 1, at: 1.8, fx: 'sparkle', x: 28, y: 40 },
        { l: 1, at: 3.4, fx: 'sparkle', x: 76, y: 40 },
        { l: 2, id: 'swSnow', x: 42, dur: 1.2 },
        { l: 2, at: 1.6, id: 'swSnow', anim: 'nod' },
        { l: 2, at: 2.0, fx: 'hearts', id: 'swSnow' },
        { l: 3, id: 'swSnow', anim: 'wiggle' },
        { l: 4, id: 'swSnow', pose: 'bed', x: 62, y: 92, h: 34 },
        { l: 4, at: 1.2, fx: 'zzz', x: 54, y: 62 }
      ]
    },
    { // 7 小矮人們回家，看到床上睡著一個人；小不點「噓」；白雪公主醒過來
      bg: 'bg-dwarf-room.jpg',
      actors: [
        { id: 'swSnow', pose: 'bed', x: 68, y: 92, h: 34 },
        { id: 'swDwarfs', pose: 'surprise', x: -18, y: 97, h: 44 },
        { id: 'swDot', pose: 'shh', x: -10, y: 97, h: 24 }
      ],
      cues: [
        { l: 0, at: 0.4, fx: 'zzz', x: 60, y: 62 },
        { l: 0, at: 1.2, id: 'swDwarfs', x: 22, dur: 2.2 },
        { l: 0, at: 1.6, id: 'swDot', x: 44, dur: 2.0 },
        { l: 1, id: 'swDwarfs', anim: 'hop' },
        { l: 2, id: 'swDot', anim: 'nod' },
        { l: 2, at: 1.6, fx: 'hearts', id: 'swDot' },
        { l: 3, at: 0.6, id: 'swSnow', pose: 'wake', x: 72, y: 94, h: 46 },
        { l: 3, at: 2.0, id: 'swDwarfs', anim: 'hop' }
      ]
    },
    { // 8 白雪公主坐在床邊說迷路了；小矮人們張開手歡迎，小不點跳起來
      bg: 'bg-dwarf-room.jpg',
      actors: [
        { id: 'swSnow', pose: 'shy', x: 74, y: 94, h: 46 },
        { id: 'swDwarfs', pose: 'welcome', x: 30, y: 97, h: 22 },
        { id: 'swDot', pose: 'shh', x: 55, y: 97, h: 24 }
      ],
      cues: [
        { l: 0, id: 'swSnow', anim: 'nod' },
        { l: 1, id: 'swDwarfs', anim: 'hop' },
        { l: 2, id: 'swSnow', anim: 'hop' },
        { l: 2, at: 1.4, fx: 'hearts', id: 'swSnow' },
        { l: 3, id: 'swDot', pose: 'jump', anim: 'hop' },
        { l: 3, at: 0.8, fx: 'sparkle', id: 'swDot' },
        { l: 4, at: 1.0, fx: 'hearts', x: 50, y: 50 },
        { l: 4, at: 1.4, id: 'swDwarfs', anim: 'hop' }
      ]
    },
    { // 9 早上的小木屋門口：小矮人們扛鏟子往右走、回頭叮嚀；白雪公主繫圍裙送行，煮湯唱歌餵小鳥
      bg: 'bg-dwarf-house.jpg',
      actors: [
        { id: 'swSnow', pose: 'apron', x: 22, y: 95, h: 50 },
        { id: 'swDot', pose: 'wave', x: 42, y: 96, h: 24 },
        { id: 'swDwarfs', pose: 'march', x: 70, y: 96, h: 22 }
      ],
      cues: [
        { l: 0, at: 1.0, id: 'swDwarfs', x: 72, dur: 2.0 },
        { l: 1, id: 'swDwarfs', anim: 'nod' },
        { l: 2, id: 'swDot', anim: 'hop' },
        { l: 3, id: 'swSnow', anim: 'hop' },
        { l: 3, at: 0.6, id: 'swDwarfs', x: 88, y: 74, h: 10, dur: 3.2 },
        { l: 3, at: 0.6, id: 'swDot', x: 72, y: 76, h: 11, dur: 3.2 },
        { l: 4, id: 'swDwarfs', hide: true },
        { l: 4, id: 'swDot', hide: true },
        { l: 4, at: 1.2, fx: 'puff', x: 30, y: 46 },
        { l: 4, at: 2.0, fx: 'notes', id: 'swSnow' },
        { l: 4, at: 2.8, id: 'swSnow', anim: 'hop' },
        { l: 4, at: 3.0, fx: 'hearts', x: 40, y: 30 }
      ]
    },
    { // 10 王宮裡：魔鏡照出森林小木屋；王后煮出一顆魔法蘋果
      bg: 'bg-queen-room.jpg',
      actors: [
        { id: 'swQueen', pose: 'mirror', x: 28, y: 96, h: 64 },
        { id: 'swCauldron', pose: 'pot', x: 52, y: 96, h: 40, hidden: true },
        { id: 'swMirror', pose: 'plain', x: 78, y: 95, h: 64 }
      ],
      cues: [
        { l: 1, at: 0.4, id: 'swQueen', anim: 'nod' },
        { l: 2, id: 'swMirror', pose: 'cottage', anim: 'wiggle' },
        { l: 2, at: 0.2, fx: 'sparkle', id: 'swMirror' },
        { l: 3, id: 'swQueen', anim: 'hop' },
        { l: 4, id: 'swCauldron', show: true, anim: 'wiggle' },
        { l: 4, at: 0.6, fx: 'sparkle', id: 'swCauldron' },
        { l: 4, at: 1.8, id: 'swQueen', pose: 'apple', anim: 'hop' },
        { l: 4, at: 2.0, fx: 'sparkle', id: 'swQueen' }
      ]
    },
    { // 11 小木屋的窗戶：王后扮成老婆婆（右）敲窗，白雪公主在窗戶裡猶豫
      bg: 'bg-dwarf-window.jpg',
      actors: [
        { id: 'swSnow', pose: 'window', x: 44, y: 55.6, h: 36, hidden: true },
        { id: 'swQueen', pose: 'hag', x: 115, y: 97, h: 56 }
      ],
      cues: [
        { l: 0, at: 1.0, id: 'swQueen', x: 82, dur: 2.4 },
        { l: 1, at: 1.36, id: 'swQueen', anim: 'nod' },
        { l: 1, at: 1.76, id: 'swQueen', anim: 'nod' },
        { l: 1, at: 2.4, id: 'swSnow', show: true },
        { l: 2, at: 1.6, fx: 'sparkle', x: 70, y: 40 },
        { l: 3, id: 'swSnow', anim: 'wiggle' },
        { l: 4, id: 'swQueen', anim: 'hop' }
      ]
    },
    { // 12 傍晚屋裡（桌上的蘋果被咬了一口）：白雪公主睡在地毯上，小矮人們圍著叫她
      bg: 'bg-dwarf-room-dusk.jpg',
      actors: [
        { id: 'swSnow', pose: 'bite', x: 48, y: 90, h: 50 },
        { id: 'swDwarfs', pose: 'worry', x: 112, y: 96, h: 42, hidden: true },
        { id: 'swDot', pose: 'cry', x: -10, y: 93, h: 24, hidden: true }
      ],
      cues: [
        { l: 0, at: 3.0, id: 'swSnow', anim: 'nod' },
        { l: 1, at: 1.0, fx: 'hearts', id: 'swSnow' },
        { l: 1, at: 2.4, id: 'swSnow', anim: 'wiggle' },
        { l: 2, id: 'swSnow', pose: 'asleep', x: 48, y: 76, h: 16 },
        { l: 2, at: 0.8, fx: 'zzz', x: 46, y: 58 },
        { l: 3, at: 0.6, id: 'swDwarfs', show: true, x: 78, dur: 1.6 },
        { l: 3, at: 0.8, id: 'swDot', show: true, x: 29, dur: 1.4 },
        { l: 4, id: 'swDwarfs', anim: 'hop' },
        { l: 4, at: 0.4, id: 'swDot', anim: 'wiggle' },
        { l: 4, at: 1.8, id: 'swDwarfs', anim: 'hop' }
      ]
    },
    { // 13 開滿野花的草地：白雪公主睡在花床上，小不點灑花瓣；王子騎白馬從右邊來
      bg: 'bg-meadow-flowers.jpg',
      actors: [
        { id: 'swSnow', pose: 'flowerbed', x: 46, y: 94, h: 46 },
        { id: 'swDot', pose: 'petals', x: 20, y: 95, h: 26 },
        { id: 'swPrince', pose: 'horse', x: 118, y: 95, h: 52 }
      ],
      cues: [
        { l: 0, at: 1.6, fx: 'sparkle', x: 30, y: 60 },
        { l: 0, at: 2.6, id: 'swDot', anim: 'nod' },
        { l: 1, at: 0.6, id: 'swPrince', x: 80, dur: 2.8 },
        { l: 2, id: 'swPrince', anim: 'nod' },
        { l: 4, id: 'swDot', anim: 'wiggle' }
      ]
    },
    { // 14 王子叫她起床、扶她坐起來；哈啾！蘋果掉出來，醒了；小矮人們歡呼
      bg: 'bg-meadow-flowers.jpg',
      actors: [
        { id: 'swSnow', pose: 'flowerbed', x: 46, y: 94, h: 46 },
        { id: 'swPrince', pose: 'smile', x: 70, y: 94, h: 54 },
        { id: 'swDwarfs', pose: 'cheer', x: 77, y: 97, h: 22, hidden: true },
        { id: 'swDot', pose: 'jump', x: 16, y: 96, h: 26, hidden: true }
      ],
      cues: [
        { l: 0, at: 1.6, id: 'swPrince', anim: 'nod' },
        { l: 1, id: 'swSnow', hide: true },
        { l: 1, id: 'swPrince', pose: 'lift', x: 38, y: 94, h: 46 },
        { l: 2, id: 'swPrince', anim: 'wiggle' },
        { l: 2, fx: 'puff', x: 56, y: 62 },
        { l: 3, at: 1.8, fx: 'sparkle', x: 46, y: 56 },
        { l: 4, id: 'swDwarfs', show: true, anim: 'hop' },
        { l: 4, id: 'swDot', show: true, anim: 'hop' },
        { l: 4, at: 1.0, fx: 'hearts', x: 46, y: 46 },
        { l: 4, at: 1.4, id: 'swDwarfs', anim: 'hop' }
      ]
    },
    { // 15 白天的王后房間：魔鏡說最美的是一顆好心；王后坐下來難過，決定去道歉
      bg: 'bg-queen-room-day.jpg',
      actors: [
        { id: 'swQueen', pose: 'mirror', x: 36, y: 96, h: 64 },
        { id: 'swMirror', pose: 'plain', x: 75, y: 95, h: 64 }
      ],
      cues: [
        { l: 1, id: 'swQueen', anim: 'nod' },
        { l: 2, id: 'swMirror', pose: 'gentle', anim: 'nod' },
        { l: 2, at: 2.0, fx: 'hearts', id: 'swMirror' },
        { l: 3, id: 'swQueen', pose: 'sad', x: 34, y: 96, h: 56 },
        { l: 4, id: 'swQueen', pose: 'mirror', x: 36, y: 96, h: 64 },
        { l: 4, at: 0.8, id: 'swQueen', x: -20, dur: 2.2 }
      ]
    },
    { // 16 小木屋門口：王后牽著白雪公主的手道歉、和好；後來大家常常開派對
      bg: 'bg-dwarf-party.jpg',
      actors: [
        { id: 'swQueen', pose: 'sorry', x: 50, y: 96, h: 60 },
        { id: 'swSnow', pose: 'happy', x: 59, y: 96, h: 52, hidden: true },
        { id: 'swDwarfs', pose: 'party', x: 20, y: 99, h: 26, hidden: true },
        { id: 'swDot', pose: 'cake', x: 79, y: 97, h: 26, hidden: true },
        { id: 'swPrince', pose: 'smile', x: 92, y: 95, h: 54, hidden: true }
      ],
      cues: [
        { l: 0, at: 2.0, id: 'swQueen', anim: 'nod' },
        { l: 1, at: 1.2, fx: 'hearts', x: 50, y: 40 },
        { l: 2, id: 'swQueen', anim: 'nod' },
        { l: 3, id: 'swQueen', pose: 'clap', x: 36, y: 90, h: 56 },
        { l: 3, id: 'swSnow', show: true, anim: 'hop' },
        { l: 3, at: 0.6, id: 'swDwarfs', show: true, anim: 'hop' },
        { l: 3, at: 1.0, id: 'swDot', show: true, anim: 'hop' },
        { l: 3, at: 1.4, id: 'swPrince', show: true, anim: 'nod' },
        { l: 4, fx: 'hearts', x: 50, y: 40 },
        { l: 4, id: 'swSnow', anim: 'spin' },
        { l: 4, at: 0.4, id: 'swDwarfs', anim: 'hop' },
        { l: 4, at: 0.6, fx: 'notes', id: 'swDwarfs' }
      ]
    }
  ]
});
