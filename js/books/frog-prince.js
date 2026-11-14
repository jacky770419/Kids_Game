/* 青蛙王子：分鏡（手寫）。格式見 js/story-data.js 開頭與 addBook 的說明；文字與時間在 frog-prince-script.js。
   花園（bg-well-garden）：老井在左邊（井口約 x 30、y 52），大樹在右邊，井前和右邊的草地給角色站。
   餐廳（bg-dining）：長桌橫在畫面中左（桌面約 y 54），右邊是門（門底約 x 87、y 60）；角色都站／坐在桌子前面的地板上。
   方向：公主 cry／point／throw／welcome、王子 bow／catch 都朝右；青蛙 tilt／call、舔豆子的舌頭朝左；
   國王、公主嘟嘴（pout）連椅子一起畫，國王拍手（clap）連白長椅一起畫，放在背景的長椅上。
   打勾勾（pinky-promise）是公主和坐在石頭上的青蛙合成一張。 */
StoryData.addBook('frog-prince', {
  color: '#9ED86A',
  cover: { bg: 'bg-well-bloom.jpg', actor: 'fpPromise', pose: 'promise' },
  voices: {
    '公主': { actor: 'fpPrincess', color: '#F7A8C8' },
    '青蛙': { actor: 'fpFrog', color: '#9ED86A' },
    '國王': { actor: 'fpKing', color: '#E8B04A' },
    '王子': { actor: 'fpPrince', color: '#7CC08A' }
  },
  sprites: {
    fpPrincess: {
      welcome: { src: 'princess-welcome.png' },      // 第一個姿勢＝字幕圓框裡的臉
      point: { src: 'princess-point.png' },
      toss: { src: 'princess-toss.png' },
      cry: { src: 'princess-cry.png', k: 0.78 },
      run: { src: 'princess-run-ball.png' },
      pout: { src: 'princess-pout.png', k: 0.86 },   // 連紅椅子
      shy: { src: 'princess-shy.png' },
      giggle: { src: 'princess-giggle.png' },
      pj: { src: 'princess-pj.png', k: 0.8 },
      wow: { src: 'princess-wow.png' },
      throw: { src: 'princess-throw.png' },
      lean: { src: 'princess-lean.png' }              // 彎腰往前看（第 4 頁青蛙跳進井裡之後）
    },
    fpFrog: {
      tilt: { src: 'frog-tilt.png', left: true },
      call: { src: 'frog-call.png', left: true },
      feet: { src: 'frog-feet.png' },                 // 只有兩隻腳（門縫底下）
      tongue: { src: 'frog-tongue.png', left: true },  // 連盤子
      pillow: { src: 'frog-pillow.png' },              // 連枕頭
      glow: { src: 'frog-glow.png' }
    },
    fpKing: {
      smile: { src: 'king-smile.png' },                // 第一個姿勢＝字幕圓框裡的臉
      eat: { src: 'king-eat.png' },                    // 連紅椅子
      gentle: { src: 'king-gentle.png' },              // 連紅椅子
      clap: { src: 'king-clap.png' }                   // 連白長椅
    },
    fpPrince: {
      bow: { src: 'prince-bow.png' },
      catch: { src: 'prince-catch.png' }
    },
    // 公主跟坐在石頭上的青蛙打勾勾（同一張圖）
    fpPromise: { promise: { src: 'pinky-promise.png' } },
    fpBall: { splash: { src: 'ball-splash.png' } },
    fpBirds: { perch: { src: 'birds.png' } }
  },
  taps: {
    fpFrog: ['hop', 'notes'],
    fpBall: ['wiggle', 'sparkle'],
    fpPrince: ['nod', 'sparkle'],
    fpBirds: ['wiggle', 'notes'],
    fpPromise: ['nod', 'hearts']
  },
  pages: [
    { // 1 公主在花園的井邊丟金球；樹上兩隻小鳥
      bg: 'bg-well-garden.jpg',
      actors: [
        { id: 'fpBirds', pose: 'perch', x: 84, y: 30, h: 14 },
        { id: 'fpPrincess', pose: 'toss', x: 56, y: 95, h: 54 }
      ],
      cues: [
        { l: 1, at: 0.8, id: 'fpPrincess', anim: 'hop' },
        { l: 1, at: 1.0, fx: 'sparkle', x: 56, y: 42 },
        { l: 2, id: 'fpPrincess', anim: 'wiggle' },
        { l: 2, at: 1.2, fx: 'hearts', id: 'fpPrincess' },
        { l: 2, at: 0.6, id: 'fpBirds', anim: 'hop' },
        { l: 3, id: 'fpPrincess', x: 48, dur: 1.6 },
        { l: 3, at: 1.8, id: 'fpPrincess', anim: 'hop' },
        { l: 3, at: 2.0, fx: 'sparkle', x: 48, y: 42 }
      ]
    },
    { // 2 往井裡看：咚！金球掉進水裡；公主跪在井邊（左下）伸手大哭
      bg: 'bg-well-down.jpg',
      actors: [
        { id: 'fpBall', pose: 'splash', x: 50, y: 68, h: 18, hidden: true },
        { id: 'fpPrincess', pose: 'cry', x: 18, y: 101, h: 54 }
      ],
      cues: [
        { l: 1, at: 0.3, id: 'fpBall', show: true, anim: 'hop' },
        { l: 1, at: 0.3, fx: 'spout', x: 50, y: 60 },
        { l: 2, id: 'fpPrincess', anim: 'wiggle' },
        { l: 2, at: 1.8, id: 'fpPrincess', anim: 'wiggle' },
        { l: 3, id: 'fpBall', anim: 'wiggle' }
      ]
    },
    { // 3 青蛙從井邊跳出來；公主一邊擦眼淚、一邊指著井
      bg: 'bg-well-garden.jpg',
      actors: [
        { id: 'fpPrincess', pose: 'cry', x: 50, y: 92, h: 52 },
        { id: 'fpFrog', pose: 'tilt', x: 36, y: 64, h: 10, hidden: true }
      ],
      cues: [
        { l: 0, at: 1.6, id: 'fpFrog', show: true, anim: 'hop' },
        { l: 0, at: 2.0, id: 'fpFrog', x: 70, y: 90, h: 20, dur: 1.2 },
        { l: 1, id: 'fpFrog', anim: 'hop' },
        { l: 2, id: 'fpPrincess', pose: 'point' },
        { l: 3, id: 'fpFrog', anim: 'hop' },
        { l: 3, at: 0.8, fx: 'sparkle', id: 'fpFrog' }
      ]
    },
    { // 4 青蛙要公主答應做朋友：打勾勾（只畫這一刻）；最後一句青蛙跳進井裡：
      //   打勾勾換成只有公主彎腰（轉身朝左看井），井口濺水
      bg: 'bg-well-garden.jpg',
      actors: [
        { id: 'fpPromise', pose: 'promise', x: 62, y: 93, h: 52 },
        { id: 'fpPrincess', pose: 'lean', flip: true, x: 54, y: 93, h: 48, hidden: true }
      ],
      cues: [
        { l: 1, id: 'fpPromise', anim: 'wiggle' },
        { l: 2, id: 'fpPromise', anim: 'nod' },
        { l: 2, at: 0.9, id: 'fpPromise', anim: 'nod' },
        { l: 2, at: 1.2, fx: 'hearts', x: 66, y: 50 },
        { l: 3, at: 0.6, id: 'fpPromise', hide: true },
        { l: 3, at: 0.6, id: 'fpPrincess', show: true },
        { l: 3, at: 0.8, fx: 'spout', x: 30, y: 50 },
        { l: 3, at: 1.2, id: 'fpPrincess', anim: 'wiggle' }
      ]
    },
    { // 5 青蛙把金球頂上井口；公主抱著球往左跑走；青蛙濕濕地在井邊喊她
      bg: 'bg-well-garden.jpg',
      actors: [
        { id: 'fpBall', pose: 'splash', x: 30, y: 54, h: 13, hidden: true },
        { id: 'fpFrog', pose: 'call', x: 50, y: 78, h: 20, hidden: true },
        { id: 'fpPrincess', pose: 'cry', flip: true, x: 72, y: 93, h: 52 }
      ],
      cues: [
        { l: 0, at: 1.6, id: 'fpBall', show: true, anim: 'hop' },
        { l: 0, at: 1.6, fx: 'spout', x: 30, y: 46 },
        { l: 0, at: 2.4, id: 'fpFrog', show: true, anim: 'hop' },
        { l: 1, id: 'fpBall', hide: true },
        { l: 1, id: 'fpPrincess', pose: 'run', flip: false, anim: 'hop' },
        { l: 1, at: 0.3, fx: 'sparkle', id: 'fpPrincess' },
        { l: 2, at: 0.4, id: 'fpPrincess', x: -20, y: 96, dur: 2.6 },
        { l: 3, id: 'fpFrog', anim: 'wiggle' },
        { l: 3, at: 1.0, id: 'fpFrog', x: 45, y: 84, h: 22, dur: 1.4 },
        { l: 4, at: 0.4, id: 'fpFrog', anim: 'wiggle' }
      ]
    },
    { // 6 晚上的餐廳：國王和公主坐著吃飯；咚咚！門縫底下露出青蛙的腳
      bg: 'bg-dining.jpg',
      actors: [
        { id: 'fpKing', pose: 'eat', x: 26, y: 97, h: 52 },
        { id: 'fpPrincess', pose: 'pout', x: 56, y: 97, h: 50 },
        { id: 'fpFrog', pose: 'feet', x: 87, y: 61, h: 8, hidden: true }
      ],
      cues: [
        { l: 0, at: 1.0, id: 'fpKing', anim: 'nod' },
        { l: 1, id: 'fpFrog', show: true },
        { l: 1, at: 0.2, id: 'fpFrog', anim: 'hop' },
        { l: 1, at: 1.4, id: 'fpFrog', anim: 'hop' },
        { l: 1, at: 1.0, id: 'fpKing', anim: 'wiggle' },
        { l: 2, id: 'fpFrog', anim: 'hop' },
        { l: 3, id: 'fpFrog', anim: 'wiggle' },
        { l: 4, id: 'fpPrincess', anim: 'wiggle' },
        { l: 4, at: 1.4, id: 'fpPrincess', anim: 'wiggle' }
      ]
    },
    { // 7 國王放下湯匙跟公主講道理；公主站起來，不好意思地點頭；青蛙還在門外
      bg: 'bg-dining.jpg',
      actors: [
        { id: 'fpKing', pose: 'gentle', x: 26, y: 97, h: 52 },
        { id: 'fpPrincess', pose: 'pout', x: 56, y: 97, h: 50 },
        { id: 'fpFrog', pose: 'feet', x: 87, y: 61, h: 8 }
      ],
      cues: [
        { l: 0, id: 'fpKing', anim: 'nod' },
        { l: 1, id: 'fpPrincess', pose: 'shy', x: 58, y: 96, h: 54 },
        { l: 2, id: 'fpKing', anim: 'nod' },
        { l: 3, id: 'fpKing', anim: 'nod' },
        { l: 3, at: 1.6, id: 'fpFrog', anim: 'hop' },
        { l: 4, id: 'fpPrincess', anim: 'nod' },
        { l: 4, at: 0.8, fx: 'hearts', x: 42, y: 40 }
      ]
    },
    { // 8 公主開門請青蛙進來；青蛙坐到桌上的盤子邊，伸舌頭吃豆子；國王摸鬍子笑
      bg: 'bg-dining.jpg',
      actors: [
        { id: 'fpKing', pose: 'smile', x: 16, y: 96, h: 52 },
        { id: 'fpPrincess', pose: 'welcome', x: 62, y: 96, h: 54 },
        { id: 'fpFrog', pose: 'tilt', x: 88, y: 62, h: 10, hidden: true }
      ],
      cues: [
        { l: 0, at: 1.2, id: 'fpFrog', show: true, anim: 'hop' },
        { l: 0, at: 1.8, id: 'fpFrog', x: 80, y: 80, h: 14, dur: 1.0 },
        { l: 1, id: 'fpFrog', x: 49, y: 56, h: 13, dur: 1.4 },
        { l: 1, at: 0.4, id: 'fpPrincess', x: 68, dur: 1.2 },
        { l: 1, at: 1.6, id: 'fpPrincess', pose: 'giggle' },
        { l: 2, id: 'fpFrog', pose: 'tongue', h: 18 },
        { l: 2, at: 0.6, fx: 'notes', id: 'fpFrog' },
        { l: 3, at: 0.6, id: 'fpFrog', anim: 'wiggle' },
        { l: 3, at: 1.2, fx: 'sparkle', x: 44, y: 50 },
        { l: 4, id: 'fpPrincess', anim: 'hop' },
        { l: 4, at: 0.6, fx: 'hearts', id: 'fpPrincess' },
        { l: 4, at: 0.4, id: 'fpKing', anim: 'nod' }
      ]
    },
    { // 9 公主的臥室：青蛙睏了，公主拿小枕頭放在床邊，蹲下來跟牠說晚安
      bg: 'bg-bedroom.jpg',
      actors: [
        { id: 'fpPrincess', pose: 'pj', x: 46, y: 94, h: 54 },
        { id: 'fpFrog', pose: 'tilt', x: 67, y: 83, h: 17 }
      ],
      cues: [
        { l: 0, id: 'fpFrog', anim: 'wiggle' },
        { l: 1, at: 1.6, id: 'fpFrog', pose: 'pillow', h: 21, anim: 'hop' },
        { l: 2, id: 'fpPrincess', anim: 'nod' },
        { l: 3, id: 'fpPrincess', anim: 'nod' },
        { l: 3, at: 2.0, fx: 'zzz', id: 'fpFrog' },
        { l: 4, at: 0.2, fx: 'hearts', x: 56, y: 50 }
      ]
    },
    { // 10 金光一閃，青蛙變成王子；背景中間有一顆大金星閃光（約 x 50、y 58），青蛙和王子都站在閃光正中間
      bg: 'bg-bedroom-glow.jpg',
      actors: [
        { id: 'fpPrincess', pose: 'pj', x: 20, y: 94, h: 54 },
        { id: 'fpFrog', pose: 'glow', x: 50, y: 76, h: 26 },
        { id: 'fpPrince', pose: 'bow', flip: true, x: 50, y: 96, h: 60, hidden: true }
      ],
      cues: [
        { l: 0, at: 1.2, fx: 'sparkle', id: 'fpFrog' },
        { l: 0, at: 1.4, id: 'fpFrog', anim: 'spin' },
        { l: 0, at: 2.6, fx: 'sparkle', id: 'fpFrog' },
        { l: 1, id: 'fpFrog', hide: true },
        { l: 1, id: 'fpPrince', show: true, anim: 'hop' },
        { l: 1, at: 0.1, fx: 'sparkle', x: 50, y: 50 },
        { l: 1, at: 0.3, id: 'fpPrincess', pose: 'wow', anim: 'hop' },
        { l: 2, id: 'fpPrince', anim: 'nod' },
        { l: 3, id: 'fpPrincess', anim: 'wiggle' },
        { l: 4, id: 'fpPrince', anim: 'nod' },
        { l: 4, at: 1.6, fx: 'sparkle', x: 50, y: 40 }
      ]
    },
    { // 11 花開滿了：國王坐在長椅上拍手；公主和王子在井邊丟金球玩
      bg: 'bg-well-bloom.jpg',
      actors: [
        { id: 'fpBirds', pose: 'perch', x: 84, y: 30, h: 14 },
        { id: 'fpKing', pose: 'clap', x: 68, y: 66, h: 32 },
        { id: 'fpPrincess', pose: 'giggle', x: 34, y: 96, h: 52 },
        { id: 'fpPrince', pose: 'bow', flip: true, x: 87, y: 97, h: 56 }
      ],
      cues: [
        { l: 0, id: 'fpKing', anim: 'hop' },
        { l: 0, at: 0.6, fx: 'hearts', id: 'fpKing' },
        { l: 1, id: 'fpPrince', anim: 'nod' },
        { l: 1, at: 1.2, id: 'fpPrincess', anim: 'hop' },
        { l: 2, at: 0.6, id: 'fpPrincess', pose: 'throw' },
        { l: 2, at: 1.4, id: 'fpPrincess', pose: 'giggle' },
        { l: 2, at: 1.4, id: 'fpPrince', pose: 'catch', anim: 'hop' },
        { l: 2, at: 1.6, id: 'fpBirds', anim: 'hop' },
        { l: 3, id: 'fpPrincess', pose: 'toss', anim: 'hop' },
        { l: 3, at: 0.2, id: 'fpPrince', pose: 'bow' },
        { l: 4, at: 0.6, id: 'fpKing', anim: 'hop' },
        { l: 4, at: 1.0, fx: 'hearts', x: 58, y: 40 },
        { l: 4, at: 2.0, id: 'fpPrincess', anim: 'hop' },
        { l: 4, at: 2.2, id: 'fpPrince', anim: 'hop' },
        { l: 4, at: 2.6, fx: 'sparkle', x: 50, y: 36 }
      ]
    }
  ]
});
