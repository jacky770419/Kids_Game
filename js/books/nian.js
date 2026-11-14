/* 年獸來了：分鏡（手寫）。格式見 js/story-data.js 開頭與 addBook 的說明；文字與時間在 nian-script.js。
   年獸（nyBeast）是藍綠色毛毛的圓肚子怪獸，表情都畫得好笑不可怕；roar／eat／drool／flee 朝右（往左走要 flip）。
   阿福和小美大多畫在同一張圖（kids-*），放在 nyMei 底下（小美說話比較多，說話時那張圖會動）；
   nyMei 第一個姿勢是單人的 giggle（字幕圓框裡的臉），阿福單人只有舉燈籠那張（nyAfu）。
   好幾個村民一起的圖（逃跑、提燈籠、拜年）是 nyFolk；貼春聯、點鞭炮的叔叔是 nyUncle；炸開的鞭炮是道具 nyPop。
   校稿提醒：小孩不拿鞭炮、不點火（第 8 頁大人點、小孩站遠遠的摀耳朵）；第 1 頁年獸整隻走出來叉腰。 */
StoryData.addBook('nian', {
  color: '#F28B7D',
  cover: { bg: 'bg-nian-newyear.jpg', actor: 'nyBeast', pose: 'roar' },
  voices: {
    '年獸': { actor: 'nyBeast', color: '#3CC8BE' },
    '阿福': { actor: 'nyAfu', color: '#6FA8E8' },
    '小美': { actor: 'nyMei', color: '#F7A1C4' },
    '老爺爺': { actor: 'nyGrandpa', color: '#C8CDD6' },
    '奶奶': { actor: 'nyNainai', color: '#93C98F' }
  },
  sprites: {
    nyBeast: {
      roar: { src: 'nian-roar.png' },
      eat: { src: 'nian-eat.png' },
      drool: { src: 'nian-drool.png' },
      scared: { src: 'nian-scared.png' },
      hop: { src: 'nian-hop.png' },
      squint: { src: 'nian-squint.png' },
      flee: { src: 'nian-flee.png' },
      peek: { src: 'nian-peek.png' }
    },
    nyGrandpa: {
      smile: { src: 'grandpa-smile.png' },
      three: { src: 'grandpa-three.png' },
      cane: { src: 'grandpa-cane.png' },
      bow: { src: 'grandpa-bow.png' },
      // 老爺爺、阿福、小美擠在一起偷看（第 6 頁）
      corner: { src: 'hide-corner.png' }
    },
    nyAfu: {
      lantern: { src: 'afu-lantern.png' }
    },
    // 小美單人＋阿福小美兩人一起的圖
    nyMei: {
      giggle: { src: 'mei-giggle.png' },
      hide: { src: 'afu-mei-hide.png' },
      count: { src: 'kids-count.png' },
      fire: { src: 'kids-firecrackers.png' },
      ears: { src: 'kids-ears.png' },
      laugh: { src: 'kids-laugh.png' },
      bow: { src: 'kids-bow.png' },
      greet: { src: 'kids-greet.png' }
    },
    nyNainai: {
      lantern: { src: 'nainai-lantern.png' },
      happy: { src: 'nainai-happy.png' }
    },
    nyUncle: {
      couplet: { src: 'villager-couplet.png' },
      light: { src: 'villager-light.png' }
    },
    nyFolk: {
      flee: { src: 'villagers-flee.png' },
      lanterns: { src: 'villagers-lanterns.png' },
      greet: { src: 'villagers-greet.png' }
    },
    nyPop: { pop: { src: 'firecrackers-pop.png' } }
  },
  taps: {
    nyBeast: ['wiggle', 'hearts'],
    nyGrandpa: ['nod', 'sparkle'],
    nyMei: ['hop', 'hearts'],
    nyNainai: ['nod', 'hearts'],
    nyPop: ['wiggle', 'sparkle']
  },
  pages: [
    { // 1 傍晚山腳下的小村子；年獸從大山上整隻走下來，叉腰大吼
      bg: 'bg-nian-village.jpg',
      actors: [
        { id: 'nyBeast', pose: 'roar', x: 52, y: 30, h: 12, hidden: true }
      ],
      cues: [
        { l: 1, at: 0.4, id: 'nyBeast', show: true, anim: 'hop' },
        { l: 2, at: 0.2, id: 'nyBeast', x: 58, y: 97, h: 58, dur: 2.4 },
        { l: 3, id: 'nyBeast', anim: 'hop' },
        { l: 3, at: 1.4, id: 'nyBeast', anim: 'wiggle' }
      ]
    },
    { // 2 擺著年糕的小路：年獸邊走邊吃，地咚咚搖；村民抱著雞鴨往右逃
      bg: 'bg-nian-lane.jpg',
      actors: [
        { id: 'nyBeast', pose: 'eat', x: 24, y: 97, h: 56 },
        { id: 'nyFolk', pose: 'flee', x: 77, y: 96, h: 33, hidden: true }
      ],
      cues: [
        { l: 0, at: 0.6, id: 'nyBeast', anim: 'wiggle' },
        { l: 1, id: 'nyBeast', x: 40, dur: 2.4 },
        { l: 1, at: 0.6, id: 'nyBeast', anim: 'hop' },
        { l: 1, at: 1.6, id: 'nyBeast', anim: 'hop' },
        { l: 2, at: 0.4, id: 'nyBeast', anim: 'wiggle' },
        { l: 2, at: 1.6, id: 'nyBeast', anim: 'wiggle' },
        { l: 3, id: 'nyFolk', show: true },
        { l: 3, at: 0.2, id: 'nyFolk', x: 118, dur: 2.2 }
      ]
    },
    { // 3 白天的村子口：老爺爺從左邊走來，摸著白鬍子；阿福拉他一起躲，小美躲在阿福後面
      bg: 'bg-nian-tree.jpg',
      actors: [
        { id: 'nyGrandpa', pose: 'smile', x: -12, y: 97, h: 50 },
        { id: 'nyMei', pose: 'hide', x: 72, y: 97, h: 40, hidden: true }
      ],
      cues: [
        { l: 0, at: 0.2, id: 'nyGrandpa', x: 36, dur: 2.6 },
        { l: 1, at: 0.4, id: 'nyGrandpa', anim: 'nod' },
        { l: 2, id: 'nyMei', show: true, anim: 'hop' },
        { l: 3, id: 'nyMei', anim: 'wiggle' },
        { l: 4, id: 'nyGrandpa', anim: 'nod' },
        { l: 4, at: 1.8, id: 'nyGrandpa', anim: 'nod' }
      ]
    },
    { // 4 老爺爺伸出三根手指：紅色、響聲、火光；阿福小美跟著數
      bg: 'bg-nian-tree.jpg',
      actors: [
        { id: 'nyGrandpa', pose: 'smile', x: 34, y: 97, h: 50 },
        { id: 'nyMei', pose: 'count', x: 72, y: 97, h: 40 }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'nyGrandpa', pose: 'three', anim: 'nod' },
        { l: 0, at: 0.6, fx: 'sparkle', x: 44, y: 52 },
        { l: 1, id: 'nyMei', anim: 'nod' },
        { l: 2, id: 'nyGrandpa', anim: 'hop' },
        { l: 3, id: 'nyMei', anim: 'hop' },
        { l: 3, at: 0.6, fx: 'sparkle', x: 72, y: 48 }
      ]
    },
    { // 5 貼上紅紙的小路：叔叔貼春聯、奶奶掛燈籠、阿福小美排鞭炮（沒點火）；奶奶說真漂亮
      bg: 'bg-nian-lane-red.jpg',
      actors: [
        { id: 'nyUncle', pose: 'couplet', x: 17, y: 97, h: 48 },
        { id: 'nyNainai', pose: 'lantern', x: 48, y: 97, h: 46, hidden: true },
        { id: 'nyMei', pose: 'fire', x: 80, y: 97, h: 28, hidden: true }
      ],
      cues: [
        { l: 0, at: 2.6, id: 'nyUncle', anim: 'hop' },
        { l: 1, id: 'nyNainai', show: true, anim: 'hop' },
        { l: 2, id: 'nyMei', show: true, anim: 'hop' },
        { l: 3, id: 'nyNainai', anim: 'nod' },
        { l: 3, at: 0.6, fx: 'sparkle', x: 50, y: 30 },
        { l: 3, at: 1.2, fx: 'hearts', id: 'nyNainai' }
      ]
    },
    { // 6 天黑了，咚咚咚：年獸流著口水從右邊走向第一家；老爺爺和小孩躲在左邊偷看
      bg: 'bg-nian-lane-night.jpg',
      actors: [
        { id: 'nyGrandpa', pose: 'corner', x: 14, y: 97, h: 36 },
        { id: 'nyBeast', pose: 'drool', x: 118, y: 97, h: 58, flip: true }
      ],
      cues: [
        { l: 0, at: 1.0, id: 'nyBeast', x: 64, dur: 2.4 },
        { l: 0, at: 1.4, id: 'nyGrandpa', anim: 'wiggle' },
        { l: 1, id: 'nyBeast', anim: 'hop' },
        { l: 2, at: 1.6, id: 'nyBeast', anim: 'wiggle' },
        { l: 2, at: 1.8, id: 'nyGrandpa', anim: 'nod' }
      ]
    },
    { // 7 紅紅的大門前：年獸遮住眼睛往後退；小美在左邊指著牠偷笑
      bg: 'bg-nian-door.jpg',
      actors: [
        { id: 'nyBeast', pose: 'scared', x: 70, y: 97, h: 60 },
        { id: 'nyMei', pose: 'giggle', x: 15, y: 97, h: 40, hidden: true }
      ],
      cues: [
        { l: 0, id: 'nyBeast', anim: 'wiggle' },
        { l: 1, at: 0.8, id: 'nyBeast', x: 80, dur: 1.2 },
        { l: 1, at: 2.0, id: 'nyBeast', anim: 'wiggle' },
        { l: 2, id: 'nyMei', show: true, anim: 'hop' },
        { l: 2, at: 1.6, id: 'nyMei', anim: 'nod' }
      ]
    },
    { // 8 老爺爺舉拐杖下令；叔叔遠遠地點鞭炮，劈哩啪啦；小孩在後面摀耳朵；年獸摀耳朵跳來跳去
      bg: 'bg-nian-lane-night.jpg',
      actors: [
        { id: 'nyMei', pose: 'ears', x: 10, y: 86, h: 26 },
        { id: 'nyGrandpa', pose: 'cane', x: 26, y: 97, h: 46 },
        { id: 'nyUncle', pose: 'light', x: 52, y: 97, h: 32 },
        { id: 'nyPop', pose: 'pop', x: 41, y: 98, h: 18, hidden: true },
        { id: 'nyBeast', pose: 'drool', x: 80, y: 97, h: 56, flip: true }
      ],
      cues: [
        { l: 0, id: 'nyGrandpa', anim: 'hop' },
        { l: 1, id: 'nyPop', show: true, anim: 'wiggle' },
        { l: 1, at: 0.1, fx: 'sparkle', x: 41, y: 86 },
        { l: 1, at: 0.4, id: 'nyBeast', pose: 'hop', flip: false, anim: 'hop' },
        { l: 1, at: 0.9, id: 'nyPop', anim: 'wiggle' },
        { l: 1, at: 1.0, fx: 'sparkle', x: 37, y: 84 },
        { l: 2, id: 'nyBeast', anim: 'wiggle' },
        { l: 2, at: 0.4, id: 'nyMei', anim: 'wiggle' },
        { l: 3, id: 'nyBeast', x: 83, dur: 0.6 },
        { l: 3, at: 0.2, id: 'nyBeast', anim: 'hop' },
        { l: 3, at: 0.9, id: 'nyBeast', x: 74, dur: 0.6 },
        { l: 3, at: 1.1, id: 'nyBeast', anim: 'hop' },
        { l: 3, at: 1.8, id: 'nyBeast', x: 80, dur: 0.5 },
        { l: 3, at: 1.9, id: 'nyPop', anim: 'wiggle' }
      ]
    },
    { // 9 燈籠蠟燭全點亮：阿福舉燈籠大喊，村民提燈籠走過來；年獸瞇眼擋光
      bg: 'bg-nian-lane-lit.jpg',
      actors: [
        { id: 'nyAfu', pose: 'lantern', x: 15, y: 97, h: 40 },
        { id: 'nyFolk', pose: 'lanterns', x: 30, y: 93, h: 32, hidden: true },
        { id: 'nyBeast', pose: 'hop', x: 82, y: 97, h: 56 }
      ],
      cues: [
        { l: 0, id: 'nyAfu', anim: 'hop' },
        { l: 1, id: 'nyFolk', show: true },
        { l: 1, at: 0.2, id: 'nyFolk', x: 48, dur: 2.2 },
        { l: 2, fx: 'sparkle', x: 30, y: 50 },
        { l: 2, at: 0.5, fx: 'sparkle', x: 70, y: 48 },
        { l: 2, at: 1.0, fx: 'sparkle', x: 50, y: 60 },
        { l: 2, at: 1.4, id: 'nyBeast', pose: 'squint', anim: 'wiggle' },
        { l: 3, id: 'nyBeast', anim: 'wiggle' },
        { l: 3, at: 1.6, id: 'nyBeast', anim: 'wiggle' }
      ]
    },
    { // 10 村外往大山的小路：年獸抱著頭說都怕啦，咚咚咚跑回山裡；阿福小美叉腰大笑
      bg: 'bg-nian-mountain-road.jpg',
      actors: [
        { id: 'nyBeast', pose: 'flee', x: 46, y: 97, h: 52 },
        { id: 'nyMei', pose: 'laugh', x: 17, y: 97, h: 38, hidden: true }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'nyBeast', anim: 'wiggle' },
        { l: 1, id: 'nyBeast', anim: 'hop' },
        { l: 2, at: 0.4, id: 'nyBeast', x: 74, y: 50, h: 9, dur: 3.6 },
        { l: 2, at: 1.0, id: 'nyMei', show: true, anim: 'hop' },
        { l: 2, at: 4.0, id: 'nyBeast', hide: true },
        { l: 3, id: 'nyMei', anim: 'hop' },
        { l: 3, at: 0.4, fx: 'hearts', id: 'nyMei' }
      ]
    },
    { // 11 第二天早上：大家走出家門互相拜年；奶奶摸摸頭、老爺爺回禮、阿福小美拱手
      bg: 'bg-nian-morning.jpg',
      actors: [
        { id: 'nyNainai', pose: 'happy', x: 15, y: 97, h: 44, hidden: true },
        { id: 'nyGrandpa', pose: 'bow', x: 34, y: 97, h: 48, hidden: true },
        { id: 'nyMei', pose: 'bow', x: 58, y: 97, h: 36, hidden: true },
        { id: 'nyFolk', pose: 'greet', x: 85, y: 92, h: 36, hidden: true }
      ],
      cues: [
        { l: 0, at: 1.2, fx: 'sparkle', x: 68, y: 14 },
        { l: 1, id: 'nyMei', show: true, anim: 'hop' },
        { l: 1, at: 0.6, id: 'nyGrandpa', show: true, anim: 'hop' },
        { l: 1, at: 1.2, id: 'nyNainai', show: true, anim: 'hop' },
        { l: 1, at: 1.8, id: 'nyFolk', show: true, anim: 'hop' },
        { l: 2, id: 'nyMei', anim: 'nod' },
        { l: 2, at: 1.0, id: 'nyGrandpa', anim: 'nod' },
        { l: 3, id: 'nyNainai', anim: 'nod' },
        { l: 3, at: 0.4, fx: 'hearts', x: 36, y: 40 }
      ]
    },
    { // 12 熱熱鬧鬧過新年，天上有煙火；阿福小美對著看的人拜年；遠遠的山頂後年獸偷偷探頭
      bg: 'bg-nian-newyear.jpg',
      actors: [
        { id: 'nyMei', pose: 'greet', x: 50, y: 97, h: 44 },
        { id: 'nyBeast', pose: 'peek', x: 26, y: 28, h: 8, hidden: true }
      ],
      cues: [
        { l: 0, at: 0.4, fx: 'sparkle', x: 38, y: 20 },
        { l: 0, at: 1.6, fx: 'sparkle', x: 62, y: 22 },
        { l: 0, at: 2.8, fx: 'sparkle', x: 50, y: 16 },
        { l: 1, at: 0.4, id: 'nyBeast', show: true },
        { l: 1, at: 1.4, id: 'nyBeast', anim: 'nod' },
        { l: 2, id: 'nyMei', anim: 'nod' },
        { l: 3, id: 'nyMei', anim: 'hop' },
        { l: 3, at: 0.3, fx: 'hearts', id: 'nyMei' },
        { l: 3, at: 0.5, fx: 'sparkle', x: 50, y: 18 }
      ]
    }
  ]
});
