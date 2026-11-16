/* 后羿射日和嫦娥奔月：分鏡（手寫）。格式見 js/story-data.js 開頭與 addBook 的說明；文字與時間在 chang-e-script.js。
   小太陽（ceSun）一個角色包好幾張：jump／hide／bird 是一個太陽，play（十個圍一圈）、tease（五個追來追去）是群像，
   這樣「小太陽」說話時亮的是畫面上那團太陽。另外 ceSuns 是背景用的其他太陽：row（九個坐一排）、tease（跟 ceSun 同一張）。
   合在一起的圖：houyi-change-smile 算嫦娥的姿勢（ceChange couple）；change-rabbit-wave 算玉兔的姿勢（ceRabbit wave，第 16 頁玉兔說話）。
   方向：后羿 look 朝右（握拳往右上看）、shout／receive 朝左、shoot 往右上射、smileup／moon 往右上看；嫦娥 water 往右遞碗；
   王母 give 往右遞瓶子；壞人 peek／tiptoe 朝左；小女孩 point 往右上指；小狗朝右；金色小鳥往右上飛；一家人往右上指。
   神樹（bg-sea-tree）：右邊三根平平的樹枝，上面那根在 y 20（x 45–87）、中間 y 39（x 45–93）、下面 y 57（x 45–77）。
   山頂（bg-mountain-hot／cool）：左下岩石頂 y 80（x 0–45），右下山腳空地 y 92（x 60–95）。
   月亮：bg-yard-fullmoon、bg-balcony 的月亮裡自帶嫦娥和兔子的剪影，ceRabbit wave 擺在月亮裡蓋住剪影。
   畫面最上面一條（y 3–12）會被頁點蓋住：bg-window-dusk-moon 的月亮（x 64–78、y 2–23）上緣在頁點底下，嫦娥飛到月亮左下就消失。 */
StoryData.addBook('chang-e', {
  color: '#F5C04A',
  cover: { bg: 'bg-yard-fullmoon.jpg', actor: 'ceChange', pose: 'couple' },
  voices: {
    '后羿': { actor: 'ceHouyi', color: '#6E9BE0' },
    '嫦娥': { actor: 'ceChange', color: '#F3A6C8' },
    '小太陽': { actor: 'ceSun', color: '#FFC83D' },
    '小女孩': { actor: 'ceGirl', color: '#8EDB8A' },
    '王母娘娘': { actor: 'ceWangmu', color: '#B98BE0' },
    '壞人': { actor: 'ceBad', color: '#B5B5C2' },
    '玉兔': { actor: 'ceRabbit', color: '#E6E1FF' }
  },
  sprites: {
    ceHouyi: {
      look: { src: 'houyi-look.png' },
      shout: { src: 'houyi-shout.png' },
      shoot: { src: 'houyi-shoot.png' },
      smileup: { src: 'houyi-smile-up.png' },
      receive: { src: 'houyi-receive.png' },
      moon: { src: 'houyi-moon.png' }
    },
    ceChange: {
      water: { src: 'change-water.png' },
      box: { src: 'change-box.png' },
      protect: { src: 'change-protect.png' },
      float: { src: 'change-float.png' },
      sit: { src: 'change-sit-moon.png', k: 0.78 },
      couple: { src: 'houyi-change-smile.png' }      // 后羿和嫦娥並肩（后羿在左）
    },
    ceSun: {
      jump: { src: 'sun-jump.png' },
      hide: { src: 'sun-hide.png' },                 // 躲在白雲後面（雲是圖的一部分）
      bird: { src: 'sun-to-bird.png' },
      play: { src: 'suns-play.png' },                // 十個手牽手圍一圈
      tease: { src: 'suns-tease.png' }               // 五個追來追去
    },
    ceSuns: {
      row: { src: 'suns-row.png' },                  // 九個坐一排（很扁：寬是高的 6 倍）
      tease: { src: 'suns-tease.png' }
    },
    ceBirds: { fly: { src: 'golden-birds.png' } },
    ceGirl: {
      hot: { src: 'girl-hot.png', k: 0.8 },
      cheer: { src: 'girl-cheer.png' },
      point: { src: 'girl-point.png' },
      hooray: { src: 'girl-hooray.png' },
      rain: { src: 'girl-rain.png' }
    },
    ceDog: { hot: { src: 'dog-hot.png' } },
    ceVillagers: {
      fan: { src: 'villagers-fan.png' },
      dance: { src: 'villagers-dance.png' }
    },
    ceWangmu: { give: { src: 'wangmu-give.png' } },
    ceBad: {
      peek: { src: 'badguy-peek.png' },
      tiptoe: { src: 'badguy-tiptoe.png' },
      fall: { src: 'badguy-fall.png' }
    },
    ceRabbit: {
      pound: { src: 'rabbit-pound.png' },
      wave: { src: 'change-rabbit-wave.png' }        // 嫦娥和玉兔一起揮手
    },
    ceFamily: { point: { src: 'family-moon.png' } }
  },
  taps: {
    ceHouyi: ['hop', 'sparkle'],
    ceChange: ['nod', 'hearts'],
    ceSun: ['hop', 'sparkle'],
    ceSuns: ['wiggle', 'sparkle'],
    ceBirds: ['wiggle', 'notes'],
    ceGirl: ['hop', 'hearts'],
    ceDog: ['wiggle', 'hearts'],
    ceVillagers: ['hop', 'hearts'],
    ceWangmu: ['nod', 'sparkle'],
    ceBad: ['wiggle', 'puff'],
    ceRabbit: ['hop', 'hearts'],
    ceFamily: ['hop', 'hearts']
  },
  pages: [
    { // 1 東邊大海上的神樹，九個太陽坐在樹枝上，第十個跳起來出門上班；晚上回樹上休息
      bg: 'bg-sea-tree.jpg',
      actors: [
        { id: 'ceSuns', pose: 'row', x: 66, y: 39.5, h: 9, loop: 'still' },
        { id: 'ceSun', pose: 'jump', x: 88, y: 39.5, h: 9.5 }
      ],
      cues: [
        { l: 0, at: 2.6, fx: 'sparkle', x: 66, y: 30 },                // 「十個太陽」
        { l: 1, at: 0.6, id: 'ceSuns', anim: 'wiggle' },               // 「十兄弟」
        { l: 1, at: 0.8, id: 'ceSun', anim: 'hop' },
        { l: 2, at: 1.0, id: 'ceSun', anim: 'hop' },                   // 「輪到一個太陽」
        { l: 3, id: 'ceSun', x: 84, y: 80, h: 30, dur: 1.2 },         // 「今天輪到我囉！」跳到海面上
        { l: 3, at: 1.3, fx: 'sparkle', id: 'ceSun' },
        { l: 3, at: 1.6, id: 'ceSuns', anim: 'wiggle' },               // 「大家再見！」
        { l: 4, tint: 'sunset' },                                      // 「晚上」
        { l: 4, at: 1.0, id: 'ceSun', x: 88, y: 39.5, h: 9.5, dur: 1.4 },
        { l: 4, at: 1.6, tint: 'night' },
        { l: 4, at: 2.4, fx: 'zzz', x: 72, y: 26 }
      ]
    },
    { // 2 太陽兄弟想到好玩的主意：十個一起跳到天上手牽手轉圈，天上好亮
      bg: 'bg-sea-tree-glare.jpg',
      actors: [
        { id: 'ceSuns', pose: 'row', x: 66, y: 39.5, h: 9, loop: 'still' },
        { id: 'ceSun', pose: 'jump', x: 88, y: 39.5, h: 9.5 }
      ],
      cues: [
        { l: 0, at: 2.0, id: 'ceSun', anim: 'hop' },                   // 「好玩的主意」
        { l: 1, id: 'ceSuns', anim: 'wiggle' },                        // 「我們十個，一起出去玩吧！」
        { l: 1, at: 0.4, id: 'ceSun', anim: 'hop' },
        { l: 2, at: 0.2, id: 'ceSuns', hide: true },                   // 「呼！一起跳到天上」
        { l: 2, at: 0.2, id: 'ceSun', pose: 'play', x: 70, y: 86, h: 72, loop: 'float' },
        { l: 2, at: 0.4, fx: 'sparkle', x: 40, y: 30 },
        { l: 2, at: 0.8, fx: 'sparkle', x: 78, y: 40 },
        { l: 3, fx: 'sparkle', x: 30, y: 20 },                          // 「天上好亮」
        { l: 3, at: 1.2, fx: 'sparkle', x: 85, y: 18 },
        { l: 4, id: 'ceSun', anim: 'spin' },                           // 「真好玩！」
        { l: 4, at: 1.4, fx: 'sparkle', id: 'ceSun' }
      ]
    },
    { // 3 村子被曬得好熱：河快乾了、稻子彎頭；村民搧扇子，小女孩坐著想喝水，小狗熱到吐舌頭
      bg: 'bg-village-dry.jpg',
      actors: [
        { id: 'ceSun', pose: 'tease', x: 52, y: 43, h: 30, loop: 'float' },
        { id: 'ceVillagers', pose: 'fan', x: 20, y: 96, h: 44 },
        { id: 'ceGirl', pose: 'hot', x: 54, y: 96, h: 40 },
        { id: 'ceDog', pose: 'hot', x: 80, y: 94, h: 20 }
      ],
      cues: [
        { l: 0, at: 1.0, id: 'ceSun', anim: 'wiggle' },                // 「一起曬」
        { l: 0, at: 2.8, id: 'ceVillagers', anim: 'wiggle' },          // 「好熱，好熱！」
        { l: 1, at: 0.4, fx: 'sparkle', x: 62, y: 52 },                // 「河水快不見了」
        { l: 1, at: 2.0, id: 'ceVillagers', anim: 'nod' },
        { l: 2, id: 'ceGirl', anim: 'wiggle' },                         // 「好熱喔！我想喝水！」
        { l: 3, at: 0.4, id: 'ceDog', anim: 'wiggle' }                  // 「小狗也熱到吐舌頭了」
      ]
    },
    { // 4 院子：大英雄后羿（射箭最準）；嫦娥捧著水，請后羿幫幫大家
      bg: 'bg-yard-peach.jpg',
      actors: [
        { id: 'ceSun', pose: 'play', x: 46, y: 45, h: 30, loop: 'float' },
        { id: 'ceHouyi', pose: 'look', flip: true, x: 66, y: 96, h: 60 },
        { id: 'ceChange', pose: 'water', x: 36, y: 96, h: 56, hidden: true }
      ],
      cues: [
        { l: 0, at: 2.2, id: 'ceHouyi', anim: 'hop' },                 // 「大英雄，叫做后羿」
        { l: 0, at: 2.4, fx: 'sparkle', id: 'ceHouyi' },
        { l: 1, at: 1.0, id: 'ceHouyi', anim: 'nod' },                 // 「射箭，最準了」
        { l: 2, id: 'ceChange', show: true, anim: 'hop' },             // 「他的太太嫦娥」
        { l: 2, at: 1.8, fx: 'hearts', id: 'ceChange' },               // 「又溫柔，又善良」
        { l: 3, id: 'ceChange', anim: 'nod' },                          // 「大家好熱，我們幫幫大家吧！」
        { l: 3, at: 1.6, id: 'ceSun', anim: 'wiggle' },
        { l: 4, id: 'ceHouyi', anim: 'hop' }                            // 「好！我去跟太陽說！」
      ]
    },
    { // 5 山頂：后羿對著天上大喊，太陽們扮鬼臉不聽；后羿要拿出弓箭，山腳下的小女孩握拳加油
      bg: 'bg-mountain-hot.jpg',
      actors: [
        { id: 'ceHouyi', pose: 'shout', flip: true, x: 22, y: 80, h: 52 },
        { id: 'ceSun', pose: 'tease', x: 64, y: 62, h: 50, loop: 'float' },
        { id: 'ceGirl', pose: 'cheer', x: 80, y: 93, h: 22, hidden: true }
      ],
      cues: [
        { l: 0, at: 0.4, id: 'ceHouyi', anim: 'hop' },                 // 「太陽兄弟，請你們回家」
        { l: 1, id: 'ceSun', anim: 'wiggle' },                          // 「不要，不要！」
        { l: 1, at: 1.4, id: 'ceSun', anim: 'spin' },
        { l: 2, at: 1.6, fx: 'sparkle', x: 50, y: 56 },                // 「地上越來越熱」
        { l: 3, id: 'ceHouyi', pose: 'look', flip: false, anim: 'nod' },         // 「好，那我要拿出弓箭了！」
        { l: 4, id: 'ceGirl', show: true, anim: 'hop' },              // 「后羿，加油！」
        { l: 4, at: 0.6, id: 'ceGirl', anim: 'hop' }
      ]
    },
    { // 6 后羿拉弓對準一個太陽，咻！那個太陽一閃變成金色小鳥飛走；山腳下的小女孩指著天上
      bg: 'bg-mountain-hot.jpg',
      actors: [
        { id: 'ceHouyi', pose: 'shoot', x: 22, y: 80, h: 52 },
        { id: 'ceSuns', pose: 'tease', x: 74, y: 60, h: 40, loop: 'float' },
        { id: 'ceSun', pose: 'jump', x: 48, y: 34, h: 18, loop: 'float' },
        { id: 'ceGirl', pose: 'point', x: 82, y: 93, h: 22 }
      ],
      cues: [
        { l: 0, at: 1.6, id: 'ceHouyi', anim: 'nod' },                 // 「對準一個太陽」
        { l: 1, fx: 'puff', x: 34, y: 40 },                             // 「咻！」
        { l: 1, at: 0.2, id: 'ceSun', anim: 'wiggle' },
        { l: 2, fx: 'sparkle', id: 'ceSun' },                           // 「太陽一閃」
        { l: 2, at: 0.3, id: 'ceSun', pose: 'bird', h: 22 },           // 「變成金色小鳥」
        { l: 2, at: 2.2, id: 'ceSun', x: 112, y: 8, h: 14, dur: 1.4 }, // 「飛走了！」
        { l: 3, id: 'ceGirl', anim: 'hop' },                            // 「哇！太陽變成小鳥了！」
        { l: 3, at: 0.8, fx: 'sparkle', x: 84, y: 64 }
      ]
    },
    { // 7 咻咻咻，太陽一個接一個變成小鳥；有的飛走、有的躲到山後；數到九，天變涼了，小女孩跳起來歡呼
      bg: 'bg-mountain-cool.jpg',
      actors: [
        { id: 'ceHouyi', pose: 'shoot', x: 22, y: 80, h: 52 },
        { id: 'ceSuns', pose: 'tease', x: 70, y: 56, h: 44, loop: 'float' },
        { id: 'ceBirds', pose: 'fly', x: 66, y: 50, h: 34, hidden: true, loop: 'float' },
        { id: 'ceGirl', pose: 'hooray', x: 80, y: 93, h: 24, hidden: true }
      ],
      cues: [
        { l: 0, fx: 'puff', x: 34, y: 40 },                             // 「咻！咻！咻！」
        { l: 0, at: 0.6, fx: 'puff', x: 36, y: 34 },
        { l: 0, at: 1.2, fx: 'puff', x: 34, y: 44 },
        { l: 0, at: 0.4, id: 'ceHouyi', anim: 'nod' },
        { l: 1, id: 'ceSuns', anim: 'wiggle' },                         // 「太陽一個接一個」
        { l: 1, at: 1.4, fx: 'sparkle', id: 'ceSuns' },
        { l: 1, at: 1.6, id: 'ceSuns', hide: true },                   // 「變成小鳥」
        { l: 1, at: 1.6, id: 'ceBirds', show: true },
        { l: 2, id: 'ceBirds', x: 84, y: 36, h: 28, dur: 2.4 },        // 「有的飛走，有的躲到山後面」
        { l: 3, at: 0.3, fx: 'sparkle', x: 30, y: 16 },             // 「一、二、三……九！」
        { l: 3, at: 0.9, fx: 'sparkle', x: 46, y: 10 },
        { l: 3, at: 1.5, fx: 'sparkle', x: 62, y: 16 },
        { l: 3, at: 2.1, fx: 'sparkle', x: 78, y: 10 },
        { l: 3, at: 2.7, fx: 'sparkle', x: 90, y: 22 },
        { l: 3, at: 2.2, id: 'ceBirds', x: 108, y: 14, h: 22, dur: 2.0 },
        { l: 3, at: 4.4, id: 'ceBirds', hide: true },
        { l: 4, id: 'ceGirl', show: true, anim: 'hop' },              // 「變涼了！變涼了！」
        { l: 4, at: 0.8, id: 'ceGirl', anim: 'hop' }
      ]
    },
    { // 8 最後一個太陽躲在白雲後面發抖；后羿放下弓溫柔地說；太陽從雲後跳出來答應準時上班
      bg: 'bg-sky-cloud.jpg',
      actors: [
        { id: 'ceSun', pose: 'hide', x: 75, y: 56, h: 50, loop: 'float' },
        { id: 'ceHouyi', pose: 'smileup', x: 24, y: 99, h: 72 }
      ],
      cues: [
        { l: 0, at: 0.2, id: 'ceSun', anim: 'wiggle' },                // 「后羿，不要射我！」
        { l: 0, at: 1.6, id: 'ceSun', anim: 'wiggle' },
        { l: 1, id: 'ceHouyi', anim: 'nod' },                           // 「你留下來」
        { l: 1, at: 1.8, id: 'ceHouyi', anim: 'nod' },
        { l: 2, id: 'ceSun', pose: 'jump', x: 74, y: 44, h: 32, anim: 'hop' },  // 「好！我每天都準時上班！」
        { l: 2, at: 0.3, fx: 'sparkle', id: 'ceSun' },
        { l: 3, at: 1.6, fx: 'hearts', x: 50, y: 30 }                 // 「天上就剩下一個太陽了」
      ]
    },
    { // 9 下起涼涼的雨，稻子抬頭、河水回來；村民在雨裡跳舞，小女孩接雨水；后羿和嫦娥相視而笑
      bg: 'bg-village-rain.jpg',
      actors: [
        { id: 'ceVillagers', pose: 'dance', x: 20, y: 95, h: 36 },
        { id: 'ceGirl', pose: 'rain', x: 47, y: 96, h: 34 },
        { id: 'ceChange', pose: 'couple', x: 76, y: 97, h: 54 }
      ],
      cues: [
        { l: 0, at: 1.6, id: 'ceVillagers', anim: 'hop' },             // 「天上下起了雨」
        { l: 1, at: 0.4, fx: 'sparkle', x: 46, y: 50 },                // 「小草抬起頭」
        { l: 1, at: 1.6, fx: 'sparkle', x: 62, y: 56 },                // 「河水又回來了」
        { l: 2, id: 'ceGirl', anim: 'hop' },                            // 「謝謝后羿！你是大英雄！」
        { l: 2, at: 1.4, id: 'ceVillagers', anim: 'hop' },
        { l: 3, id: 'ceChange', anim: 'nod' },                          // 「后羿，你辛苦了！」
        { l: 3, at: 0.6, fx: 'hearts', id: 'ceChange' }
      ]
    },
    { // 10 天上仙宮：王母娘娘把發光的仙藥遞給后羿；后羿接過來有點煩惱；帶回家要交給嫦娥
      bg: 'bg-heaven-palace.jpg',
      actors: [
        { id: 'ceWangmu', pose: 'give', x: 30, y: 92, h: 52 },
        { id: 'ceHouyi', pose: 'look', flip: true, x: 72, y: 94, h: 56 }
      ],
      cues: [
        { l: 0, at: 0.6, fx: 'sparkle', id: 'ceWangmu' },              // 「天上的王母娘娘」
        { l: 0, at: 1.8, id: 'ceWangmu', anim: 'nod' },                // 「送給后羿一瓶仙藥」
        { l: 1, at: 0.6, id: 'ceWangmu', anim: 'nod' },                // 「后羿，謝謝你」
        { l: 1, at: 2.4, fx: 'sparkle', x: 42, y: 60 },                // 「吃下仙藥」
        // 接瓶子：后羿雙手的瓶子剛好蓋在王母手上的瓶子上（兩張圖各畫了一個瓶子，疊成同一個）
        { l: 1, at: 4.0, id: 'ceHouyi', pose: 'receive', flip: false, x: 47.5, y: 97.7, h: 54, dur: 0.8 },
        { l: 2, at: 0.2, id: 'ceHouyi', anim: 'nod' },                 // 「可是，我想陪著嫦娥」
        { l: 3, id: 'ceWangmu', hide: true },                          // 「后羿把仙藥帶回家」
        { l: 3, fx: 'sparkle', x: 30, y: 60 },
        { l: 3, at: 0.4, id: 'ceHouyi', flip: true, x: 70, y: 95, dur: 1.6 },  // 轉身往回家的方向
        { l: 4, id: 'ceHouyi', anim: 'nod' },                           // 「嫦娥，請你幫我收好」
        { l: 4, at: 1.0, fx: 'hearts', id: 'ceHouyi' }
      ]
    },
    { // 11 晚上：嫦娥在窗前把仙藥收進小木盒；壞人蹲在草叢旁偷聽偷笑；第二天，后羿出門
      bg: 'bg-window-night.jpg',
      actors: [
        { id: 'ceChange', pose: 'box', x: 36, y: 95, h: 54 },
        { id: 'ceBad', pose: 'peek', x: 72, y: 95, h: 38, hidden: true },
        { id: 'ceHouyi', pose: 'look', flip: true, x: 12, y: 80, h: 44, hidden: true }
      ],
      cues: [
        { at: 0.6, id: 'ceChange', anim: 'nod' },
        { l: 0, at: 1.2, id: 'ceBad', show: true, anim: 'hop' },       // 「窗外有一個壞人在偷聽」
        { l: 1, id: 'ceBad', anim: 'wiggle' },                          // 「嘿嘿，仙藥！我想要！」
        { l: 2, id: 'ceBad', anim: 'nod' },                             // 「等后羿出門，我就來拿！」
        { l: 3, id: 'ceBad', hide: true },                              // 「第二天」（背景是晚上，換不了天色）
        { l: 3, at: 0.8, id: 'ceHouyi', show: true },                  // 「后羿出門去了」
        { l: 3, at: 1.0, id: 'ceHouyi', x: -14, y: 96, h: 54, dur: 1.4 }
      ]
    },
    { // 12 傍晚屋裡：壞人踮著腳從門口溜進來要仙藥；嫦娥抱著仙藥往後退，最後打開瓶子吃下去
      bg: 'bg-house-inside.jpg',
      actors: [
        { id: 'ceChange', pose: 'protect', x: 34, y: 96, h: 56 },
        { id: 'ceBad', pose: 'tiptoe', x: 84, y: 80, h: 40 }
      ],
      cues: [
        { id: 'ceBad', x: 72, y: 92, h: 48, dur: 1.4 },               // 從門口溜進來
        { l: 0, at: 0.4, id: 'ceBad', anim: 'wiggle' },                // 「嫦娥，快把仙藥給我！」
        { l: 1, id: 'ceChange', anim: 'wiggle' },                       // 「不行！」
        { l: 2, id: 'ceBad', x: 60, y: 95, h: 50, dur: 2.2 },          // 「壞人越走越近」
        { l: 2, at: 0.6, id: 'ceChange', x: 26, dur: 1.6 },
        { l: 3, id: 'ceChange', anim: 'hop' },                          // 「我要保護仙藥！」
        { l: 4, at: 0.6, fx: 'sparkle', x: 26, y: 50 },               // 「她打開瓶子」
        { l: 4, at: 1.8, id: 'ceChange', anim: 'nod' },                // 「把仙藥吃下去」
        { l: 4, at: 2.0, fx: 'sparkle', id: 'ceChange' }
      ]
    },
    { // 13 傍晚窗前：嫦娥身體變輕慢慢飄起來，回頭說再見；壞人撲空跌一跤跑走；嫦娥飛向月亮
      bg: 'bg-window-dusk-moon.jpg',
      actors: [
        { id: 'ceChange', pose: 'protect', x: 34, y: 96, h: 50 },
        { id: 'ceBad', pose: 'tiptoe', x: 66, y: 96, h: 42 }
      ],
      cues: [
        { at: 0.8, fx: 'sparkle', id: 'ceChange' },                    // 「咦？」
        { l: 0, at: 1.4, id: 'ceChange', pose: 'float', x: 36, y: 76, h: 50, dur: 2.4 },  // 「慢慢飄起來」
        { l: 0, at: 1.8, id: 'ceBad', x: 50, dur: 0.6 },              // 撲過去
        { l: 0, at: 2.4, id: 'ceBad', pose: 'fall', x: 57, y: 97, h: 34, anim: 'wiggle' },
        { l: 1, id: 'ceChange', x: 46, y: 58, h: 44, dur: 3, loop: 'float' },  // 「我飛起來了！后羿，再見！」
        { l: 2, id: 'ceBad', anim: 'wiggle' },                          // 「壞人什麼都沒拿到」
        { l: 2, at: 1.8, id: 'ceBad', pose: 'tiptoe', flip: true, h: 42 },  // 「摸摸鼻子跑走了」
        { l: 2, at: 2.0, id: 'ceBad', x: 116, dur: 1.4 },
        { l: 3, at: 0.8, id: 'ceChange', x: 67, y: 30, h: 18, dur: 2.4 },  // 「就飛到月亮上」：飛到月亮左下（月亮中心 x 71、y 12）
        { l: 3, at: 2.8, fx: 'sparkle', x: 70, y: 17 },
        { l: 3, at: 3.0, id: 'ceChange', hide: true }
      ]
    },
    { // 14 月亮上好安靜：嫦娥坐在桂花樹旁有點寂寞；玉兔搗藥跳出來陪她；一起看地上的家（左上的地球）
      bg: 'bg-moon.jpg',
      actors: [
        { id: 'ceChange', pose: 'sit', x: 40, y: 94, h: 62 },
        { id: 'ceRabbit', pose: 'pound', x: 108, y: 94, h: 30 }
      ],
      cues: [
        { l: 0, at: 1.8, id: 'ceChange', anim: 'nod' },                // 「有一點冷」
        { l: 1, id: 'ceRabbit', x: 72, dur: 1.2 },                     // 「嫦娥姊姊，我是玉兔！」
        { l: 1, at: 1.2, id: 'ceRabbit', anim: 'hop' },
        { l: 2, id: 'ceChange', anim: 'nod' },                          // 「謝謝你，小玉兔」
        { l: 2, at: 0.8, fx: 'hearts', x: 56, y: 50 },
        { l: 3, id: 'ceRabbit', anim: 'hop' },                          // 「一起看看地上的家吧！」
        { l: 3, at: 0.8, fx: 'sparkle', x: 9, y: 9 },
        { l: 4, at: 1.4, fx: 'hearts', x: 56, y: 50 }                 // 「玉兔每天陪著嫦娥」
      ]
    },
    { // 15 后羿回家找不到嫦娥好難過；抬頭看圓月，嫦娥和玉兔在月亮上揮手；后羿說每天陪她看月亮
      bg: 'bg-yard-fullmoon.jpg',
      actors: [
        { id: 'ceHouyi', pose: 'moon', x: 12, y: 74, h: 40 },
        { id: 'ceRabbit', pose: 'wave', x: 51.5, y: 31, h: 18, hidden: true, loop: 'float' }  // 蓋住背景月亮裡自帶的剪影
      ],
      cues: [
        { id: 'ceHouyi', x: 38, y: 96, h: 58, dur: 2.0 },             // 「后羿回到家」
        { l: 0, at: 2.6, id: 'ceHouyi', anim: 'nod' },                 // 「看不到嫦娥，好難過」
        { l: 1, id: 'ceHouyi', pose: 'look', flip: true, anim: 'wiggle' },          // 「嫦娥，你在哪裡？」左右找
        { l: 1, at: 1.0, id: 'ceHouyi', flip: false },
        { l: 2, id: 'ceHouyi', pose: 'moon' },                          // 「抬頭一看」
        { l: 2, at: 1.2, fx: 'sparkle', x: 50, y: 10 },                // 「月亮好圓」
        { l: 2, at: 1.8, id: 'ceRabbit', show: true },                 // 「嫦娥在上面揮手呢！」
        { l: 3, id: 'ceHouyi', anim: 'nod' },                           // 「我每天都陪你看月亮」
        { l: 3, at: 1.2, fx: 'hearts', id: 'ceHouyi' },
        { l: 4, at: 1.2, fx: 'hearts', x: 50, y: 8 }                  // 「也在想念后羿」
      ]
    },
    { // 16 現在的中秋節：一家人在陽台吃月餅、指著圓月亮；月亮裡看得到嫦娥和玉兔；一起說中秋節快樂
      bg: 'bg-balcony.jpg',
      actors: [
        { id: 'ceFamily', pose: 'point', x: 26, y: 99, h: 66 },
        { id: 'ceRabbit', pose: 'wave', x: 51, y: 33, h: 24, hidden: true, loop: 'float' }  // 蓋住背景月亮裡的剪影
      ],
      cues: [
        { l: 0, at: 2.6, fx: 'sparkle', x: 52, y: 14 },               // 「八月十五中秋節，月亮又圓又亮」
        { l: 1, id: 'ceFamily', anim: 'nod' },                          // 「看月亮，吃月餅」
        { l: 1, at: 1.8, fx: 'hearts', id: 'ceFamily' },               // 「想念家人」
        { l: 2, at: 0.6, id: 'ceFamily', anim: 'hop' },                // 「抬頭看」
        { l: 2, at: 1.4, id: 'ceRabbit', show: true },                 // 「看到嫦娥和玉兔喔！」
        { l: 2, at: 1.6, fx: 'sparkle', id: 'ceRabbit' },
        { l: 3, at: 1.6, id: 'ceFamily', anim: 'hop' },                // 「中秋節快樂！」
        { l: 3, at: 1.8, fx: 'hearts', x: 30, y: 30 },
        { l: 4, id: 'ceRabbit', anim: 'hop' },
        { l: 4, at: 0.4, fx: 'sparkle', x: 52, y: 14 }
      ]
    }
  ]
});
