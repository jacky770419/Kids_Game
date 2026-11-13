/* 十二生肖的故事：分鏡（手寫）。格式見 js/story-data.js 開頭與 addBook 的說明；文字與時間在 zodiac-script.js。
   比賽一律「往右游、往右跑」；終點（bg-finish）是前面的草地，河在後面，上岸＝從河裡往畫面下方走。
   水裡的角色：自己畫了浪花的圖（ox-swim、tiger-swim、dog-splash、pig-swim、rabbit-log、raft-*）直接放水面上；
   沒畫浪花的（牛、馬在水裡）用 waves 蓋住腳（腳的 y 要小於 waves＋6 才會在浪後面）。
   面朝左的圖：rabbit-hop、goat-hop、dragon-fly、ox-rat-ride（要往右就 flip）。 */
StoryData.addBook('zodiac', {
  color: '#FFC94D',
  cover: { bg: 'bg-river-water.jpg', actor: 'zdOx', pose: 'swim' },
  voices: {
    '玉皇大帝': { actor: 'zdEmperor', color: '#FFE08A' },
    '老鼠': { actor: 'zdRat', color: '#D9D9E3' },
    '牛': { actor: 'zdOx', color: '#CFC6BA' },
    '老虎': { actor: 'zdTiger', color: '#FFC27A' },
    '兔子': { actor: 'zdRabbit', color: '#FFD6E5' },
    '龍': { actor: 'zdDragon', color: '#A8E6A1' },
    '蛇': { actor: 'zdSnake', color: '#C9F09A' },
    '馬': { actor: 'zdHorse', color: '#E8C09A' },
    '羊': { actor: 'zdGoat', color: '#F3EEDC' },
    '猴子': { actor: 'zdMonkey', color: '#E0BE98' },
    '雞': { actor: 'zdRooster', color: '#FFAE94' },
    '狗': { actor: 'zdDog', color: '#DDB08A' },
    '豬': { actor: 'zdPig', color: '#FFBFD0' },
    '貓': { actor: 'zdCat', color: '#FFC98F' }
  },
  sprites: {
    zdEmperor: {
      think: { src: 'emperor-think.png' },
      idea: { src: 'emperor-idea.png' },
      cloud: { src: 'emperor-cloud.png' },
      flag: { src: 'emperor-flag.png' },
      laugh: { src: 'emperor-laugh.png' },
      bend: { src: 'emperor-bend.png' }
    },
    zdRat: {
      proud: { src: 'rat-proud.png' },
      worry: { src: 'rat-worry.png' },
      pull: { src: 'rat-pull.png' },
      jump: { src: 'rat-jump.png' },
      sheepish: { src: 'rat-sheepish.png' },
      run: { src: 'rat-run.png' }
    },
    zdOx: {
      bow: { src: 'ox-bow.png' },
      ride: { src: 'ox-rat-ride.png', left: true, k: 1.06 },
      swim: { src: 'ox-swim.png' },
      shake: { src: 'ox-shake.png' }
    },
    zdTiger: {
      wet: { src: 'tiger-wet.png' },
      swim: { src: 'tiger-swim.png' }
    },
    zdRabbit: {
      hop: { src: 'rabbit-hop.png', left: true },
      log: { src: 'rabbit-log.png', k: 1.1 }
    },
    zdDragon: {
      fly: { src: 'dragon-fly.png', left: true },
      blow: { src: 'dragon-blow.png' },
      shy: { src: 'dragon-shy.png' }
    },
    zdSnake: {
      slide: { src: 'snake-slide.png' }
    },
    zdHorse: {
      run: { src: 'horse-run-snake.png' },
      rear: { src: 'horse-rear.png' }
    },
    zdGoat: {
      hop: { src: 'goat-hop.png', left: true }
    },
    zdMonkey: {
      hop: { src: 'monkey-hop.png' }
    },
    zdRooster: {
      step: { src: 'rooster-step.png' }
    },
    zdDog: {
      shake: { src: 'dog-shake.png' },
      splash: { src: 'dog-splash.png' }
    },
    zdPig: {
      wake: { src: 'pig-wake.png' },
      sleep: { src: 'pig-sleep.png' },
      swim: { src: 'pig-swim.png' }
    },
    zdCat: {
      plead: { src: 'cat-plead.png' },
      sleep: { src: 'cat-sleep.png' },
      wake: { src: 'cat-wake.png' },
      wet: { src: 'cat-wet.png' },
      chase: { src: 'cat-chase.png' },
      peek: { src: 'cat-peek.png' }
    },
    // 木筏是道具：先是三隻坐在上面（trio），上岸時換成空木筏（empty，木筏一樣大所以 k 小一點）
    zdRaft: {
      trio: { src: 'raft-trio.png' },
      empty: { src: 'raft-empty.png', k: 0.7 }
    }
  },
  taps: {
    zdEmperor: ['nod', 'sparkle'],
    zdDragon: ['nod', 'sparkle'],
    zdRaft: ['wiggle', 'sparkle'],
    zdSnake: ['wiggle', 'hearts']
  },
  pages: [
    { // 1 天上的宮殿：玉皇大帝想呀想，有了！
      bg: 'bg-heaven.jpg',
      actors: [
        { id: 'zdEmperor', pose: 'think', x: 50, y: 97, h: 60 }
      ],
      cues: [
        { l: 0, at: 1.6, id: 'zdEmperor', anim: 'nod' },
        { l: 1, at: 1.0, fx: 'sparkle', x: 50, y: 30 },
        { l: 2, at: 0.4, id: 'zdEmperor', anim: 'wiggle' },
        { l: 2, at: 1.8, id: 'zdEmperor', anim: 'wiggle' },
        { l: 4, id: 'zdEmperor', pose: 'idea', anim: 'hop' },
        { l: 4, at: 0.2, fx: 'sparkle', id: 'zdEmperor' }
      ]
    },
    { // 2 玉皇大帝坐雲來到河邊宣布；草地上的動物跳起來
      bg: 'bg-river-day.jpg',
      actors: [
        { id: 'zdEmperor', pose: 'cloud', x: 18, y: 40, h: 30, loop: 'float' },
        { id: 'zdOx', pose: 'bow', x: 12, y: 97, h: 22 },
        { id: 'zdRat', pose: 'proud', x: 26, y: 97, h: 14 },
        { id: 'zdRabbit', pose: 'hop', x: 38, y: 96, h: 17 },
        { id: 'zdMonkey', pose: 'hop', x: 51, y: 97, h: 18 },
        { id: 'zdGoat', pose: 'hop', x: 64, y: 96, h: 15 },
        { id: 'zdRooster', pose: 'step', x: 76, y: 97, h: 17 },
        { id: 'zdPig', pose: 'wake', x: 89, y: 97, h: 18 }
      ],
      cues: [
        { id: 'zdEmperor', x: 50, y: 58, h: 38, dur: 2.6 },
        { l: 1, id: 'zdEmperor', anim: 'nod' },
        { l: 2, at: 0.4, id: 'zdEmperor', anim: 'hop' },
        { l: 2, at: 2.2, fx: 'sparkle', x: 50, y: 22 },
        { l: 3, at: 0.6, id: 'zdRat', anim: 'hop' },
        { l: 3, at: 0.8, id: 'zdRabbit', anim: 'hop' },
        { l: 3, at: 1.0, id: 'zdMonkey', anim: 'hop' },
        { l: 3, at: 1.2, id: 'zdGoat', anim: 'hop' },
        { l: 3, at: 1.4, id: 'zdRooster', anim: 'hop' },
        { l: 3, at: 1.6, id: 'zdPig', anim: 'hop' },
        { l: 3, at: 1.8, id: 'zdOx', anim: 'hop' },
        { l: 4, at: 1.0, id: 'zdRat', anim: 'hop' },
        { l: 4, at: 1.0, id: 'zdMonkey', anim: 'hop' },
        { l: 4, at: 1.2, id: 'zdRabbit', anim: 'hop' },
        { l: 4, at: 1.2, id: 'zdRooster', anim: 'hop' },
        { l: 4, at: 1.4, id: 'zdGoat', anim: 'hop' },
        { l: 4, at: 1.4, id: 'zdPig', anim: 'hop' },
        { l: 4, at: 1.6, fx: 'hearts', x: 50, y: 72 }
      ]
    },
    { // 3 晚上的大樹下：貓拜託老鼠叫她起床，然後在草窩裡睡著
      bg: 'bg-tree-night.jpg',
      actors: [
        { id: 'zdCat', pose: 'plead', x: 50, y: 97, h: 40 },
        { id: 'zdRat', pose: 'proud', x: 66, y: 97, h: 22, hidden: true }
      ],
      cues: [
        { l: 0, at: 0.6, fx: 'hearts', x: 50, y: 56 },
        { l: 1, id: 'zdCat', anim: 'nod' },
        { l: 2, fx: 'sparkle', x: 60, y: 62 },
        { l: 3, id: 'zdCat', anim: 'wiggle' },
        { l: 4, id: 'zdCat', pose: 'sleep', x: 42, y: 76, h: 22, dur: 0.01 },
        { l: 4, id: 'zdRat', show: true },
        { l: 4, at: 0.8, id: 'zdRat', anim: 'nod' },
        { l: 4, at: 1.2, fx: 'zzz', id: 'zdCat' },
        { l: 4, at: 2.2, fx: 'zzz', id: 'zdCat' }
      ]
    },
    { // 4 清晨河邊，動物一隻一隻來了；老鼠在最前面，河好寬
      bg: 'bg-river-dawn.jpg',
      actors: [
        { id: 'zdRat', pose: 'proud', x: 88, y: 98, h: 24 },
        { id: 'zdOx', pose: 'bow', x: 10, y: 81, h: 17, hidden: true },
        { id: 'zdTiger', pose: 'wet', x: 25, y: 81, h: 15, hidden: true },
        { id: 'zdRabbit', pose: 'hop', x: 38, y: 81, h: 14, hidden: true },
        { id: 'zdDragon', pose: 'fly', x: 74, y: 44, h: 16, hidden: true, loop: 'float' },
        { id: 'zdSnake', pose: 'slide', x: 50, y: 81, h: 13, hidden: true },
        { id: 'zdHorse', pose: 'rear', x: 62, y: 81, h: 17, hidden: true },
        { id: 'zdGoat', pose: 'hop', x: 75, y: 81, h: 13, hidden: true },
        { id: 'zdMonkey', pose: 'hop', x: 11, y: 98, h: 17, hidden: true },
        { id: 'zdRooster', pose: 'step', x: 26, y: 98, h: 17, hidden: true },
        { id: 'zdDog', pose: 'shake', x: 42, y: 98, h: 15, hidden: true },
        { id: 'zdPig', pose: 'wake', x: 58, y: 98, h: 17, hidden: true }
      ],
      cues: [
        { l: 0, at: 0.6, id: 'zdRat', anim: 'hop' },
        { l: 1, id: 'zdOx', show: true, anim: 'hop' },
        { l: 1, at: 1.04, id: 'zdTiger', show: true, anim: 'hop' },
        { l: 1, at: 2.08, id: 'zdRabbit', show: true, anim: 'hop' },
        { l: 2, id: 'zdDragon', show: true, anim: 'hop' },
        { l: 2, at: 0.88, id: 'zdSnake', show: true, anim: 'hop' },
        { l: 2, at: 1.44, id: 'zdHorse', show: true, anim: 'hop' },
        { l: 2, at: 1.84, id: 'zdGoat', show: true, anim: 'hop' },
        { l: 2, at: 2.24, id: 'zdMonkey', show: true, anim: 'hop' },
        { l: 2, at: 2.88, id: 'zdRooster', show: true, anim: 'hop' },
        { l: 2, at: 3.36, id: 'zdDog', show: true, anim: 'hop' },
        { l: 2, at: 3.76, id: 'zdPig', show: true, anim: 'hop' },
        { l: 3, id: 'zdRat', anim: 'hop' },
        { l: 3, at: 0.6, fx: 'notes', id: 'zdRat' },
        { l: 4, id: 'zdRat', pose: 'worry', anim: 'wiggle' },
        { l: 4, at: 2.2, id: 'zdRat', anim: 'wiggle' }
      ]
    },
    { // 5 老鼠拉拉牛的尾巴；爬上去坐在牛背上
      bg: 'bg-river-dawn.jpg',
      actors: [
        { id: 'zdOx', pose: 'bow', x: 62, y: 96, h: 42 },
        { id: 'zdRat', pose: 'pull', x: 37, y: 97, h: 22 }
      ],
      cues: [
        { l: 0, at: 0.3, id: 'zdRat', anim: 'wiggle' },
        { l: 1, id: 'zdOx', anim: 'nod' },
        { l: 1, at: 2.2, id: 'zdOx', anim: 'nod' },
        { l: 2, id: 'zdRat', pose: 'proud', x: 52, y: 66, h: 15, dur: 1.8 },
        { l: 2, at: 2.0, id: 'zdRat', hide: true },
        { l: 2, at: 2.0, id: 'zdOx', pose: 'ride', flip: true, anim: 'hop' },
        { l: 3, id: 'zdOx', anim: 'nod' },
        { l: 4, id: 'zdOx', anim: 'hop' },
        { l: 4, at: 0.6, fx: 'hearts', x: 56, y: 44 }
      ]
    },
    { // 6 預備開始！大家跳進河裡；牛慢慢游，老鼠加油
      bg: 'bg-river-water.jpg',
      actors: [
        { id: 'zdEmperor', pose: 'flag', x: 15, y: 58, h: 40, loop: 'float' },
        { id: 'zdTiger', pose: 'swim', x: 50, y: 46, h: 17, hidden: true },
        { id: 'zdDog', pose: 'splash', x: 70, y: 56, h: 14, hidden: true },
        { id: 'zdPig', pose: 'swim', x: 86, y: 44, h: 13, hidden: true },
        { id: 'zdOx', pose: 'swim', x: 28, y: 97, h: 32 }
      ],
      cues: [
        { l: 0, at: 0.9, id: 'zdEmperor', anim: 'nod' },
        { l: 0, at: 2.6, id: 'zdEmperor', anim: 'hop' },
        { l: 0, at: 2.7, fx: 'sparkle', id: 'zdEmperor' },
        { l: 1, id: 'zdTiger', show: true, anim: 'hop' },
        { l: 1, at: 0.05, fx: 'spout', x: 50, y: 42 },
        { l: 1, at: 0.4, id: 'zdDog', show: true, anim: 'hop' },
        { l: 1, at: 0.45, fx: 'spout', x: 70, y: 52 },
        { l: 1, at: 1.1, id: 'zdPig', show: true, anim: 'hop' },
        { l: 1, at: 1.15, fx: 'spout', x: 86, y: 40 },
        { l: 1, at: 1.6, fx: 'spout', x: 30, y: 74 },
        { l: 2, id: 'zdOx', x: 48, dur: 7.5 },
        { l: 2, at: 0.3, id: 'zdTiger', x: 60, dur: 4 },
        { l: 2, at: 0.3, id: 'zdDog', x: 78, dur: 4 },
        { l: 3, id: 'zdOx', anim: 'nod' },
        { l: 3, at: 1.5, id: 'zdOx', anim: 'nod' },
        { l: 4, id: 'zdOx', anim: 'hop' },
        { l: 4, at: 0.9, id: 'zdOx', anim: 'hop' },
        { l: 4, at: 0.4, fx: 'sparkle', x: 44, y: 66 }
      ]
    },
    { // 7 終點：牛游到岸邊（老鼠坐在牛頭後面）；一、二、三，跳！老鼠第一名；牛爬上岸、第二名
      bg: 'bg-finish.jpg',
      waves: 58,
      actors: [
        { id: 'zdEmperor', pose: 'cloud', x: 16, y: 96, h: 44, loop: 'float' },
        { id: 'zdOx', pose: 'swim', x: 30, y: 67, h: 24 },
        { id: 'zdRat', pose: 'jump', x: 52, y: 46, h: 10, hidden: true }
      ],
      cues: [
        { l: 0, id: 'zdOx', x: 44, dur: 2.8 },
        { l: 0, at: 1.84, id: 'zdOx', anim: 'nod' },
        { l: 1, id: 'zdOx', anim: 'nod' },
        { l: 1, at: 0.56, id: 'zdOx', anim: 'nod' },
        { l: 1, at: 1.04, id: 'zdOx', pose: 'bow', x: 46, y: 63, h: 26, dur: 0.01 },
        { l: 1, at: 1.04, id: 'zdRat', show: true },
        { l: 1, at: 1.06, id: 'zdRat', x: 66, y: 88, h: 16, dur: 0.6 },
        { l: 1, at: 1.7, id: 'zdRat', pose: 'proud', anim: 'hop' },
        { l: 2, id: 'zdEmperor', anim: 'hop' },
        { l: 2, at: 0.6, fx: 'sparkle', id: 'zdRat' },
        { l: 3, id: 'zdOx', pose: 'shake', x: 42, y: 94, h: 32, dur: 1.4 },
        { l: 3, at: 1.6, id: 'zdOx', anim: 'wiggle' },
        { l: 4, id: 'zdEmperor', anim: 'hop' },
        { l: 4, at: 0.6, fx: 'sparkle', id: 'zdOx' }
      ]
    },
    { // 8 急流：老虎被水推遠、吼！用力游到對岸，第三名
      bg: 'bg-river-rapids.jpg',
      actors: [
        { id: 'zdTiger', pose: 'swim', x: 42, y: 74, h: 34, hidden: true },
        { id: 'zdEmperor', pose: 'cloud', x: 84, y: 54, h: 34, hidden: true, loop: 'float' }
      ],
      cues: [
        { l: 1, id: 'zdTiger', show: true, anim: 'hop' },
        { l: 1, at: 0.6, id: 'zdTiger', x: 18, y: 72, h: 30, dur: 2.6 },
        { l: 1, at: 1.0, id: 'zdTiger', anim: 'wiggle' },
        { l: 2, id: 'zdTiger', anim: 'hop' },
        { l: 2, at: 0.1, fx: 'puff', id: 'zdTiger' },
        { l: 3, id: 'zdTiger', x: 52, y: 46, h: 20, dur: 1.6 },
        { l: 3, at: 1.7, id: 'zdTiger', pose: 'wet', x: 62, y: 34, h: 18, dur: 0.6 },
        { l: 4, id: 'zdEmperor', show: true, anim: 'hop' },
        { l: 4, at: 0.8, fx: 'sparkle', id: 'zdTiger' },
        { l: 4, at: 0.8, id: 'zdTiger', anim: 'hop' }
      ]
    },
    { // 9 兔子跳石頭：一顆、兩顆、三顆、四顆；跳上浮木，風把浮木吹到對岸，第四名
      bg: 'bg-stones.jpg',
      actors: [
        { id: 'zdRabbit', pose: 'hop', x: 10, y: 92, h: 24, flip: true, hidden: true },
        { id: 'zdEmperor', pose: 'cloud', x: 87, y: 32, h: 28, hidden: true, loop: 'float' }
      ],
      cues: [
        { l: 1, id: 'zdRabbit', show: true, anim: 'hop' },
        { l: 1, at: 0.83, id: 'zdRabbit', x: 15, y: 62, h: 18, dur: 0.45 },
        { l: 1, at: 1.55, id: 'zdRabbit', x: 30, y: 56, h: 15, dur: 0.45 },
        { l: 1, at: 2.27, id: 'zdRabbit', x: 43.5, y: 50, h: 13, dur: 0.45 },
        { l: 1, at: 2.99, id: 'zdRabbit', x: 54, y: 46, h: 11, dur: 0.45 },
        { l: 2, at: 0.5, id: 'zdRabbit', anim: 'wiggle' },
        { l: 2, at: 1.84, id: 'zdRabbit', pose: 'log', x: 70, y: 55, h: 17, dur: 0.6 },
        { l: 3, id: 'zdRabbit', x: 86, y: 40, h: 14, dur: 3 },
        { l: 3, at: 0.1, fx: 'puff', x: 62, y: 48 },
        { l: 3, at: 1.4, fx: 'puff', x: 70, y: 44 },
        { l: 4, id: 'zdEmperor', show: true, anim: 'hop' },
        { l: 4, at: 0.9, fx: 'sparkle', id: 'zdRabbit' },
        { l: 4, at: 0.9, id: 'zdRabbit', anim: 'hop' }
      ]
    },
    { // 10 龍在小村子上空，小苗好渴；吹出烏雲下雨，滴答滴答
      bg: 'bg-village.jpg',
      actors: [
        { id: 'zdDragon', pose: 'fly', x: 112, y: 40, h: 24, loop: 'float' }
      ],
      cues: [
        { l: 0, id: 'zdDragon', x: 66, dur: 2.4 },
        { l: 1, id: 'zdDragon', anim: 'nod' },
        { l: 2, at: 1.0, id: 'zdDragon', anim: 'wiggle' },
        { l: 3, id: 'zdDragon', anim: 'nod' },
        { l: 3, at: 2.5, id: 'zdDragon', pose: 'blow', x: 28, y: 46, h: 33, dur: 0.6 },
        { l: 3, at: 3.1, id: 'zdDragon', anim: 'hop' },
        { l: 4, fx: 'spout', x: 56, y: 66 },
        { l: 4, at: 0.32, fx: 'spout', x: 76, y: 70 },
        { l: 4, at: 0.96, fx: 'spout', x: 64, y: 72 },
        { l: 4, at: 1.28, fx: 'spout', x: 86, y: 66 },
        { l: 4, at: 2.5, fx: 'sparkle', x: 66, y: 68 },
        { l: 4, at: 2.8, fx: 'sparkle', x: 30, y: 72 },
        { l: 4, at: 3.0, id: 'zdDragon', anim: 'nod' }
      ]
    },
    { // 11 龍飛到終點，不好意思地低頭；玉皇大帝摸摸龍，第五名
      bg: 'bg-finish.jpg',
      actors: [
        { id: 'zdOx', pose: 'bow', x: 10, y: 97, h: 24 },
        { id: 'zdTiger', pose: 'wet', x: 27, y: 97, h: 17 },
        { id: 'zdRat', pose: 'proud', x: 37.5, y: 98, h: 12 },
        { id: 'zdRabbit', pose: 'hop', x: 22, y: 79, h: 14 },
        { id: 'zdEmperor', pose: 'bend', x: 56, y: 96, h: 52 },
        { id: 'zdDragon', pose: 'fly', x: 22, y: 38, h: 20, flip: true, loop: 'float' }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'zdDragon', x: 84, y: 62, h: 24, dur: 2.2 },
        { l: 0, at: 2.7, id: 'zdDragon', pose: 'shy', x: 85, y: 96, h: 34, loop: 'none', dur: 0.5 },
        { l: 0, at: 3.0, fx: 'sparkle', x: 50, y: 22 },
        { l: 1, id: 'zdEmperor', anim: 'nod' },
        { l: 2, id: 'zdDragon', anim: 'nod' },
        { l: 3, id: 'zdEmperor', anim: 'nod' },
        { l: 3, at: 1.4, fx: 'hearts', id: 'zdDragon' },
        { l: 4, id: 'zdEmperor', anim: 'hop' },
        { l: 4, at: 0.9, fx: 'sparkle', id: 'zdDragon' },
        { l: 4, at: 0.9, id: 'zdDragon', anim: 'hop' }
      ]
    },
    { // 12 馬噠噠噠跑過淺水，腳上偷偷纏著小蛇
      bg: 'bg-river-day.jpg',
      waves: 56,
      actors: [
        { id: 'zdHorse', pose: 'run', x: -16, y: 61, h: 34 }
      ],
      cues: [
        { l: 1, id: 'zdHorse', x: 48, dur: 2.6 },
        { l: 1, at: 0.4, fx: 'spout', x: 10, y: 58 },
        { l: 1, at: 1.3, fx: 'spout', x: 28, y: 58 },
        { l: 1, at: 2.2, fx: 'spout', x: 44, y: 58 },
        { l: 2, id: 'zdHorse', anim: 'hop' },
        { l: 2, at: 1.4, id: 'zdHorse', anim: 'hop' },
        { l: 3, at: 2.2, fx: 'sparkle', x: 55, y: 50 },
        { l: 4, at: 0.2, fx: 'hearts', x: 55, y: 50 }
      ]
    },
    { // 13 小蛇滑下來先上岸（第六名），馬嚇一跳（第七名）；玉皇大帝笑
      bg: 'bg-finish.jpg',
      waves: 58,
      actors: [
        { id: 'zdEmperor', pose: 'laugh', x: 15, y: 88, h: 40, loop: 'float' },
        { id: 'zdHorse', pose: 'run', x: 40, y: 63, h: 30 },
        { id: 'zdSnake', pose: 'slide', x: 47, y: 62, h: 12, hidden: true }
      ],
      cues: [
        { l: 0, at: 1.68, id: 'zdHorse', pose: 'rear' },
        { l: 0, at: 1.68, id: 'zdSnake', show: true },
        { l: 0, at: 1.8, id: 'zdSnake', x: 60, y: 90, h: 18, dur: 1.4 },
        { l: 1, at: 1.0, id: 'zdHorse', x: 38, y: 95, h: 36, dur: 1.4 },
        { l: 2, id: 'zdSnake', anim: 'wiggle' },
        { l: 3, id: 'zdHorse', anim: 'hop' },
        { l: 3, at: 1.4, id: 'zdHorse', anim: 'wiggle' },
        { l: 4, id: 'zdEmperor', anim: 'hop' },
        { l: 4, at: 1.36, fx: 'sparkle', id: 'zdSnake' },
        { l: 4, at: 1.36, id: 'zdSnake', anim: 'hop' },
        { l: 4, at: 3.36, fx: 'sparkle', id: 'zdHorse' },
        { l: 4, at: 3.36, id: 'zdHorse', anim: 'hop' }
      ]
    },
    { // 14 雞、羊、猴子坐木筏；靠岸後羊第八、猴子第九、雞第十依序上岸
      bg: 'bg-finish.jpg',
      actors: [
        { id: 'zdEmperor', pose: 'cloud', x: 14, y: 92, h: 40, loop: 'float' },
        { id: 'zdRaft', pose: 'trio', x: 46, y: 60, h: 28, loop: 'still' },
        { id: 'zdGoat', pose: 'hop', x: 48, y: 67, h: 12, hidden: true, flip: true },
        { id: 'zdMonkey', pose: 'hop', x: 57, y: 67, h: 13, hidden: true },
        { id: 'zdRooster', pose: 'step', x: 39, y: 67, h: 14, hidden: true }
      ],
      cues: [
        { l: 0, at: 0.2, id: 'zdRaft', anim: 'hop' },
        { l: 0, at: 0.3, fx: 'notes', x: 39, y: 34 },
        { l: 1, id: 'zdRaft', anim: 'nod' },
        { l: 2, id: 'zdRaft', anim: 'wiggle' },
        { l: 2, at: 0.2, fx: 'spout', x: 56, y: 62 },
        { l: 2, at: 1.4, fx: 'spout', x: 56, y: 62 },
        { l: 3, id: 'zdRaft', x: 47, y: 66, h: 30, dur: 1.8 },
        { l: 3, at: 2.0, id: 'zdRaft', pose: 'empty' },
        { l: 3, at: 2.0, id: 'zdGoat', show: true },
        { l: 3, at: 2.0, id: 'zdMonkey', show: true },
        { l: 3, at: 2.0, id: 'zdRooster', show: true },
        { l: 4, id: 'zdGoat', x: 58, y: 92, h: 17, dur: 0.6 },
        { l: 4, at: 0.1, id: 'zdGoat', anim: 'hop' },
        { l: 4, at: 1.28, fx: 'sparkle', id: 'zdGoat' },
        { l: 4, at: 1.7, id: 'zdMonkey', x: 72, y: 94, h: 19, dur: 0.6 },
        { l: 4, at: 1.8, id: 'zdMonkey', anim: 'hop' },
        { l: 4, at: 3.12, fx: 'sparkle', id: 'zdMonkey' },
        { l: 4, at: 3.6, id: 'zdRooster', x: 86, y: 96, h: 20, dur: 0.8 },
        { l: 4, at: 5.2, fx: 'sparkle', id: 'zdRooster' },
        { l: 4, at: 5.2, id: 'zdRooster', anim: 'hop' }
      ]
    },
    { // 15 狗在淺水玩水；爬上岸甩一甩，水花亂飛，大家躲開；第十一名
      bg: 'bg-finish.jpg',
      actors: [
        { id: 'zdEmperor', pose: 'cloud', x: 13, y: 92, h: 38, loop: 'float' },
        { id: 'zdRat', pose: 'proud', x: 31, y: 97, h: 14 },
        { id: 'zdMonkey', pose: 'hop', x: 72, y: 97, h: 19 },
        { id: 'zdRooster', pose: 'step', x: 88, y: 97, h: 19 },
        { id: 'zdDog', pose: 'splash', x: 34, y: 64, h: 20, hidden: true }
      ],
      cues: [
        { l: 0, at: 0.6, fx: 'spout', x: 38, y: 58 },
        { l: 1, id: 'zdDog', show: true, anim: 'hop' },
        { l: 1, at: 0.2, fx: 'spout', x: 40, y: 58 },
        { l: 1, at: 1.0, id: 'zdDog', x: 52, dur: 1.4 },
        { l: 1, at: 2.2, fx: 'spout', x: 55, y: 58 },
        { l: 2, id: 'zdDog', x: 40, dur: 1.2 },
        { l: 2, at: 0.6, fx: 'spout', x: 42, y: 58 },
        { l: 2, at: 1.8, id: 'zdDog', pose: 'shake', x: 50, y: 94, h: 24, dur: 1.0 },
        { l: 3, id: 'zdDog', anim: 'wiggle' },
        { l: 3, at: 0.1, fx: 'spout', id: 'zdDog' },
        { l: 3, at: 0.3, id: 'zdRat', anim: 'hop' },
        { l: 3, at: 0.3, id: 'zdMonkey', anim: 'hop' },
        { l: 3, at: 0.9, id: 'zdDog', anim: 'wiggle' },
        { l: 3, at: 1.0, fx: 'spout', id: 'zdDog' },
        { l: 3, at: 1.2, id: 'zdRooster', anim: 'hop' },
        { l: 4, id: 'zdEmperor', anim: 'hop' },
        { l: 4, at: 0.7, fx: 'sparkle', id: 'zdDog' },
        { l: 4, at: 0.7, id: 'zdDog', anim: 'hop' }
      ]
    },
    { // 16 沙洲大樹下，豬吃飽睡著；醒來跳下水往對岸游；第十二名
      bg: 'bg-sandbar.jpg',
      actors: [
        { id: 'zdPig', pose: 'sleep', x: 46, y: 76, h: 30 },
        { id: 'zdEmperor', pose: 'laugh', x: 86, y: 46, h: 30, hidden: true, loop: 'float' }
      ],
      cues: [
        { l: 0, at: 1.0, fx: 'zzz', id: 'zdPig' },
        { l: 1, at: 1.6, fx: 'zzz', id: 'zdPig' },
        { l: 2, id: 'zdPig', anim: 'nod' },
        { l: 2, at: 2.2, fx: 'zzz', id: 'zdPig' },
        { l: 3, id: 'zdPig', pose: 'wake', anim: 'hop' },
        { l: 3, at: 0.6, id: 'zdPig', x: 74, y: 88, dur: 0.9 },
        { l: 3, at: 1.5, id: 'zdPig', pose: 'swim', x: 84, y: 99, h: 22, dur: 0.6 },
        { l: 3, at: 1.6, fx: 'spout', x: 84, y: 90 },
        { l: 4, id: 'zdEmperor', show: true, anim: 'hop' },
        { l: 4, at: 0.9, fx: 'sparkle', id: 'zdPig' }
      ]
    },
    { // 17 下午了，貓還在睡；醒來嚇一跳，拼命往河邊跑
      bg: 'bg-tree-day.jpg',
      actors: [
        { id: 'zdCat', pose: 'sleep', x: 42, y: 76, h: 22 }
      ],
      cues: [
        { l: 0, at: 1.0, fx: 'zzz', id: 'zdCat' },
        { l: 1, at: 1.8, fx: 'zzz', id: 'zdCat' },
        { l: 1, at: 3.0, id: 'zdCat', anim: 'nod' },
        { l: 2, id: 'zdCat', pose: 'wake', x: 42, y: 80, h: 26, anim: 'hop', dur: 0.2 },
        { l: 2, at: 1.44, id: 'zdCat', anim: 'wiggle' },
        { l: 3, at: 0.24, id: 'zdCat', anim: 'hop' },
        { l: 3, at: 1.04, id: 'zdCat', x: 84, y: 64, h: 13, dur: 1.4 },
        { l: 4, id: 'zdCat', anim: 'hop' },
        { l: 4, at: 0.7, id: 'zdCat', anim: 'hop' }
      ]
    },
    { // 18 傍晚，貓溼答答上岸，氣鼓鼓瞪老鼠；老鼠躲在牛腳後面抓頭
      bg: 'bg-finish.jpg',
      tint: 'sunset',
      actors: [
        { id: 'zdCat', pose: 'wet', x: 30, y: 68, h: 14 },
        { id: 'zdEmperor', pose: 'bend', x: 46, y: 95, h: 54, flip: true },
        { id: 'zdOx', pose: 'bow', x: 80, y: 95, h: 32, flip: true },
        { id: 'zdRat', pose: 'sheepish', x: 68, y: 94, h: 17 }
      ],
      cues: [
        { l: 0, at: 0.6, id: 'zdCat', x: 19, y: 97, h: 32, dur: 1.8 },
        { l: 1, id: 'zdEmperor', anim: 'nod' },
        { l: 2, id: 'zdCat', anim: 'wiggle' },
        { l: 2, at: 1.2, id: 'zdCat', anim: 'hop' },
        { l: 3, id: 'zdRat', anim: 'nod' },
        { l: 3, at: 1.6, id: 'zdRat', anim: 'wiggle' },
        { l: 4, id: 'zdCat', anim: 'wiggle' },
        { l: 4, at: 0.8, id: 'zdCat', anim: 'hop' },
        { l: 4, at: 0.9, fx: 'sparkle', id: 'zdCat' }
      ]
    },
    { // 19 貓追老鼠繞著小樹跑；大家哈哈大笑
      bg: 'bg-meadow-eve.jpg',
      actors: [
        { id: 'zdOx', pose: 'bow', x: 10, y: 98, h: 22 },
        { id: 'zdMonkey', pose: 'hop', x: 92, y: 98, h: 18 },
        { id: 'zdGoat', pose: 'hop', x: 84, y: 74, h: 12 },
        { id: 'zdRat', pose: 'run', x: -10, y: 90, h: 15 },
        { id: 'zdCat', pose: 'chase', x: -26, y: 92, h: 22 }
      ],
      cues: [
        { l: 0, at: 0.3, id: 'zdRat', x: 62, dur: 2.4 },
        { l: 0, at: 1.1, id: 'zdCat', x: 40, dur: 2.4 },
        { l: 1, id: 'zdCat', anim: 'hop' },
        { l: 1, at: 0.6, id: 'zdRat', x: 78, y: 80, h: 13, dur: 1.0 },
        { l: 1, at: 1.6, id: 'zdRat', flip: true },
        { l: 1, at: 0.8, id: 'zdCat', x: 60, y: 86, h: 19, dur: 1.4 },
        { l: 2, id: 'zdRat', x: 44, y: 70, h: 11, dur: 1.6 },
        { l: 2, at: 0.6, id: 'zdCat', flip: true },
        { l: 2, at: 0.6, id: 'zdCat', x: 72, y: 74, h: 15, dur: 1.6 },
        { l: 3, id: 'zdOx', anim: 'hop' },
        { l: 3, at: 0.2, id: 'zdMonkey', anim: 'hop' },
        { l: 3, at: 0.4, id: 'zdGoat', anim: 'hop' },
        { l: 3, at: 0.3, fx: 'notes', x: 10, y: 66 },
        { l: 3, at: 0.6, fx: 'notes', x: 90, y: 70 },
        { l: 3, at: 0.2, id: 'zdRat', x: 30, y: 84, h: 13, dur: 1.2 },
        { l: 3, at: 0.8, id: 'zdCat', x: 50, y: 74, h: 15, dur: 1.4 },
        { l: 4, id: 'zdRat', flip: false },
        { l: 4, id: 'zdRat', x: 58, y: 94, h: 16, dur: 1.6 },
        { l: 4, at: 0.6, id: 'zdCat', flip: false },
        { l: 4, at: 0.6, id: 'zdCat', x: 34, y: 92, h: 21, dur: 1.6 },
        { l: 4, at: 2.0, id: 'zdRat', x: 74, y: 94, dur: 1.2 },
        { l: 4, at: 2.3, id: 'zdCat', x: 52, y: 94, dur: 1.2 }
      ]
    },
    { // 20 夜空：十二隻動物照順時鐘圍成一圈，玉皇大帝在中間；貓在外面偷看
      bg: 'bg-night-sky.jpg',
      actors: [
        { id: 'zdEmperor', pose: 'cloud', x: 50, y: 70, h: 30, loop: 'float' },
        { id: 'zdRat', pose: 'proud', x: 50, y: 29, h: 14 },
        { id: 'zdOx', pose: 'bow', x: 66.5, y: 34, h: 14 },
        { id: 'zdTiger', pose: 'wet', x: 78.5, y: 46, h: 15 },
        { id: 'zdRabbit', pose: 'hop', x: 83, y: 62, h: 15 },
        { id: 'zdDragon', pose: 'fly', x: 78.5, y: 78, h: 12 },
        { id: 'zdSnake', pose: 'slide', x: 66.5, y: 91, h: 14 },
        { id: 'zdHorse', pose: 'rear', x: 50, y: 96, h: 15 },
        { id: 'zdGoat', pose: 'hop', x: 33.5, y: 91, h: 13 },
        { id: 'zdMonkey', pose: 'hop', x: 21.5, y: 79, h: 15 },
        { id: 'zdRooster', pose: 'step', x: 17, y: 62, h: 15 },
        { id: 'zdDog', pose: 'shake', x: 21.5, y: 46, h: 14 },
        { id: 'zdPig', pose: 'wake', x: 33.5, y: 34, h: 14 },
        { id: 'zdCat', pose: 'peek', x: 8, y: 99, h: 13 }
      ],
      cues: [
        { l: 0, id: 'zdEmperor', anim: 'nod' },
        { l: 1, id: 'zdRat', anim: 'hop' },
        { l: 1, fx: 'sparkle', id: 'zdRat' },
        { l: 1, at: 0.58, id: 'zdOx', anim: 'hop' },
        { l: 1, at: 0.58, fx: 'sparkle', id: 'zdOx' },
        { l: 1, at: 1.94, id: 'zdTiger', anim: 'hop' },
        { l: 1, at: 1.94, fx: 'sparkle', id: 'zdTiger' },
        { l: 1, at: 2.74, id: 'zdRabbit', anim: 'hop' },
        { l: 1, at: 2.74, fx: 'sparkle', id: 'zdRabbit' },
        { l: 1, at: 3.54, id: 'zdDragon', anim: 'hop' },
        { l: 1, at: 3.54, fx: 'sparkle', id: 'zdDragon' },
        { l: 1, at: 4.26, id: 'zdSnake', anim: 'hop' },
        { l: 1, at: 4.26, fx: 'sparkle', id: 'zdSnake' },
        { l: 2, id: 'zdHorse', anim: 'hop' },
        { l: 2, fx: 'sparkle', id: 'zdHorse' },
        { l: 2, at: 0.8, id: 'zdGoat', anim: 'hop' },
        { l: 2, at: 0.8, fx: 'sparkle', id: 'zdGoat' },
        { l: 2, at: 1.44, id: 'zdMonkey', anim: 'hop' },
        { l: 2, at: 1.44, fx: 'sparkle', id: 'zdMonkey' },
        { l: 2, at: 2.08, id: 'zdRooster', anim: 'hop' },
        { l: 2, at: 2.08, fx: 'sparkle', id: 'zdRooster' },
        { l: 2, at: 2.72, id: 'zdDog', anim: 'hop' },
        { l: 2, at: 2.72, fx: 'sparkle', id: 'zdDog' },
        { l: 2, at: 3.36, id: 'zdPig', anim: 'hop' },
        { l: 2, at: 3.36, fx: 'sparkle', id: 'zdPig' },
        { l: 3, id: 'zdEmperor', anim: 'nod' },
        { l: 3, at: 1.6, fx: 'sparkle', x: 50, y: 44 },
        { l: 4, at: 0.6, fx: 'hearts', x: 50, y: 52 },
        { l: 4, at: 1.6, id: 'zdCat', anim: 'wiggle' }
      ]
    }
  ]
});
