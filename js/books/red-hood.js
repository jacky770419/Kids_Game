/* 小紅帽：分鏡（手寫）。格式見 js/story-data.js 開頭與 addBook 的說明；文字與時間在 red-hood-script.js。
   方向：girl-skip／spin／wave／look／enter 朝右，girl-tilt 朝左看，girl-back 臉朝右往左退；
   wolf-point 指右、wolf-tiptoe 臉朝右、wolf-peek（蹲低揮手）朝右、wolf-knock 朝左敲門、
   wolf-grab 朝右撲、wolf-flee 朝左逃；hunter-open 自己畫了一扇門在右邊。
   兩人一張圖：mom-give（媽媽＋小紅帽）、wolf-push（大野狼＋奶奶）、girl-hug-gm（小紅帽＋奶奶），各自是一個角色。
   奶奶的臥室（bg-grandma-room）：衣櫃在最左邊、床在右半邊（枕頭在右）；床上的狼（bedcap／hide／blink／grin）直接疊在床上。 */
StoryData.addBook('red-hood', {
  color: '#F2665E',
  cover: { bg: 'bg-forest-path.jpg', actor: 'rhGirl', pose: 'skip' },
  voices: {
    '小紅帽': { actor: 'rhGirl', color: '#F2665E' },
    '媽媽': { actor: 'rhMom', color: '#A8D5A2' },
    '大野狼': { actor: 'rhWolf', color: '#B5B5C3' },
    '奶奶': { actor: 'rhGrandma', color: '#C3A6DD' },
    '獵人': { actor: 'rhHunter', color: '#8CC07A' }
  },
  sprites: {
    rhGirl: {
      spin: { src: 'girl-spin.png' },
      wave: { src: 'girl-wave.png' },
      take: { src: 'girl-take.png' },
      nod: { src: 'girl-nod.png' },
      skip: { src: 'girl-skip.png' },
      tilt: { src: 'girl-tilt.png' },
      pick: { src: 'girl-pick.png' },
      enter: { src: 'girl-enter.png' },
      look: { src: 'girl-look.png' },
      back: { src: 'girl-back.png' },
      shout: { src: 'girl-shout.png' },
      finger: { src: 'girl-finger.png' }
    },
    rhMom: {
      stand: { src: 'mom-stand.png' },
      finger: { src: 'mom-finger.png', k: 0.82 }
    },
    rhMomGirl: { give: { src: 'mom-give.png' } },
    rhWolf: {
      point: { src: 'wolf-point.png' },   // 第一個姿勢＝字幕旁的頭像，要臉在上面正中間的
      peek: { src: 'wolf-peek.png' },
      tiptoe: { src: 'wolf-tiptoe.png' },
      knock: { src: 'wolf-knock.png' },
      bedcap: { src: 'wolf-bedcap.png' },
      hide: { src: 'wolf-hide.png' },
      blink: { src: 'wolf-blink.png' },
      grin: { src: 'wolf-grin.png' },
      grab: { src: 'wolf-grab.png' },
      flee: { src: 'wolf-flee.png' }
    },
    rhWolfGm: { push: { src: 'wolf-push.png' } },
    rhGrandma: {
      out: { src: 'grandma-out.png' },
      eat: { src: 'gm-eat.png' }
    },
    rhGirlGm: { hug: { src: 'girl-hug-gm.png' } },
    rhHunter: {
      stop: { src: 'hunter-stop.png' },
      open: { src: 'hunter-open.png' },
      eat: { src: 'hunter-eat.png' }
    }
  },
  taps: {
    rhGirl: ['hop', 'hearts'],
    rhWolf: ['wiggle', 'sparkle'],
    rhHunter: ['nod', 'sparkle']
  },
  pages: [
    { // 1 森林旁的小木屋，小紅帽在門前小路上轉一圈
      bg: 'bg-cottage.jpg',
      actors: [
        { id: 'rhGirl', pose: 'wave', x: 62, y: 96, h: 48 }
      ],
      cues: [
        { l: 0, at: 0.8, id: 'rhGirl', anim: 'hop' },
        { l: 1, at: 0.6, id: 'rhGirl', anim: 'nod' },
        { l: 2, at: 1.4, id: 'rhGirl', pose: 'spin', anim: 'spin' },
        { l: 3, id: 'rhGirl', anim: 'hop' },
        { l: 3, at: 0.4, fx: 'hearts', id: 'rhGirl' }
      ]
    },
    { // 2 廚房：媽媽把籃子交給小紅帽（兩人一張圖）；小紅帽接過籃子，媽媽站著舉手指說話
      bg: 'bg-rh-kitchen.jpg',
      actors: [
        { id: 'rhMomGirl', pose: 'give', x: 40, y: 97, h: 62 },
        { id: 'rhMom', pose: 'stand', x: 28, y: 97, h: 62, hidden: true },
        { id: 'rhGirl', pose: 'take', x: 50, y: 97, h: 48, hidden: true }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'rhMomGirl', anim: 'nod' },
        { l: 1, at: 1.4, fx: 'sparkle', x: 44, y: 62 },
        { l: 2, id: 'rhMomGirl', hide: true },
        { l: 2, id: 'rhMom', show: true },
        { l: 2, id: 'rhGirl', show: true, anim: 'hop' },
        { l: 2, at: 0.8, fx: 'hearts', id: 'rhGirl' },
        { l: 3, id: 'rhMom', anim: 'nod' }
      ]
    },
    { // 3 屋前：媽媽蹲下來豎手指叮嚀，小紅帽點頭跟著說
      bg: 'bg-cottage.jpg',
      actors: [
        { id: 'rhMom', pose: 'finger', x: 40, y: 96, h: 58 },
        { id: 'rhGirl', pose: 'nod', x: 62, y: 96, h: 48 }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'rhMom', anim: 'nod' },
        { l: 1, id: 'rhMom', anim: 'nod' },
        { l: 2, id: 'rhGirl', anim: 'nod' },
        { l: 3, id: 'rhGirl', anim: 'nod' },
        { l: 4, id: 'rhMom', anim: 'nod' },
        { l: 4, at: 1.0, id: 'rhGirl', anim: 'hop' }
      ]
    },
    { // 4 森林小路：小紅帽提著籃子一蹦一跳往右走，邊走邊唱
      bg: 'bg-forest-path.jpg',
      actors: [
        { id: 'rhGirl', pose: 'skip', x: 22, y: 97, h: 46 }
      ],
      cues: [
        { l: 0, at: 0.3, id: 'rhGirl', x: 40, dur: 2.6 },
        { l: 1, fx: 'notes', x: 24, y: 18 },
        { l: 1, at: 0.6, fx: 'notes', x: 72, y: 18 },
        { l: 1, at: 1.4, fx: 'sparkle', x: 82, y: 82 },
        { l: 2, id: 'rhGirl', x: 56, dur: 2.4 },
        { l: 2, at: 0.4, fx: 'notes', id: 'rhGirl' },
        { l: 3, id: 'rhGirl', x: 74, dur: 3.2 },
        { l: 3, at: 0.6, fx: 'notes', id: 'rhGirl' },
        { l: 3, at: 2.4, fx: 'notes', id: 'rhGirl' }
      ]
    },
    { // 5 大野狼從左邊老橡樹旁蹲低出來揮手（peek 朝右）；小紅帽停下來歪頭看牠
      bg: 'bg-forest-path.jpg',
      actors: [
        { id: 'rhWolf', pose: 'peek', x: 20, y: 92, h: 34, hidden: true },
        { id: 'rhGirl', pose: 'skip', x: 58, y: 97, h: 46 }
      ],
      cues: [
        { l: 0, at: 1.6, id: 'rhWolf', show: true, anim: 'hop' },
        { l: 0, at: 1.6, id: 'rhGirl', pose: 'tilt' },
        { l: 1, id: 'rhWolf', anim: 'wiggle' },
        { l: 2, id: 'rhGirl', pose: 'nod', anim: 'nod' },
        { l: 3, id: 'rhGirl', anim: 'wiggle' },
        { l: 4, id: 'rhWolf', anim: 'wiggle' },
        { l: 4, at: 1.2, fx: 'sparkle', x: 52, y: 78 }
      ]
    },
    { // 6 花海：大野狼指著花，小紅帽離開小路去摘花；大野狼偷偷往右溜走
      bg: 'bg-flower-meadow.jpg',
      actors: [
        { id: 'rhWolf', pose: 'point', flip: true, x: 66, y: 96, h: 50 },
        { id: 'rhGirl', pose: 'tilt', x: 86, y: 97, h: 44 }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'rhWolf', anim: 'nod' },
        { l: 0, at: 1.2, fx: 'sparkle', x: 30, y: 70 },
        { l: 1, at: 1.0, id: 'rhWolf', anim: 'wiggle' },
        { l: 2, id: 'rhGirl', anim: 'hop' },
        { l: 2, at: 0.8, fx: 'hearts', id: 'rhGirl' },
        { l: 3, id: 'rhGirl', pose: 'pick', x: 30, y: 97, dur: 2.2 },
        { l: 3, at: 2.2, fx: 'sparkle', x: 36, y: 80 },
        { l: 4, at: 0.6, id: 'rhWolf', pose: 'tiptoe', flip: false },
        { l: 4, at: 1.4, id: 'rhWolf', x: 112, dur: 2.6 }
      ]
    },
    { // 7 奶奶家門口：大野狼站在石屋綠門右邊，朝左舉手敲門、捏著鼻子學小紅帽
      bg: 'bg-grandma-house.jpg',
      actors: [
        { id: 'rhWolf', pose: 'knock', x: 36, y: 88, h: 40 }
      ],
      cues: [
        { l: 0, at: 0.2, id: 'rhWolf', anim: 'wiggle' },
        { l: 0, at: 0.8, id: 'rhWolf', anim: 'wiggle' },
        { l: 2, at: 0.8, id: 'rhWolf', anim: 'nod' },
        { l: 3, id: 'rhWolf', anim: 'wiggle' },
        { l: 4, at: 1.0, id: 'rhWolf', anim: 'hop' }
      ]
    },
    { // 8 臥室：大野狼把奶奶推進左邊衣櫃（兩個一張圖、翻面朝左推），再戴上睡帽躺到床上
      bg: 'bg-grandma-room.jpg',
      actors: [
        { id: 'rhWolfGm', pose: 'push', flip: true, x: 52, y: 97, h: 52 },
        { id: 'rhWolf', pose: 'point', flip: true, x: 36, y: 97, h: 52, hidden: true }
      ],
      cues: [
        { l: 0, at: 1.0, id: 'rhWolfGm', x: 24, dur: 2.0 },
        { l: 1, id: 'rhWolfGm', hide: true },
        { l: 1, id: 'rhWolf', show: true, anim: 'hop' },
        { l: 1, at: 0.6, id: 'rhWolf', anim: 'wiggle' },
        { l: 2, id: 'rhWolf', anim: 'nod' },
        { l: 3, at: 0.4, id: 'rhWolf', pose: 'tiptoe', flip: false, x: 62, dur: 1.6 },
        { l: 3, at: 2.2, id: 'rhWolf', pose: 'bedcap', flip: true, x: 76, y: 96, h: 46 },
        { l: 4, id: 'rhWolf', anim: 'wiggle' }
      ]
    },
    { // 9 小紅帽抱著花走進臥室；床上的「奶奶」拉高被子
      bg: 'bg-grandma-room.jpg',
      actors: [
        { id: 'rhWolf', pose: 'hide', x: 74, y: 92, h: 40 },
        { id: 'rhGirl', pose: 'enter', x: 2, y: 97, h: 50 }
      ],
      cues: [
        { l: 0, at: 0.2, id: 'rhGirl', x: 34, dur: 2.6 },
        { l: 1, id: 'rhGirl', anim: 'hop' },
        { l: 2, id: 'rhWolf', anim: 'wiggle' },
        { l: 3, id: 'rhGirl', pose: 'look' },
        { l: 4, id: 'rhWolf', anim: 'nod' }
      ]
    },
    { // 10 小紅帽走近看：大耳朵、大眼睛；狼從被子露出頭眨眼
      bg: 'bg-grandma-room.jpg',
      actors: [
        { id: 'rhWolf', pose: 'blink', x: 74, y: 92, h: 40 },
        { id: 'rhGirl', pose: 'look', x: 34, y: 97, h: 50 }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'rhGirl', x: 42, dur: 1.6 },
        { l: 1, id: 'rhGirl', anim: 'nod' },
        { l: 2, id: 'rhWolf', anim: 'wiggle' },
        { l: 3, id: 'rhGirl', anim: 'nod' },
        { l: 4, id: 'rhWolf', anim: 'hop' }
      ]
    },
    { // 11 大手、大嘴巴：狼伸手咧嘴笑；小紅帽發現是大野狼，往後退
      bg: 'bg-grandma-room.jpg',
      actors: [
        { id: 'rhWolf', pose: 'blink', x: 74, y: 92, h: 40 },
        { id: 'rhGirl', pose: 'look', x: 42, y: 97, h: 50 }
      ],
      cues: [
        { l: 0, id: 'rhGirl', anim: 'nod' },
        { l: 1, id: 'rhWolf', pose: 'grin', anim: 'wiggle' },
        { l: 2, id: 'rhGirl', anim: 'nod' },
        { l: 3, id: 'rhWolf', anim: 'hop' },
        { l: 4, id: 'rhGirl', pose: 'back', x: 30, dur: 0.6, anim: 'wiggle' }
      ]
    },
    { // 12 狼跳下床搶籃子（grab 翻面朝左）；小紅帽大喊；獵人從左邊進來喝止；狼往右逃走
      bg: 'bg-grandma-room.jpg',
      actors: [
        { id: 'rhWolf', pose: 'grin', x: 74, y: 92, h: 40 },
        { id: 'rhGirl', pose: 'back', x: 30, y: 97, h: 50 },
        { id: 'rhHunter', pose: 'stop', x: 12, y: 97, h: 66, hidden: true }
      ],
      cues: [
        { l: 0, at: 0.6, id: 'rhWolf', pose: 'grab', flip: true, x: 54, y: 97, h: 52, dur: 0.8 },
        { l: 1, id: 'rhGirl', pose: 'shout', anim: 'wiggle' },
        { l: 1, at: 0.9, id: 'rhGirl', anim: 'wiggle' },
        { l: 2, at: 1.2, id: 'rhHunter', show: true, anim: 'hop' },
        { l: 3, id: 'rhHunter', anim: 'nod' },
        { l: 3, at: 1.0, id: 'rhWolf', anim: 'wiggle' },
        { l: 4, id: 'rhWolf', pose: 'flee', flip: true, anim: 'hop' },
        { l: 4, at: 0.3, fx: 'puff', x: 60, y: 60 },
        { l: 4, at: 0.3, id: 'rhWolf', x: 120, dur: 1.6 },
        { l: 4, at: 2.2, id: 'rhGirl', pose: 'take', anim: 'hop' }
      ]
    },
    { // 13 衣櫃前：獵人拉開衣櫃門（open 翻面，門疊在衣櫃上、之後一直開著），奶奶走出來，小紅帽抱住奶奶
      bg: 'bg-grandma-room.jpg',
      actors: [
        { id: 'rhHunter', pose: 'stop', x: 70, y: 97, h: 66 },
        { id: 'rhGirl', pose: 'tilt', x: 52, y: 97, h: 50 },
        { id: 'rhGrandma', pose: 'out', x: 12, y: 97, h: 52, hidden: true },
        { id: 'rhGirlGm', pose: 'hug', x: 52, y: 97, h: 52, hidden: true }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'rhGirl', anim: 'wiggle' },
        { l: 1, id: 'rhGirl', anim: 'hop' },
        { l: 1, at: 0.8, fx: 'sparkle', x: 13, y: 50 },
        { l: 2, id: 'rhHunter', x: 34, dur: 1.2 },
        { l: 2, at: 1.2, id: 'rhHunter', pose: 'open', flip: true },
        { l: 2, at: 1.8, id: 'rhGrandma', show: true, x: 17, dur: 1.0 },
        { l: 2, at: 1.6, id: 'rhGirl', x: 62, dur: 0.6 },
        { l: 3, id: 'rhGrandma', hide: true },
        { l: 3, id: 'rhGirl', hide: true },
        { l: 3, id: 'rhGirlGm', show: true, anim: 'hop' },
        { l: 3, at: 0.6, fx: 'hearts', id: 'rhGirlGm' },
        { l: 4, id: 'rhGirlGm', anim: 'nod' },
        { l: 4, at: 1.6, fx: 'hearts', id: 'rhGirlGm' }
      ]
    },
    { // 14 傍晚的小飯廳：奶奶、獵人坐在桌邊吃點心；小紅帽站在桌前豎手指學媽媽說話
      bg: 'bg-grandma-table.jpg',
      actors: [
        { id: 'rhGrandma', pose: 'eat', x: 22, y: 97, h: 50 },
        { id: 'rhHunter', pose: 'eat', x: 80, y: 97, h: 56 },
        { id: 'rhGirl', pose: 'finger', x: 50, y: 98, h: 48 }
      ],
      cues: [
        { l: 0, at: 0.6, id: 'rhGrandma', anim: 'nod' },
        { l: 0, at: 1.4, id: 'rhHunter', anim: 'hop' },
        { l: 0, at: 1.8, fx: 'hearts', x: 50, y: 40 },
        { l: 1, id: 'rhGrandma', anim: 'nod' },
        { l: 1, at: 1.6, id: 'rhHunter', anim: 'nod' },
        { l: 2, at: 0.8, id: 'rhGirl', anim: 'nod' },
        { l: 3, id: 'rhGirl', anim: 'nod' },
        { l: 4, id: 'rhGirl', pose: 'wave', anim: 'hop' },
        { l: 4, at: 1.2, fx: 'hearts', id: 'rhGirl' },
        { l: 4, at: 1.6, id: 'rhGrandma', anim: 'hop' },
        { l: 4, at: 1.8, id: 'rhHunter', anim: 'hop' }
      ]
    }
  ]
});
