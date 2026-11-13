/* 灰姑娘：分鏡（手寫）。格式見 js/story-data.js 開頭與 addBook 的說明；文字與時間在 cinderella-script.js。
   圖裡的灰姑娘叫艾拉（ella-*）：破衣服（sweep／broom／wave／cry／surprise／carry／clap／palm／sit／kind）
   跟舞會禮服（joy／walk／dance／run）是不同的圖，第 10 頁換裝、第 16 頁變回來。
   方向：ella-run 朝右跑（往左跑要 flip）、ella-walk／dance 朝右；王子 bow／reach／kneel 朝左；
   仙女、繼母倒茶、送信人、馬、馬車都朝右。小老鼠變車夫用同一個角色換姿勢，所以車夫那幾頁 h 要放大。 */
StoryData.addBook('cinderella', {
  color: '#9CC9F0',
  cover: { bg: 'bg-ballroom.jpg', actor: 'cdElla', pose: 'dance' },
  voices: {
    '灰姑娘': { actor: 'cdElla', color: '#9CC9F0' },
    '小老鼠': { actor: 'cdMouse', color: '#CFCFDB' },
    '繼母': { actor: 'cdStep', color: '#C3A6DD' },
    '大姊': { actor: 'cdBig', color: '#F7A8A0' },
    '二姊': { actor: 'cdSmall', color: '#9FB6F2' },
    '仙女': { actor: 'cdFairy', color: '#F9C8DC' },
    '王子': { actor: 'cdPrince', color: '#F3D98A' }
  },
  sprites: {
    cdElla: {
      sweep: { src: 'ella-sweep.png', k: 0.78 },
      broom: { src: 'ella-broom.png' },
      wave: { src: 'ella-wave.png' },
      cry: { src: 'ella-cry.png', k: 0.82 },
      surprise: { src: 'ella-surprise.png' },
      carry: { src: 'ella-carry.png' },
      clap: { src: 'ella-clap.png' },
      palm: { src: 'ella-palm.png' },
      sit: { src: 'ella-sit-shoe.png', k: 0.84 },
      kind: { src: 'ella-kind.png' },
      joy: { src: 'ella-joy.png' },
      walk: { src: 'ella-walk.png' },
      dance: { src: 'ella-dance.png' },
      run: { src: 'ella-run.png' }
    },
    // 小老鼠和變成的車夫：同一個角色，車夫的頁 h 放大
    cdMouse: {
      wave: { src: 'mouse-wave.png' },
      peek: { src: 'mouse-peek.png' },
      eat: { src: 'mouse-eat.png' },
      coach: { src: 'mouse-coachman.png' }
    },
    cdMice: { run: { src: 'mice-friends.png' } },
    cdHorse: { stand: { src: 'horse.png' } },
    cdHorse2: { stand: { src: 'horse.png' } },
    cdHorse3: { stand: { src: 'horse.png' } },
    cdHorse4: { stand: { src: 'horse.png' } },
    cdStep: {
      point: { src: 'step-point.png' },
      letter: { src: 'step-letter.png' },
      gasp: { src: 'step-gasp.png' },
      tea: { src: 'step-tea.png' }
    },
    cdBig: {
      mirror: { src: 'big-mirror.png', k: 0.86 },
      foot: { src: 'big-foot.png', k: 0.86 },
      squeeze: { src: 'big-squeeze.png', k: 0.86 }
    },
    cdSmall: {
      dress: { src: 'small-dress.png' },
      necklace: { src: 'small-necklace.png' },
      foot: { src: 'small-foot.png' }
    },
    // 兩個姊姊、一家三口合在同一張圖
    cdSisters: {
      jump: { src: 'sisters-jump.png' },
      gasp: { src: 'sisters-gasp.png' },
      wave: { src: 'sisters-wave.png' }
    },
    cdFamily: { sorry: { src: 'family-sorry.png' } },
    cdFairy: {
      appear: { src: 'fairy-appear.png' },
      cast: { src: 'fairy-cast.png' },
      finger: { src: 'fairy-finger.png' }
    },
    cdPrince: {
      bow: { src: 'prince-bow.png' },
      reach: { src: 'prince-reach.png' },
      slipper: { src: 'prince-slipper.png' },
      kneel: { src: 'prince-kneel.png', k: 0.74 },
      happy: { src: 'prince-happy.png' }
    },
    cdMessenger: { give: { src: 'messenger.png' } },
    cdCarriage: { go: { src: 'carriage-family.png' } },
    cdPumpkin: { big: { src: 'pumpkin.png' } },
    cdCoach: { gold: { src: 'coach.png' } },
    cdSlipper: { shoe: { src: 'slipper.png' } }
  },
  taps: {
    cdElla: ['spin', 'sparkle'],
    cdFairy: ['spin', 'sparkle'],
    cdPumpkin: ['wiggle', 'sparkle'],
    cdCoach: ['wiggle', 'sparkle'],
    cdSlipper: ['hop', 'sparkle'],
    cdMice: ['hop', 'hearts']
  },
  pages: [
    { // 1 早上的廚房：灰姑娘蹲在火爐邊掃灰，小老鼠從洞口探頭打招呼
      bg: 'bg-kitchen-day.jpg',
      actors: [
        { id: 'cdElla', pose: 'sweep', x: 40, y: 95, h: 44 },
        { id: 'cdMouse', pose: 'peek', x: 88, y: 71, h: 12, flip: true }
      ],
      cues: [
        { l: 0, at: 1.6, id: 'cdElla', anim: 'nod' },
        { l: 1, at: 0.8, id: 'cdElla', anim: 'wiggle' },
        { l: 1, at: 2.4, fx: 'puff', x: 50, y: 82 },
        { l: 2, at: 1.4, id: 'cdElla', anim: 'hop' },
        { l: 3, id: 'cdMouse', pose: 'wave', anim: 'hop' },
        { l: 3, at: 0.8, id: 'cdMouse', x: 70, y: 93, h: 15, dur: 1.2 },
        { l: 4, id: 'cdElla', pose: 'wave', anim: 'hop' },
        { l: 4, at: 1.2, fx: 'hearts', x: 56, y: 50 }
      ]
    },
    { // 2 客廳：繼母、大姊、二姊一個一個叫，灰姑娘跑來跑去
      bg: 'bg-parlor.jpg',
      actors: [
        { id: 'cdStep', pose: 'point', x: 16, y: 95, h: 52 },
        { id: 'cdElla', pose: 'broom', x: 40, y: 96, h: 46 },
        { id: 'cdBig', pose: 'mirror', x: 62, y: 93, h: 44 },
        { id: 'cdSmall', pose: 'dress', x: 85, y: 95, h: 44 }
      ],
      cues: [
        { l: 0, id: 'cdStep', anim: 'wiggle' },
        { l: 1, id: 'cdBig', anim: 'wiggle' },
        { l: 2, id: 'cdSmall', anim: 'wiggle' },
        { l: 2, at: 1.6, id: 'cdSmall', anim: 'hop' },
        { l: 3, id: 'cdElla', anim: 'hop' },
        { l: 4, id: 'cdElla', x: 28, dur: 0.8 },
        { l: 4, at: 1.0, id: 'cdElla', x: 50, dur: 0.9 },
        { l: 4, at: 2.0, id: 'cdElla', x: 72, dur: 0.9 },
        { l: 4, at: 3.1, id: 'cdElla', x: 40, dur: 0.9 },
        { l: 4, at: 4.0, id: 'cdElla', anim: 'wiggle' }
      ]
    },
    { // 3 大門口：送信人送來金色的信，姊姊們跳起來，灰姑娘在後面好想去
      bg: 'bg-house-front.jpg',
      actors: [
        { id: 'cdMessenger', pose: 'give', x: -12, y: 96, h: 46 },
        { id: 'cdStep', pose: 'letter', x: 36, y: 96, h: 50 },
        { id: 'cdSisters', pose: 'jump', x: 62, y: 95, h: 40 },
        { id: 'cdElla', pose: 'broom', x: 87, y: 88, h: 38 }
      ],
      cues: [
        { id: 'cdMessenger', x: 16, dur: 2 },
        { l: 0, at: 2.2, id: 'cdMessenger', anim: 'nod' },
        { l: 0, at: 2.4, fx: 'sparkle', x: 36, y: 66 },
        { l: 1, id: 'cdStep', anim: 'hop' },
        { l: 1, at: 0.4, id: 'cdMessenger', flip: true, x: -14, dur: 2.2 },
        { l: 2, id: 'cdSisters', anim: 'hop' },
        { l: 2, at: 1.2, fx: 'hearts', id: 'cdSisters' },
        { l: 3, id: 'cdSisters', anim: 'hop' },
        { l: 4, id: 'cdElla', pose: 'surprise', x: 84, y: 91, h: 40, dur: 0.8 },
        { l: 4, at: 1.8, id: 'cdElla', anim: 'nod' }
      ]
    },
    { // 4 傍晚的客廳：繼母說沒有裙子、碗還沒洗；灰姑娘幫姊姊穿鞋、戴項鍊
      bg: 'bg-parlor.jpg',
      tint: 'sunset',
      actors: [
        { id: 'cdStep', pose: 'point', x: 12, y: 95, h: 52 },
        { id: 'cdBig', pose: 'foot', x: 34, y: 94, h: 44 },
        { id: 'cdElla', pose: 'surprise', x: 56, y: 96, h: 46 },
        { id: 'cdSmall', pose: 'necklace', x: 84, y: 95, h: 44 }
      ],
      cues: [
        { l: 0, id: 'cdStep', anim: 'nod' },
        { l: 1, id: 'cdStep', anim: 'wiggle' },
        { l: 1, at: 1.4, id: 'cdElla', anim: 'nod' },
        { l: 2, id: 'cdBig', anim: 'wiggle' },
        { l: 2, at: 0.8, id: 'cdElla', pose: 'kind', flip: true, x: 52, dur: 0.6 },
        { l: 3, id: 'cdSmall', anim: 'hop' },
        { l: 3, at: 0.8, id: 'cdElla', flip: false, x: 64, dur: 0.8 },
        { l: 4, id: 'cdElla', pose: 'clap', x: 56, dur: 0.6 },
        { l: 4, at: 0.8, fx: 'sparkle', id: 'cdBig' },
        { l: 4, at: 1.6, fx: 'sparkle', id: 'cdSmall' },
        { l: 4, at: 2.4, id: 'cdElla', anim: 'hop' }
      ]
    },
    { // 5 天黑了：家人坐馬車往右走遠，灰姑娘一個人在門口揮手
      bg: 'bg-house-front-night.jpg',
      actors: [
        { id: 'cdElla', pose: 'wave', x: 24, y: 94, h: 42 },
        { id: 'cdCarriage', pose: 'go', x: 62, y: 95, h: 34 }
      ],
      cues: [
        { l: 0, id: 'cdCarriage', anim: 'wiggle' },
        { l: 1, id: 'cdCarriage', anim: 'hop' },
        { l: 2, id: 'cdCarriage', anim: 'wiggle' },
        { l: 3, id: 'cdCarriage', x: 76, y: 80, h: 18, dur: 3 },
        { l: 3, at: 1.6, id: 'cdElla', anim: 'nod' },
        { l: 4, id: 'cdCarriage', x: 92, y: 70, h: 8, dur: 3.2 },
        { l: 4, at: 3.0, id: 'cdCarriage', hide: true }
      ]
    },
    { // 6 晚上的廚房：灰姑娘坐在火爐邊哭，小老鼠在她手上拍拍她
      bg: 'bg-kitchen-night.jpg',
      actors: [
        { id: 'cdElla', pose: 'cry', x: 42, y: 96, h: 54 }
      ],
      cues: [
        { l: 0, at: 1.4, id: 'cdElla', anim: 'nod' },
        { l: 2, at: 0.4, fx: 'spout', x: 41, y: 60 },
        { l: 2, at: 1.6, fx: 'spout', x: 41, y: 60 },
        { l: 3, id: 'cdElla', anim: 'nod' },
        { l: 3, at: 1.0, fx: 'hearts', x: 54, y: 50 },
        { l: 4, at: 1.8, id: 'cdElla', anim: 'nod' }
      ]
    },
    { // 7 金色的光：仙女出現，灰姑娘站起來，小老鼠躲在腳邊偷看
      bg: 'bg-kitchen-night.jpg',
      actors: [
        { id: 'cdElla', pose: 'cry', x: 62, y: 95, h: 46 },
        { id: 'cdFairy', pose: 'appear', x: 28, y: 95, h: 48, hidden: true },
        { id: 'cdMouse', pose: 'peek', x: 80, y: 96, h: 13, hidden: true, flip: true }
      ],
      cues: [
        { l: 0, at: 0.8, fx: 'sparkle', x: 30, y: 40 },
        { l: 0, at: 1.3, fx: 'sparkle', x: 50, y: 30 },
        { l: 0, at: 1.8, fx: 'sparkle', x: 70, y: 42 },
        { l: 0, at: 2.2, id: 'cdFairy', show: true, anim: 'spin' },
        { l: 0, at: 2.4, fx: 'sparkle', id: 'cdFairy' },
        { l: 1, id: 'cdElla', pose: 'surprise', anim: 'hop' },
        { l: 1, id: 'cdMouse', show: true },
        { l: 1, at: 0.4, id: 'cdFairy', anim: 'nod' },
        { l: 2, id: 'cdFairy', anim: 'nod' },
        { l: 2, at: 1.6, fx: 'hearts', id: 'cdElla' },
        { l: 3, id: 'cdFairy', pose: 'cast', anim: 'hop' },
        { l: 3, at: 0.4, fx: 'sparkle', x: 46, y: 40 },
        { l: 4, id: 'cdElla', anim: 'hop' },
        { l: 4, at: 0.8, id: 'cdMouse', anim: 'hop' }
      ]
    },
    { // 8 月光下的菜園：灰姑娘抱來大南瓜，仙女一揮，變成金色馬車
      bg: 'bg-garden-night.jpg',
      actors: [
        { id: 'cdFairy', pose: 'appear', x: 18, y: 95, h: 46 },
        { id: 'cdElla', pose: 'carry', x: 110, y: 95, h: 44, flip: true },
        { id: 'cdPumpkin', pose: 'big', x: 50, y: 92, h: 20, hidden: true, loop: 'still' },
        { id: 'cdCoach', pose: 'gold', x: 52, y: 94, h: 46, hidden: true, loop: 'still' }
      ],
      cues: [
        { l: 0, id: 'cdFairy', anim: 'nod' },
        { l: 1, id: 'cdElla', x: 58, dur: 2.4 },
        { l: 1, at: 2.6, id: 'cdPumpkin', show: true },
        { l: 1, at: 2.6, id: 'cdElla', pose: 'clap', flip: false, x: 82, dur: 0.8 },
        { l: 2, id: 'cdFairy', anim: 'nod' },
        { l: 2, at: 1.4, id: 'cdFairy', pose: 'cast', anim: 'wiggle' },
        { l: 3, id: 'cdPumpkin', anim: 'wiggle' },
        { l: 3, at: 0.2, fx: 'sparkle', x: 44, y: 76 },
        { l: 3, at: 0.9, fx: 'sparkle', x: 56, y: 72 },
        { l: 3, at: 1.6, id: 'cdPumpkin', anim: 'spin' },
        { l: 3, at: 1.6, fx: 'sparkle', x: 50, y: 80 },
        { l: 4, id: 'cdPumpkin', hide: true },
        { l: 4, id: 'cdCoach', show: true, anim: 'hop' },
        { l: 4, at: 0.2, fx: 'sparkle', id: 'cdCoach' },
        { l: 4, at: 0.6, id: 'cdElla', pose: 'surprise', anim: 'hop' }
      ]
    },
    { // 9 老鼠朋友變四匹白馬，小老鼠變車夫，灰姑娘拍手笑
      bg: 'bg-garden-night.jpg',
      actors: [
        { id: 'cdFairy', pose: 'cast', x: 12, y: 96, h: 42 },
        { id: 'cdCoach', pose: 'gold', x: 30, y: 84, h: 36, loop: 'still' },
        { id: 'cdHorse3', pose: 'stand', x: 49, y: 83, h: 17, hidden: true },
        { id: 'cdHorse4', pose: 'stand', x: 63, y: 83, h: 17, hidden: true },
        { id: 'cdHorse', pose: 'stand', x: 55, y: 90, h: 20, hidden: true },
        { id: 'cdHorse2', pose: 'stand', x: 70, y: 90, h: 20, hidden: true },
        { id: 'cdMice', pose: 'run', x: 60, y: 94, h: 11 },
        { id: 'cdMouse', pose: 'wave', x: 80, y: 95, h: 13 },
        { id: 'cdElla', pose: 'surprise', x: 92, y: 96, h: 42 }
      ],
      cues: [
        { l: 0, id: 'cdMouse', anim: 'hop' },
        { l: 0, at: 0.8, id: 'cdMice', anim: 'hop' },
        { l: 1, id: 'cdFairy', anim: 'wiggle' },
        { l: 1, at: 0.6, fx: 'sparkle', x: 58, y: 84 },
        { l: 1, at: 1.2, fx: 'sparkle', x: 78, y: 82 },
        { l: 2, id: 'cdMice', hide: true },
        { l: 2, id: 'cdHorse', show: true, anim: 'hop' },
        { l: 2, at: 0.3, id: 'cdHorse2', show: true, anim: 'hop' },
        { l: 2, at: 0.6, id: 'cdHorse3', show: true, anim: 'hop' },
        { l: 2, at: 0.9, id: 'cdHorse4', show: true, anim: 'hop' },
        { l: 2, at: 1.0, fx: 'sparkle', x: 60, y: 70 },
        { l: 3, fx: 'sparkle', x: 80, y: 84 },
        { l: 3, at: 0.2, id: 'cdMouse', pose: 'coach', h: 30, dur: 0.4, anim: 'hop' },
        { l: 4, id: 'cdElla', pose: 'clap', anim: 'hop' },
        { l: 4, at: 1.0, fx: 'hearts', id: 'cdMouse' }
      ]
    },
    { // 10 換裝：舊衣服變成藍禮服、玻璃鞋
      bg: 'bg-garden-night.jpg',
      actors: [
        { id: 'cdCoach', pose: 'gold', x: 72, y: 75, h: 24, loop: 'still' },
        { id: 'cdHorse', pose: 'stand', x: 86, y: 75, h: 13 },
        { id: 'cdHorse2', pose: 'stand', x: 94, y: 76, h: 13 },
        { id: 'cdFairy', pose: 'appear', x: 24, y: 96, h: 46 },
        { id: 'cdElla', pose: 'surprise', x: 52, y: 97, h: 48 }
      ],
      cues: [
        { l: 0, id: 'cdFairy', anim: 'nod' },
        { l: 1, id: 'cdFairy', pose: 'cast', anim: 'wiggle' },
        { l: 1, at: 0.8, fx: 'sparkle', x: 52, y: 70 },
        { l: 1, at: 1.4, id: 'cdElla', anim: 'spin' },
        { l: 1, at: 1.6, fx: 'sparkle', x: 52, y: 55 },
        { l: 1, at: 1.9, id: 'cdElla', pose: 'joy' },
        { l: 2, at: 1.6, fx: 'sparkle', id: 'cdElla' },
        { l: 3, at: 0.6, fx: 'sparkle', x: 52, y: 92 },
        { l: 4, id: 'cdElla', anim: 'hop' },
        { l: 4, at: 1.4, fx: 'hearts', id: 'cdElla' },
        { l: 4, at: 2.0, id: 'cdFairy', pose: 'appear', anim: 'nod' }
      ]
    },
    { // 11 門口：仙女叮嚀十二點；灰姑娘點頭上車，車夫小老鼠揮手
      bg: 'bg-house-front-night.jpg',
      actors: [
        { id: 'cdFairy', pose: 'finger', x: 14, y: 96, h: 46 },
        { id: 'cdElla', pose: 'walk', x: 34, y: 96, h: 46 },
        { id: 'cdCoach', pose: 'gold', x: 60, y: 90, h: 38, loop: 'still' },
        { id: 'cdHorse', pose: 'stand', x: 84, y: 84, h: 20 },
        { id: 'cdHorse2', pose: 'stand', x: 92, y: 89, h: 22 },
        { id: 'cdMouse', pose: 'coach', x: 76, y: 97, h: 28 }
      ],
      cues: [
        { l: 0, id: 'cdFairy', anim: 'nod' },
        { l: 1, id: 'cdFairy', anim: 'wiggle' },
        { l: 1, at: 2.0, fx: 'notes', x: 22, y: 40 },
        { l: 1, at: 2.6, fx: 'notes', x: 22, y: 40 },
        { l: 1, at: 3.2, fx: 'notes', x: 22, y: 40 },
        { l: 2, id: 'cdFairy', anim: 'nod' },
        { l: 3, id: 'cdElla', anim: 'nod' },
        { l: 3, at: 1.6, id: 'cdElla', anim: 'hop' },
        { l: 4, id: 'cdMouse', anim: 'hop' },
        { l: 4, at: 0.6, id: 'cdElla', x: 50, y: 94, dur: 1.4 },
        { l: 4, at: 1.6, fx: 'sparkle', id: 'cdCoach' }
      ]
    },
    { // 12 王宮大廳：灰姑娘走進來，姊姊們看呆了、沒認出她
      bg: 'bg-ballroom.jpg',
      actors: [
        { id: 'cdElla', pose: 'walk', x: -10, y: 95, h: 48 },
        { id: 'cdSisters', pose: 'gasp', x: 78, y: 95, h: 42 }
      ],
      cues: [
        { l: 0, at: 0.6, id: 'cdElla', x: 36, dur: 3.4 },
        { l: 1, at: 0.4, fx: 'sparkle', x: 40, y: 22 },
        { l: 1, at: 1.4, fx: 'sparkle', x: 18, y: 48 },
        { l: 1, at: 2.4, fx: 'sparkle', x: 82, y: 48 },
        { l: 2, id: 'cdSisters', anim: 'wiggle' },
        { l: 3, id: 'cdSisters', anim: 'hop' },
        { l: 3, at: 1.4, fx: 'sparkle', id: 'cdElla' },
        { l: 4, id: 'cdElla', anim: 'nod' },
        { l: 4, at: 1.6, id: 'cdSisters', anim: 'wiggle' }
      ]
    },
    { // 13 王子走過來邀舞，兩個人跳呀跳
      bg: 'bg-ballroom.jpg',
      actors: [
        { id: 'cdElla', pose: 'walk', x: 34, y: 95, h: 48 },
        { id: 'cdPrince', pose: 'happy', x: 110, y: 95, h: 52 }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'cdPrince', x: 64, dur: 2.4 },
        { l: 0, at: 2.8, id: 'cdPrince', pose: 'bow' },
        { l: 1, id: 'cdPrince', anim: 'nod' },
        { l: 2, id: 'cdElla', pose: 'dance', anim: 'hop' },
        { l: 2, at: 1.0, fx: 'hearts', x: 50, y: 40 },
        { l: 3, id: 'cdPrince', pose: 'happy' },
        { l: 3, id: 'cdElla', anim: 'spin' },
        { l: 3, id: 'cdElla', loop: 'sway' },
        { l: 3, id: 'cdPrince', loop: 'sway' },
        { l: 3, at: 0.6, fx: 'notes', x: 50, y: 38 },
        { l: 3, at: 1.2, id: 'cdElla', x: 44, dur: 1.2 },
        { l: 3, at: 1.2, id: 'cdPrince', x: 58, dur: 1.2 },
        { l: 3, at: 2.6, id: 'cdElla', anim: 'spin' },
        { l: 3, at: 2.8, id: 'cdElla', x: 36, dur: 1.2 },
        { l: 3, at: 2.8, id: 'cdPrince', x: 50, dur: 1.2 },
        { l: 3, at: 3.4, fx: 'notes', x: 44, y: 38 },
        { l: 4, id: 'cdElla', x: 42, dur: 1 },
        { l: 4, id: 'cdPrince', x: 58, dur: 1 },
        { l: 4, at: 0.8, id: 'cdElla', anim: 'spin' },
        { l: 4, at: 1.2, fx: 'hearts', x: 50, y: 40 }
      ]
    },
    { // 14 大鐘響了：灰姑娘嚇一跳往左跑，王子伸手想留住她
      bg: 'bg-ballroom.jpg',
      actors: [
        { id: 'cdElla', pose: 'dance', x: 42, y: 95, h: 48, loop: 'sway' },
        { id: 'cdPrince', pose: 'happy', x: 58, y: 95, h: 52, loop: 'sway' }
      ],
      cues: [
        { l: 0, at: 1.6, fx: 'notes', x: 76, y: 30 },
        { l: 1, id: 'cdElla', loop: 'none' },
        { l: 1, id: 'cdPrince', loop: 'none' },
        { l: 1, at: 0.1, fx: 'notes', x: 76, y: 30 },
        { l: 1, at: 0.5, fx: 'notes', x: 76, y: 30 },
        { l: 1, at: 0.9, fx: 'notes', x: 76, y: 30 },
        { l: 1, at: 1.4, fx: 'notes', x: 76, y: 30 },
        { l: 1, at: 1.8, fx: 'notes', x: 76, y: 30 },
        { l: 1, at: 2.2, fx: 'notes', x: 76, y: 30 },
        { l: 2, id: 'cdElla', pose: 'run', flip: true, anim: 'hop' },
        { l: 2, at: 0.6, id: 'cdElla', x: 34, dur: 0.8 },
        { l: 3, id: 'cdPrince', pose: 'reach', anim: 'wiggle' },
        { l: 4, at: 0.6, id: 'cdElla', x: -14, dur: 1.6 }
      ]
    },
    { // 15 王宮樓梯：灰姑娘跑下樓、掉了一隻玻璃鞋；王子撿起來
      bg: 'bg-palace-stairs.jpg',
      actors: [
        { id: 'cdElla', pose: 'run', x: 72, y: 40, h: 24, flip: true },
        { id: 'cdSlipper', pose: 'shoe', x: 58, y: 46, h: 6, hidden: true, loop: 'still' },
        { id: 'cdPrince', pose: 'reach', x: 76, y: 35, h: 21, hidden: true }
      ],
      cues: [
        { id: 'cdElla', x: 60, y: 46, h: 28, dur: 2.4 },
        { l: 1, id: 'cdSlipper', show: true, anim: 'hop' },
        { l: 1, at: 0.4, fx: 'sparkle', id: 'cdSlipper' },
        { l: 1, at: 0.2, id: 'cdElla', x: 34, y: 80, h: 40, dur: 2.2 },
        { l: 1, at: 1.4, id: 'cdPrince', show: true },
        { l: 2, id: 'cdElla', x: -14, y: 96, h: 46, dur: 2.4 },
        { l: 3, id: 'cdPrince', pose: 'slipper', x: 63, y: 48, h: 26, dur: 1.6 },
        { l: 3, at: 1.6, id: 'cdSlipper', hide: true },
        { l: 3, at: 1.8, fx: 'sparkle', id: 'cdPrince' },
        { l: 4, id: 'cdPrince', anim: 'nod' },
        { l: 4, at: 1.4, id: 'cdPrince', anim: 'hop' }
      ]
    },
    { // 16 半夜的小路：馬車變回南瓜、白馬變回老鼠、禮服變回舊衣服；剩一隻玻璃鞋
      bg: 'bg-road-night.jpg',
      actors: [
        { id: 'cdElla', pose: 'run', x: 30, y: 95, h: 46, flip: true },
        { id: 'cdCoach', pose: 'gold', x: 62, y: 94, h: 40, loop: 'still' },
        { id: 'cdPumpkin', pose: 'big', x: 62, y: 94, h: 20, hidden: true, loop: 'still' },
        { id: 'cdHorse', pose: 'stand', x: 86, y: 92, h: 24 },
        { id: 'cdMice', pose: 'run', x: 84, y: 95, h: 9, hidden: true },
        { id: 'cdMouse', pose: 'wave', x: 46, y: 96, h: 13, hidden: true }
      ],
      cues: [
        { l: 0, at: 0.6, fx: 'notes', x: 50, y: 30 },
        { l: 1, id: 'cdCoach', hide: true },
        { l: 1, id: 'cdPumpkin', show: true, anim: 'hop' },
        { l: 1, at: 0.1, fx: 'puff', x: 56, y: 80 },
        { l: 1, at: 1.8, id: 'cdHorse', hide: true },
        { l: 1, at: 1.8, id: 'cdMice', show: true, anim: 'hop' },
        { l: 1, at: 1.9, fx: 'puff', x: 80, y: 84 },
        { l: 1, at: 2.4, id: 'cdMice', x: 76, dur: 1 },
        { l: 2, id: 'cdElla', pose: 'surprise', flip: false, anim: 'spin' },
        { l: 2, at: 0.1, fx: 'puff', x: 24, y: 70 },
        { l: 2, at: 0.6, id: 'cdMouse', show: true, anim: 'hop' },
        { l: 2, at: 1.4, id: 'cdMice', x: 86, dur: 1 },
        { l: 3, id: 'cdMouse', hide: true },
        { l: 3, id: 'cdElla', pose: 'palm', anim: 'hop' },
        { l: 3, at: 1.4, fx: 'sparkle', x: 27, y: 92 },
        { l: 4, id: 'cdElla', anim: 'wiggle' },
        { l: 4, at: 0.4, fx: 'hearts', id: 'cdElla' }
      ]
    },
    { // 17 第二天：王子帶著玻璃鞋來試；大姊、二姊都擠不進去
      bg: 'bg-parlor.jpg',
      actors: [
        { id: 'cdBig', pose: 'mirror', x: 40, y: 94, h: 44 },
        { id: 'cdSmall', pose: 'foot', x: 44, y: 96, h: 44, hidden: true },
        { id: 'cdStep', pose: 'point', x: 90, y: 92, h: 48 },
        { id: 'cdPrince', pose: 'slipper', x: 110, y: 95, h: 52 }
      ],
      cues: [
        { l: 0, at: 1.0, id: 'cdPrince', x: 64, dur: 2.4 },
        { l: 1, id: 'cdPrince', anim: 'nod' },
        { l: 1, at: 0.6, fx: 'sparkle', id: 'cdPrince' },
        { l: 2, id: 'cdPrince', pose: 'kneel' },
        { l: 2, id: 'cdBig', pose: 'squeeze', anim: 'hop' },
        { l: 2, at: 2.4, id: 'cdBig', anim: 'wiggle' },
        { l: 2, at: 3.2, id: 'cdBig', anim: 'wiggle' },
        { l: 3, id: 'cdBig', pose: 'mirror', x: 16, dur: 0.6 },
        { l: 3, at: 0.3, id: 'cdSmall', show: true, anim: 'hop' },
        { l: 3, at: 2.4, id: 'cdSmall', anim: 'wiggle' },
        { l: 3, at: 3.2, id: 'cdSmall', anim: 'wiggle' },
        { l: 4, id: 'cdPrince', pose: 'slipper', anim: 'nod' },
        { l: 4, at: 0.6, id: 'cdStep', anim: 'wiggle' }
      ]
    },
    { // 18 灰姑娘來試：剛剛好！又拿出另一隻；王子好開心，繼母和姊姊們嚇呆了
      bg: 'bg-parlor.jpg',
      actors: [
        { id: 'cdStep', pose: 'point', x: 10, y: 95, h: 50 },
        { id: 'cdSisters', pose: 'gasp', x: 27, y: 96, h: 38 },
        { id: 'cdPrince', pose: 'kneel', x: 74, y: 93, h: 52 },
        { id: 'cdElla', pose: 'surprise', x: 92, y: 96, h: 48 }
      ],
      cues: [
        { l: 0, id: 'cdElla', anim: 'nod' },
        { l: 0, at: 1.4, id: 'cdElla', x: 52, dur: 1.2 },
        { l: 1, id: 'cdPrince', pose: 'bow' },
        { l: 1, at: 0.4, id: 'cdElla', pose: 'sit' },
        { l: 2, fx: 'sparkle', x: 60, y: 86 },
        { l: 2, at: 0.3, id: 'cdStep', pose: 'gasp', anim: 'hop' },
        { l: 2, at: 0.5, id: 'cdSisters', anim: 'hop' },
        { l: 3, id: 'cdElla', anim: 'nod' },
        { l: 3, at: 1.4, fx: 'sparkle', x: 54, y: 72 },
        { l: 4, id: 'cdPrince', pose: 'happy', anim: 'hop' },
        { l: 4, at: 0.8, fx: 'hearts', x: 64, y: 44 },
        { l: 4, at: 1.2, id: 'cdSisters', anim: 'wiggle' }
      ]
    },
    { // 19 道歉、和好：大家手牽手笑起來
      bg: 'bg-parlor.jpg',
      actors: [
        { id: 'cdFamily', pose: 'sorry', x: 26, y: 96, h: 50 },
        { id: 'cdElla', pose: 'kind', x: 62, y: 96, h: 46, flip: true },
        { id: 'cdPrince', pose: 'happy', x: 86, y: 95, h: 52 },
        { id: 'cdMouse', pose: 'wave', x: 45, y: 46, h: 10 }
      ],
      cues: [
        { l: 0, id: 'cdFamily', anim: 'nod' },
        { l: 1, id: 'cdFamily', anim: 'nod' },
        { l: 2, id: 'cdFamily', anim: 'nod' },
        { l: 3, id: 'cdElla', anim: 'nod' },
        { l: 3, at: 0.8, id: 'cdElla', x: 54, dur: 0.8 },
        { l: 3, at: 1.6, fx: 'hearts', x: 44, y: 44 },
        { l: 4, id: 'cdFamily', anim: 'hop' },
        { l: 4, at: 0.2, id: 'cdElla', anim: 'hop' },
        { l: 4, at: 0.4, id: 'cdPrince', anim: 'hop' },
        { l: 4, at: 0.6, id: 'cdMouse', anim: 'hop' },
        { l: 4, at: 1.0, fx: 'hearts', x: 50, y: 40 }
      ]
    },
    { // 20 王宮花園：灰姑娘和王子走過來；姊姊們招手，繼母倒茶，老鼠們啃餅乾
      bg: 'bg-palace-garden.jpg',
      actors: [
        { id: 'cdSisters', pose: 'wave', x: 22, y: 95, h: 36 },
        { id: 'cdStep', pose: 'tea', x: 44, y: 90, h: 42 },
        { id: 'cdMouse', pose: 'eat', x: 34, y: 66, h: 10 },
        { id: 'cdMice', pose: 'run', x: 40, y: 98, h: 10 },
        { id: 'cdElla', pose: 'walk', x: 112, y: 95, h: 46, flip: true },
        { id: 'cdPrince', pose: 'happy', x: 126, y: 94, h: 50 }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'cdElla', x: 68, dur: 3 },
        { l: 0, at: 0.4, id: 'cdPrince', x: 84, dur: 3 },
        { l: 1, id: 'cdStep', anim: 'nod' },
        { l: 1, at: 1.4, id: 'cdMouse', anim: 'wiggle' },
        { l: 2, id: 'cdSisters', anim: 'wiggle' },
        { l: 2, at: 1.2, fx: 'hearts', id: 'cdSisters' },
        { l: 3, id: 'cdSisters', anim: 'hop' },
        { l: 3, at: 1.0, id: 'cdElla', anim: 'hop' },
        { l: 4, id: 'cdElla', anim: 'spin' },
        { l: 4, at: 0.4, id: 'cdPrince', anim: 'hop' },
        { l: 4, at: 0.8, id: 'cdMice', anim: 'hop' },
        { l: 4, at: 1.2, fx: 'hearts', x: 50, y: 40 },
        { l: 4, at: 2.2, fx: 'sparkle', x: 74, y: 40 }
      ]
    }
  ]
});
