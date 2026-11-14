/* 有聲故事書的手寫資料：注音表、角色的圖、每一頁的分鏡（誰站哪裡、哪一句話時做什麼）。
   文字、誰說、時間在 js/story-script.js（由 tools/tts/build_story.py 從錄音產生），兩邊用故事 id 和頁碼對起來。

   座標一律是舞台的百分比（舞台固定 3:2）：
     x  角色腳底中心的水平位置（0＝左邊、100＝右邊）
     y  腳底的垂直位置（0＝上緣、100＝下緣）
     h  角色的高度佔舞台高度的百分比（站姿為準；坐、睡的姿勢在 SPRITES 用 k 縮小）

   分鏡 cues 每一筆：
     l     第幾句開始時觸發（0 起算；不寫＝這一頁一開始）
     at    再晚幾秒（可省略）
     id    哪個角色；下面幾個欄位都是可省略的動作：
       pose   換姿勢          x／y／h＋dur  用 dur 秒移到那裡（移動中自動加走路的搖晃）
       flip   true＝左右翻面  anim  做一次的小動作：hop／wiggle／nod／spin
       loop   持續的動作：float／sway／none      show／hide  出現／消失
       glow   小星星的亮度：dim／glow／bright
       loop 寫在 actors 裡＝一開始就有的持續動作；房子這種道具寫 loop: 'still'（不要呼吸）
     fx    特效：hearts／notes／sparkle／spout／puff（往右吹的風）／zzz；位置用 id（那個角色的頭上）或 x、y
     tint  換整個畫面的色調：day／sunset／night */
(function (global) {
  'use strict';

  /* 字幕的注音。她不識漢字、認注音，所以每個字旁邊都要有。
     一字一音查 ZY；讀音跟著詞變的（輕聲、破音字）寫在 ZY_PHRASES，整詞優先。
     新故事用到表裡沒有的字，tools/check_story.js 會擋下來。 */
  var ZY = {
    '一': 'ㄧ', '三': 'ㄙㄢ', '上': 'ㄕㄤˋ', '下': 'ㄒㄧㄚˋ', '不': 'ㄅㄨˋ', '主': 'ㄓㄨˇ', '也': 'ㄧㄝˇ', '了': '˙ㄌㄜ',
    '亮': 'ㄌㄧㄤˋ', '今': 'ㄐㄧㄣ', '他': 'ㄊㄚ', '以': 'ㄧˇ', '伸': 'ㄕㄣ', '住': 'ㄓㄨˋ', '你': 'ㄋㄧˇ', '來': 'ㄌㄞˊ',
    '個': 'ㄍㄜˋ', '們': '˙ㄇㄣ', '候': 'ㄏㄡˋ', '光': 'ㄍㄨㄤ', '全': 'ㄑㄩㄢˊ', '兩': 'ㄌㄧㄤˇ', '公': 'ㄍㄨㄥ', '出': 'ㄔㄨ',
    '到': 'ㄉㄠˋ', '前': 'ㄑㄧㄢˊ', '加': 'ㄐㄧㄚ', '去': 'ㄑㄩˋ', '友': 'ㄧㄡˇ', '叢': 'ㄘㄨㄥˊ', '可': 'ㄎㄜˇ', '吧': '˙ㄅㄚ',
    '呀': '˙ㄧㄚ', '呢': '˙ㄋㄜ', '呱': 'ㄍㄨㄚ', '和': 'ㄏㄢˋ', '哇': 'ㄨㄚ', '哎': 'ㄞ', '唱': 'ㄔㄤˋ', '喔': 'ㄛ',
    '嘻': 'ㄒㄧ', '囉': '˙ㄌㄨㄛ', '回': 'ㄏㄨㄟˊ', '園': 'ㄩㄢˊ', '在': 'ㄗㄞˋ', '地': '˙ㄉㄜ', '城': 'ㄔㄥˊ', '堡': 'ㄅㄠˇ',
    '多': 'ㄉㄨㄛ', '夜': 'ㄧㄝˋ', '大': 'ㄉㄚˋ', '天': 'ㄊㄧㄢ', '太': 'ㄊㄞˋ', '她': 'ㄊㄚ', '好': 'ㄏㄠˇ', '它': 'ㄊㄚ',
    '安': 'ㄢ', '家': 'ㄐㄧㄚ', '對': 'ㄉㄨㄟˋ', '小': 'ㄒㄧㄠˇ', '尖': 'ㄐㄧㄢ', '山': 'ㄕㄢ', '岸': 'ㄢˋ', '帶': 'ㄉㄞˋ',
    '幫': 'ㄅㄤ', '張': 'ㄓㄤ', '彎': 'ㄨㄢ', '彩': 'ㄘㄞˇ', '得': '˙ㄉㄜ', '從': 'ㄘㄨㄥˊ', '心': 'ㄒㄧㄣ', '忽': 'ㄏㄨ',
    '怎': 'ㄗㄣˇ', '怕': 'ㄆㄚˋ', '悄': 'ㄑㄧㄠˇ', '想': 'ㄒㄧㄤˇ', '懶': 'ㄌㄢˇ', '我': 'ㄨㄛˇ', '戶': 'ㄏㄨˋ', '手': 'ㄕㄡˇ',
    '把': 'ㄅㄚˇ', '抱': 'ㄅㄠˋ', '指': 'ㄓˇ', '捧': 'ㄆㄥˇ', '掉': 'ㄉㄧㄠˋ', '換': 'ㄏㄨㄢˋ', '數': 'ㄕㄨˇ', '早': 'ㄗㄠˇ',
    '星': 'ㄒㄧㄥ', '是': 'ㄕˋ', '時': 'ㄕˊ', '晚': 'ㄨㄢˇ', '暗': 'ㄢˋ', '更': 'ㄍㄥˋ', '最': 'ㄗㄨㄟˋ', '有': 'ㄧㄡˇ',
    '朋': 'ㄆㄥˊ', '服': 'ㄈㄨˊ', '根': 'ㄍㄣ', '棒': 'ㄅㄤˋ', '歌': 'ㄍㄜ', '每': 'ㄇㄟˇ', '比': 'ㄅㄧˇ', '沒': 'ㄇㄟˊ',
    '海': 'ㄏㄞˇ', '游': 'ㄧㄡˊ', '然': 'ㄖㄢˊ', '熊': 'ㄒㄩㄥˊ', '獨': 'ㄉㄨˊ', '獸': 'ㄕㄡˋ', '癢': 'ㄧㄤˇ', '的': '˙ㄉㄜ',
    '眨': 'ㄓㄚˇ', '眼': 'ㄧㄢˇ', '睛': 'ㄐㄧㄥ', '睡': 'ㄕㄨㄟˋ', '碰': 'ㄆㄥˋ', '空': 'ㄎㄨㄥ', '窗': 'ㄔㄨㄤ', '給': 'ㄍㄟˇ',
    '緊': 'ㄐㄧㄣˇ', '聽': 'ㄊㄧㄥ', '腰': 'ㄧㄠ', '腳': 'ㄐㄧㄠˇ', '臉': 'ㄌㄧㄢˇ', '舉': 'ㄐㄩˇ', '舒': 'ㄕㄨ', '花': 'ㄏㄨㄚ',
    '著': '˙ㄓㄜ', '虹': 'ㄏㄨㄥˊ', '蛙': 'ㄨㄚ', '裡': 'ㄌㄧˇ', '要': 'ㄧㄠˋ', '見': 'ㄐㄧㄢˋ', '角': 'ㄐㄧㄠˇ', '誰': 'ㄕㄟˊ',
    '謝': 'ㄒㄧㄝˋ', '變': 'ㄅㄧㄢˋ', '貼': 'ㄊㄧㄝ', '走': 'ㄗㄡˇ', '起': 'ㄑㄧˇ', '趴': 'ㄆㄚ', '跑': 'ㄆㄠˇ', '跳': 'ㄊㄧㄠˋ',
    '踮': 'ㄉㄧㄢˇ', '躺': 'ㄊㄤˇ', '輕': 'ㄑㄧㄥ', '這': 'ㄓㄜˋ', '進': 'ㄐㄧㄣˋ', '遇': 'ㄩˋ', '過': 'ㄍㄨㄛˋ', '還': 'ㄏㄞˊ',
    '邊': 'ㄅㄧㄢ', '那': 'ㄋㄚˋ', '部': 'ㄅㄨˋ', '都': 'ㄉㄡ', '醒': 'ㄒㄧㄥˇ', '長': 'ㄔㄤˊ', '閃': 'ㄕㄢˇ', '開': 'ㄎㄞ',
    '陽': 'ㄧㄤˊ', '雲': 'ㄩㄣˊ', '青': 'ㄑㄧㄥ', '靜': 'ㄐㄧㄥˋ', '面': 'ㄇㄧㄢˋ', '頭': 'ㄊㄡˊ', '頸': 'ㄐㄧㄥˇ', '顆': 'ㄎㄜ',
    '飛': 'ㄈㄟ', '高': 'ㄍㄠ', '魚': 'ㄩˊ', '鯨': 'ㄐㄧㄥ', '鹿': 'ㄌㄨˋ', '麼': '˙ㄇㄜ', '點': 'ㄉㄧㄢˇ',
    // 龜兔賽跑、三隻小豬
    '久': 'ㄐㄧㄡˇ', '倒': 'ㄉㄠˇ', '停': 'ㄊㄧㄥˊ', '偷': 'ㄊㄡ', '備': 'ㄅㄟˋ', '先': 'ㄒㄧㄢ', '兔': 'ㄊㄨˋ', '再': 'ㄗㄞˋ',
    '力': 'ㄌㄧˋ', '動': 'ㄉㄨㄥˋ', '厲': 'ㄌㄧˋ', '吵': 'ㄔㄠˇ', '吹': 'ㄔㄨㄟ', '呼': 'ㄏㄨ', '命': 'ㄇㄧㄥˋ', '哈': 'ㄏㄚ',
    '哥': 'ㄍㄜ', '啊': '˙ㄚ', '垂': 'ㄔㄨㄟˊ', '塊': 'ㄎㄨㄞˋ', '妳': 'ㄋㄧˇ', '妹': 'ㄇㄟˋ', '始': 'ㄕˇ', '子': '˙ㄗ',
    '定': 'ㄉㄧㄥˋ', '害': 'ㄏㄞˋ', '就': 'ㄐㄧㄡˋ', '尾': 'ㄨㄟˇ', '屋': 'ㄨ', '己': 'ㄐㄧˇ', '已': 'ㄧˇ', '巴': '˙ㄅㄚ',
    '很': 'ㄏㄣˇ', '快': 'ㄎㄨㄞˋ', '慢': 'ㄇㄢˋ', '房': 'ㄈㄤˊ', '拼': 'ㄆㄧㄣ', '搬': 'ㄅㄢ', '整': 'ㄓㄥˇ', '方': 'ㄈㄤ',
    '會': 'ㄏㄨㄟˋ', '木': 'ㄇㄨˋ', '樹': 'ㄕㄨˋ', '橋': 'ㄑㄧㄠˊ', '次': 'ㄘˋ', '步': 'ㄅㄨˋ', '氣': 'ㄑㄧˋ', '烏': 'ㄨ',
    '牢': 'ㄌㄠˊ', '狼': 'ㄌㄤˊ', '玩': 'ㄨㄢˊ', '用': 'ㄩㄥˋ', '疊': 'ㄉㄧㄝˊ', '看': 'ㄎㄢˋ', '真': 'ㄓㄣ', '磚': 'ㄓㄨㄢ',
    '稻': 'ㄉㄠˋ', '糕': 'ㄍㄠ', '糟': 'ㄗㄠ', '紅': 'ㄏㄨㄥˊ', '經': 'ㄐㄧㄥ', '自': 'ㄗˋ', '草': 'ㄘㄠˇ', '蓋': 'ㄍㄞˋ',
    '豬': 'ㄓㄨ', '賽': 'ㄙㄞˋ', '贏': 'ㄧㄥˊ', '趕': 'ㄍㄢˇ', '身': 'ㄕㄣ', '遠': 'ㄩㄢˇ', '野': 'ㄧㄝˇ', '門': 'ㄇㄣˊ',
    '隻': 'ㄓ', '靠': 'ㄎㄠˋ', '預': 'ㄩˋ', '齊': 'ㄑㄧˊ', '龜': 'ㄍㄨㄟ',
    // 拔蘿蔔、獅子和老鼠
    '午': 'ㄨˇ', '吃': 'ㄔ', '咚': 'ㄉㄨㄥ', '咬': 'ㄧㄠˇ', '咻': 'ㄒㄧㄡ', '唰': 'ㄕㄨㄚ', '啵': 'ㄅㄛ', '啾': 'ㄐㄧㄡ',
    '喵': 'ㄇㄧㄠ', '嘿': 'ㄏㄟ', '女': 'ㄋㄩˇ', '奶': 'ㄋㄞˇ', '孫': 'ㄙㄨㄣ', '幾': 'ㄐㄧˇ', '忙': 'ㄇㄤˊ', '意': 'ㄧˋ',
    '成': 'ㄔㄥˊ', '抓': 'ㄓㄨㄚ', '拉': 'ㄌㄚ', '拔': 'ㄅㄚˊ', '故': 'ㄍㄨˋ', '散': 'ㄙㄢˋ', '林': 'ㄌㄧㄣˊ', '森': 'ㄙㄣ',
    '汪': 'ㄨㄤ', '洞': 'ㄉㄨㄥˋ', '湯': 'ㄊㄤ', '煮': 'ㄓㄨˇ', '爺': 'ㄧㄝˊ', '牙': 'ㄧㄚˊ', '狗': 'ㄍㄡˇ', '獅': 'ㄕ',
    '破': 'ㄆㄛˋ', '種': 'ㄓㄨㄥˋ', '笑': 'ㄒㄧㄠˋ', '網': 'ㄨㄤˇ', '罩': 'ㄓㄠˋ', '老': 'ㄌㄠˇ', '能': 'ㄋㄥˊ', '菜': 'ㄘㄞˋ',
    '葉': 'ㄧㄝˋ', '蔔': 'ㄅㄛˊ', '蘿': 'ㄌㄨㄛˊ', '覺': 'ㄐㄩㄝˊ', '請': 'ㄑㄧㄥˇ', '讓': 'ㄖㄤˋ', '貓': 'ㄇㄠ', '鍋': 'ㄍㄨㄛ',
    '鼠': 'ㄕㄨˇ', '鼻': 'ㄅㄧˊ', '齒': 'ㄔˇ',
    // 新書第一批：北風與太陽、小熊不想睡覺、小水滴的旅行、十二生肖的故事、灰姑娘（一字一音照教育部國語辭典）
    '七': 'ㄑㄧ', '且': 'ㄑㄧㄝˇ', '九': 'ㄐㄧㄡˇ', '亂': 'ㄌㄨㄢˋ', '事': 'ㄕˋ', '二': 'ㄦˋ', '五': 'ㄨˇ', '人': 'ㄖㄣˊ',
    '什': 'ㄕㄣˊ', '仙': 'ㄒㄧㄢ', '件': 'ㄐㄧㄢˋ', '休': 'ㄒㄧㄡ', '係': 'ㄒㄧˋ', '信': 'ㄒㄧㄣˋ', '做': 'ㄗㄨㄛˋ', '像': 'ㄒㄧㄤˋ',
    '八': 'ㄅㄚ', '六': 'ㄌㄧㄡˋ', '冷': 'ㄌㄥˇ', '凳': 'ㄉㄥˋ', '划': 'ㄏㄨㄚˊ', '別': 'ㄅㄧㄝˊ', '刷': 'ㄕㄨㄚ', '剛': 'ㄍㄤ',
    '剩': 'ㄕㄥˋ', '助': 'ㄓㄨˋ', '包': 'ㄅㄠ', '北': 'ㄅㄟˇ', '匹': 'ㄆㄧ', '十': 'ㄕˊ', '半': 'ㄅㄢˋ', '南': 'ㄋㄢˊ',
    '厚': 'ㄏㄡˋ', '原': 'ㄩㄢˊ', '又': 'ㄧㄡˋ', '及': 'ㄐㄧˊ', '口': 'ㄎㄡˇ', '另': 'ㄌㄧㄥˋ', '叫': 'ㄐㄧㄠˋ', '名': 'ㄇㄧㄥˊ',
    '吱': 'ㄓ', '吼': 'ㄏㄡˇ', '味': 'ㄨㄟˋ', '呵': 'ㄏㄜ', '咕': 'ㄍㄨ', '咦': 'ㄧˊ', '咩': 'ㄇㄧㄝ', '哞': 'ㄇㄡ',
    '哪': 'ㄋㄚˇ', '哭': 'ㄎㄨ', '問': 'ㄨㄣˋ', '啦': '˙ㄌㄚ', '善': 'ㄕㄢˋ', '喜': 'ㄒㄧˇ', '喝': 'ㄏㄜ', '單': 'ㄉㄢ',
    '嗎': '˙ㄇㄚ', '嗚': 'ㄨ', '嗨': 'ㄏㄞ', '嗯': 'ㄣˋ', '嘛': '˙ㄇㄚ', '嘟': 'ㄉㄨ', '嘩': 'ㄏㄨㄚ', '嘶': 'ㄙ',
    '噠': 'ㄉㄚ', '噹': 'ㄉㄤ', '嚕': 'ㄌㄨ', '四': 'ㄙˋ', '國': 'ㄍㄨㄛˊ', '圓': 'ㄩㄢˊ', '坐': 'ㄗㄨㄛˋ', '外': 'ㄨㄞˋ',
    '夫': 'ㄈㄨ', '套': 'ㄊㄠˋ', '姊': 'ㄐㄧㄝˇ', '姑': 'ㄍㄨ', '娘': 'ㄋㄧㄤˊ', '媽': 'ㄇㄚ', '字': 'ㄗˋ', '孩': 'ㄏㄞˊ',
    '守': 'ㄕㄡˇ', '完': 'ㄨㄢˊ', '宮': 'ㄍㄨㄥ', '密': 'ㄇㄧˋ', '寬': 'ㄎㄨㄢ', '封': 'ㄈㄥ', '屬': 'ㄕㄨˇ', '帝': 'ㄉㄧˋ',
    '常': 'ㄔㄤˊ', '帽': 'ㄇㄠˋ', '年': 'ㄋㄧㄢˊ', '床': 'ㄔㄨㄤˊ', '廚': 'ㄔㄨˊ', '廳': 'ㄊㄧㄥ', '往': 'ㄨㄤˇ', '後': 'ㄏㄡˋ',
    '忘': 'ㄨㄤˋ', '念': 'ㄋㄧㄢˋ', '急': 'ㄐㄧˊ', '息': 'ㄒㄧˊ', '愛': 'ㄞˋ', '懂': 'ㄉㄨㄥˇ', '戴': 'ㄉㄞˋ', '所': 'ㄙㄨㄛˇ',
    '才': 'ㄘㄞˊ', '打': 'ㄉㄚˇ', '扮': 'ㄅㄢˋ', '找': 'ㄓㄠˇ', '抬': 'ㄊㄞˊ', '拖': 'ㄊㄨㄛ', '拿': 'ㄋㄚˊ', '掃': 'ㄙㄠˇ',
    '推': 'ㄊㄨㄟ', '揮': 'ㄏㄨㄟ', '搖': 'ㄧㄠˊ', '撐': 'ㄔㄥ', '撲': 'ㄆㄨ', '撿': 'ㄐㄧㄢˇ', '擠': 'ㄐㄧˇ', '支': 'ㄓ',
    '放': 'ㄈㄤˋ', '敢': 'ㄍㄢˇ', '於': 'ㄩˊ', '旅': 'ㄌㄩˇ', '日': 'ㄖˋ', '明': 'ㄇㄧㄥˊ', '晶': 'ㄐㄧㄥ', '暖': 'ㄋㄨㄢˇ',
    '曬': 'ㄕㄞˋ', '月': 'ㄩㄝˋ', '朵': 'ㄉㄨㄛˇ', '村': 'ㄘㄨㄣ', '板': 'ㄅㄢˇ', '枕': 'ㄓㄣˇ', '柔': 'ㄖㄡˊ', '條': 'ㄊㄧㄠˊ',
    '梯': 'ㄊㄧ', '梳': 'ㄕㄨ', '樓': 'ㄌㄡˊ', '樣': 'ㄧㄤˋ', '欠': 'ㄑㄧㄢˋ', '歡': 'ㄏㄨㄢ', '此': 'ㄘˇ', '母': 'ㄇㄨˇ',
    '毛': 'ㄇㄠˊ', '水': 'ㄕㄨㄟˇ', '汗': 'ㄏㄢˋ', '沙': 'ㄕㄚ', '河': 'ㄏㄜˊ', '油': 'ㄧㄡˊ', '沾': 'ㄓㄢ', '法': 'ㄈㄚˇ',
    '泳': 'ㄩㄥˇ', '洗': 'ㄒㄧˇ', '流': 'ㄌㄧㄡˊ', '浮': 'ㄈㄨˊ', '淚': 'ㄌㄟˋ', '渴': 'ㄎㄜˇ', '溪': 'ㄒㄧ', '溫': 'ㄨㄣ',
    '滑': 'ㄏㄨㄚˊ', '滴': 'ㄉㄧ', '滿': 'ㄇㄢˇ', '火': 'ㄏㄨㄛˇ', '灰': 'ㄏㄨㄟ', '照': 'ㄓㄠˋ', '熱': 'ㄖㄜˋ', '燈': 'ㄉㄥ',
    '爐': 'ㄌㄨˊ', '爬': 'ㄆㄚˊ', '牆': 'ㄑㄧㄤˊ', '牛': 'ㄋㄧㄡˊ', '牠': 'ㄊㄚ', '物': 'ㄨˋ', '牽': 'ㄑㄧㄢ', '猜': 'ㄘㄞ',
    '猴': 'ㄏㄡˊ', '玉': 'ㄩˋ', '王': 'ㄨㄤˊ', '玻': 'ㄅㄛ', '現': 'ㄒㄧㄢˋ', '球': 'ㄑㄧㄡˊ', '璃': 'ㄌㄧˊ', '瓜': 'ㄍㄨㄚ',
    '生': 'ㄕㄥ', '甩': 'ㄕㄨㄞˇ', '發': 'ㄈㄚ', '白': 'ㄅㄞˊ', '皇': 'ㄏㄨㄤˊ', '皮': 'ㄆㄧˊ', '直': 'ㄓˊ', '知': 'ㄓ',
    '石': 'ㄕˊ', '碗': 'ㄨㄢˇ', '祕': 'ㄇㄧˋ', '神': 'ㄕㄣˊ', '穿': 'ㄔㄨㄢ', '站': 'ㄓㄢˋ', '竹': 'ㄓㄨˊ', '竿': 'ㄍㄢ',
    '第': 'ㄉㄧˋ', '等': 'ㄉㄥˇ', '筏': 'ㄈㄚˊ', '答': 'ㄉㄚˊ', '簡': 'ㄐㄧㄢˇ', '累': 'ㄌㄟˋ', '終': 'ㄓㄨㄥ', '繼': 'ㄐㄧˋ',
    '纏': 'ㄔㄢˊ', '羊': 'ㄧㄤˊ', '美': 'ㄇㄟˇ', '而': 'ㄦˊ', '聞': 'ㄨㄣˊ', '聰': 'ㄘㄨㄥ', '聲': 'ㄕㄥ', '肖': 'ㄒㄧㄠˋ',
    '脫': 'ㄊㄨㄛ', '與': 'ㄩˇ', '舊': 'ㄐㄧㄡˋ', '舞': 'ㄨˇ', '良': 'ㄌㄧㄤˊ', '色': 'ㄙㄜˋ', '苗': 'ㄇㄧㄠˊ', '苦': 'ㄎㄨˇ',
    '藍': 'ㄌㄢˊ', '虎': 'ㄏㄨˇ', '蛇': 'ㄕㄜˊ', '蛋': 'ㄉㄢˋ', '行': 'ㄒㄧㄥˊ', '衣': 'ㄧ', '袋': 'ㄉㄞˋ', '被': 'ㄅㄟˋ',
    '裙': 'ㄑㄩㄣˊ', '裝': 'ㄓㄨㄤ', '親': 'ㄑㄧㄣ', '記': 'ㄐㄧˋ', '試': 'ㄕˋ', '該': 'ㄍㄞ', '認': 'ㄖㄣˋ', '說': 'ㄕㄨㄛ',
    '講': 'ㄐㄧㄤˇ', '豎': 'ㄕㄨˋ', '越': 'ㄩㄝˋ', '跟': 'ㄍㄣ', '路': 'ㄌㄨˋ', '踩': 'ㄘㄞˇ', '躲': 'ㄉㄨㄛˇ', '車': 'ㄔㄜ',
    '軟': 'ㄖㄨㄢˇ', '輛': 'ㄌㄧㄤˋ', '輪': 'ㄌㄨㄣˊ', '辛': 'ㄒㄧㄣ', '辦': 'ㄅㄢˋ', '迎': 'ㄧㄥˊ', '追': 'ㄓㄨㄟ', '送': 'ㄙㄨㄥˋ',
    '通': 'ㄊㄨㄥ', '道': 'ㄉㄠˋ', '選': 'ㄒㄩㄢˇ', '金': 'ㄐㄧㄣ', '鍊': 'ㄌㄧㄢˋ', '鐘': 'ㄓㄨㄥ', '鑽': 'ㄗㄨㄢ', '閉': 'ㄅㄧˋ',
    '間': 'ㄐㄧㄢ', '關': 'ㄍㄨㄢ', '陪': 'ㄆㄟˊ', '雙': 'ㄕㄨㄤ', '雞': 'ㄐㄧ', '雨': 'ㄩˇ', '鞋': 'ㄒㄧㄝˊ', '響': 'ㄒㄧㄤˇ',
    '項': 'ㄒㄧㄤˋ', '風': 'ㄈㄥ', '飄': 'ㄆㄧㄠ', '飽': 'ㄅㄠˇ', '香': 'ㄒㄧㄤ', '馬': 'ㄇㄚˇ', '體': 'ㄊㄧˇ', '鬆': 'ㄙㄨㄥ',
    '魔': 'ㄇㄛˊ', '鹹': 'ㄒㄧㄢˊ', '黑': 'ㄏㄟ', '鼓': 'ㄍㄨˇ', '龍': 'ㄌㄨㄥˊ',
    // 新書第二批：小紅帽、傑克與魔豆、年獸來了、青蛙王子、白雪公主、長髮公主（一字一音照教育部國語辭典）
    '旁': 'ㄆㄤˊ', '病': 'ㄅㄧㄥˋ', '蘋': 'ㄆㄧㄥˊ', '果': 'ㄍㄨㄛˇ', '離': 'ㄌㄧˊ', '陌': 'ㄇㄛˋ', '話': 'ㄏㄨㄚˋ', '乖': 'ㄍㄨㄞ',
    '籃': 'ㄌㄢˊ', '鳥': 'ㄋㄧㄠˇ', '漂': 'ㄆㄧㄠˋ', '摘': 'ㄓㄞ', '些': 'ㄒㄧㄝ', '耶': '˙ㄧㄝ', '叩': 'ㄎㄡˋ', '敲': 'ㄑㄧㄠ',
    '捏': 'ㄋㄧㄝ', '學': 'ㄒㄩㄝˊ', '鎖': 'ㄙㄨㄛˇ', '櫃': 'ㄍㄨㄟˋ', '音': 'ㄧㄣ', '怪': 'ㄍㄨㄞˋ', '感': 'ㄍㄢˇ', '冒': 'ㄇㄠˋ',
    '喉': 'ㄏㄡˊ', '嚨': 'ㄌㄨㄥˊ', '近': 'ㄐㄧㄣˋ', '耳': 'ㄦˇ', '清': 'ㄑㄧㄥ', '楚': 'ㄔㄨˇ', '嘴': 'ㄗㄨㄟˇ', '搶': 'ㄑㄧㄤˇ',
    '救': 'ㄐㄧㄡˋ', '獵': 'ㄌㄧㄝˋ', '叔': 'ㄕㄨˊ', '准': 'ㄓㄨㄣˇ', '欺': 'ㄑㄧ', '負': 'ㄈㄨˋ', '擔': 'ㄉㄢ', '傑': 'ㄐㄧㄝˊ',
    '克': 'ㄎㄜˋ', '豆': 'ㄉㄡˋ', '男': 'ㄋㄢˊ', '窮': 'ㄑㄩㄥˊ', '乳': 'ㄖㄨˇ', '東': 'ㄉㄨㄥ', '西': 'ㄒㄧ', '鎮': 'ㄓㄣˋ',
    '賣': 'ㄇㄞˋ', '鬍': 'ㄏㄨˊ', '奇': 'ㄑㄧˊ', '唉': 'ㄞ', '丟': 'ㄉㄧㄡ', '莖': 'ㄐㄧㄥ', '傘': 'ㄙㄢˇ', '綠': 'ㄌㄩˋ',
    '棉': 'ㄇㄧㄢˊ', '糖': 'ㄊㄤˊ', '棟': 'ㄉㄨㄥˋ', '位': 'ㄨㄟˋ', '巨': 'ㄐㄩˋ', '低': 'ㄉㄧ', '客': 'ㄎㄜˋ', '餓': 'ㄜˋ',
    '麵': 'ㄇㄧㄢˋ', '嗓': 'ㄙㄤˇ', '茶': 'ㄔㄚˊ', '杯': 'ㄅㄟ', '嘰': 'ㄐㄧ', '哩': 'ㄌㄧ', '餅': 'ㄅㄧㄥˇ', '烤': 'ㄎㄠˇ',
    '盤': 'ㄆㄢˊ', '棕': 'ㄗㄨㄥ', '滾': 'ㄍㄨㄣˇ', '桌': 'ㄓㄨㄛ', '琴': 'ㄑㄧㄣˊ', '轟': 'ㄏㄨㄥ', '隆': 'ㄌㄨㄥˊ', '雷': 'ㄌㄟˊ',
    '堆': 'ㄉㄨㄟ', '睏': 'ㄎㄨㄣˋ', '向': 'ㄒㄧㄤˋ', '買': 'ㄇㄞˇ', '縮': 'ㄙㄨㄛ', '收': 'ㄕㄡ', '留': 'ㄌㄧㄡˊ', '準': 'ㄓㄨㄣˇ',
    '紙': 'ㄓˇ', '寫': 'ㄒㄧㄝˇ', '春': 'ㄔㄨㄣ', '聯': 'ㄌㄧㄢˊ', '掛': 'ㄍㄨㄚˋ', '籠': 'ㄌㄨㄥˊ', '阿': 'ㄚ', '福': 'ㄈㄨˊ',
    '鞭': 'ㄅㄧㄢ', '炮': 'ㄆㄠˋ', '排': 'ㄆㄞˊ', '處': 'ㄔㄨˋ', '愣': 'ㄌㄥˋ', '遮': 'ㄓㄜ', '退': 'ㄊㄨㄟˋ', '劈': 'ㄆㄧ',
    '啪': 'ㄆㄚ', '摀': 'ㄨˇ', '蠟': 'ㄌㄚˋ', '燭': 'ㄓㄨˊ', '睜': 'ㄓㄥ', '平': 'ㄆㄧㄥˊ', '恭': 'ㄍㄨㄥ', '新': 'ㄒㄧㄣ',
    '樂': 'ㄌㄜˋ', '句': 'ㄐㄩˋ', '井': 'ㄐㄧㄥˇ', '深': 'ㄕㄣ', '傷': 'ㄕㄤ', '飯': 'ㄈㄢˋ', '頂': 'ㄉㄧㄥˇ', '兒': 'ㄦˊ',
    '豌': 'ㄨㄢ', '舌': 'ㄕㄜˊ', '巫': 'ㄨ', '婆': 'ㄆㄛˊ', '解': 'ㄐㄧㄝˇ', '雪': 'ㄒㄩㄝˇ', '膚': 'ㄈㄨ', '唇': 'ㄔㄨㄣˊ',
    '后': 'ㄏㄡˋ', '鏡': 'ㄐㄧㄥˋ', '世': 'ㄕˋ', '界': 'ㄐㄧㄝˋ', '冠': 'ㄍㄨㄢ', '歪': 'ㄨㄞ', '提': 'ㄊㄧˊ', '迷': 'ㄇㄧˊ',
    '椅': 'ㄧˇ', '矮': 'ㄞˇ', '噓': 'ㄒㄩ', '挖': 'ㄨㄚ', '寶': 'ㄅㄠˇ', '餵': 'ㄨㄟˋ', '哼': 'ㄏㄥ', '甜': 'ㄊㄧㄢˊ',
    '騎': 'ㄑㄧˊ', '扶': 'ㄈㄨˊ', '錯': 'ㄘㄨㄛˋ', '禮': 'ㄌㄧˇ', '派': 'ㄆㄞˋ', '髮': 'ㄈㄚˇ', '座': 'ㄗㄨㄛˋ', '塔': 'ㄊㄚˇ',
    '扇': 'ㄕㄢˋ', '辮': 'ㄅㄧㄢˋ', '危': 'ㄨㄟˊ', '險': 'ㄒㄧㄢˇ', '首': 'ㄕㄡˇ', '田': 'ㄊㄧㄢˊ', '絲': 'ㄙ', '編': 'ㄅㄧㄢ'
  };

  var ZY_PHRASES = {
    '謝謝': ['ㄒㄧㄝˋ', '˙ㄒㄧㄝ'],
    '朋友': ['ㄆㄥˊ', '˙ㄧㄡ'],
    '眼睛': ['ㄧㄢˇ', '˙ㄐㄧㄥ'],
    '時候': ['ㄕˊ', '˙ㄏㄡ'],
    '舒服': ['ㄕㄨ', '˙ㄈㄨ'],
    '窗戶': ['ㄔㄨㄤ', '˙ㄏㄨ'],
    '指頭': ['ㄓˇ', '˙ㄊㄡ'],
    '太陽': ['ㄊㄞˋ', '˙ㄧㄤ'],
    '不了家': ['ㄅㄨˋ', 'ㄌㄧㄠˇ', 'ㄐㄧㄚ'],   // 「回不了家」的了念ㄌㄧㄠˇ
    '睡著': ['ㄕㄨㄟˋ', 'ㄓㄠˊ'],              // 「睡著了」的著念ㄓㄠˊ，不是「貼著」的˙ㄓㄜ
    '哥哥': ['ㄍㄜ', '˙ㄍㄜ'],
    '厲害': ['ㄌㄧˋ', '˙ㄏㄞ'],
    '力氣': ['ㄌㄧˋ', '˙ㄑㄧ'],
    '地方': ['ㄉㄧˋ', '˙ㄈㄤ'],                // 單字表的「地」是「輕輕地」的˙ㄉㄜ
    '木頭': ['ㄇㄨˋ', '˙ㄊㄡ'],
    '蘿蔔': ['ㄌㄨㄛˊ', '˙ㄅㄛ'],
    '爺爺': ['ㄧㄝˊ', '˙ㄧㄝ'],
    '奶奶': ['ㄋㄞˇ', '˙ㄋㄞ'],
    '長呀長': ['ㄓㄤˇ', '˙ㄧㄚ', 'ㄓㄤˇ'],     // 「蘿蔔長呀長」是長大的長
    '長得': ['ㄓㄤˇ', '˙ㄉㄜ'],
    '午覺': ['ㄨˇ', 'ㄐㄧㄠˋ'],                // 單字表的「覺」念ㄐㄩㄝˊ
    // 新書第一批（輕聲照教育部國語辭典；辭典不讀輕聲的，例如關係、休息、喜歡、知道、玻璃，就照單字念）
    '睡覺': ['ㄕㄨㄟˋ', 'ㄐㄧㄠˋ'],
    '媽媽': ['ㄇㄚ', '˙ㄇㄚ'],
    '姊姊': ['ㄐㄧㄝˇ', '˙ㄐㄧㄝ'],
    '姑娘': ['ㄍㄨ', '˙ㄋㄧㄤ'],
    '衣服': ['ㄧ', '˙ㄈㄨ'],
    '月亮': ['ㄩㄝˋ', '˙ㄌㄧㄤ'],
    '石頭': ['ㄕˊ', '˙ㄊㄡ'],
    '枕頭': ['ㄓㄣˇ', '˙ㄊㄡ'],
    '名字': ['ㄇㄧㄥˊ', '˙ㄗ'],
    '呵欠': ['ㄏㄜ', '˙ㄑㄧㄢ'],
    '王子': ['ㄨㄤˊ', 'ㄗˇ'],                  // 單字表的「子」是「兔子、帽子」的˙ㄗ
    '地上': ['ㄉㄧˋ', 'ㄕㄤˋ'],                // 「在地上玩」；單字表的「地」是「輕輕地」的˙ㄉㄜ
    '掃地': ['ㄙㄠˇ', 'ㄉㄧˋ'],
    '們和好': ['˙ㄇㄣ', 'ㄏㄜˊ', 'ㄏㄠˇ'],     // 「我們和好」是和好如初；「我和好朋友」的和照單字表念ㄏㄢˋ
    '滴答': ['ㄉㄧ', 'ㄉㄚ'],
    '嘩啦': ['ㄏㄨㄚ', 'ㄌㄚ'],                // 狀聲詞；句尾的「啦」照單字表念˙ㄌㄚ
    '嗯？': ['ㄣˊ', null],                     // 疑問的嗯；「嗯，嗯」使勁的聲音照單字表念ㄣˋ
    '啊！比賽': ['ㄚˋ', null, 'ㄅㄧˇ', 'ㄙㄞˋ'],  // 十二生肖：老鼠醒來想起比賽（醒悟）
    // 新書第二批
    '東西': ['ㄉㄨㄥ', '˙ㄒㄧ'],
    '喉嚨': ['ㄏㄡˊ', '˙ㄌㄨㄥ'],
    '耳朵': ['ㄦˇ', '˙ㄉㄨㄛ'],
    '漂亮': ['ㄆㄧㄠˋ', '˙ㄌㄧㄤ'],
    '叔叔': ['ㄕㄨˊ', '˙ㄕㄨ'],
    '燈籠': ['ㄉㄥ', '˙ㄌㄨㄥ'],
    '婆婆': ['ㄆㄛˊ', '˙ㄆㄛ'],
    '地板': ['ㄉㄧˋ', 'ㄅㄢˇ'],
    '地就咚': ['ㄉㄧˋ', 'ㄐㄧㄡˋ', 'ㄉㄨㄥ']   // 年獸來了：「牠一走路，地就咚咚地搖」
  };

  /* 角色的圖。k＝這個姿勢相對站姿的高度（坐著、躺著比較矮）；left:true＝這張圖本來就面朝左。
     路徑寫成完整字面而不是拼字串，tools/check_precache.js 才掃得到（跟 cake-data.js 同一個理由）。 */
  var SPRITES = {
    bear: {
      walk: { src: 'assets/story/chars/bear-walk.png' },
      hug: { src: 'assets/story/chars/bear-hug.png' },
      point: { src: 'assets/story/chars/bear-point.png' },
      wake: { src: 'assets/story/chars/bear-wake.png', k: 0.92 },
      sad: { src: 'assets/story/chars/bear-sad.png', k: 0.84 },
      sleep: { src: 'assets/story/chars/bear-sleep.png', k: 0.6 }
    },
    frog: {
      sit: { src: 'assets/story/chars/frog-sit.png', left: true },
      jump: { src: 'assets/story/chars/frog-jump.png', left: true }
    },
    giraffe: {
      stand: { src: 'assets/story/chars/giraffe-stand.png', left: true },
      bend: { src: 'assets/story/chars/giraffe-bend.png', left: true, k: 0.68 }
    },
    whale: {
      happy: { src: 'assets/story/chars/whale-happy.png', left: true }
    },
    princess: {
      stand: { src: 'assets/stickers/princess.png' },
      cup: { src: 'assets/story/chars/princess-cup.png' },
      reach: { src: 'assets/story/chars/princess-reach.png', k: 1.14 },
      lean: { src: 'assets/story/chars/princess-lean.png', k: 0.6 },
      run: { src: 'assets/story/chars/princess-run.png' },
      bed: { src: 'assets/story/chars/princess-bed.png', k: 0.7 },
      ride: { src: 'assets/story/chars/unicorn-ride.png', k: 1.25 }
    },
    unicorn: {
      walk: { src: 'assets/story/chars/unicorn-walk.png', left: true }
    },
    star: { dim: { svg: true }, glow: { svg: true }, bright: { svg: true } },

    // 龜兔賽跑（每個角色的第一個姿勢會被字幕框拿去當「誰在說話」的小頭像）
    hare: {
      proud: { src: 'assets/story/chars/hare-proud.png' },
      run: { src: 'assets/story/chars/hare-run.png', k: 0.86 },
      shock: { src: 'assets/story/chars/hare-shock.png' },
      sleep: { src: 'assets/story/chars/hare-sleep.png', k: 0.82 }
    },
    tortoise: {
      cheer: { src: 'assets/story/chars/tortoise-cheer.png' },
      walk: { src: 'assets/story/chars/tortoise-walk.png', k: 0.72 }
    },

    // 三隻小豬：三兄妹靠穿戴分（草帽、藍帽、紅蝴蝶結）；房子也是角色，才能「倒下來」
    pig1: {
      stand: { src: 'assets/story/chars/pig1-stand.png' },
      run: { src: 'assets/story/chars/pig1-run.png' }
    },
    pig2: {
      stand: { src: 'assets/story/chars/pig2-stand.png' },
      run: { src: 'assets/story/chars/pig2-run.png' }
    },
    pig3: {
      brick: { src: 'assets/story/chars/pig3-brick.png' },
      cheer: { src: 'assets/story/chars/pig3-cheer.png' }
    },
    wolf: {
      stand: { src: 'assets/story/chars/wolf-stand.png' },
      blow: { src: 'assets/story/chars/wolf-blow.png', k: 0.9 },
      tired: { src: 'assets/story/chars/wolf-tired.png', k: 0.86 }
    },
    straw: {
      up: { src: 'assets/story/chars/house-straw.png' },
      down: { src: 'assets/story/chars/house-straw-down.png', k: 0.38 }
    },
    wood: {
      up: { src: 'assets/story/chars/house-wood.png' },
      down: { src: 'assets/story/chars/house-wood-down.png', k: 0.5 }
    },
    brick: {
      up: { src: 'assets/story/chars/house-brick.png' }
    },

    // 拔蘿蔔：拉的姿勢一律朝右（蘿蔔在右邊），一個拉一個往左排；蘿蔔、湯鍋是道具
    grandpa: {
      cheer: { src: 'assets/story/chars/grandpa-cheer.png' },
      pull: { src: 'assets/story/chars/grandpa-pull.png' }
    },
    grandma: {
      cheer: { src: 'assets/story/chars/grandma-cheer.png' },
      pull: { src: 'assets/story/chars/grandma-pull.png' }
    },
    girl: {
      cheer: { src: 'assets/story/chars/girl-cheer.png' },
      pull: { src: 'assets/story/chars/girl-pull.png' }
    },
    dog: {
      cheer: { src: 'assets/story/chars/dog-cheer.png' },
      pull: { src: 'assets/story/chars/dog-pull.png' }
    },
    cat: {
      cheer: { src: 'assets/story/chars/cat-cheer.png' },
      pull: { src: 'assets/story/chars/cat-pull.png' }
    },
    // 小老鼠兩本共用（拔蘿蔔最後來幫忙的、獅子和老鼠的主角）
    mouse: {
      cheer: { src: 'assets/story/chars/mouse-cheer.png' },
      pull: { src: 'assets/story/chars/mouse-pull.png' },
      run: { src: 'assets/story/chars/mouse-run.png' },
      plead: { src: 'assets/story/chars/mouse-plead.png' },
      chew: { src: 'assets/story/chars/mouse-chew.png' }
    },
    turnip: {
      ground: { src: 'assets/story/chars/turnip-ground.png' },
      big: { src: 'assets/story/chars/turnip-big.png', k: 1.3 }
    },
    soup: {
      pot: { src: 'assets/story/chars/soup-pot.png' }
    },

    // 獅子和老鼠：獅子是溫和版，被網子罩住的那張連網子一起畫；咬破的網子是另一個道具
    lion: {
      happy: { src: 'assets/story/chars/lion-happy.png' },
      sleep: { src: 'assets/story/chars/lion-sleep.png', left: true, k: 0.55 },
      wake: { src: 'assets/story/chars/lion-wake.png', left: true },
      laugh: { src: 'assets/story/chars/lion-laugh.png', left: true },
      walk: { src: 'assets/story/chars/lion-walk.png', k: 0.85 },
      net: { src: 'assets/story/chars/lion-net.png', k: 1.05 }
    },
    net: {
      torn: { src: 'assets/story/chars/net-torn.png' }
    }
  };

  /* 點角色時做什麼：[動作, 特效]。沒列的＝跳一下、冒愛心。房子是道具，只晃一下。 */
  var TAPS = {
    star: ['spin', 'sparkle'],
    whale: ['nod', 'spout'],
    giraffe: ['nod', 'hearts'],
    wolf: ['wiggle', 'puff'],
    tortoise: ['nod', 'hearts'],
    straw: ['wiggle', 'sparkle'],
    wood: ['wiggle', 'sparkle'],
    brick: ['wiggle', 'sparkle'],
    turnip: ['wiggle', 'sparkle'],
    soup: ['wiggle', 'hearts'],
    lion: ['nod', 'hearts'],
    net: ['wiggle', 'sparkle']
  };

  /* 說話的人 → 畫面上哪個角色跟著動、字幕框用什麼顏色 */
  var VOICES = {
    '旁白': { color: '#FFD93D' },
    '小熊': { actor: 'bear', color: '#E8A85C' },
    '小青蛙': { actor: 'frog', color: '#8EDB8A' },
    '長頸鹿': { actor: 'giraffe', color: '#FFB05C' },
    '大鯨魚': { actor: 'whale', color: '#7CC8F5' },
    '小公主': { actor: 'princess', color: '#FF9EC4' },
    '小星星': { actor: 'star', color: '#FFE98A' },
    '獨角獸': { actor: 'unicorn', color: '#B79CFF' },
    '兔子': { actor: 'hare', color: '#D9D3FF' },
    '烏龜': { actor: 'tortoise', color: '#9BDB7A' },
    '豬大哥': { actor: 'pig1', color: '#FFE98A' },
    '豬二哥': { actor: 'pig2', color: '#8EC5FF' },
    '豬小妹': { actor: 'pig3', color: '#FF9EA5' },
    '大野狼': { actor: 'wolf', color: '#C9CDD6' },
    '爺爺': { actor: 'grandpa', color: '#8EC5FF' },
    '奶奶': { actor: 'grandma', color: '#8EDB8A' },
    '孫女': { actor: 'girl', color: '#FF9EC4' },
    '小狗': { actor: 'dog', color: '#E8A85C' },
    '小貓': { actor: 'cat', color: '#FFB05C' },
    '小老鼠': { actor: 'mouse', color: '#D9D3FF' },
    '獅子': { actor: 'lion', color: '#FFC14D' }
  };

  var STAGING = {
    'bear-hug': {
      color: '#8EDB8A',
      cover: { bg: 'assets/story/bg/forest-morning.jpg', actor: 'bear', pose: 'hug' },
      pages: [
        { // 1 早上醒來
          bg: 'assets/story/bg/forest-morning.jpg',
          actors: [{ id: 'bear', pose: 'wake', x: 50, y: 92, h: 50 }],
          cues: [
            { l: 0, at: 2.2, id: 'bear', anim: 'wiggle' },
            { l: 1, id: 'bear', pose: 'hug', anim: 'hop' },
            { l: 1, at: 1.4, fx: 'hearts', id: 'bear' }
          ]
        },
        { // 2 小青蛙
          bg: 'assets/story/bg/pond.jpg',
          actors: [
            { id: 'frog', pose: 'sit', x: 66, y: 66, h: 15 },
            { id: 'bear', pose: 'walk', x: -14, y: 93, h: 46 }
          ],
          cues: [
            { id: 'bear', x: 30, dur: 2.6 },
            { l: 0, at: 2.6, id: 'frog', anim: 'hop' },
            { l: 2, id: 'bear', pose: 'point', x: 40, dur: 1.2 },
            { l: 2, at: 0.9, id: 'frog', pose: 'jump', x: 55, y: 74, dur: 0.7 },
            { l: 2, at: 1.7, id: 'frog', pose: 'sit' },
            { l: 2, at: 2.6, fx: 'hearts', x: 53, y: 56 },
            { l: 3, id: 'frog', anim: 'hop' },
            { l: 3, at: 1.2, id: 'frog', anim: 'hop' }
          ]
        },
        { // 3 長頸鹿
          bg: 'assets/story/bg/meadow.jpg',
          actors: [
            { id: 'giraffe', pose: 'stand', x: 70, y: 93, h: 90 },
            { id: 'bear', pose: 'walk', x: -14, y: 95, h: 34 }
          ],
          cues: [
            { id: 'bear', x: 30, dur: 2.6 },
            { l: 0, at: 2.6, id: 'giraffe', anim: 'nod' },
            { l: 2, id: 'bear', x: 69, dur: 1.5 },
            { l: 2, at: 1.4, id: 'bear', pose: 'hug', anim: 'wiggle' },
            { l: 2, at: 2.6, fx: 'hearts', x: 69, y: 54 },
            { l: 3, id: 'giraffe', pose: 'bend', anim: 'wiggle' },
            { l: 3, at: 1.2, id: 'giraffe', anim: 'wiggle' }
          ]
        },
        { // 4 大鯨魚
          bg: 'assets/story/bg/beach.jpg',
          waves: 63,
          actors: [
            { id: 'whale', pose: 'happy', x: 68, y: 70, h: 34, loop: 'float' },
            { id: 'bear', pose: 'walk', x: -14, y: 94, h: 34 }
          ],
          cues: [
            { id: 'bear', x: 22, dur: 2.4 },
            { l: 0, at: 3.4, id: 'whale', anim: 'nod' },
            { l: 0, at: 3.6, fx: 'spout', id: 'whale' },
            { l: 2, id: 'bear', pose: 'hug', x: 40, y: 86, dur: 1.4 },
            { l: 2, at: 0.4, id: 'whale', x: 58, dur: 1.6 },
            { l: 2, at: 3.0, fx: 'hearts', x: 47, y: 50 },
            { l: 3, at: 0.2, fx: 'spout', id: 'whale' }
          ]
        },
        { // 5 太陽下山，小熊一個人
          bg: 'assets/story/bg/beach.jpg',
          tint: 'day',
          actors: [{ id: 'bear', pose: 'hug', x: 40, y: 95, h: 36 }],
          cues: [
            { at: 0.3, tint: 'sunset' },
            { l: 0, at: 1.6, id: 'bear', pose: 'walk' },
            { l: 1, id: 'bear', pose: 'sad' }
          ]
        },
        { // 6 朋友們回來
          bg: 'assets/story/bg/beach.jpg',
          tint: 'sunset',
          waves: 63,
          actors: [
            { id: 'whale', pose: 'happy', x: 124, y: 70, h: 32, loop: 'float' },
            { id: 'giraffe', pose: 'stand', x: 125, y: 93, h: 84 },
            { id: 'bear', pose: 'sad', x: 40, y: 95, h: 36 },
            { id: 'frog', pose: 'jump', x: -8, y: 95, h: 13, flip: true }
          ],
          cues: [
            { l: 0, at: 1.2, id: 'frog', x: 22, dur: 1.0 },
            { l: 0, at: 2.3, id: 'frog', pose: 'sit' },
            { l: 0, at: 2.6, id: 'giraffe', x: 84, dur: 1.4 },
            { l: 0, at: 4.0, id: 'giraffe', pose: 'bend' },
            { l: 0, at: 4.2, id: 'whale', x: 56, dur: 1.6 },
            { l: 1, id: 'bear', pose: 'walk', flip: true },
            { l: 1, at: 0.1, id: 'frog', anim: 'hop' },
            { l: 1, at: 0.9, id: 'frog', anim: 'hop' }
          ]
        },
        { // 7 大家抱在一起
          bg: 'assets/story/bg/beach.jpg',
          tint: 'sunset',
          waves: 63,
          actors: [
            { id: 'whale', pose: 'happy', x: 56, y: 70, h: 32, loop: 'float' },
            { id: 'giraffe', pose: 'bend', x: 84, y: 93, h: 84 },
            { id: 'bear', pose: 'hug', x: 40, y: 95, h: 38, loop: 'sway' },
            { id: 'frog', pose: 'sit', x: 22, y: 95, h: 13 }
          ],
          cues: [
            { at: 0.2, id: 'frog', pose: 'jump', x: 27, y: 78, dur: 0.8 },
            { at: 0.3, id: 'giraffe', x: 76, dur: 1.2 },
            { l: 0, at: 0.6, fx: 'hearts', x: 28, y: 60 },
            { l: 0, at: 2.0, fx: 'hearts', x: 70, y: 30 },
            { l: 0, at: 3.4, fx: 'hearts', x: 56, y: 38 },
            { l: 1, id: 'bear', anim: 'hop' },
            { l: 1, at: 0.6, fx: 'hearts', id: 'bear' },
            { l: 1, at: 1.4, fx: 'sparkle', x: 42, y: 44 }
          ]
        },
        { // 8 晚安
          bg: 'assets/story/bg/beach.jpg',
          tint: 'night',
          stars: [0, 0, 100, 34],
          actors: [{ id: 'bear', pose: 'sleep', x: 46, y: 93, h: 40 }],
          cues: [
            { l: 1, at: 0.4, fx: 'hearts', x: 50, y: 60 }
          ]
        }
      ]
    },

    'princess-star': {
      color: '#B79CFF',
      cover: { bg: 'assets/story/bg/garden-night.jpg', actor: 'princess', pose: 'cup', star: true },
      pages: [
        { // 1 窗邊數星星
          bg: 'assets/story/bg/bedroom-night.jpg',
          stars: [56, 15, 85, 32],
          starsLate: true,
          actors: [{ id: 'princess', pose: 'lean', x: 70, y: 62, h: 60 }],
          cues: [
            { l: 1, at: 0.1, stars: 1 },
            { l: 1, at: 1.2, stars: 2 },
            { l: 1, at: 2.2, stars: 3 },
            { l: 1, at: 3.0, stars: 99 }
          ]
        },
        { // 2 小星星掉下來
          bg: 'assets/story/bg/bedroom-night.jpg',
          stars: [56, 15, 85, 32],
          actors: [
            { id: 'star', pose: 'bright', x: 58, y: 24, h: 8 },
            { id: 'princess', pose: 'lean', x: 70, y: 62, h: 60 }
          ],
          cues: [
            { l: 0, at: 0.5, id: 'star', anim: 'spin' },
            { l: 0, at: 1.0, id: 'star', x: 85, y: 58, dur: 1.1 },
            { l: 0, at: 2.1, id: 'star', hide: true },
            { l: 0, at: 2.1, fx: 'sparkle', x: 85, y: 55 },
            { l: 1, id: 'princess', anim: 'hop' }
          ]
        },
        { // 3 花園裡的小星星
          bg: 'assets/story/bg/garden-night.jpg',
          actors: [
            { id: 'star', pose: 'dim', x: 74, y: 84, h: 12 },
            { id: 'princess', pose: 'run', x: -14, y: 93, h: 48 }
          ],
          cues: [
            { id: 'princess', x: 34, dur: 2.2 },
            { l: 0, at: 2.4, id: 'princess', pose: 'stand' },
            { l: 1, id: 'star', anim: 'wiggle' }
          ]
        },
        { // 4 捧在手心唱歌
          bg: 'assets/story/bg/garden-night.jpg',
          actors: [
            { id: 'princess', pose: 'stand', x: 40, y: 93, h: 50 },
            { id: 'star', pose: 'dim', x: 74, y: 84, h: 12 }
          ],
          cues: [
            { l: 0, at: 0.2, id: 'princess', x: 60, dur: 1.2 },
            { l: 1, id: 'princess', pose: 'cup' },
            { l: 1, at: 0.2, id: 'star', x: 60, y: 71, h: 9, dur: 0.8 },
            { l: 1, at: 2.6, fx: 'notes', x: 67, y: 46 },
            { l: 1, at: 3.8, fx: 'notes', x: 53, y: 46 },
            { l: 1, at: 5.4, id: 'star', glow: 'glow', anim: 'hop' }
          ]
        },
        { // 5 獨角獸來了
          bg: 'assets/story/bg/garden-night.jpg',
          actors: [
            { id: 'princess', pose: 'reach', x: 36, y: 93, h: 50 },
            { id: 'star', pose: 'glow', x: 36, y: 35, h: 9, loop: 'float' },
            { id: 'unicorn', pose: 'walk', x: 122, y: 94, h: 56 }
          ],
          cues: [
            { l: 0, id: 'princess', anim: 'hop' },
            { l: 1, id: 'unicorn', x: 74, dur: 1.8 },
            { l: 1, at: 0.3, id: 'princess', pose: 'cup' },
            { l: 1, at: 0.3, id: 'star', x: 36, y: 71, dur: 0.5 },
            { l: 2, id: 'unicorn', anim: 'nod' }
          ]
        },
        { // 6 跑上彩虹
          bg: 'assets/story/bg/sky-night.jpg',
          stars: [0, 2, 62, 40],
          actors: [{ id: 'princess', pose: 'ride', x: -14, y: 88, h: 30 }],
          cues: [
            { id: 'princess', x: 30, y: 58, dur: 2.4 },
            { l: 0, at: 2.4, id: 'princess', x: 62, y: 36, dur: 2.2 },
            { l: 0, at: 1.4, fx: 'sparkle', x: 14, y: 70 },
            { l: 0, at: 3.4, fx: 'sparkle', x: 42, y: 50 },
            { l: 1, id: 'princess', loop: 'float' }
          ]
        },
        { // 7 回家囉
          bg: 'assets/story/bg/sky-night.jpg',
          stars: [0, 2, 62, 40],
          actors: [
            { id: 'unicorn', pose: 'walk', x: 76, y: 84, h: 44 },
            { id: 'princess', pose: 'cup', x: 44, y: 84, h: 44 },
            { id: 'star', pose: 'glow', x: 44, y: 64, h: 8 }
          ],
          cues: [
            { l: 0, at: 1.6, id: 'princess', pose: 'reach' },
            { l: 0, at: 1.6, id: 'star', x: 44, y: 33, dur: 0.6 },
            { l: 1, at: 0.6, id: 'star', x: 30, y: 16, dur: 1.6, anim: 'spin' },
            { l: 2, id: 'star', glow: 'bright' },
            { l: 2, at: 0.6, fx: 'sparkle', x: 30, y: 12 },
            { l: 2, at: 2.0, fx: 'sparkle', x: 30, y: 12 }
          ]
        },
        { // 8 晚安
          bg: 'assets/story/bg/bedroom-night.jpg',
          stars: [56, 15, 85, 32],
          actors: [
            { id: 'star', pose: 'bright', x: 70, y: 36, h: 10, loop: 'float' },
            { id: 'princess', pose: 'bed', x: 27, y: 96, h: 52 }
          ],
          cues: [
            { l: 0, at: 4.4, id: 'star', anim: 'blink' },
            { l: 1, id: 'star', anim: 'blink' },
            { l: 2, at: 1.0, fx: 'hearts', x: 24, y: 58 }
          ]
        }
      ]
    }
  };

  /* 龜兔賽跑。背景：大草原（地平線 68%）、小路（路在 78～84%，大樹在右邊、小橋在左邊）、
     山丘（大樹在中間偏右、樹根 72%，終點旗在樹的右邊，小路從左下角彎上來） */
  STAGING['tortoise-hare'] = {
    color: '#FFD93D',
    cover: { bg: 'assets/story/bg/hill-tree.jpg', actor: 'tortoise', pose: 'cheer' },
    pages: [
      { // 1 兔子很快、烏龜很慢
        bg: 'assets/story/bg/meadow.jpg',
        actors: [
          { id: 'hare', pose: 'proud', x: 60, y: 93, h: 44 },
          { id: 'tortoise', pose: 'walk', x: -12, y: 95, h: 30 }
        ],
        cues: [
          { id: 'tortoise', x: 28, dur: 4.4 },
          { l: 0, at: 0.2, id: 'hare', pose: 'run', x: 88, dur: 0.5 },
          { l: 0, at: 0.9, id: 'hare', flip: true, x: 56, dur: 0.5 },
          { l: 0, at: 1.6, id: 'hare', flip: false, pose: 'proud' },
          { l: 1, id: 'hare', anim: 'hop' },
          { l: 1, at: 0.9, id: 'hare', anim: 'hop' }
        ]
      },
      { // 2 來比賽吧
        bg: 'assets/story/bg/meadow.jpg',
        actors: [
          { id: 'hare', pose: 'proud', x: 60, y: 93, h: 44 },
          { id: 'tortoise', pose: 'walk', x: 28, y: 95, h: 30 }
        ],
        cues: [
          { l: 0, id: 'tortoise', anim: 'nod' },
          { l: 0, at: 2.4, id: 'tortoise', anim: 'nod' },
          { l: 1, id: 'hare', anim: 'hop' },
          { l: 1, at: 1.0, id: 'hare', anim: 'hop' }
        ]
      },
      { // 3 預備——開始
        bg: 'assets/story/bg/meadow.jpg',
        actors: [
          { id: 'hare', pose: 'run', x: 20, y: 93, h: 44 },
          { id: 'tortoise', pose: 'walk', x: 12, y: 96, h: 30 }
        ],
        cues: [
          { l: 0, at: 1.2, id: 'hare', x: 125, dur: 0.9 },
          { l: 0, at: 1.3, fx: 'puff', x: 30, y: 80 },
          { l: 0, at: 1.3, id: 'tortoise', x: 24, dur: 4 },
          { l: 1, at: 1.6, id: 'tortoise', x: 46, dur: 5 }
        ]
      },
      { // 4 兔子在樹下睡著
        bg: 'assets/story/bg/path-tree.jpg',
        actors: [
          { id: 'tortoise', pose: 'walk', x: 4, y: 84, h: 12 },
          { id: 'hare', pose: 'run', x: -14, y: 92, h: 40 }
        ],
        cues: [
          { id: 'hare', x: 62, dur: 1.1 },
          { id: 'tortoise', x: 12, dur: 9 },
          { l: 0, at: 1.2, id: 'hare', pose: 'proud', flip: true },
          { l: 1, id: 'hare', flip: false, anim: 'nod' },
          { l: 2, id: 'hare', pose: 'sleep', x: 76, y: 88, dur: 0.8 },
          { l: 2, at: 1.2, fx: 'zzz', x: 80, y: 56 }
        ]
      },
      { // 5 烏龜沒有停
        bg: 'assets/story/bg/path-tree.jpg',
        actors: [
          { id: 'hare', pose: 'sleep', x: 76, y: 88, h: 40 },
          { id: 'tortoise', pose: 'walk', x: -10, y: 92, h: 28 }
        ],
        cues: [
          { id: 'tortoise', x: 30, dur: 6 },
          { at: 1.5, fx: 'zzz', x: 80, y: 56 },
          { l: 0, at: 4.4, fx: 'zzz', x: 80, y: 56 },
          { l: 1, id: 'tortoise', x: 48, dur: 3 }
        ]
      },
      { // 6 輕輕走過兔子身邊，太陽下山
        bg: 'assets/story/bg/path-tree.jpg',
        tint: 'day',
        actors: [
          { id: 'hare', pose: 'sleep', x: 76, y: 88, h: 40 },
          { id: 'tortoise', pose: 'walk', x: 48, y: 93, h: 28 }
        ],
        cues: [
          { id: 'tortoise', x: 118, dur: 8.5 },
          { l: 0, at: 1.0, fx: 'zzz', x: 80, y: 56 },
          { l: 1, tint: 'sunset' },
          { l: 1, at: 0.6, fx: 'zzz', x: 80, y: 56 }
        ]
      },
      { // 7 兔子醒來拼命跑，烏龜已經到了
        bg: 'assets/story/bg/hill-tree.jpg',
        tint: 'sunset',
        actors: [
          { id: 'tortoise', pose: 'walk', x: 34, y: 86, h: 26 },
          { id: 'hare', pose: 'shock', x: -14, y: 97, h: 42 }
        ],
        cues: [
          { id: 'tortoise', x: 52, y: 80, dur: 6 },
          { l: 0, id: 'hare', x: 10, dur: 0.5 },
          { l: 1, id: 'hare', anim: 'hop' },
          { l: 2, id: 'hare', pose: 'run', x: 30, y: 92, dur: 2.4 },
          { l: 2, at: 3.2, id: 'tortoise', pose: 'cheer', anim: 'hop' },
          { l: 2, at: 3.4, fx: 'sparkle', id: 'tortoise' }
        ]
      },
      { // 8 我到了
        bg: 'assets/story/bg/hill-tree.jpg',
        tint: 'sunset',
        actors: [
          { id: 'tortoise', pose: 'cheer', x: 52, y: 80, h: 30 },
          { id: 'hare', pose: 'shock', x: 30, y: 92, h: 42 }
        ],
        cues: [
          { l: 0, id: 'tortoise', anim: 'hop' },
          { l: 0, at: 0.5, fx: 'sparkle', id: 'tortoise' },
          { l: 1, id: 'hare', pose: 'proud', x: 38, y: 88, dur: 1.0 },
          { l: 1, at: 1.2, id: 'hare', anim: 'nod' },
          { l: 2, at: 0.6, fx: 'hearts', x: 45, y: 50 },
          { l: 2, at: 2.2, fx: 'hearts', x: 45, y: 50 }
        ]
      }
    ]
  };

  /* 三隻小豬。背景全部是大草原；房子高度佔舞台五六成，倒下來換成矮矮的一堆。 */
  STAGING['three-pigs'] = {
    color: '#FF9EC4',
    cover: { bg: 'assets/story/bg/meadow.jpg', actor: 'pig3', pose: 'cheer' },
    pages: [
      { // 1 三隻小豬要蓋房子
        bg: 'assets/story/bg/meadow.jpg',
        actors: [
          { id: 'pig1', pose: 'stand', x: 26, y: 94, h: 36 },
          { id: 'pig2', pose: 'stand', x: 50, y: 94, h: 36 },
          { id: 'pig3', pose: 'brick', x: 74, y: 94, h: 36 }
        ],
        cues: [
          { l: 1, id: 'pig1', anim: 'hop' },
          { l: 2, id: 'pig2', anim: 'hop' },
          { l: 3, id: 'pig3', anim: 'hop' }
        ]
      },
      { // 2 房子蓋好了，豬小妹還在搬磚塊
        bg: 'assets/story/bg/meadow.jpg',
        actors: [
          { id: 'straw', pose: 'up', x: 17, y: 88, h: 46, loop: 'still' },
          { id: 'wood', pose: 'up', x: 50, y: 88, h: 46, loop: 'still' },
          { id: 'brick', pose: 'up', x: 83, y: 88, h: 46, loop: 'still' },
          { id: 'pig1', pose: 'stand', x: 28, y: 96, h: 26 },
          { id: 'pig2', pose: 'stand', x: 60, y: 96, h: 26 },
          { id: 'pig3', pose: 'brick', x: 66, y: 97, h: 26 }
        ],
        cues: [
          { l: 0, at: 0.4, id: 'straw', anim: 'wiggle' },
          { l: 0, at: 1.8, id: 'wood', anim: 'wiggle' },
          { l: 0, at: 3.4, id: 'pig1', pose: 'run', x: 125, dur: 1.8 },
          { l: 0, at: 3.6, id: 'pig2', pose: 'run', x: 130, dur: 1.5 },
          { l: 1, id: 'pig3', anim: 'hop' },
          { l: 1, at: 2.2, id: 'pig3', anim: 'hop' },
          { l: 1, at: 3.2, id: 'pig3', anim: 'hop' }
        ]
      },
      { // 3 大野狼來了
        bg: 'assets/story/bg/meadow.jpg',
        actors: [
          { id: 'straw', pose: 'up', x: 66, y: 89, h: 60, loop: 'still' },
          { id: 'pig1', pose: 'stand', x: 88, y: 96, h: 28 },
          { id: 'wolf', pose: 'stand', x: -16, y: 96, h: 44 }
        ],
        cues: [
          { l: 0, at: 0.6, id: 'wolf', x: 26, dur: 1.6 },
          { l: 1, id: 'wolf', anim: 'nod' },
          { l: 1, at: 1.2, id: 'wolf', anim: 'nod' },
          { l: 2, id: 'pig1', anim: 'wiggle' },
          { l: 2, at: 1.0, id: 'pig1', anim: 'wiggle' }
        ]
      },
      { // 4 稻草屋倒了
        bg: 'assets/story/bg/meadow.jpg',
        actors: [
          { id: 'straw', pose: 'up', x: 66, y: 89, h: 60, loop: 'still' },
          { id: 'pig1', pose: 'stand', x: 88, y: 96, h: 28 },
          { id: 'wolf', pose: 'stand', x: 26, y: 96, h: 44 }
        ],
        cues: [
          { l: 0, at: 1.0, id: 'wolf', pose: 'blow' },
          { l: 0, at: 1.2, fx: 'puff', x: 40, y: 66 },
          { l: 0, at: 1.9, fx: 'puff', x: 40, y: 66 },
          { l: 0, at: 2.6, fx: 'puff', x: 40, y: 66 },
          { l: 0, at: 2.8, id: 'straw', anim: 'wiggle' },
          { l: 1, fx: 'puff', x: 40, y: 66 },
          { l: 1, at: 0.5, id: 'straw', pose: 'down', anim: 'wiggle' },
          { l: 1, at: 0.6, fx: 'sparkle', x: 66, y: 70 },
          { l: 1, at: 0.7, id: 'pig1', pose: 'run', anim: 'hop' },
          { l: 1, at: 2.6, id: 'pig1', x: 125, dur: 1.2 },
          { l: 1, at: 1.4, id: 'wolf', pose: 'stand' }
        ]
      },
      { // 5 木頭屋也倒了
        bg: 'assets/story/bg/meadow.jpg',
        actors: [
          { id: 'wood', pose: 'up', x: 64, y: 89, h: 60, loop: 'still' },
          { id: 'pig1', pose: 'stand', x: 84, y: 96, h: 26 },
          { id: 'pig2', pose: 'stand', x: 94, y: 97, h: 26 },
          { id: 'wolf', pose: 'blow', x: 24, y: 96, h: 44 }
        ],
        cues: [
          { l: 0, at: 0.6, fx: 'puff', x: 38, y: 66 },
          { l: 0, at: 1.3, fx: 'puff', x: 38, y: 66 },
          { l: 0, at: 2.0, fx: 'puff', x: 38, y: 66 },
          { l: 0, at: 2.0, id: 'wood', anim: 'wiggle' },
          { l: 1, fx: 'puff', x: 38, y: 66 },
          { l: 1, at: 0.5, id: 'wood', pose: 'down', anim: 'wiggle' },
          { l: 1, at: 0.6, fx: 'sparkle', x: 64, y: 70 },
          { l: 1, at: 0.7, id: 'pig1', pose: 'run', anim: 'hop' },
          { l: 1, at: 0.8, id: 'pig2', pose: 'run', anim: 'hop' },
          { l: 1, at: 1.4, id: 'wolf', pose: 'stand' },
          { l: 1, at: 2.8, id: 'pig1', x: 125, dur: 1.2 },
          { l: 1, at: 2.9, id: 'pig2', x: 135, dur: 1.2 }
        ]
      },
      { // 6 磚塊屋一動也不動
        bg: 'assets/story/bg/meadow.jpg',
        actors: [
          { id: 'brick', pose: 'up', x: 68, y: 89, h: 62, loop: 'still' },
          { id: 'wolf', pose: 'blow', x: 24, y: 96, h: 44 }
        ],
        cues: [
          { l: 0, at: 0.3, fx: 'puff', x: 38, y: 66 },
          { l: 0, at: 1.0, fx: 'puff', x: 38, y: 66 },
          { l: 0, at: 1.8, fx: 'puff', x: 38, y: 66 },
          { l: 0, at: 2.6, fx: 'puff', x: 38, y: 66 },
          { l: 0, at: 2.8, id: 'wolf', anim: 'wiggle' },
          { l: 1, at: 0.8, fx: 'sparkle', x: 68, y: 40 },
          { l: 1, at: 2.6, id: 'wolf', pose: 'tired' }
        ]
      },
      { // 7 大野狼走掉了
        bg: 'assets/story/bg/meadow.jpg',
        actors: [
          { id: 'brick', pose: 'up', x: 68, y: 89, h: 62, loop: 'still' },
          { id: 'wolf', pose: 'tired', x: 24, y: 96, h: 44 }
        ],
        cues: [
          { l: 0, at: 0.2, id: 'wolf', anim: 'nod' },
          { l: 0, at: 1.4, id: 'wolf', anim: 'nod' },
          { l: 1, id: 'wolf', pose: 'stand', flip: true },
          { l: 1, at: 0.4, id: 'wolf', x: -20, dur: 2.8 }
        ]
      },
      { // 8 三隻小豬住在磚塊屋
        bg: 'assets/story/bg/meadow.jpg',
        actors: [
          { id: 'brick', pose: 'up', x: 76, y: 88, h: 60, loop: 'still' },
          { id: 'pig1', pose: 'stand', x: 16, y: 96, h: 34 },
          { id: 'pig2', pose: 'stand', x: 33, y: 97, h: 34 },
          { id: 'pig3', pose: 'cheer', x: 51, y: 96, h: 34 }
        ],
        cues: [
          { l: 0, id: 'pig1', anim: 'hop' },
          { l: 0, at: 0.3, id: 'pig2', anim: 'hop' },
          { l: 1, id: 'pig3', anim: 'hop' },
          { l: 1, at: 1.4, id: 'pig3', anim: 'hop' },
          { l: 2, at: 0.6, fx: 'hearts', x: 33, y: 52 },
          { l: 2, at: 2.4, fx: 'hearts', x: 51, y: 52 },
          { l: 2, at: 3.6, fx: 'sparkle', x: 76, y: 36 }
        ]
      }
    ]
  };

  /* 拔蘿蔔：一個拉一個，從蘿蔔往左排。每頁開頭前面幾個已經在拉，新來的從左邊走進來接在最後面；
     「嘿咻！嘿咻！」那一句（每頁的第 2 句）大家跟著喊的節奏一起晃、蘿蔔也晃。
     站得愈左邊 y 愈大（愈靠前），後面的人伸出來的手才會蓋在前面那個人的背上。 */
  var CHAIN = [
    { id: 'grandpa', x: 63, y: 90, h: 38 },
    { id: 'grandma', x: 48.5, y: 90.6, h: 35 },
    { id: 'girl', x: 35, y: 91.2, h: 29 },
    { id: 'dog', x: 24.5, y: 91.8, h: 22 },
    { id: 'cat', x: 15.5, y: 92.4, h: 18 },
    { id: 'mouse', x: 8.5, y: 93, h: 11 }
  ];
  var TURNIP = { id: 'turnip', pose: 'ground', x: 82, y: 93, h: 48, loop: 'still' };

  // 第 n 頁的舞台：前 n−1 個已經在拉，第 n 個（新來的）先站在畫面外左邊
  function chainActors(n) {
    var list = [TURNIP];
    CHAIN.slice(0, n).forEach(function (c, i) {
      var newcomer = i === n - 1 && n > 1;
      list.push({ id: c.id, pose: newcomer ? 'cheer' : 'pull', x: newcomer ? -14 : c.x, y: c.y, h: c.h });
    });
    return list;
  }
  // 新來的走進來、接上去開始拉（走的時候是歡呼的樣子，到了才換成拉）
  function comeIn(n, dur) {
    var c = CHAIN[n - 1];
    return [
      { l: 0, at: 0.1, id: c.id, x: c.x, dur: dur },
      { l: 0, at: dur + 0.2, id: c.id, pose: 'pull' }
    ];
  }
  // 「嘿咻！嘿咻！」：兩聲各晃一次（第 l 句開始後 0 秒與 0.6 秒）
  function heave(n, l) {
    var out = [];
    [0, 0.6].forEach(function (at) {
      out.push({ l: l, at: at + 0.1, id: 'turnip', anim: 'wiggle' });
      CHAIN.slice(0, n).forEach(function (c) { out.push({ l: l, at: at, id: c.id, anim: 'wiggle' }); });
    });
    return out;
  }
  // 一頁「誰拉誰、嘿咻、還是拔不起來、誰喊下一個」的分鏡
  function pullPage(n, dur) {
    return {
      bg: 'assets/story/bg/farm.jpg',
      actors: chainActors(n),
      cues: (n > 1 ? comeIn(n, dur) : []).concat(heave(n, 1), [
        { l: 2, id: 'turnip', anim: 'nod' },
        { l: 3, id: CHAIN[n - 1].id, anim: 'hop' }
      ])
    };
  }

  STAGING['turnip'] = {
    color: '#FFB05C',
    cover: { bg: 'assets/story/bg/farm.jpg', actor: 'turnip', pose: 'big' },
    pages: [
      { // 1 爺爺種的蘿蔔長得好大
        bg: 'assets/story/bg/farm.jpg',
        actors: [
          { id: 'turnip', pose: 'ground', x: 82, y: 93, h: 12, loop: 'still' },
          { id: 'grandpa', pose: 'cheer', x: 40, y: 93, h: 38 }
        ],
        cues: [
          { l: 0, at: 1.4, id: 'grandpa', anim: 'nod' },
          { l: 1, at: 0.3, id: 'turnip', h: 22, dur: 0.6 },
          { l: 1, at: 1.3, id: 'turnip', h: 35, dur: 0.6 },
          { l: 1, at: 2.3, id: 'turnip', h: 48, dur: 0.6 },
          { l: 1, at: 2.9, fx: 'sparkle', x: 82, y: 56 },
          { l: 2, id: 'grandpa', anim: 'hop' },
          { l: 2, at: 1.7, id: 'grandpa', x: 56, dur: 1.2 }
        ]
      },
      pullPage(1),          // 2 爺爺拉
      pullPage(2, 1.6),     // 3 奶奶來了
      pullPage(3, 1.4),     // 4 孫女來了
      pullPage(4, 1.2),     // 5 小狗來了
      pullPage(5, 1.0),     // 6 小貓來了
      { // 7 小老鼠來了，啵！拔起來了
        bg: 'assets/story/bg/farm.jpg',
        actors: chainActors(6).map(function (a) { return a.id === 'mouse' ? Object.assign({}, a, { pose: 'run' }) : a; }),
        cues: [
          { l: 0, id: 'mouse', x: CHAIN[5].x, dur: 1.2 },
          { l: 0, at: 1.3, id: 'mouse', pose: 'pull', anim: 'hop' }
        ].concat(heave(6, 2), [
          { l: 3, id: 'turnip', pose: 'big', y: 78, dur: 0.25, anim: 'hop' },
          { l: 3, at: 0.1, fx: 'sparkle', x: 82, y: 50 },
          { l: 3, at: 0.35, id: 'turnip', y: 93, dur: 0.35 }
        ], CHAIN.map(function (c, i) {
          return { l: 3, at: 0.05, id: c.id, x: c.x - 4, dur: 0.3 };
        }), CHAIN.map(function (c, i) {
          return { l: 3, at: 1.3 + i * 0.12, id: c.id, pose: 'cheer', anim: 'hop' };
        }))
      },
      { // 8 大家一起喝蘿蔔湯
        bg: 'assets/story/bg/farm.jpg',
        tint: 'sunset',
        actors: [
          { id: 'grandma', pose: 'cheer', x: 13, y: 94, h: 35 },
          { id: 'girl', pose: 'cheer', x: 26, y: 95, h: 29 },
          { id: 'dog', pose: 'cheer', x: 37.5, y: 95.5, h: 22 },
          { id: 'soup', pose: 'pot', x: 51, y: 96, h: 30, loop: 'still' },
          { id: 'cat', pose: 'cheer', x: 63, y: 95.5, h: 18 },
          { id: 'mouse', pose: 'cheer', x: 72, y: 96, h: 11 },
          { id: 'grandpa', pose: 'cheer', x: 85, y: 94, h: 38 }
        ],
        cues: [
          { l: 0, id: 'grandpa', anim: 'nod' },
          { l: 0, at: 1.5, id: 'mouse', anim: 'hop' },
          { l: 0, at: 1.7, fx: 'hearts', id: 'mouse' },
          { l: 1, at: 1.6, id: 'soup', anim: 'wiggle' },
          { l: 1, at: 1.8, fx: 'sparkle', x: 51, y: 70 },
          { l: 2, id: 'grandma', anim: 'hop' },
          { l: 2, at: 0.15, id: 'girl', anim: 'hop' },
          { l: 2, at: 0.3, id: 'dog', anim: 'hop' },
          { l: 2, at: 0.45, id: 'cat', anim: 'hop' },
          { l: 2, at: 0.6, id: 'mouse', anim: 'hop' },
          { l: 2, at: 0.75, id: 'grandpa', anim: 'hop' },
          { l: 2, at: 1.4, fx: 'hearts', x: 51, y: 56 }
        ]
      }
    ]
  };

  /* 獅子和老鼠：前四頁在草原的大樹下（獅子在右、小老鼠從左邊來），後四頁在森林。
     網子那段要溫和：網子一罩上獅子是「哎呀卡住了」的表情，小老鼠一咬就破，不拖。 */
  STAGING['lion-mouse'] = {
    color: '#7CC8F5',
    cover: { bg: 'assets/story/bg/savanna.jpg', actor: 'lion', pose: 'happy' },
    pages: [
      { // 1 獅子睡午覺，小老鼠撞到他的鼻子
        bg: 'assets/story/bg/savanna.jpg',
        actors: [
          { id: 'lion', pose: 'sleep', x: 66, y: 92, h: 46 },
          { id: 'mouse', pose: 'run', x: -8, y: 94, h: 16 }
        ],
        cues: [
          { l: 0, at: 0.6, fx: 'zzz', id: 'lion' },
          { l: 0, at: 3.0, fx: 'zzz', id: 'lion' },
          { l: 1, at: 0.2, id: 'mouse', x: 44, dur: 2.0 },
          { l: 1, at: 2.35, id: 'mouse', x: 47, dur: 0.15, anim: 'hop' },
          { l: 1, at: 2.45, id: 'lion', anim: 'wiggle' },
          { l: 1, at: 2.5, fx: 'sparkle', x: 50, y: 74 }
        ]
      },
      { // 2 哈啾！獅子醒了
        bg: 'assets/story/bg/savanna.jpg',
        actors: [
          { id: 'lion', pose: 'wake', x: 68, y: 92, h: 46 },
          { id: 'mouse', pose: 'plead', x: 42, y: 94, h: 16 }
        ],
        cues: [
          { l: 0, id: 'lion', anim: 'wiggle' },
          { l: 0, at: 0.2, id: 'mouse', anim: 'hop' },
          { l: 1, at: 0.6, id: 'lion', anim: 'nod' }
        ]
      },
      { // 3 小老鼠說對不起
        bg: 'assets/story/bg/savanna.jpg',
        actors: [
          { id: 'lion', pose: 'wake', x: 68, y: 92, h: 46 },
          { id: 'mouse', pose: 'plead', x: 42, y: 94, h: 16 }
        ],
        cues: [
          { l: 0, id: 'mouse', anim: 'nod' },
          { l: 0, at: 1.0, id: 'mouse', anim: 'nod' },
          { l: 1, at: 1.4, id: 'mouse', anim: 'hop' }
        ]
      },
      { // 4 獅子哈哈大笑，讓小老鼠回家
        bg: 'assets/story/bg/savanna.jpg',
        actors: [
          { id: 'lion', pose: 'laugh', x: 68, y: 92, h: 46 },
          { id: 'mouse', pose: 'plead', x: 42, y: 94, h: 16 }
        ],
        cues: [
          { l: 0, at: 0.1, id: 'lion', anim: 'wiggle' },
          { l: 0, at: 1.0, id: 'lion', anim: 'wiggle' },
          { l: 1, at: 0.2, id: 'lion', pose: 'happy' },
          { l: 1, at: 1.2, id: 'mouse', pose: 'cheer', anim: 'hop' },
          { l: 2, id: 'mouse', anim: 'hop' },
          { l: 2, at: 0.3, fx: 'hearts', id: 'mouse' },
          { l: 2, at: 1.1, id: 'mouse', pose: 'run', flip: true },
          { l: 2, at: 1.2, id: 'mouse', x: -12, dur: 1.6 }
        ]
      },
      { // 5 森林裡，網子罩住了獅子
        bg: 'assets/story/bg/forest.jpg',
        actors: [
          { id: 'lion', pose: 'walk', x: -16, y: 93, h: 46 }
        ],
        cues: [
          { l: 0, at: 0.2, id: 'lion', x: 54, dur: 2.8 },
          { l: 1, at: 0.1, id: 'lion', pose: 'net', anim: 'hop' },
          { l: 1, at: 0.2, fx: 'sparkle', id: 'lion' },
          { l: 2, at: 0.2, id: 'lion', anim: 'wiggle' },
          { l: 2, at: 1.4, id: 'lion', anim: 'wiggle' }
        ]
      },
      { // 6 小老鼠跑來幫忙
        bg: 'assets/story/bg/forest.jpg',
        actors: [
          { id: 'lion', pose: 'net', x: 60, y: 93, h: 46 },
          { id: 'mouse', pose: 'run', x: -10, y: 95, h: 16 }
        ],
        cues: [
          { l: 0, at: 0.3, id: 'mouse', x: 36, dur: 1.8 },
          { l: 1, id: 'mouse', pose: 'cheer', anim: 'hop' },
          { l: 1, at: 1.0, id: 'lion', anim: 'nod' }
        ]
      },
      { // 7 咬呀咬，網子破了
        bg: 'assets/story/bg/forest.jpg',
        actors: [
          { id: 'net', pose: 'torn', x: 60, y: 96, h: 13, hidden: true, loop: 'still' },
          { id: 'lion', pose: 'net', x: 60, y: 93, h: 46 },
          { id: 'mouse', pose: 'chew', x: 47, y: 95, h: 16 }
        ],
        cues: [
          { l: 0, at: 2.2, id: 'mouse', anim: 'wiggle' },
          { l: 0, at: 3.1, id: 'mouse', anim: 'wiggle' },
          { l: 1, at: 0.2, id: 'lion', pose: 'happy', anim: 'hop' },
          { l: 1, at: 0.2, id: 'net', show: true },
          { l: 1, at: 0.3, fx: 'sparkle', id: 'lion' },
          { l: 1, at: 0.6, id: 'mouse', pose: 'cheer', anim: 'hop' }
        ]
      },
      { // 8 變成好朋友
        bg: 'assets/story/bg/forest.jpg',
        actors: [
          { id: 'net', pose: 'torn', x: 86, y: 97, h: 10, loop: 'still' },
          { id: 'lion', pose: 'happy', x: 62, y: 93, h: 46 },
          { id: 'mouse', pose: 'cheer', x: 44, y: 95, h: 16 }
        ],
        cues: [
          { l: 0, id: 'lion', anim: 'nod' },
          { l: 1, id: 'mouse', anim: 'hop' },
          { l: 1, at: 1.2, id: 'mouse', anim: 'hop' },
          { l: 2, at: 1.0, fx: 'hearts', x: 51, y: 52 },
          { l: 2, at: 2.0, id: 'lion', anim: 'hop' },
          { l: 2, at: 2.2, id: 'mouse', anim: 'hop' },
          { l: 2, at: 3.0, fx: 'hearts', x: 51, y: 52 }
        ]
      }
    ]
  };

  /* 新書（2026-11 起）：一本兩個檔，打開那本才載入（js/book-sync.js 在背景把整本抓進快取）。
       js/books/<id>-script.js  錄音產生（tools/tts/build_books.py）→ StoryData.addScript({ id, title, pages })
       js/books/<id>.js         手寫分鏡 → StoryData.addBook(id, { color, cover, zy, phrases, voices, sprites, taps, pages })
     跟上面舊書的寫法一樣，只差在：
       - 圖的路徑可以只寫檔名（'wind-blow.png'、'bg-sky.jpg'），會補成 assets/books/<id>/ 底下
       - voices 只在這本有效（不同本的「小老鼠」可以是不同角色）；沒寫的說話的人再查上面的 VOICES
       - sprites 的角色 id 全站不能重複（tools/check_story.js 會擋），zy／phrases 只能補表裡沒有的字 */
  var BOOK_SCRIPTS = {};
  function addScript(s) { BOOK_SCRIPTS[s.id] = s; }
  function addBook(id, def) {
    var base = 'assets/books/' + id + '/';
    var fix = function (p) { return p && p.indexOf('/') < 0 ? base + p : p; };
    Object.keys(def.sprites || {}).forEach(function (actor) {
      var poses = {};
      Object.keys(def.sprites[actor]).forEach(function (pose) {
        var d = Object.assign({}, def.sprites[actor][pose]);
        d.src = fix(d.src);
        poses[pose] = d;
      });
      SPRITES[actor] = poses;
    });
    Object.keys(def.zy || {}).forEach(function (c) { if (!ZY[c]) ZY[c] = def.zy[c]; });
    Object.keys(def.phrases || {}).forEach(function (w) { if (!ZY_PHRASES[w]) ZY_PHRASES[w] = def.phrases[w]; });
    Object.keys(def.taps || {}).forEach(function (a) { TAPS[a] = def.taps[a]; });
    STAGING[id] = {
      color: def.color,
      book: true,
      voices: def.voices || {},
      cover: Object.assign({}, def.cover, { bg: fix(def.cover.bg) }),
      pages: def.pages.map(function (p) { return Object.assign({}, p, { bg: fix(p.bg) }); })
    };
  }

  var StoryData = { ZY: ZY, ZY_PHRASES: ZY_PHRASES, SPRITES: SPRITES, VOICES: VOICES, STAGING: STAGING, TAPS: TAPS,
    BOOK_SCRIPTS: BOOK_SCRIPTS, addScript: addScript, addBook: addBook };
  if (typeof module !== 'undefined' && module.exports) module.exports = StoryData;
  global.StoryData = StoryData;
})(typeof window !== 'undefined' ? window : globalThis);
