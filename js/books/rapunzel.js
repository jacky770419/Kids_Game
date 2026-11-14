/* 長髮公主：分鏡（手寫）。格式見 js/story-data.js 開頭與 addBook 的說明；文字與時間在 rapunzel-script.js。
   畫圖時避開審查叫「金辮子公主」，故事裡就是長髮公主（rzGirl）。
   方向：公主 point／wow／sing／sit-sing、王子 call／peek／clap／ribbon／sit-sing、巫婆 worry／magic／sit-sing 都朝右；
   公主 hold 朝左（握左邊的人的手）、馬朝左；巫婆 walk-away 是背影往右走。
   塔（bg-tower／bg-tower-night）很細：塔身約 x 22–32，窗口中心 x 27、窗台下緣 y 26.5，塔底 y 79。
   window／dream 兩張是公主連石頭窗台的上半身，窗台對齊塔的窗口（公主比塔口大，像探出頭來）。
   辮子：braid-down 從窗台往下長（y 跟 h 一起變，上緣固定在 y 26）。巫婆 climb 那張自己帶一段比較細的辮子，
   所以第 2 頁 braid-down 只垂到塔身一半、跟 climb 的辮子一樣粗，兩段接起來；巫婆站得比 braid-down 前面（y 比較大）蓋住接縫。 */
StoryData.addBook('rapunzel', {
  color: '#F5C842',
  cover: { bg: 'bg-tower-meadow.jpg', actor: 'rzGirl', pose: 'wow' },
  voices: {
    '長髮公主': { actor: 'rzGirl', color: '#F5C842' },
    '巫婆': { actor: 'rzWitch', color: '#A88BE0' },
    '王子': { actor: 'rzPrince', color: '#F07A6E' }
  },
  sprites: {
    rzGirl: {
      point: { src: 'rapunzel-point.png' },
      wow: { src: 'rapunzel-wow.png' },
      sing: { src: 'rapunzel-sing.png' },
      hold: { src: 'rapunzel-hold.png' },
      sitsing: { src: 'rapunzel-sit-sing.png' },
      // 連窗台的上半身（只放在塔的窗口，h 每頁直接給）
      window: { src: 'rapunzel-window.png' },
      dream: { src: 'rapunzel-dream.png' }
    },
    rzWitch: {
      worry: { src: 'witch-worry.png' },
      magic: { src: 'witch-magic.png' },
      walk: { src: 'witch-walk-away.png' },
      ladder: { src: 'witch-ladder.png' },
      climb: { src: 'witch-climb.png' },
      sitsing: { src: 'witch-sit-sing.png' }
    },
    rzPrince: {
      call: { src: 'prince-call.png' },
      peek: { src: 'prince-peek.png' },
      ride: { src: 'prince-ride.png' },     // 騎著馬（馬在圖裡），朝右
      climb: { src: 'prince-climb.png' },   // 抓著辮子爬（辮子在圖的左邊，粗細照 braid-down）
      clap: { src: 'prince-clap.png' },
      ribbon: { src: 'prince-ribbon.png' },
      sitsing: { src: 'prince-sit-sing.png' }
    },
    rzHorse: { stand: { src: 'horse-brown.png' } },
    rzBirds: { fly: { src: 'birds-yellow.png' } },
    rzBraid: { down: { src: 'braid-down.png' } }
  },
  taps: {
    rzGirl: ['hop', 'hearts'],
    rzWitch: ['nod', 'sparkle'],
    rzPrince: ['hop', 'hearts'],
    rzHorse: ['hop', 'hearts'],
    rzBirds: ['wiggle', 'notes'],
    rzBraid: ['wiggle', 'sparkle']
  },
  pages: [
    { // 1 森林裡好高的塔；最上面的小窗一閃，長髮公主趴在窗台上探出來；小鳥飛過來
      bg: 'bg-tower.jpg',
      actors: [
        { id: 'rzGirl', pose: 'window', x: 28.1, y: 27.6, h: 18, hidden: true },
        { id: 'rzBirds', pose: 'fly', x: 90, y: 34, h: 15, hidden: true, loop: 'float' }
      ],
      cues: [
        { l: 1, at: 3.4, fx: 'sparkle', x: 27, y: 20 },               // 「一扇小窗」
        { l: 2, at: 0.3, id: 'rzGirl', show: true, anim: 'hop' },     // 「塔上住著一個女孩」
        { l: 2, at: 1.9, id: 'rzGirl', anim: 'wiggle' },              // 「頭髮好長，好長」
        { l: 3, id: 'rzBirds', show: true, x: 47, y: 30, dur: 1.8 },
        { l: 3, at: 1.2, fx: 'notes', x: 42, y: 16 },
        { l: 3, at: 1.6, id: 'rzGirl', anim: 'nod' }
      ]
    },
    { // 2 巫婆從右邊走到塔下喊；辮子從窗口放下來，巫婆抓著辮子爬上去
      bg: 'bg-tower.jpg',
      actors: [
        { id: 'rzGirl', pose: 'window', x: 28.1, y: 27.6, h: 18 },
        { id: 'rzBraid', pose: 'down', x: 24.5, y: 27, h: 1, hidden: true, loop: 'still' },
        { id: 'rzWitch', pose: 'walk', flip: true, x: 92, y: 97, h: 40 }
      ],
      cues: [
        { id: 'rzWitch', x: 31, y: 81, h: 36, dur: 2.3 },
        { l: 1, id: 'rzWitch', anim: 'hop' },                          // 「長髮公主，長髮公主」
        { l: 1, at: 3.0, id: 'rzGirl', anim: 'nod' },
        { l: 2, id: 'rzBraid', show: true, y: 54, h: 28, dur: 1.4 },  // 辮子往下放
        { l: 2, at: 1.4, id: 'rzWitch', pose: 'climb', flip: false, x: 19.8, y: 79, h: 38, dur: 0.4 },
        { l: 2, at: 1.9, id: 'rzWitch', y: 64, dur: 2.2 }             // 「巫婆抓著辮子爬上去」
      ]
    },
    { // 3 塔頂房間：公主指著窗外想出去玩，巫婆搖手說不可以
      bg: 'bg-tower-room.jpg',
      actors: [
        { id: 'rzGirl', pose: 'point', x: 32, y: 95, h: 50 },
        { id: 'rzWitch', pose: 'worry', flip: true, x: 70, y: 95, h: 46 }
      ],
      cues: [
        { at: 0.3, id: 'rzGirl', anim: 'hop' },
        { l: 1, id: 'rzWitch', anim: 'wiggle' },                       // 「不可以！」
        { l: 1, at: 3.0, id: 'rzWitch', anim: 'nod' },
        { l: 2, at: 1.6, fx: 'hearts', id: 'rzWitch' }                // 「巫婆很愛她」
      ]
    },
    { // 4 傍晚坐在大窗台上唱歌；小鳥飛來了，可是她好想要一個朋友
      bg: 'bg-tower-window-dusk.jpg',
      actors: [
        { id: 'rzGirl', pose: 'sing', x: 50, y: 84.6, h: 54 },
        { id: 'rzBirds', pose: 'fly', x: 92, y: 26, h: 15, hidden: true, loop: 'float' }
      ],
      cues: [
        { at: 1.2, fx: 'notes', id: 'rzGirl' },
        { l: 1, id: 'rzGirl', anim: 'nod' },
        { l: 1, at: 1.6, fx: 'notes', id: 'rzGirl' },
        { l: 2, id: 'rzBirds', show: true, x: 66, y: 38, h: 17, dur: 1.8 },  // 「小鳥飛來了」
        { l: 2, at: 1.2, fx: 'notes', x: 66, y: 22 },
        { l: 2, at: 2.6, id: 'rzGirl', anim: 'nod' }                  // 「好想要一個朋友」
      ]
    },
    { // 5 王子騎馬從左邊沿著小路走進森林，聽到塔上的歌聲；下馬躲在大橡樹邊偷看，遠遠的巫婆爬上塔
      bg: 'bg-forest-oak.jpg',
      actors: [
        { id: 'rzPrince', pose: 'ride', x: -16, y: 99, h: 48 },
        { id: 'rzHorse', pose: 'stand', x: 62, y: 93, h: 36, hidden: true },
        { id: 'rzWitch', pose: 'climb', x: 85.5, y: 41, h: 9, hidden: true }
      ],
      cues: [
        { id: 'rzPrince', x: 62, y: 93, h: 46, dur: 3 },               // 「王子騎馬經過森林」
        { l: 1, id: 'rzPrince', anim: 'hop' },                          // 「這歌聲真好聽！」
        { l: 1, at: 0.3, fx: 'notes', x: 86, y: 16 },
        { l: 1, at: 1.6, fx: 'notes', x: 84, y: 14 },
        { l: 2, id: 'rzHorse', show: true },                            // 下馬：馬留在原地，王子換成偷看
        { l: 2, id: 'rzPrince', pose: 'peek', x: 46, y: 88, h: 40, dur: 1.4 },  // 「他躲在大樹後面」
        { l: 2, at: 0.3, id: 'rzHorse', x: 22, y: 90, h: 34, dur: 1.6 },
        { l: 2, at: 1.5, id: 'rzWitch', show: true, y: 33, dur: 1.6 } // 「看到巫婆爬上塔」
      ]
    },
    { // 6 晚上：巫婆走遠，王子來到塔下喊；公主在窗口；辮子放下來，王子抓著辮子爬上去
      bg: 'bg-tower-night.jpg',
      actors: [
        { id: 'rzGirl', pose: 'dream', x: 26.9, y: 29, h: 15 },
        { id: 'rzBraid', pose: 'down', x: 24.5, y: 27, h: 1, hidden: true, loop: 'still' },
        { id: 'rzWitch', pose: 'walk', x: 40, y: 92, h: 36 },
        { id: 'rzPrince', pose: 'call', flip: true, x: 108, y: 96, h: 40 }
      ],
      cues: [
        { id: 'rzWitch', x: 62, y: 77, h: 16, dur: 2.4 },             // 「巫婆走了」
        { at: 2.4, id: 'rzWitch', hide: true },
        { at: 1.6, id: 'rzPrince', x: 36, y: 84, h: 36, dur: 2.0 },  // 「王子來到塔下」
        { l: 1, id: 'rzPrince', anim: 'hop' },
        { l: 1, at: 1.0, id: 'rzGirl', anim: 'nod' },
        // 跟第 2 頁一樣：braid-down 垂到塔身一半、跟 prince-climb 的辮子一樣粗，王子站前面蓋住接縫
        { l: 2, id: 'rzBraid', show: true, y: 63, h: 37, dur: 1.4 },  // 「長辮子放下來了」
        { l: 2, at: 1.4, id: 'rzPrince', pose: 'climb', flip: false, x: 28.3, y: 79, h: 34, dur: 0.4 },
        { l: 2, at: 1.8, id: 'rzPrince', y: 64, dur: 1.3 }            // 「王子爬了上去」
      ]
    },
    { // 7 晚上的塔頂房間：公主嚇一跳；王子說喜歡她的歌；公主坐上窗台唱歌，王子坐小凳子拍手
      bg: 'bg-tower-room-night.jpg',
      actors: [
        { id: 'rzGirl', pose: 'wow', x: 36, y: 95, h: 50 },
        { id: 'rzPrince', pose: 'peek', flip: true, x: 68, y: 94, h: 50 }
      ],
      cues: [
        { at: 0.2, id: 'rzGirl', anim: 'hop' },                         // 「啊！」
        { l: 1, id: 'rzPrince', anim: 'nod' },
        { l: 2, at: 0.4, id: 'rzPrince', anim: 'nod' },                 // 「對不起」
        { l: 3, id: 'rzGirl', anim: 'hop' },
        { l: 3, at: 0.8, id: 'rzPrince', pose: 'clap', x: 88, y: 79, h: 44, dur: 1 },
        { l: 3, at: 1.0, id: 'rzGirl', pose: 'sing', x: 62, y: 66, h: 38, dur: 1.2 },
        { l: 4, fx: 'notes', id: 'rzGirl' },
        { l: 4, at: 1.4, id: 'rzPrince', anim: 'hop' },
        { l: 4, at: 2.2, fx: 'notes', id: 'rzGirl' },
        { l: 4, at: 3.4, fx: 'hearts', id: 'rzPrince' }
      ]
    },
    { // 8 白天的塔頂房間：王子拿著絲帶說外面的世界；公主指著窗外想去看；說好一起編梯子
      bg: 'bg-tower-room.jpg',
      actors: [
        { id: 'rzPrince', pose: 'ribbon', x: 26, y: 95, h: 52 },
        { id: 'rzGirl', pose: 'wow', flip: true, x: 54, y: 95, h: 50 }
      ],
      cues: [
        { at: 1.2, id: 'rzPrince', anim: 'hop' },
        { l: 1, at: 0.4, fx: 'sparkle', x: 72, y: 34 },               // 「大河、花田」
        { l: 1, at: 1.6, fx: 'sparkle', x: 66, y: 40 },
        { l: 2, id: 'rzGirl', pose: 'point', flip: false },            // 「我好想去看看」
        { l: 2, at: 2.0, id: 'rzGirl', anim: 'nod' },                  // 「可是，我下不去」
        { l: 3, id: 'rzPrince', anim: 'hop' },
        { l: 3, at: 1.0, id: 'rzGirl', pose: 'wow', flip: true, anim: 'hop' },
        { l: 3, at: 2.0, fx: 'hearts', x: 40, y: 36 }
      ]
    },
    { // 9 巫婆蹲著拿起絲帶梯子；公主蹲在旁邊握著她的手說話
      bg: 'bg-tower-room.jpg',
      actors: [
        { id: 'rzWitch', pose: 'ladder', x: 38, y: 95, h: 40 },
        { id: 'rzGirl', pose: 'wow', flip: true, x: 76, y: 95, h: 50 }
      ],
      cues: [
        { at: 1.6, id: 'rzWitch', anim: 'wiggle' },                     // 「看到了絲帶梯子」
        { l: 1, id: 'rzWitch', anim: 'hop' },
        { l: 2, id: 'rzGirl', pose: 'hold', flip: false, x: 61, y: 95, h: 38, dur: 0.8 },
        { l: 2, at: 1.6, fx: 'hearts', x: 49, y: 50 },                // 「我愛妳」
        { l: 3, id: 'rzGirl', anim: 'nod' },
        { l: 3, at: 1.2, id: 'rzWitch', anim: 'nod' }
      ]
    },
    { // 10 塔頂房間：巫婆紅了眼睛認錯；揮一揮手，地板多了樓梯
      bg: 'bg-tower-room-stairs.jpg',
      actors: [
        { id: 'rzWitch', pose: 'worry', x: 24, y: 95, h: 46 },
        { id: 'rzGirl', pose: 'hold', x: 46, y: 95, h: 38 }
      ],
      cues: [
        { at: 2.2, id: 'rzWitch', anim: 'nod' },                        // 「眼睛紅了」
        { l: 1, at: 3.6, id: 'rzWitch', anim: 'nod' },                  // 「是我錯了」
        { l: 1, at: 4.0, fx: 'hearts', x: 36, y: 50 },
        { l: 2, id: 'rzWitch', pose: 'magic' },                        // 「去吧，孩子」
        { l: 2, at: 0.4, id: 'rzGirl', pose: 'wow', flip: true, x: 85, y: 97, h: 50, dur: 1.2 },
        { l: 3, at: 0.6, id: 'rzWitch', anim: 'hop' },                 // 「揮一揮手」
        { l: 3, at: 0.8, fx: 'sparkle', x: 62, y: 70 },
        { l: 3, at: 1.6, fx: 'sparkle', x: 72, y: 76 },
        { l: 3, at: 2.4, fx: 'sparkle', x: 80, y: 68 },
        { l: 3, at: 2.4, id: 'rzGirl', anim: 'hop' }
      ]
    },
    { // 11 公主從塔下的小門走出來踩草地；王子和巫婆也來了；三個人坐在塔下唱歌
      bg: 'bg-tower-meadow.jpg',
      actors: [
        { id: 'rzGirl', pose: 'point', x: 28.5, y: 79, h: 13 },
        { id: 'rzWitch', pose: 'magic', x: 28.5, y: 79, h: 12, hidden: true },
        { id: 'rzPrince', pose: 'call', flip: true, x: 110, y: 96, h: 48 },
        { id: 'rzBirds', pose: 'fly', x: 108, y: 20, h: 15, hidden: true, loop: 'float' }
      ],
      cues: [
        { at: 0.3, id: 'rzGirl', x: 50, y: 95, h: 48, dur: 2.6 },    // 「走出小門，踩在綠草地上」
        { l: 1, id: 'rzGirl', pose: 'wow', anim: 'hop' },             // 「好軟的草！好香的花！」
        { l: 1, at: 0.4, fx: 'sparkle', id: 'rzGirl' },
        { l: 2, id: 'rzPrince', x: 76, dur: 1.8 },                     // 「她和王子常常回來看巫婆奶奶」
        { l: 2, at: 0.8, id: 'rzWitch', show: true, x: 22, y: 95, h: 44, dur: 1.8 },
        { l: 3, id: 'rzWitch', pose: 'sitsing', x: 25, y: 96, h: 36 },       // 「三個人坐在塔下，一起唱歌」
        { l: 3, id: 'rzGirl', pose: 'sitsing', y: 96, h: 38 },
        { l: 3, id: 'rzPrince', pose: 'sitsing', x: 74, y: 96, h: 40 },
        { l: 3, at: 0.2, id: 'rzBirds', show: true, x: 52, y: 32, dur: 1.6 },
        { l: 3, at: 0.6, fx: 'notes', x: 40, y: 50 },
        { l: 3, at: 1.6, fx: 'notes', x: 62, y: 48 }
      ]
    }
  ]
});
