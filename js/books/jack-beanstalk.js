/* 傑克與魔豆：分鏡（手寫）。格式見 js/story-data.js 開頭與 addBook 的說明；文字與時間在 jack-beanstalk-script.js。
   傑克（jbJack）的姿勢很多：牽牛、摸牛、躲在茶杯裡（cuppeek／cupwow，杯子連傑克畫在一起）、抱母雞揮手都算他的姿勢；
   媽媽抱傑克（mom-hug）算媽媽的姿勢、巨人太太捏著傑克放進茶杯（wife-pinch）算太太的姿勢，那時候傑克要先藏起來。
   巨人抱母雞（giant-hen）、推母雞（giant-push）算巨人的姿勢，母雞另外站著的是 jbHen；第 2 頁換走的牛是 jbCow（cow-walk 面向左）。
   巨人家的廚房從桌面的高度看：傑克站在桌面上（y 約 80），巨人和太太站在桌子兩旁、下半身超出畫面（被桌子擋住的感覺）。
   方向：牽牛往左走、老爺爺的豆子朝右、太太 peek 往右下看、傑克 waveup／henbye 往左上揮手、媽媽丟豆子朝右、
   巨人 sniff 鼻子朝左、push 往右推、噴嚏朝右、giggle 兩個都往右上看。 */
StoryData.addBook('jack-beanstalk', {
  color: '#8BD17C',
  cover: { bg: 'bg-beanstalk-dawn.jpg', actor: 'jbJack', pose: 'climb' },
  voices: {
    '傑克': { actor: 'jbJack', color: '#6FB7F2' },
    '媽媽': { actor: 'jbMom', color: '#A9C98A' },
    '老爺爺': { actor: 'jbOldman', color: '#B79BE0' },
    '巨人太太': { actor: 'jbWife', color: '#F7A8C4' },
    '巨人': { actor: 'jbGiant', color: '#F2925A' },
    '母雞': { actor: 'jbHen', color: '#D9A066' }
  },
  sprites: {
    jbJack: {
      waveup: { src: 'jack-wave-up.png' },
      petcow: { src: 'jack-pet-cow.png' },
      leadcow: { src: 'jack-lead-cow.png' },
      wow: { src: 'jack-wow.png' },
      show: { src: 'jack-show.png' },
      sorry: { src: 'jack-sorry.png' },
      window: { src: 'jack-window.png' },
      climb: { src: 'jack-climb.png' },
      cloud: { src: 'jack-cloud.png' },
      bread: { src: 'jack-bread.png' },
      cuppeek: { src: 'cup-peek.png' },
      cupwow: { src: 'cup-wow.png' },
      sneeze: { src: 'jack-sneeze.png', k: 0.8 },
      ears: { src: 'jack-ears.png' },
      laugh: { src: 'jack-laugh.png' },
      talk: { src: 'jack-talk.png', k: 0.82 },
      henbye: { src: 'jack-hen-bye.png' },
      giggle: { src: 'jack-giggle.png' }
    },
    jbMom: {
      joy: { src: 'mom-joy.png' },
      jar: { src: 'mom-jar.png' },
      toss: { src: 'mom-toss.png' },
      hug: { src: 'mom-hug.png', k: 0.9 },
      giggle: { src: 'mom-giggle.png' }
    },
    jbOldman: { beans: { src: 'oldman-beans.png' } },
    jbBird: { perch: { src: 'bird.png' } },
    jbWife: {
      apron: { src: 'wife-apron.png' },
      peek: { src: 'wife-peek.png' },
      pinch: { src: 'wife-pinch.png' },
      pancakes: { src: 'wife-pancakes.png' }
    },
    jbGiant: {
      whisper: { src: 'giant-whisper.png' },
      sniff: { src: 'giant-sniff.png' },
      hen: { src: 'giant-hen.png' },
      snore: { src: 'giant-snore.png' },
      oneeye: { src: 'giant-one-eye.png' },
      lonely: { src: 'giant-lonely.png' },
      push: { src: 'giant-push.png' },
      yawn: { src: 'giant-yawn.png' }
    },
    jbHen: {
      proud: { src: 'hen-proud.png' },
      egg: { src: 'hen-egg.png' },
      doze: { src: 'hen-doze.png' }
    },
    jbEgg: { gold: { src: 'golden-egg.png' } },
    jbCup: { tipped: { src: 'cup-tipped.png' } },
    jbHarp: { sing: { src: 'harp-sing.png' } },
    jbCow: { walk: { src: 'cow-walk.png' } }
  },
  taps: {
    jbGiant: ['wiggle', 'zzz'],
    jbHen: ['hop', 'notes'],
    jbEgg: ['spin', 'sparkle'],
    jbBird: ['hop', 'notes'],
    jbHarp: ['wiggle', 'notes'],
    jbCow: ['hop', 'hearts'],
    jbCup: ['wiggle', 'sparkle']
  },
  pages: [
    { // 1 山腳下的小木屋：傑克摸著乳牛，媽媽捧著空米缸叫他把牛牽去賣
      bg: 'bg-jack-home.jpg',
      actors: [
        { id: 'jbMom', pose: 'jar', x: 34, y: 95, h: 54 },
        { id: 'jbJack', pose: 'petcow', x: 70, y: 96, h: 42 }
      ],
      cues: [
        { l: 0, at: 1.6, id: 'jbJack', anim: 'hop' },
        { l: 1, at: 2.4, id: 'jbMom', anim: 'nod' },
        { l: 2, at: 1.0, id: 'jbJack', anim: 'nod' },
        { l: 3, id: 'jbMom', anim: 'wiggle' },
        { l: 4, at: 1.4, id: 'jbJack', anim: 'nod' }
      ]
    },
    { // 2 鄉下小路：傑克牽牛從右邊走來，路邊石頭上的老爺爺攤開手掌給他看魔豆；說「我要換」時傑克放開牛，牛走到老爺爺身邊
      bg: 'bg-country-road.jpg',
      actors: [
        { id: 'jbOldman', pose: 'beans', x: 22, y: 96, h: 48 },
        { id: 'jbCow', pose: 'walk', x: 73, y: 95, h: 26, hidden: true },
        { id: 'jbJack', pose: 'leadcow', x: 112, y: 97, h: 42 }
      ],
      cues: [
        { id: 'jbJack', x: 66, dur: 4 },
        { l: 1, at: 0.6, id: 'jbOldman', anim: 'nod' },
        { l: 3, at: 0.8, fx: 'sparkle', x: 33, y: 62 },
        { l: 4, id: 'jbJack', pose: 'wow', x: 60, h: 40, anim: 'hop' },
        { l: 4, id: 'jbCow', show: true },
        { l: 4, at: 0.2, id: 'jbCow', x: 42, dur: 1.8 },
        { l: 4, at: 1.4, id: 'jbJack', anim: 'hop' }
      ]
    },
    { // 3 小木屋裡、傍晚：傑克得意地秀魔豆，媽媽嘆氣，再把豆子往右邊的窗外一丟；晚上沒東西吃
      bg: 'bg-jack-room.jpg',
      actors: [
        { id: 'jbJack', pose: 'show', x: 30, y: 96, h: 40, flip: true },
        { id: 'jbMom', pose: 'jar', x: 64, y: 96, h: 54 }
      ],
      cues: [
        { l: 0, id: 'jbJack', anim: 'hop' },
        { l: 0, at: 1.4, fx: 'sparkle', x: 38, y: 70 },
        { l: 1, id: 'jbMom', anim: 'nod' },
        { l: 2, id: 'jbJack', pose: 'sorry', flip: false },
        { l: 3, id: 'jbMom', pose: 'toss', x: 70, anim: 'wiggle' },
        { l: 4, tint: 'night' },
        { l: 4, at: 1.0, id: 'jbJack', anim: 'nod' }
      ]
    },
    { // 4 清晨：傑克從窗戶探出頭，看見好高好高的豆莖穿進雲裡
      bg: 'bg-beanstalk-dawn.jpg',
      actors: [
        { id: 'jbJack', pose: 'window', x: 30, y: 100, h: 40 }
      ],
      cues: [
        { l: 1, id: 'jbJack', anim: 'hop' },
        { l: 2, at: 1.0, fx: 'sparkle', x: 74, y: 20 },
        { l: 3, at: 1.0, fx: 'sparkle', x: 88, y: 36 },
        { l: 4, id: 'jbJack', anim: 'nod' },
        { l: 4, at: 1.8, id: 'jbJack', anim: 'hop' }
      ]
    },
    { // 5 半空中：傑克抓著葉子往上爬（爬到上面），小鳥歪頭看；最後站上白雲蹦蹦跳
      bg: 'bg-beanstalk-sky.jpg',
      actors: [
        { id: 'jbBird', pose: 'perch', x: 74, y: 40, h: 14, flip: true, loop: 'float' },
        { id: 'jbJack', pose: 'climb', x: 38, y: 104, h: 40 }
      ],
      cues: [
        { l: 0, id: 'jbJack', y: 86, dur: 3 },
        { l: 1, id: 'jbJack', y: 70, dur: 3 },
        { l: 2, id: 'jbBird', anim: 'hop' },
        { l: 2, at: 0.4, fx: 'notes', id: 'jbBird' },
        { l: 3, at: 0.8, id: 'jbJack', pose: 'cloud', x: 58, y: 64, h: 36, loop: 'float' },
        { l: 4, id: 'jbJack', anim: 'hop' },
        { l: 4, at: 1.0, id: 'jbJack', anim: 'hop' }
      ]
    },
    { // 6 雲上的大房子：巨人太太在門口彎腰往下看，小小的傑克在左邊抬頭揮手
      bg: 'bg-cloud-house.jpg',
      actors: [
        { id: 'jbWife', pose: 'peek', x: 76, y: 84, h: 78, flip: true, hidden: true },
        { id: 'jbJack', pose: 'wow', x: 36, y: 92, h: 22 }
      ],
      cues: [
        { l: 0, at: 1.0, id: 'jbJack', anim: 'hop' },
        { l: 1, at: 0.8, id: 'jbWife', show: true },
        { l: 2, id: 'jbWife', anim: 'nod' },
        { l: 3, id: 'jbJack', pose: 'waveup', flip: true, anim: 'hop' },
        { l: 4, id: 'jbWife', anim: 'nod' },
        { l: 4, at: 1.2, fx: 'hearts', x: 52, y: 50 }
      ]
    },
    { // 7 巨人家的廚房：傑克在桌上抱著大麵包吃；地板咚咚搖，太太捏著傑克放進茶杯
      bg: 'bg-giant-kitchen.jpg',
      actors: [
        { id: 'jbWife', pose: 'peek', x: 20, y: 112, h: 100 },
        { id: 'jbJack', pose: 'bread', x: 62, y: 82, h: 32 }
      ],
      cues: [
        { l: 1, id: 'jbJack', anim: 'hop' },
        { l: 1, at: 0.8, fx: 'hearts', id: 'jbJack' },
        { l: 2, at: 0.6, id: 'jbJack', anim: 'wiggle' },
        { l: 2, at: 0.6, id: 'jbWife', anim: 'wiggle' },
        { l: 2, at: 1.6, id: 'jbJack', anim: 'wiggle' },
        { l: 3, id: 'jbWife', anim: 'hop' },
        { l: 4, id: 'jbJack', hide: true },
        { l: 4, id: 'jbWife', pose: 'pinch', x: 50, y: 92, h: 82 }
      ]
    },
    { // 8 巨人從左邊走進來，鼻子往右到處聞；傑克躲在茶杯裡偷看；太太端出鬆餅
      bg: 'bg-giant-kitchen.jpg',
      actors: [
        { id: 'jbGiant', pose: 'sniff', x: -24, y: 114, h: 104, flip: true },
        { id: 'jbJack', pose: 'cuppeek', x: 61, y: 84, h: 28 },
        { id: 'jbWife', pose: 'pancakes', x: 90, y: 112, h: 96, hidden: true }
      ],
      cues: [
        { id: 'jbGiant', x: 14, dur: 2.4 },
        { l: 1, id: 'jbGiant', anim: 'wiggle' },
        { l: 1, at: 1.2, id: 'jbJack', anim: 'wiggle' },
        { l: 2, id: 'jbGiant', x: 20, dur: 1.2 },
        { l: 2, at: 1.6, id: 'jbGiant', anim: 'wiggle' },
        { l: 3, id: 'jbWife', show: true, anim: 'hop' },
        { l: 4, id: 'jbGiant', flip: false, anim: 'hop' },
        { l: 4, at: 1.0, fx: 'hearts', id: 'jbGiant' }
      ]
    },
    { // 9 巨人坐在椅子上抱出母雞，咚！一顆金蛋滾到桌上；傑克在茶杯裡看呆了
      bg: 'bg-giant-kitchen.jpg',
      actors: [
        { id: 'jbGiant', pose: 'whisper', x: 22, y: 114, h: 104 },
        { id: 'jbJack', pose: 'cupwow', x: 82, y: 84, h: 30 },
        { id: 'jbEgg', pose: 'gold', x: 48, y: 80, h: 10, hidden: true }
      ],
      cues: [
        { l: 0, at: 1.2, id: 'jbGiant', anim: 'wiggle' },
        { l: 1, id: 'jbGiant', pose: 'hen', x: 33, y: 108, h: 90, anim: 'hop' },
        { l: 2, id: 'jbGiant', anim: 'nod' },
        { l: 3, id: 'jbGiant', anim: 'wiggle' },
        { l: 3, fx: 'notes', x: 16, y: 48 },
        { l: 4, id: 'jbEgg', show: true, anim: 'hop' },
        { l: 4, at: 0.3, id: 'jbEgg', x: 64, dur: 1.4 },
        { l: 4, at: 1.6, fx: 'sparkle', id: 'jbEgg' },
        { l: 4, at: 1.4, id: 'jbJack', anim: 'hop' }
      ]
    },
    { // 10 下午：巨人拿出金色豎琴放在桌上，豎琴唱歌（音符），聽著聽著靠在椅子上睡著、打呼像打雷
      bg: 'bg-giant-kitchen-pm.jpg',
      actors: [
        { id: 'jbGiant', pose: 'whisper', x: 22, y: 114, h: 104 },
        { id: 'jbHarp', pose: 'sing', x: 58, y: 82, h: 40, hidden: true },
        { id: 'jbJack', pose: 'cuppeek', x: 80, y: 84, h: 28 }
      ],
      cues: [
        { l: 0, at: 1.2, id: 'jbHarp', show: true, anim: 'hop' },
        { l: 0, at: 1.4, fx: 'sparkle', id: 'jbHarp' },
        { l: 1, id: 'jbGiant', anim: 'nod' },
        { l: 2, id: 'jbHarp', anim: 'wiggle' },
        { l: 2, fx: 'notes', id: 'jbHarp' },
        { l: 2, at: 1.2, fx: 'notes', id: 'jbHarp' },
        { l: 3, fx: 'notes', id: 'jbHarp' },
        { l: 3, id: 'jbGiant', pose: 'snore', x: 24, y: 108, h: 92 },
        { l: 3, at: 1.0, fx: 'zzz', id: 'jbGiant' },
        { l: 4, id: 'jbGiant', anim: 'wiggle' },
        { l: 4, at: 0.2, id: 'jbJack', anim: 'wiggle' },
        { l: 4, at: 1.2, id: 'jbGiant', anim: 'wiggle' },
        { l: 4, at: 1.4, id: 'jbJack', anim: 'wiggle' },
        { l: 4, at: 2.0, fx: 'zzz', id: 'jbGiant' }
      ]
    },
    { // 11 打呼聲讓茶杯搖來搖去，傑克滾出來朝左邊打噴嚏；巨人睜開一隻眼睛；傑克摀住耳朵
      bg: 'bg-giant-kitchen-pm.jpg',
      actors: [
        { id: 'jbGiant', pose: 'snore', x: 24, y: 108, h: 92 },
        { id: 'jbCup', pose: 'tipped', x: 76, y: 84, h: 18, flip: true, hidden: true },
        { id: 'jbJack', pose: 'cuppeek', x: 74, y: 84, h: 28 }
      ],
      cues: [
        { l: 0, id: 'jbJack', anim: 'wiggle' },
        { l: 0, at: 0.8, fx: 'zzz', id: 'jbGiant' },
        { l: 0, at: 1.2, id: 'jbJack', anim: 'wiggle' },
        { l: 0, at: 2.2, id: 'jbJack', anim: 'wiggle' },
        { l: 1, id: 'jbCup', show: true },
        { l: 1, id: 'jbJack', pose: 'sneeze', flip: true, x: 54, y: 84, h: 32 },
        { l: 2, id: 'jbJack', anim: 'wiggle' },
        { l: 2, at: 0.1, fx: 'puff', x: 40, y: 64 },
        { l: 3, id: 'jbGiant', pose: 'oneeye', x: 22, y: 114, h: 100 },
        { l: 4, id: 'jbJack', pose: 'ears', flip: false, x: 54, y: 84, h: 32, anim: 'wiggle' }
      ]
    },
    { // 12 巨人努力小聲說話，還是像打雷；傑克笑出來；巨人說沒人找他玩，好寂寞
      bg: 'bg-giant-kitchen-pm.jpg',
      actors: [
        { id: 'jbGiant', pose: 'whisper', x: 22, y: 114, h: 104 },
        { id: 'jbCup', pose: 'tipped', x: 82, y: 84, h: 18, flip: true },
        { id: 'jbJack', pose: 'ears', x: 58, y: 84, h: 32 }
      ],
      cues: [
        { l: 0, id: 'jbGiant', anim: 'nod' },
        { l: 1, at: 1.4, id: 'jbGiant', anim: 'wiggle' },
        { l: 1, at: 1.4, id: 'jbJack', anim: 'wiggle' },
        { l: 2, id: 'jbJack', pose: 'laugh', anim: 'hop' },
        { l: 3, id: 'jbGiant', pose: 'lonely' },
        { l: 4, id: 'jbGiant', anim: 'nod' }
      ]
    },
    { // 13 傑克盤腿坐著說家裡好窮；巨人蹲下來用手指把母雞推給傑克，母雞拍翅膀
      bg: 'bg-giant-kitchen.jpg',
      actors: [
        { id: 'jbGiant', pose: 'lonely', x: 20, y: 114, h: 104 },
        { id: 'jbJack', pose: 'talk', x: 78, y: 84, h: 32 }
      ],
      cues: [
        { l: 0, id: 'jbJack', anim: 'hop' },
        { l: 1, id: 'jbJack', anim: 'nod' },
        { l: 2, id: 'jbGiant', pose: 'push', x: 36, y: 103, h: 76, anim: 'hop' },
        { l: 3, id: 'jbGiant', anim: 'nod' },
        { l: 3, at: 0.8, fx: 'sparkle', x: 62, y: 60 },
        { l: 4, fx: 'notes', x: 60, y: 56 },
        { l: 4, at: 0.4, id: 'jbJack', anim: 'hop' },
        { l: 4, at: 1.2, fx: 'hearts', id: 'jbJack' }
      ]
    },
    { // 14 傍晚的大門前：傑克抱著母雞往右上揮手，巨人坐在台階上打哈欠，太太在門口揮圍裙；傑克從左邊的豆莖爬下去
      bg: 'bg-giant-door-dusk.jpg',
      actors: [
        { id: 'jbWife', pose: 'apron', x: 82, y: 70, h: 56 },
        { id: 'jbGiant', pose: 'yawn', x: 70, y: 97, h: 56 },
        { id: 'jbHarp', pose: 'sing', x: 93, y: 98, h: 36, hidden: true },
        { id: 'jbJack', pose: 'henbye', x: 38, y: 92, h: 24, flip: true }
      ],
      cues: [
        { l: 0, id: 'jbJack', anim: 'hop' },
        { l: 0, at: 1.4, id: 'jbWife', anim: 'wiggle' },
        { l: 1, id: 'jbGiant', anim: 'nod' },
        { l: 2, id: 'jbHarp', show: true, anim: 'wiggle' },
        { l: 2, at: 0.4, fx: 'notes', id: 'jbHarp' },
        { l: 2, at: 1.4, fx: 'zzz', id: 'jbGiant' },
        { l: 3, id: 'jbJack', flip: false, x: 20, y: 86, dur: 1.4 },
        { l: 3, at: 1.6, id: 'jbJack', y: 135, dur: 1.4 },
        { l: 3, at: 2.8, id: 'jbJack', hide: true }
      ]
    },
    { // 15 傍晚回到家：媽媽抱住傑克；母雞咕咕生出金蛋；買回乳牛，媽媽好開心
      bg: 'bg-garden-dusk.jpg',
      actors: [
        { id: 'jbMom', pose: 'hug', x: 38, y: 95, h: 54 },
        { id: 'jbHen', pose: 'proud', x: 60, y: 96, h: 18 },
        { id: 'jbJack', pose: 'petcow', x: 76, y: 96, h: 40, hidden: true }
      ],
      cues: [
        { l: 0, id: 'jbMom', anim: 'hop' },
        { l: 1, id: 'jbHen', anim: 'hop' },
        { l: 2, id: 'jbHen', pose: 'egg', anim: 'hop' },
        { l: 2, at: 0.4, fx: 'sparkle', x: 64, y: 88 },
        { l: 3, id: 'jbHen', x: 18, y: 96, h: 16, dur: 0.8 },
        { l: 3, at: 0.6, id: 'jbMom', pose: 'joy', x: 44, h: 54 },
        { l: 3, at: 0.6, id: 'jbJack', show: true, anim: 'hop' },
        { l: 4, id: 'jbMom', anim: 'hop' },
        { l: 4, at: 1.0, fx: 'hearts', x: 58, y: 54 }
      ]
    },
    { // 16 晚上：豆莖縮成右邊一小株黃葉豆苗，傑克把豆子收好；天上轟隆轟隆，媽媽和傑克抬頭笑，母雞在打盹
      bg: 'bg-home-night.jpg',
      actors: [
        { id: 'jbHen', pose: 'doze', x: 22, y: 96, h: 12 },
        { id: 'jbMom', pose: 'joy', x: 46, y: 95, h: 54 },
        { id: 'jbJack', pose: 'wow', x: 60, y: 96, h: 40 }
      ],
      cues: [
        { l: 0, at: 1.4, fx: 'sparkle', x: 82, y: 80 },
        { l: 1, id: 'jbJack', pose: 'show', flip: true, anim: 'hop' },
        { l: 1, at: 1.2, fx: 'sparkle', x: 64, y: 72 },
        { l: 2, at: 1.6, id: 'jbMom', anim: 'wiggle' },
        { l: 2, at: 1.6, fx: 'zzz', x: 82, y: 14 },
        { l: 3, id: 'jbMom', pose: 'giggle', anim: 'nod' },
        { l: 4, id: 'jbJack', pose: 'giggle', flip: false, anim: 'hop' },
        { l: 4, at: 1.2, fx: 'zzz', x: 84, y: 12 }
      ]
    }
  ]
});
