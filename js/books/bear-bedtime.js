/* 小熊不想睡覺：分鏡（手寫）。格式見 js/story-data.js 開頭與 addBook 的說明；文字與時間在 bear-bedtime-script.js。
   房間（bg-bear-room／-dark）：左邊地上圓地毯、中間牆上拱形窗（窗裡 x 37–69、y 17–53，月亮放右上）、右邊木頭床（枕頭在右、床墊約 y 72）、床邊小夜燈。
   睡在床上的圖（drowsy、asleep）本來枕頭在左，要 flip 才會對上床頭在右邊。
   角色 id 一律 bb 開頭（小熊雖然是《小熊的抱抱》那隻，但 bear 已經被舊書用掉）。 */
StoryData.addBook('bear-bedtime', {
  color: '#9DB4F0',
  cover: { bg: 'bg-bear-room.jpg', actor: 'bbBear', pose: 'yawn' },
  voices: {
    '小熊': { actor: 'bbBear', color: '#E9B98A' },
    '熊媽媽': { actor: 'bbMama', color: '#F7B8CB' },
    '月亮': { actor: 'bbMoon', color: '#FFF1A6' }
  },
  sprites: {
    bbBear: {
      train: { src: 'bear-train.png', k: 0.8 },
      brush: { src: 'bear-brush.png' },
      stuck: { src: 'bear-stuck.png' },
      pop: { src: 'bear-pop.png' },
      pj: { src: 'bear-pj.png' },
      listen: { src: 'bear-listen.png', k: 0.8 },
      curious: { src: 'bear-curious.png', k: 0.82 },
      toys: { src: 'bear-toys.png', k: 0.86 },
      yawn: { src: 'bear-yawn.png' },
      drowsy: { src: 'bear-drowsy.png', k: 0.8 },
      asleep: { src: 'bear-asleep.png', k: 0.74 }
    },
    bbMama: {
      call: { src: 'mama-call.png' },
      squat: { src: 'mama-squat.png', k: 0.8 },
      clap: { src: 'mama-clap.png' },
      book: { src: 'mama-book.png', k: 0.8 },
      shh: { src: 'mama-shh.png' },
      hold: { src: 'mama-hold.png' },
      tuck: { src: 'mama-tuck.png', k: 0.9 },
      kiss: { src: 'mama-kiss.png', k: 0.95 }
    },
    bbMoon: {
      wink: { src: 'moon-wink.png' }
    },
    // 道具：紅色小火車、粉紅小拖鞋、藍色小皮球排一排
    bbToys: {
      row: { src: 'toys-row.png' }
    }
  },
  taps: {
    bbBear: ['hop', 'hearts'],
    bbMama: ['nod', 'hearts'],
    bbMoon: ['nod', 'sparkle'],
    bbToys: ['wiggle', 'sparkle']
  },
  pages: [
    { // 1 晚上，小熊在地毯上推小火車；媽媽從左邊進來叫他上床
      bg: 'bg-bear-room.jpg',
      actors: [
        { id: 'bbMoon', pose: 'wink', x: 62, y: 36, h: 15, hidden: true, loop: 'float' },
        { id: 'bbBear', pose: 'train', x: 22, y: 96, h: 48 },
        { id: 'bbMama', pose: 'call', x: -16, y: 97, h: 62 }
      ],
      cues: [
        { l: 0, at: 1.2, id: 'bbMoon', show: true, anim: 'hop' },
        { l: 0, at: 1.5, fx: 'sparkle', id: 'bbMoon' },
        { l: 1, at: 0.4, id: 'bbBear', x: 34, dur: 2.2 },
        { l: 1, at: 1.8, id: 'bbBear', anim: 'wiggle' },
        { l: 1, at: 1.9, fx: 'notes', x: 44, y: 66 },
        { l: 2, id: 'bbMama', x: 15, dur: 1.0 },
        { l: 2, at: 1.0, id: 'bbMama', anim: 'nod' },
        { l: 3, id: 'bbBear', anim: 'wiggle' },
        { l: 3, at: 1.4, id: 'bbBear', anim: 'hop' }
      ]
    },
    { // 2 浴室：小熊踩在小板凳上刷牙，媽媽蹲在旁邊
      bg: 'bg-bathroom.jpg',
      actors: [
        { id: 'bbMama', pose: 'squat', x: 22, y: 97, h: 60 },
        { id: 'bbBear', pose: 'brush', x: 56, y: 97, h: 54 }
      ],
      cues: [
        { l: 0, id: 'bbMama', anim: 'nod' },
        { l: 1, at: 0.4, id: 'bbBear', anim: 'hop' },
        { l: 2, id: 'bbBear', anim: 'wiggle' },
        { l: 2, at: 0.9, id: 'bbBear', anim: 'wiggle' },
        { l: 2, at: 1.8, fx: 'sparkle', x: 62, y: 52 },
        { l: 2, at: 2.4, id: 'bbMama', anim: 'nod' },
        { l: 3, id: 'bbBear', anim: 'hop' },
        { l: 3, at: 1.4, id: 'bbBear', anim: 'wiggle' }
      ]
    },
    { // 3 換睡衣：頭卡在睡衣裡，一隻手、兩隻手，啵！鑽出來；媽媽拍手
      bg: 'bg-bear-room.jpg',
      actors: [
        { id: 'bbMama', pose: 'call', x: 20, y: 97, h: 62 },
        { id: 'bbBear', pose: 'stuck', x: 42, y: 96, h: 46 }
      ],
      cues: [
        { l: 0, id: 'bbMama', anim: 'nod' },
        { l: 1, id: 'bbMama', pose: 'clap', anim: 'hop' },
        { l: 2, id: 'bbBear', anim: 'wiggle' },
        { l: 2, at: 0.75, id: 'bbBear', anim: 'wiggle' },
        { l: 2, at: 2.0, id: 'bbBear', pose: 'pop', anim: 'hop' },
        { l: 2, at: 2.2, fx: 'sparkle', id: 'bbBear' },
        { l: 2, at: 3.0, fx: 'hearts', id: 'bbMama' },
        { l: 3, id: 'bbBear', pose: 'pj', anim: 'wiggle' }
      ]
    },
    { // 4 床上聽故事：小熊抱小兔靠著枕頭，媽媽坐在床邊拿書
      bg: 'bg-bear-room.jpg',
      actors: [
        { id: 'bbMama', pose: 'book', x: 40, y: 97, h: 62 },
        { id: 'bbBear', pose: 'listen', x: 80, y: 84, h: 52 }
      ],
      cues: [
        { l: 0, id: 'bbMama', anim: 'nod' },
        { l: 1, at: 1.0, fx: 'sparkle', x: 46, y: 48 },
        { l: 1, at: 2.4, fx: 'sparkle', x: 60, y: 28 },
        { l: 2, id: 'bbMama', anim: 'nod' },
        { l: 2, at: 1.6, fx: 'hearts', id: 'bbBear' },
        { l: 3, id: 'bbBear', anim: 'hop' }
      ]
    },
    { // 5 媽媽想到好主意，比「噓」；小熊坐在床上歪頭看媽媽
      bg: 'bg-bear-room.jpg',
      actors: [
        { id: 'bbMama', pose: 'shh', x: 36, y: 97, h: 62 },
        { id: 'bbBear', pose: 'curious', x: 74, y: 78, h: 48, flip: true }
      ],
      cues: [
        { l: 0, at: 0.3, fx: 'sparkle', id: 'bbMama' },
        { l: 0, at: 0.3, id: 'bbMama', anim: 'nod' },
        { l: 1, id: 'bbBear', anim: 'wiggle' },
        { l: 2, id: 'bbMama', anim: 'nod' },
        { l: 3, id: 'bbBear', pose: 'pop', flip: false, anim: 'hop' }
      ]
    },
    { // 6 窗邊：媽媽抱著小熊，跟月亮、星星說晚安；月亮眨眼回晚安
      bg: 'bg-bear-room.jpg',
      stars: [39, 18, 67, 50],
      starsLate: true,
      actors: [
        { id: 'bbMoon', pose: 'wink', x: 62, y: 36, h: 15, loop: 'float' },
        { id: 'bbMama', pose: 'hold', x: 18, y: 97, h: 64 }
      ],
      cues: [
        { l: 0, at: 0.3, id: 'bbMama', x: 40, dur: 2.0 },
        { l: 1, id: 'bbMama', anim: 'hop' },
        { l: 1, at: 0.8, fx: 'hearts', id: 'bbMoon' },
        { l: 2, stars: 99 },
        { l: 2, at: 0.6, fx: 'sparkle', x: 46, y: 30 },
        { l: 2, at: 1.0, id: 'bbMama', anim: 'hop' },
        { l: 3, id: 'bbMoon', anim: 'nod' },
        { l: 3, at: 0.4, fx: 'sparkle', id: 'bbMoon' },
        { l: 4, id: 'bbMama', anim: 'nod' },
        { l: 4, at: 1.0, fx: 'hearts', x: 50, y: 40 }
      ]
    },
    { // 7 地毯上：跟小火車、小拖鞋、小皮球說晚安，然後打大呵欠
      bg: 'bg-bear-room.jpg',
      actors: [
        { id: 'bbToys', pose: 'row', x: 21, y: 92, h: 17, loop: 'still' },
        { id: 'bbBear', pose: 'toys', x: 43, y: 96, h: 48, flip: true }
      ],
      cues: [
        { l: 0, id: 'bbBear', anim: 'nod' },
        { l: 0, at: 0.6, fx: 'sparkle', x: 22, y: 80 },
        { l: 1, id: 'bbBear', anim: 'nod' },
        { l: 1, at: 0.6, fx: 'sparkle', x: 12, y: 84 },
        { l: 2, id: 'bbBear', anim: 'nod' },
        { l: 2, at: 0.6, fx: 'sparkle', x: 24, y: 88 },
        { l: 3, at: 1.2, id: 'bbBear', pose: 'yawn', flip: false },
        { l: 4, id: 'bbBear', anim: 'nod' },
        { l: 4, at: 1.0, id: 'bbBear', pose: 'pj', anim: 'wiggle' }
      ]
    },
    { // 8 爬上床、媽媽蓋被子；小熊眼睛快張不開
      bg: 'bg-bear-room.jpg',
      actors: [
        { id: 'bbBear', pose: 'pj', x: 46, y: 96, h: 46 },
        { id: 'bbMama', pose: 'tuck', x: -16, y: 97, h: 62, flip: true }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'bbBear', x: 62, y: 88, dur: 0.8, anim: 'hop' },
        { l: 0, at: 1.2, id: 'bbBear', pose: 'drowsy', flip: true, x: 79, y: 88, h: 54 },
        { l: 0, at: 1.2, id: 'bbMama', x: 44, dur: 1.2 },
        { l: 1, id: 'bbBear', anim: 'nod' },
        { l: 2, id: 'bbBear', anim: 'nod' },
        { l: 2, at: 1.2, id: 'bbMama', anim: 'nod' },
        { l: 3, at: 2.2, fx: 'zzz', x: 86, y: 46 }
      ]
    },
    { // 9 熄燈：小熊抱小兔閉著眼；媽媽彎腰親一下、抱一下
      bg: 'bg-bear-room-dark.jpg',
      actors: [
        { id: 'bbBear', pose: 'asleep', x: 77, y: 88, h: 56, flip: true },
        { id: 'bbMama', pose: 'kiss', x: 52, y: 97, h: 58 }
      ],
      cues: [
        { l: 0, id: 'bbBear', anim: 'nod' },
        { l: 1, at: 2.0, id: 'bbMama', x: 60, dur: 0.6, anim: 'nod' },
        { l: 1, at: 2.4, fx: 'hearts', x: 76, y: 52 },
        { l: 1, at: 3.3, fx: 'hearts', x: 70, y: 46 },
        { l: 2, id: 'bbBear', anim: 'nod' },
        { l: 2, at: 1.0, fx: 'zzz', x: 88, y: 50 }
      ]
    },
    { // 10 小熊睡得好香，月亮在窗外守著他
      bg: 'bg-bear-room-dark.jpg',
      stars: [39, 18, 67, 50],
      actors: [
        { id: 'bbMoon', pose: 'wink', x: 62, y: 36, h: 15, loop: 'float' },
        { id: 'bbBear', pose: 'asleep', x: 77, y: 88, h: 56, flip: true }
      ],
      cues: [
        { l: 0, at: 1.0, fx: 'zzz', x: 88, y: 50 },
        { l: 1, id: 'bbMoon', anim: 'nod' },
        { l: 1, at: 0.6, fx: 'sparkle', id: 'bbMoon' },
        { l: 1, at: 1.6, fx: 'zzz', x: 88, y: 50 },
        { l: 2, fx: 'hearts', x: 78, y: 52 },
        { l: 3, at: 1.0, fx: 'zzz', x: 88, y: 50 }
      ]
    }
  ]
});
