/* 北風與太陽：分鏡（手寫）。格式見 js/story-data.js 開頭與 addBook 的說明；文字與時間在 wind-sun-script.js。
   北風、太陽在天上（只有雲朵臉與太陽臉，用 loop float 飄著）；旅人在山坡的小路上（路在畫面下方中間）。
   北風的吹都朝右（旅人在右邊）；太陽的「光手」pat 朝左、point 朝右下。 */
StoryData.addBook('wind-sun', {
  color: '#7CC8F5',
  cover: { bg: 'bg-sky.jpg', actor: 'windsun', pose: 'lean' },
  voices: {
    '北風': { actor: 'northwind', color: '#A9C3E0' },
    '太陽': { actor: 'sunlady', color: '#FFD24D' },
    '旅人': { actor: 'traveler', color: '#D9A066' }
  },
  sprites: {
    northwind: {
      proud: { src: 'wind-proud.png' },
      peek: { src: 'wind-peek.png' },
      blow: { src: 'wind-blow.png' },
      blow2: { src: 'wind-blow2.png' },
      blow3: { src: 'wind-blow3.png' },
      tired: { src: 'wind-tired.png', k: 0.8 },
      shock: { src: 'wind-shock.png' },
      sheepish: { src: 'wind-sheepish.png' },
      breeze: { src: 'wind-breeze.png' }
    },
    sunlady: {
      smile: { src: 'sun-smile.png' },
      point: { src: 'sun-point.png' },
      pat: { src: 'sun-pat.png', k: 0.9 },
      shine: { src: 'sun-shine.png', k: 1.15 },
      wink: { src: 'sun-wink.png' }
    },
    traveler: {
      walk: { src: 'traveler-walk.png' },
      hatfly: { src: 'traveler-hatfly.png', k: 1.08 },
      shiver: { src: 'traveler-shiver.png' },
      crouch: { src: 'traveler-crouch.png', k: 0.82 },
      look: { src: 'traveler-look.png' },
      hot: { src: 'traveler-hot.png' },
      rest: { src: 'traveler-rest.png', k: 0.72 },
      wave: { src: 'traveler-wave.png' }
    },
    // 北風和太陽合在同一張圖（最後變好朋友、封面）
    windsun: {
      friends: { src: 'wind-sun-friends.png' },
      lean: { src: 'wind-sun-lean.png' }
    }
  },
  taps: {
    northwind: ['wiggle', 'puff'],
    sunlady: ['nod', 'sparkle'],
    windsun: ['hop', 'hearts']
  },
  pages: [
    { // 1 天上的北風和太陽，北風說自己最厲害
      bg: 'bg-sky.jpg',
      actors: [
        { id: 'northwind', pose: 'proud', x: 31, y: 74, h: 44, loop: 'float' },
        { id: 'sunlady', pose: 'smile', x: 71, y: 72, h: 44, loop: 'float' }
      ],
      cues: [
        { l: 1, id: 'northwind', anim: 'hop' },
        { l: 2, at: 0.6, fx: 'puff', x: 46, y: 50 },
        { l: 2, at: 0.6, id: 'northwind', anim: 'wiggle' },
        { l: 3, id: 'sunlady', anim: 'nod' }
      ]
    },
    { // 2 旅人走在小路上；太陽指著他，北風探頭
      bg: 'bg-hill-path.jpg',
      actors: [
        { id: 'sunlady', pose: 'smile', x: 18, y: 45, h: 32, loop: 'float' },
        { id: 'northwind', pose: 'peek', x: 44, y: 41, h: 28, loop: 'float' },
        { id: 'traveler', pose: 'walk', x: 46, y: 97, h: 44 }
      ],
      cues: [
        { id: 'traveler', x: 62, dur: 3 },
        { l: 2, id: 'sunlady', pose: 'point' },
        { l: 3, id: 'northwind', pose: 'proud', anim: 'hop' }
      ]
    },
    { // 3 北風用力吹，帽子飛走
      bg: 'bg-hill-path.jpg',
      actors: [
        { id: 'northwind', pose: 'blow', x: 25, y: 48, h: 34, loop: 'float' },
        { id: 'traveler', pose: 'walk', x: 64, y: 97, h: 44 }
      ],
      cues: [
        { l: 0, at: 1.4, id: 'northwind', anim: 'wiggle' },
        { l: 1, id: 'northwind', anim: 'wiggle' },
        { l: 1, at: 0.2, fx: 'puff', x: 48, y: 40 },
        { l: 2, at: 1.8, id: 'traveler', pose: 'hatfly', anim: 'wiggle' },
        { l: 2, at: 1.8, fx: 'puff', x: 52, y: 55 },
        { l: 3, id: 'traveler', pose: 'shiver', anim: 'wiggle' }
      ]
    },
    { // 4 再吹一次，小草都彎下腰
      bg: 'bg-hill-path.jpg',
      actors: [
        { id: 'northwind', pose: 'blow2', x: 25, y: 49, h: 36, loop: 'float' },
        { id: 'traveler', pose: 'shiver', x: 64, y: 97, h: 44 }
      ],
      cues: [
        { l: 0, id: 'northwind', anim: 'hop' },
        { l: 1, id: 'northwind', anim: 'wiggle' },
        { l: 1, at: 0.2, fx: 'puff', x: 48, y: 40 },
        { l: 2, at: 0.6, fx: 'puff', x: 50, y: 62 },
        { l: 2, at: 1.6, fx: 'puff', x: 46, y: 78 },
        { l: 3, id: 'traveler', anim: 'wiggle' }
      ]
    },
    { // 5 最大的風，旅人蹲下抓緊外套
      bg: 'bg-hill-path.jpg',
      actors: [
        { id: 'northwind', pose: 'blow3', x: 26, y: 52, h: 40, loop: 'float' },
        { id: 'traveler', pose: 'shiver', x: 64, y: 97, h: 44 }
      ],
      cues: [
        { l: 0, id: 'northwind', anim: 'hop' },
        { l: 1, id: 'northwind', anim: 'wiggle' },
        { l: 1, at: 0.1, fx: 'puff', x: 50, y: 40 },
        { l: 2, at: 0.4, fx: 'puff', x: 52, y: 62 },
        { l: 2, at: 1.6, id: 'traveler', pose: 'crouch', anim: 'wiggle' },
        { l: 3, id: 'traveler', anim: 'wiggle' }
      ]
    },
    { // 6 北風累了，太陽拍拍他
      bg: 'bg-sky.jpg',
      actors: [
        { id: 'northwind', pose: 'tired', x: 34, y: 84, h: 40 },
        { id: 'sunlady', pose: 'smile', x: 70, y: 70, h: 42, loop: 'float' }
      ],
      cues: [
        { l: 0, at: 1.5, id: 'northwind', anim: 'wiggle' },
        { l: 1, id: 'northwind', anim: 'nod' },
        { l: 2, id: 'sunlady', pose: 'pat', anim: 'nod' },
        { l: 3, id: 'sunlady', pose: 'smile', anim: 'hop' }
      ]
    },
    { // 7 太陽出來暖暖地照，旅人鬆開手
      bg: 'bg-hill-path.jpg',
      actors: [
        { id: 'sunlady', pose: 'smile', x: 20, y: 47, h: 32, loop: 'float' },
        { id: 'traveler', pose: 'crouch', x: 64, y: 97, h: 44 }
      ],
      cues: [
        { l: 0, at: 1.2, id: 'sunlady', pose: 'shine', anim: 'hop' },
        { l: 0, at: 1.4, fx: 'sparkle', id: 'sunlady' },
        { l: 1, fx: 'sparkle', x: 46, y: 50 },
        { l: 2, id: 'traveler', pose: 'look' },
        { l: 3, id: 'traveler', anim: 'hop' },
        { l: 3, at: 1.2, fx: 'hearts', id: 'traveler' }
      ]
    },
    { // 8 越來越熱，旅人脫下外套、坐在大樹下
      bg: 'bg-hill-path.jpg',
      actors: [
        { id: 'sunlady', pose: 'shine', x: 20, y: 48, h: 32, loop: 'float' },
        { id: 'traveler', pose: 'walk', x: 46, y: 97, h: 46 }
      ],
      cues: [
        { l: 0, id: 'sunlady', anim: 'nod' },
        { l: 0, at: 0.6, fx: 'sparkle', id: 'sunlady' },
        { l: 1, id: 'traveler', x: 60, dur: 2.4 },
        { l: 2, id: 'traveler', pose: 'hot', anim: 'wiggle' },
        { l: 3, at: 0.4, id: 'traveler', x: 78, y: 95, dur: 1.4 },
        { l: 3, at: 1.8, id: 'traveler', pose: 'rest' }
      ]
    },
    { // 9 北風好驚訝；太陽說溫柔比用力更有用
      bg: 'bg-sky.jpg',
      actors: [
        { id: 'northwind', pose: 'shock', x: 31, y: 76, h: 46, loop: 'float' },
        { id: 'sunlady', pose: 'smile', x: 70, y: 74, h: 44, loop: 'float' }
      ],
      cues: [
        { l: 0, id: 'northwind', anim: 'hop' },
        { l: 1, id: 'sunlady', pose: 'wink', anim: 'nod' },
        { l: 2, id: 'northwind', pose: 'sheepish', anim: 'wiggle' },
        { l: 2, at: 2.0, fx: 'hearts', x: 50, y: 40 }
      ]
    },
    { // 10 變成好朋友；旅人揮手走遠
      bg: 'bg-hill-path.jpg',
      tint: 'sunset',
      actors: [
        { id: 'northwind', pose: 'breeze', x: 22, y: 47, h: 30, loop: 'float' },
        { id: 'sunlady', pose: 'smile', x: 48, y: 45, h: 28, loop: 'float' },
        { id: 'windsun', pose: 'friends', x: 34, y: 50, h: 32, hidden: true, loop: 'float' },
        { id: 'traveler', pose: 'wave', x: 64, y: 97, h: 40 }
      ],
      cues: [
        { id: 'traveler', x: 58, y: 80, h: 28, dur: 9 },
        { l: 0, at: 2.4, id: 'northwind', hide: true },
        { l: 0, at: 2.4, id: 'sunlady', hide: true },
        { l: 0, at: 2.4, id: 'windsun', show: true, anim: 'hop' },
        { l: 0, at: 2.8, fx: 'hearts', id: 'windsun' },
        { l: 1, at: 0.4, fx: 'puff', x: 46, y: 36 },
        { l: 1, at: 2.0, fx: 'sparkle', id: 'windsun' },
        { l: 2, at: 1.6, fx: 'puff', x: 50, y: 50 },
        { l: 2, at: 1.0, id: 'windsun', anim: 'wiggle' }
      ]
    }
  ]
});
