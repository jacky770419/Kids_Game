/* 食物的旅行：分鏡（手寫）。格式見 js/story-data.js 開頭與 addBook 的說明；文字與時間在 food-journey-script.js。
   小蘋果（fjApple）一個角色包好幾張：bits（咬碎的一群小塊）、brown（變咖啡色）、poop（便便小圓球）都算小蘋果的姿勢，
   這樣「小蘋果」說話時亮的是畫面上那一塊。小宇的 burp 是一個圓相框（框連人一起，第 6 頁「外面的小宇」）。
   小宇的 wash 那張連小板凳一起畫，人只佔圖的約 3/4，所以 k 1.3（人跟其他姿勢一樣大）。牙齒 chomp 是兩顆蹲著的，k 1.25 跟 cheer 一樣大。
   方向：小宇 apple 右手托著蘋果、flush 往右指、wash 面朝前；小蘋果 slide 往右下溜、share 往右遞、bye 身體往右走頭往左揮手；
   胃大叔 point 往右下指；媽媽 smile 往右彎腰。
   背景：餐廳（bg-dining）盤子在 x 75–90、y 55–63，地板 y 70 以下；嘴巴（bg-mouth／spit）舌頭表面約 y 55，上排牙 y 0–17、下排 y 90 以下，
   喉嚨洞口 x 25–75、y 20–52；食道從左上（x 10–30、y 25–40）往右下；胃的兩張：左上 x 12–22、y 7–30 是進來的洞，胃汁／稀飯 y 70 以下，
   bg-stomach-mush 的小門在 x 72–90、y 52–72；大腸中間 y 45 以下是空的；廁所馬桶 x 50–83、y 20–80（沖水把手在水箱右邊 x 78–83、y 39，
   小宇站左邊按不到，就讓他往馬桶指）；洗手台 x 46–78、檯面 y 44、肥皂 x 48–55、y 38–42。
   頁點蓋住畫面最上面 x 24–76、y 0–9：小宇的打嗝相框放右上角（x 69–91、y 10–44）。 */
StoryData.addBook('food-journey', {
  color: '#FF9A8B',
  cover: { bg: 'bg-dining.jpg', actor: 'fjXiaoyu', pose: 'apple' },
  voices: {
    '小宇': { actor: 'fjXiaoyu', color: '#8EC2F5' },
    '小蘋果': { actor: 'fjApple', color: '#FF8F8F' },
    '牙齒': { actor: 'fjTeeth', color: '#FFD27A' },
    '胃': { actor: 'fjStomach', color: '#FFA9CB' },
    '媽媽': { actor: 'fjMom', color: '#94D68C' }
  },
  sprites: {
    // 字幕圓框用第一個姿勢的臉，所以臉在上面、表情普通的 wave 放第一個
    fjXiaoyu: {
      wave: { src: 'xiaoyu-wave.png' },
      hungry: { src: 'xiaoyu-hungry.png' },
      apple: { src: 'xiaoyu-apple.png' },            // 右手托著有小臉的蘋果
      burp: { src: 'xiaoyu-burp.png' },              // 圓相框（黃框白底）裡的上半身
      jump: { src: 'xiaoyu-jump.png' },
      hurry: { src: 'xiaoyu-hurry.png' },
      flush: { src: 'xiaoyu-flush.png' },
      wash: { src: 'xiaoyu-wash.png', k: 1.3 },      // 連小板凳
      clean: { src: 'xiaoyu-clean.png' }
    },
    fjApple: {
      hi: { src: 'apple-hi.png' },
      bits: { src: 'apple-bits.png' },               // 六塊小碎塊在一起打滾
      umbrella: { src: 'apple-umbrella.png' },
      slide: { src: 'apple-slide.png' },
      dizzy: { src: 'apple-dizzy.png' },
      bye: { src: 'apple-bye.png' },
      share: { src: 'apple-share.png' },
      brown: { src: 'apple-brown.png' },
      poop: { src: 'poop-friend.png' }
    },
    fjTeeth: {
      chomp: { src: 'teeth-chomp.png', k: 1.25 },    // 兩顆蹲著用力咬
      cheer: { src: 'teeth-cheer.png' }              // 三顆並排喊口號（很扁：寬是高的 2 倍）
    },
    fjStomach: {
      welcome: { src: 'stomach-welcome.png' },
      shake: { src: 'stomach-shake.png' },
      point: { src: 'stomach-point.png' }
    },
    fjMom: {
      three: { src: 'mom-three.png' },
      smile: { src: 'mom-smile.png', k: 0.9 }
    }
  },
  taps: {
    fjXiaoyu: ['hop', 'hearts'],
    fjApple: ['hop', 'sparkle'],
    fjTeeth: ['hop', 'sparkle'],
    fjStomach: ['wiggle', 'hearts'],
    fjMom: ['nod', 'hearts']
  },
  pages: [
    { // 1 中午的餐廳：小宇肚子餓，走到桌邊；盤子上的小蘋果站起來打招呼；啊嗚，拿起來要咬
      bg: 'bg-dining.jpg',
      actors: [
        { id: 'fjXiaoyu', pose: 'hungry', x: 28, y: 94, h: 56 },
        { id: 'fjApple', pose: 'hi', x: 81, y: 62, h: 18, hidden: true }
      ],
      cues: [
        { l: 0, at: 1.8, id: 'fjXiaoyu', anim: 'wiggle' },             // 「咕嚕」
        { l: 0, at: 2.3, id: 'fjXiaoyu', anim: 'wiggle' },             // 「咕嚕」
        { l: 1, id: 'fjXiaoyu', pose: 'wave', anim: 'hop' },           // 「我要吃蘋果！」
        { l: 1, at: 0.4, id: 'fjXiaoyu', x: 48, dur: 1.2 },
        { l: 2, id: 'fjApple', show: true, anim: 'hop' },              // 「嗨，小宇！」
        { l: 2, at: 0.1, fx: 'sparkle', x: 81, y: 48 },
        { l: 2, at: 2.0, id: 'fjApple', anim: 'hop' },                 // 「身體裡旅行囉」
        { l: 3, id: 'fjApple', x: 58, y: 58, h: 6, dur: 0.4 },        // 「啊嗚！」跳到小宇手上
        { l: 3, at: 0.4, id: 'fjApple', hide: true },
        { l: 3, at: 0.4, id: 'fjXiaoyu', pose: 'apple', anim: 'nod' },
        { l: 3, at: 1.7, id: 'fjXiaoyu', anim: 'hop' }                 // 「進到嘴巴裡」
      ]
    },
    { // 2 嘴巴裡：牙齒士兵喊口號、用力咬，小蘋果變成好多小塊，在舌頭上笑著打滾
      bg: 'bg-mouth.jpg',
      actors: [
        { id: 'fjTeeth', pose: 'cheer', x: 28, y: 80, h: 28 },
        { id: 'fjApple', pose: 'hi', x: 72, y: 84, h: 34 }
      ],
      cues: [
        { l: 0, id: 'fjTeeth', anim: 'hop' },                           // 「我們是牙齒！」
        { l: 0, at: 1.3, id: 'fjTeeth', anim: 'nod' },                 // 「咬一咬」
        { l: 0, at: 1.8, id: 'fjTeeth', anim: 'nod' },
        { l: 1, id: 'fjTeeth', pose: 'chomp', anim: 'wiggle' },        // 「牙齒用力咬」
        { l: 1, at: 0.6, id: 'fjApple', anim: 'wiggle' },
        { l: 1, at: 1.7, id: 'fjApple', pose: 'bits', h: 46, anim: 'hop', dur: 0.3 },  // 「變成好多小塊」
        { l: 1, at: 1.8, fx: 'sparkle', x: 72, y: 60 },
        { l: 2, id: 'fjTeeth', anim: 'hop' },                           // 「前面的牙齒切」
        { l: 2, at: 1.0, id: 'fjTeeth', anim: 'nod' },
        { l: 2, at: 2.6, id: 'fjTeeth', anim: 'wiggle' },              // 「磨碎」
        { l: 3, id: 'fjApple', anim: 'wiggle' },                        // 「哈哈，好癢！」
        { l: 3, at: 0.4, id: 'fjApple', anim: 'wiggle' },
        { l: 3, at: 1.2, id: 'fjApple', h: 38, dur: 0.6 },             // 「我變小了！」
        { l: 3, at: 1.4, fx: 'sparkle', id: 'fjApple' }
      ]
    },
    { // 3 口水像下雨，小蘋果撐葉子當雨傘；舌頭往後一推，溜進喉嚨
      bg: 'bg-mouth-spit.jpg',
      actors: [
        { id: 'fjApple', pose: 'umbrella', x: 50, y: 88, h: 40 }
      ],
      cues: [
        { l: 0, at: 0.3, fx: 'spout', x: 15, y: 28 },                  // 「口水流出來」
        { l: 0, at: 0.6, fx: 'spout', x: 86, y: 28 },
        { l: 0, at: 2.4, id: 'fjApple', anim: 'wiggle' },              // 「變軟，變滑」
        { l: 1, id: 'fjApple', anim: 'hop' },                           // 「哇」
        { l: 1, at: 1.0, fx: 'spout', x: 50, y: 42 },                  // 「好多口水」
        { l: 1, at: 2.4, fx: 'spout', x: 15, y: 28 },                  // 「好像在下雨」
        { l: 1, at: 2.6, fx: 'spout', x: 86, y: 28 },
        { l: 2, at: 0.5, id: 'fjApple', anim: 'nod' },                 // 「也會幫忙」
        { l: 2, at: 1.6, fx: 'sparkle', id: 'fjApple' },               // 「消化食物」
        { l: 3, at: 0.9, id: 'fjApple', pose: 'slide', h: 34, dur: 0.3 },  // 「往後一推」
        { l: 3, at: 1.1, id: 'fjApple', x: 50, y: 50, h: 9, dur: 1.0 },    // 「咕嚕」往喉嚨溜
        { l: 3, at: 2.2, id: 'fjApple', hide: true }                   // 「吞下去了」
      ]
    },
    { // 4 食道：小蘋果從左上的隧道口往右下溜，管子一擠一擠
      bg: 'bg-esophagus.jpg',
      actors: [
        { id: 'fjApple', pose: 'slide', x: 18, y: 46, h: 16 }
      ],
      cues: [
        { l: 0, at: 0.7, id: 'fjApple', x: 36, y: 64, h: 26, dur: 1.4 },  // 「滑進一條管子」
        { l: 0, at: 2.6, fx: 'sparkle', x: 18, y: 32 },                  // 「叫做食道」
        { l: 1, at: 0.3, id: 'fjApple', anim: 'wiggle' },              // 「擠一擠」
        { l: 1, at: 1.0, id: 'fjApple', x: 52, y: 76, h: 34, dur: 1.6 },  // 「往下送」
        { l: 2, id: 'fjApple', anim: 'hop' },                           // 「好像溜滑梯！」
        { l: 2, at: 1.5, id: 'fjApple', x: 68, y: 88, h: 40, dur: 0.5 },  // 「咻！」
        { l: 2, at: 1.6, fx: 'puff', x: 52, y: 70 },
        { l: 3, at: 0.3, id: 'fjApple', anim: 'wiggle' },              // 「一擠」
        { l: 3, at: 1.0, id: 'fjApple', anim: 'wiggle' },              // 「一擠」
        { l: 3, at: 1.6, id: 'fjApple', x: 81, y: 97, h: 42, dur: 0.8 }   // 「往下走！」
      ]
    },
    { // 5 胃的裡面：胃大叔張開手歡迎；小蘋果從左上的洞掉進胃汁，被搖得頭暈
      bg: 'bg-stomach.jpg',
      actors: [
        { id: 'fjStomach', pose: 'welcome', x: 69, y: 84, h: 58, loop: 'float' },
        { id: 'fjApple', pose: 'hi', x: 18, y: 30, h: 14 }
      ],
      cues: [
        { l: 0, at: 0.2, id: 'fjApple', x: 28, y: 82, h: 31, dur: 0.7 },  // 掉進來
        { l: 0, at: 0.9, fx: 'spout', x: 28, y: 72 },
        { l: 0, at: 0.9, id: 'fjApple', loop: 'float' },
        { l: 0, at: 0.2, id: 'fjStomach', anim: 'hop' },               // 「歡迎光臨！」
        { l: 0, at: 1.1, id: 'fjStomach', anim: 'nod' },               // 「我是胃！」
        { l: 1, at: 0.6, fx: 'spout', x: 50, y: 74 },                  // 「流出胃汁」
        { l: 1, at: 1.0, fx: 'spout', x: 40, y: 76 },
        { l: 1, at: 2.2, id: 'fjApple', anim: 'wiggle' },              // 「泡一泡」
        { l: 2, id: 'fjStomach', pose: 'shake', anim: 'wiggle' },      // 「搖一搖，攪一攪！」
        { l: 2, at: 0.1, id: 'fjApple', pose: 'dizzy', anim: 'spin' },
        { l: 2, at: 0.8, id: 'fjStomach', anim: 'wiggle' },
        { l: 2, at: 1.7, id: 'fjStomach', anim: 'wiggle' },
        { l: 2, at: 1.8, id: 'fjApple', anim: 'spin' },
        { l: 2, at: 2.4, id: 'fjStomach', anim: 'wiggle' },
        { l: 3, id: 'fjApple', anim: 'wiggle' },                        // 「哇」
        { l: 3, at: 1.6, id: 'fjApple', anim: 'spin' },                // 「洗衣機」
        { l: 3, at: 3.3, fx: 'sparkle', id: 'fjApple' }                // 「頭好暈」
      ]
    },
    { // 6 食物變成稀飯；胃大叔指著右下的小門，小蘋果揮手走進去；右上的相框：外面的小宇打了一個嗝
      bg: 'bg-stomach-mush.jpg',
      actors: [
        { id: 'fjStomach', pose: 'shake', x: 32, y: 84, h: 54, loop: 'float' },
        { id: 'fjApple', pose: 'dizzy', x: 60, y: 84, h: 28, loop: 'float' },
        { id: 'fjXiaoyu', pose: 'burp', x: 80, y: 50, h: 40, hidden: true }
      ],
      cues: [
        { l: 0, id: 'fjStomach', anim: 'wiggle' },                      // 「搖了好久」
        { l: 0, at: 0.8, id: 'fjStomach', anim: 'wiggle' },
        { l: 0, at: 2.4, id: 'fjApple', pose: 'hi', anim: 'hop' },     // 「像稀飯一樣」
        { l: 1, id: 'fjStomach', pose: 'point', anim: 'nod' },         // 「好了！下一站，小腸！」
        { l: 1, at: 1.8, fx: 'sparkle', x: 81, y: 60 },                // 「小腸」
        { l: 2, id: 'fjApple', pose: 'bye', loop: 'none', anim: 'hop' },  // 「掰掰，胃大叔！」
        { l: 2, at: 0.6, id: 'fjApple', x: 76, y: 72, h: 18, dur: 1.0 },
        { l: 2, at: 1.6, id: 'fjApple', hide: true },
        { l: 3, at: 0.3, id: 'fjXiaoyu', show: true, anim: 'hop' },    // 「外面的小宇」
        { l: 4, id: 'fjXiaoyu', anim: 'wiggle' },                       // 「嗝！」
        { l: 4, at: 0.1, fx: 'puff', x: 88, y: 32 },
        { l: 4, at: 0.7, id: 'fjXiaoyu', anim: 'nod' }                 // 「不好意思！」
      ]
    },
    { // 7 小腸彎來彎去，牆上的小手把金色的營養收走、送到身體各個地方；小蘋果驕傲地分給大家
      bg: 'bg-small-intestine.jpg',
      actors: [
        { id: 'fjApple', pose: 'share', x: 14, y: 94, h: 40 }
      ],
      cues: [
        { l: 0, at: 0.6, id: 'fjApple', x: 38, dur: 2.6 },             // 「彎來彎去」
        { l: 1, at: 0.9, fx: 'sparkle', x: 80, y: 62 },                // 「好多小手」
        { l: 1, at: 1.2, fx: 'sparkle', x: 12, y: 60 },
        { l: 1, at: 2.2, fx: 'sparkle', id: 'fjApple' },               // 「收進身體」
        { l: 2, at: 0.4, fx: 'sparkle', x: 88, y: 28 },                // 「送到身體的每一個地方」
        { l: 2, at: 1.0, fx: 'sparkle', x: 55, y: 22 },
        { l: 2, at: 1.6, fx: 'sparkle', x: 20, y: 30 },
        { l: 3, id: 'fjApple', anim: 'hop' },                           // 「我的營養」
        { l: 3, at: 1.0, fx: 'sparkle', x: 50, y: 72 },                // 「讓小宇有力氣」
        { l: 3, at: 1.8, id: 'fjApple', anim: 'hop' }
      ]
    },
    { // 8 公園：小宇吃飽了跑跑跳跳（肚子上有金色亮點），謝謝小蘋果
      bg: 'bg-park.jpg',
      actors: [
        { id: 'fjXiaoyu', pose: 'jump', x: 34, y: 92, h: 50 }
      ],
      cues: [
        { l: 0, at: 1.4, id: 'fjXiaoyu', x: 46, dur: 0.6 },            // 「跑跑」
        { l: 0, at: 1.7, id: 'fjXiaoyu', anim: 'hop' },                // 「跳跳」
        { l: 0, at: 2.0, id: 'fjXiaoyu', x: 58, dur: 0.6 },
        { l: 0, at: 2.3, id: 'fjXiaoyu', anim: 'hop' },
        { l: 0, at: 3.0, fx: 'sparkle', id: 'fjXiaoyu' },              // 「好有力氣」
        { l: 1, id: 'fjXiaoyu', anim: 'hop' },                          // 「我好有力氣喔！」
        { l: 1, at: 1.8, id: 'fjXiaoyu', anim: 'hop' },                // 「看我跳！」
        { l: 1, at: 1.9, fx: 'sparkle', id: 'fjXiaoyu' },
        { l: 2, id: 'fjXiaoyu', pose: 'wave', h: 54, y: 94, dur: 0.3 },   // 「謝謝你，小蘋果！」
        { l: 2, at: 0.6, fx: 'hearts', id: 'fjXiaoyu' }
      ]
    },
    { // 9 大腸：牆像海綿把水吸走；小蘋果變咖啡色，最後變成便便小圓球
      bg: 'bg-large-intestine.jpg',
      actors: [
        { id: 'fjApple', pose: 'hi', x: -14, y: 92, h: 40 }
      ],
      cues: [
        { l: 0, at: 1.2, id: 'fjApple', x: 50, dur: 2.0 },             // 「用不到的東西來到了大腸」
        { l: 1, at: 0.5, fx: 'spout', x: 12, y: 36 },                  // 「把水吸回去」
        { l: 1, at: 0.8, fx: 'spout', x: 88, y: 40 },
        { l: 1, at: 1.1, fx: 'spout', x: 50, y: 22 },
        { l: 1, at: 2.5, id: 'fjApple', h: 35, dur: 1.2 },             // 「慢慢變成一團」
        { l: 1, at: 3.4, id: 'fjApple', anim: 'wiggle' },
        { l: 2, id: 'fjApple', pose: 'brown', h: 38, anim: 'hop', dur: 0.3 },  // 「咦？」
        { l: 2, at: 1.3, id: 'fjApple', anim: 'wiggle' },              // 「咖啡色了」
        { l: 3, at: 0.7, id: 'fjApple', anim: 'nod' },                 // 「原來」
        { l: 3, at: 1.4, id: 'fjApple', pose: 'poop', h: 32, anim: 'hop', dur: 0.3 },  // 「便便了！」
        { l: 3, at: 1.5, fx: 'sparkle', id: 'fjApple' }
      ]
    },
    { // 10 廁所（只畫一刻）：小宇急著跑來；噗通，便便從馬桶裡探頭揮手；小宇穿好褲子往馬桶指、沖水說再見
      bg: 'bg-toilet.jpg',
      actors: [
        { id: 'fjXiaoyu', pose: 'hurry', x: 14, y: 96, h: 60 },
        { id: 'fjApple', pose: 'poop', x: 61, y: 56, h: 14, hidden: true }
      ],
      cues: [
        { l: 0, id: 'fjXiaoyu', anim: 'wiggle' },                       // 「媽媽，我要上廁所！」
        { l: 0, at: 0.4, id: 'fjXiaoyu', x: 34, dur: 1.2 },
        { l: 0, at: 1.5, id: 'fjXiaoyu', anim: 'wiggle' },
        { l: 1, id: 'fjXiaoyu', hide: true },                           // 「噗通！」
        { l: 1, at: 0.1, fx: 'spout', x: 61, y: 52 },
        { l: 1, at: 0.8, id: 'fjApple', show: true, anim: 'hop' },     // 「便便掉進馬桶裡」
        { l: 1, at: 1.4, id: 'fjXiaoyu', pose: 'flush', show: true },
        { l: 2, id: 'fjApple', anim: 'hop' },                           // 「小宇，再見！」
        { l: 2, at: 0.6, fx: 'hearts', id: 'fjApple' },
        { l: 2, at: 1.6, id: 'fjApple', anim: 'wiggle' },              // 「我的旅行到站了」
        { l: 3, id: 'fjXiaoyu', anim: 'nod' },                          // 「沖水！」
        { l: 3, at: 0.3, fx: 'spout', x: 61, y: 52 },
        { l: 3, at: 0.6, id: 'fjApple', y: 58, h: 3, dur: 0.6 },
        { l: 3, at: 1.2, id: 'fjApple', hide: true },
        { l: 3, at: 1.7, id: 'fjXiaoyu', anim: 'hop' }                 // 「再見！」
      ]
    },
    { // 11 洗手台：媽媽比三根手指提醒三件事；小宇站在小板凳上搓出泡泡，洗乾淨給大家看
      bg: 'bg-sink.jpg',
      actors: [
        { id: 'fjMom', pose: 'three', x: 24, y: 96, h: 64 },
        { id: 'fjXiaoyu', pose: 'wash', x: 60, y: 84, h: 43 }
      ],
      cues: [
        { l: 0, id: 'fjMom', anim: 'nod' },                             // 「小宇，記住三件事喔。」
        { l: 0, at: 1.1, fx: 'sparkle', x: 31, y: 40 },                // 「三件事」
        { l: 1, at: 1.1, id: 'fjMom', anim: 'nod' },                   // 「多咬幾下」
        { l: 1, at: 2.6, id: 'fjMom', anim: 'nod' },                   // 「多喝水」
        { l: 1, at: 2.8, fx: 'sparkle', x: 73, y: 36 },                // 漱口杯
        { l: 2, at: 0.4, id: 'fjMom', anim: 'nod' },                   // 「上完廁所」
        { l: 2, at: 1.5, fx: 'sparkle', x: 51, y: 38 },                // 「肥皂」
        { l: 2, at: 1.8, id: 'fjXiaoyu', anim: 'wiggle' },             // 「洗手」
        { l: 3, id: 'fjMom', pose: 'smile' },                           // 「好！」
        { l: 3, at: 0.2, id: 'fjXiaoyu', anim: 'wiggle' },             // 「搓一搓」
        { l: 3, at: 0.6, id: 'fjXiaoyu', anim: 'wiggle' },
        { l: 3, at: 1.0, id: 'fjXiaoyu', pose: 'clean', x: 62, y: 95, h: 46, dur: 0.3 },  // 「洗乾淨！」跳下板凳
        { l: 3, at: 1.3, id: 'fjXiaoyu', anim: 'hop' },
        { l: 3, at: 1.4, fx: 'sparkle', id: 'fjXiaoyu' },
        { l: 4, at: 0.6, id: 'fjXiaoyu', anim: 'nod' },                // 「你今天吃了什麼呢？」
        { l: 4, at: 1.8, fx: 'hearts', x: 44, y: 40 },                 // 「它也在旅行喔！」
        { l: 4, at: 2.0, id: 'fjMom', anim: 'nod' }
      ]
    }
  ]
});
