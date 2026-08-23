/* 水果／甜點主題的 Q 版著色線稿。
   每張圖是一段 SVG 字串，class="c" 的區域可以點擊上色。
   coloring.js 會讀 window.LINEART_FOOD，把這一批接在其他線稿後面。
   想加新圖：照同樣格式在陣列裡加一筆即可。 */
const LINEART_FOOD = [
  {
    name: '大草莓',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <ellipse class="c" fill="#fff" cx="110" cy="177" rx="20" ry="42" transform="rotate(-72 110 177)"/>
      <ellipse class="c" fill="#fff" cx="290" cy="177" rx="20" ry="42" transform="rotate(72 290 177)"/>
      <ellipse class="c" fill="#fff" cx="144" cy="138" rx="22" ry="44" transform="rotate(-40 144 138)"/>
      <ellipse class="c" fill="#fff" cx="256" cy="138" rx="22" ry="44" transform="rotate(40 256 138)"/>
      <ellipse class="c" fill="#fff" cx="200" cy="127" rx="24" ry="48"/>
      <path class="c" fill="#fff" d="M200,148 C265,148 300,190 300,240 C300,300 250,352 200,368 C150,352 100,300 100,240 C100,190 135,148 200,148 Z"/>
      <ellipse class="c" fill="#fff" cx="156" cy="218" rx="28" ry="19" transform="rotate(-30 156 218)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="210" cy="190" rx="4" ry="6"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="250" cy="225" rx="4" ry="6"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="272" cy="275" rx="4" ry="6"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="200" cy="265" rx="4" ry="6"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="152" cy="290" rx="4" ry="6"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="222" cy="320" rx="4" ry="6"/>
    </svg>`
  },
  {
    name: '西瓜片',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M60,290 Q200,384 340,290 L326,258 Q200,346 74,258 Z"/>
      <path class="c" fill="#fff" d="M74,258 Q200,346 326,258 L312,226 Q200,308 88,226 Z"/>
      <path class="c" fill="#fff" d="M200,58 L88,226 Q116,247 144,257 Z"/>
      <path class="c" fill="#fff" d="M200,58 L144,257 Q172,267 200,267 Z"/>
      <path class="c" fill="#fff" d="M200,58 L200,267 Q228,267 256,257 Z"/>
      <path class="c" fill="#fff" d="M200,58 L256,257 Q284,247 312,226 Z"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="130" cy="205" rx="6" ry="9"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="172" cy="240" rx="6" ry="9"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="185" cy="145" rx="6" ry="9"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="228" cy="240" rx="6" ry="9"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="272" cy="205" rx="6" ry="9"/>
    </svg>`
  },
  {
    name: '鳳梨',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <ellipse class="c" fill="#fff" cx="162" cy="163" rx="19" ry="44" transform="rotate(-60 162 163)"/>
      <ellipse class="c" fill="#fff" cx="238" cy="163" rx="19" ry="44" transform="rotate(60 238 163)"/>
      <ellipse class="c" fill="#fff" cx="177" cy="145" rx="20" ry="46" transform="rotate(-30 177 145)"/>
      <ellipse class="c" fill="#fff" cx="223" cy="145" rx="20" ry="46" transform="rotate(30 223 145)"/>
      <ellipse class="c" fill="#fff" cx="200" cy="135" rx="22" ry="50"/>
      <rect class="c" fill="#fff" x="110" y="160" width="180" height="210" rx="70"/>
      <path fill="none" d="M156,176 L232,252 M176,236 L230,290 M146,246 L218,318 M179,319 L206,346 M244,176 L168,252 M228,236 L170,290 M254,246 L182,318 M221,319 L194,346"/>
    </svg>`
  },
  {
    name: '蘋果',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <ellipse class="c" fill="#fff" cx="50" cy="279" rx="30" ry="17" transform="rotate(44 50 279)"/>
      <circle class="c" fill="#fff" cx="66" cy="330" r="44"/>
      <path fill="none" stroke-width="7" d="M222,158 C220,128 230,104 246,92"/>
      <ellipse class="c" fill="#fff" cx="274" cy="88" rx="42" ry="24" transform="rotate(-18 274 88)"/>
      <path class="c" fill="#fff" d="M222,152 C214,124 178,116 156,140 C126,170 116,222 128,268 C140,316 180,362 222,362 C264,362 304,316 316,268 C328,222 318,170 288,140 C266,116 230,124 222,152 Z"/>
      <ellipse class="c" fill="#fff" cx="172" cy="200" rx="30" ry="19" transform="rotate(-35 172 200)"/>
      <ellipse class="c" fill="#fff" cx="272" cy="290" rx="30" ry="24"/>
    </svg>`
  },
  {
    name: '香蕉',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M70,150 Q110,340 330,302 Q340,300 340,286 Q330,272 314,274 Q170,292 132,142 Q126,124 106,126 Q72,130 70,150 Z" transform="rotate(-14 104 150)"/>
      <path class="c" fill="#fff" d="M70,150 Q110,340 330,302 Q340,300 340,286 Q330,272 314,274 Q170,292 132,142 Q126,124 106,126 Q72,130 70,150 Z" transform="rotate(14 104 150)"/>
      <path class="c" fill="#fff" d="M70,150 Q110,340 330,302 Q340,300 340,286 Q330,272 314,274 Q170,292 132,142 Q126,124 106,126 Q72,130 70,150 Z" transform="rotate(0 104 150)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="98" cy="152" rx="17" ry="11" transform="rotate(70 98 152)"/>
    </svg>`
  },
  {
    name: '葡萄',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <ellipse class="c" fill="#fff" cx="300" cy="110" rx="52" ry="30" transform="rotate(-30 300 110)"/>
      <path fill="none" stroke-width="7" d="M200,168 C206,130 224,106 252,98"/>
      <circle class="c" fill="#fff" cx="134" cy="182" r="27"/>
      <circle class="c" fill="#fff" cx="178" cy="182" r="27"/>
      <circle class="c" fill="#fff" cx="222" cy="182" r="27"/>
      <circle class="c" fill="#fff" cx="266" cy="182" r="27"/>
      <circle class="c" fill="#fff" cx="156" cy="222" r="27"/>
      <circle class="c" fill="#fff" cx="200" cy="222" r="27"/>
      <circle class="c" fill="#fff" cx="244" cy="222" r="27"/>
      <circle class="c" fill="#fff" cx="178" cy="262" r="27"/>
      <circle class="c" fill="#fff" cx="222" cy="262" r="27"/>
      <circle class="c" fill="#fff" cx="200" cy="302" r="27"/>
    </svg>`
  },
  {
    name: '冰淇淋甜筒',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <polygon class="c" fill="#fff" points="200,368 138,232 262,232"/>
      <path fill="none" d="M176,236 L230,290 M146,246 L218,318 M179,319 L206,346 M228,236 L170,290 M254,246 L182,318 M221,319 L194,346"/>
      <circle class="c" fill="#fff" cx="200" cy="196" r="72"/>
      <circle class="c" fill="#fff" cx="200" cy="134" r="58"/>
      <circle class="c" fill="#fff" cx="200" cy="84" r="46"/>
      <ellipse class="c" fill="#fff" cx="162" cy="206" rx="25" ry="17" transform="rotate(-30 162 206)"/>
      <path fill="none" stroke-width="6" d="M246,30 C258,26 268,34 270,46"/>
      <circle class="c" fill="#fff" cx="236" cy="46" r="24"/>
    </svg>`
  },
  {
    name: '杯子蛋糕',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <circle class="c" fill="#fff" cx="200" cy="216" r="74"/>
      <circle class="c" fill="#fff" cx="186" cy="168" r="62"/>
      <circle class="c" fill="#fff" cx="214" cy="128" r="52"/>
      <circle class="c" fill="#fff" cx="190" cy="94" r="42"/>
      <circle class="c" fill="#fff" cx="208" cy="66" r="32"/>
      <path class="c" fill="#fff" d="M124,250 L276,250 L244,350 C240,372 219,372 215,350 C211,372 190,372 186,350 C182,372 161,372 157,350 Z"/>
      <path fill="none" d="M163,256 L178,344 M200,256 L200,344 M238,256 L223,344"/>
      <circle fill="#3a3a3a" stroke="none" cx="148" cy="228" r="6"/>
      <circle fill="#3a3a3a" stroke="none" cx="252" cy="226" r="6"/>
      <circle fill="#3a3a3a" stroke="none" cx="168" cy="190" r="6"/>
      <circle fill="#3a3a3a" stroke="none" cx="240" cy="150" r="6"/>
      <circle fill="#3a3a3a" stroke="none" cx="178" cy="84" r="6"/>
    </svg>`
  },
  {
    name: '甜甜圈',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <circle class="c" fill="#fff" cx="200" cy="210" r="150"/>
      <path class="c" fill="#fff" d="M55,250 A150,150 0 1 1 345,250 C332,264 322,288 306,283 C290,278 288,252 272,255 C256,258 254,290 238,287 C222,284 220,254 204,257 C188,260 186,292 170,289 C154,286 152,256 136,259 C120,262 118,286 102,281 C86,276 70,264 55,250 Z"/>
      <circle fill="#fff" cx="200" cy="210" r="52"/>
      <ellipse class="c" fill="#fff" cx="122" cy="172" rx="22" ry="15" transform="rotate(25 122 172)"/>
      <ellipse class="c" fill="#fff" cx="272" cy="160" rx="22" ry="15" transform="rotate(-40 272 160)"/>
      <ellipse class="c" fill="#fff" cx="200" cy="112" rx="22" ry="15" transform="rotate(62 200 112)"/>
      <ellipse class="c" fill="#fff" cx="298" cy="228" rx="22" ry="15" transform="rotate(-18 298 228)"/>
    </svg>`
  },
  {
    name: '生日蛋糕',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <ellipse class="c" fill="#fff" cx="200" cy="336" rx="152" ry="26"/>
      <rect class="c" fill="#fff" x="131" y="100" width="34" height="86" rx="8"/>
      <rect class="c" fill="#fff" x="183" y="100" width="34" height="86" rx="8"/>
      <rect class="c" fill="#fff" x="235" y="100" width="34" height="86" rx="8"/>
      <path class="c" fill="#fff" d="M148,102 C118,80 124,42 148,26 C172,42 178,80 148,102 Z"/>
      <path class="c" fill="#fff" d="M200,102 C170,80 176,42 200,26 C224,42 230,80 200,102 Z"/>
      <path class="c" fill="#fff" d="M252,102 C222,80 228,42 252,26 C276,42 282,80 252,102 Z"/>
      <path class="c" fill="#fff" d="M118,246 L118,176 C118,168 124,164 132,164 L268,164 C276,164 282,168 282,176 L282,246"/>
      <path fill="none" d="M118,190 C126,210 151,210 159,190 C167,210 192,210 200,190 C208,210 233,210 241,190 C249,210 274,210 282,190"/>
      <path class="c" fill="#fff" d="M90,330 L310,330 L310,258 C310,246 302,242 292,242 L108,242 C98,242 90,246 90,258 Z"/>
      <path fill="none" d="M90,266 C98,288 126,288 134,266 C142,288 170,288 178,266 C186,288 214,288 222,266 C230,288 258,288 266,266 C274,288 302,288 310,266"/>
    </svg>`
  }
];
window.LINEART_FOOD = LINEART_FOOD;
