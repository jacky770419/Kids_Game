/* 動物著色線稿（12 隻）。
   本專案手繪，風格對齊 js/lineart-data.js：同一組 viewBox（0 0 400 400）、
   同一組線條參數（stroke #3a3a3a、stroke-width 5、圓角接合），Q 版大頭圓身比例。
   畫法規則：可上色區＝class="c" fill="#fff"；分層靠「後畫的白色區塊蓋掉前面區塊的線」，
   不用放大剪影墊底、也不重複描同一段輪廓，所以不會出現交錯重疊的線。
   已經畫好、不給上色的細節（眼珠、鼻子、嘴巴、貓熊黑塊）用 fill="#3a3a3a" stroke="none"；
   純線條（鬍鬚、紋路、樹枝、水波）用 fill="none"。
   coloring.js 會讀 window.LINEART_ANIMALS，接在內建的 LINEART 後面。 */
const LINEART_ANIMALS = [
  {
    name: '小熊',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <circle class="c" fill="#fff" cx="140" cy="95" r="36"/>
      <circle class="c" fill="#fff" cx="260" cy="95" r="36"/>
      <ellipse class="c" fill="#fff" cx="200" cy="280" rx="80" ry="85"/>
      <ellipse class="c" fill="#fff" cx="112" cy="275" rx="26" ry="40"/>
      <ellipse class="c" fill="#fff" cx="288" cy="275" rx="26" ry="40"/>
      <ellipse class="c" fill="#fff" cx="155" cy="350" rx="32" ry="22"/>
      <ellipse class="c" fill="#fff" cx="245" cy="350" rx="32" ry="22"/>
      <circle class="c" fill="#fff" cx="200" cy="160" r="92"/>
      <ellipse class="c" fill="#fff" cx="200" cy="195" rx="46" ry="34"/>
      <circle fill="#3a3a3a" stroke="none" cx="170" cy="140" r="10"/>
      <circle fill="#3a3a3a" stroke="none" cx="230" cy="140" r="10"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="200" cy="180" rx="14" ry="10"/>
      <path fill="none" d="M200,190 C200,202 189,206 182,199 M200,190 C200,202 211,206 218,199"/>
    </svg>`
  },
  {
    name: '貓熊',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <circle fill="#3a3a3a" stroke="none" cx="134" cy="92" r="34"/>
      <circle fill="#3a3a3a" stroke="none" cx="266" cy="92" r="34"/>
      <ellipse class="c" fill="#fff" cx="200" cy="282" rx="78" ry="84"/>
      <ellipse class="c" fill="#fff" cx="114" cy="272" rx="25" ry="42"/>
      <ellipse class="c" fill="#fff" cx="286" cy="272" rx="25" ry="42"/>
      <ellipse class="c" fill="#fff" cx="152" cy="352" rx="32" ry="22"/>
      <ellipse class="c" fill="#fff" cx="248" cy="352" rx="32" ry="22"/>
      <circle class="c" fill="#fff" cx="200" cy="162" r="92"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="164" cy="146" rx="26" ry="32" transform="rotate(-20 164 146)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="236" cy="146" rx="26" ry="32" transform="rotate(20 236 146)"/>
      <circle fill="#fff" stroke="none" cx="166" cy="142" r="11"/>
      <circle fill="#fff" stroke="none" cx="234" cy="142" r="11"/>
      <ellipse class="c" fill="#fff" cx="200" cy="210" rx="42" ry="30"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="200" cy="198" rx="13" ry="9"/>
      <path fill="none" d="M200,207 C200,219 190,223 183,216 M200,207 C200,219 210,223 217,216"/>
    </svg>`
  },
  {
    name: '小兔子',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <ellipse class="c" fill="#fff" cx="158" cy="105" rx="30" ry="62" transform="rotate(-14 158 105)"/>
      <ellipse class="c" fill="#fff" cx="242" cy="105" rx="30" ry="62" transform="rotate(14 242 105)"/>
      <ellipse class="c" fill="#fff" cx="158" cy="110" rx="15" ry="46" transform="rotate(-14 158 110)"/>
      <ellipse class="c" fill="#fff" cx="242" cy="110" rx="15" ry="46" transform="rotate(14 242 110)"/>
      <circle class="c" fill="#fff" cx="292" cy="300" r="26"/>
      <ellipse class="c" fill="#fff" cx="200" cy="308" rx="76" ry="58"/>
      <ellipse class="c" fill="#fff" cx="140" cy="356" rx="34" ry="20"/>
      <ellipse class="c" fill="#fff" cx="260" cy="356" rx="34" ry="20"/>
      <circle class="c" fill="#fff" cx="200" cy="205" r="88"/>
      <circle fill="#3a3a3a" stroke="none" cx="172" cy="192" r="10"/>
      <circle fill="#3a3a3a" stroke="none" cx="228" cy="192" r="10"/>
      <path fill="#3a3a3a" stroke="none" d="M188,222 L212,222 L200,236 Z"/>
      <path fill="none" d="M200,236 C200,250 189,254 182,247 M200,236 C200,250 211,254 218,247"/>
      <path fill="none" d="M132,230 L82,220 M134,246 L86,250 M268,230 L318,220 M266,246 L314,250"/>
    </svg>`
  },
  {
    name: '小豬',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="6" d="M282,296 C310,290 314,266 300,262 C288,258 286,278 302,284"/>
      <ellipse class="c" fill="#fff" cx="200" cy="298" rx="82" ry="66"/>
      <rect class="c" fill="#fff" x="136" y="332" width="44" height="42" rx="14"/>
      <rect class="c" fill="#fff" x="220" y="332" width="44" height="42" rx="14"/>
      <path class="c" fill="#fff" d="M134,124 L116,58 L184,96 Z"/>
      <path class="c" fill="#fff" d="M266,124 L284,58 L216,96 Z"/>
      <circle class="c" fill="#fff" cx="200" cy="182" r="92"/>
      <ellipse class="c" fill="#fff" cx="200" cy="212" rx="44" ry="32"/>
      <circle fill="#3a3a3a" stroke="none" cx="166" cy="152" r="10"/>
      <circle fill="#3a3a3a" stroke="none" cx="234" cy="152" r="10"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="185" cy="212" rx="7" ry="10"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="215" cy="212" rx="7" ry="10"/>
      <path fill="none" d="M172,254 C184,266 216,266 228,254"/>
    </svg>`
  },
  {
    name: '青蛙',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <circle class="c" fill="#fff" cx="150" cy="130" r="40"/>
      <circle class="c" fill="#fff" cx="250" cy="130" r="40"/>
      <ellipse class="c" fill="#fff" cx="200" cy="248" rx="114" ry="96"/>
      <circle fill="#3a3a3a" stroke="none" cx="150" cy="122" r="14"/>
      <circle fill="#3a3a3a" stroke="none" cx="250" cy="122" r="14"/>
      <ellipse class="c" fill="#fff" cx="146" cy="352" rx="40" ry="22"/>
      <ellipse class="c" fill="#fff" cx="254" cy="352" rx="40" ry="22"/>
      <ellipse class="c" fill="#fff" cx="104" cy="316" rx="34" ry="20"/>
      <ellipse class="c" fill="#fff" cx="296" cy="316" rx="34" ry="20"/>
      <circle fill="#3a3a3a" stroke="none" cx="182" cy="196" r="5"/>
      <circle fill="#3a3a3a" stroke="none" cx="218" cy="196" r="5"/>
      <path fill="none" d="M112,244 C140,296 260,296 288,244"/>
    </svg>`
  },
  {
    name: '小鴨',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M126,262 L62,238 L92,300 Z"/>
      <ellipse class="c" fill="#fff" cx="200" cy="286" rx="108" ry="76"/>
      <path class="c" fill="#fff" d="M164,268 C204,246 258,258 272,290 C248,318 186,314 164,268 Z"/>
      <path class="c" fill="#fff" d="M154,342 L118,374 L188,374 Z"/>
      <path class="c" fill="#fff" d="M250,342 L214,374 L284,374 Z"/>
      <path class="c" fill="#fff" d="M192,110 C182,86 200,74 212,88 C222,72 238,86 226,108 Z"/>
      <circle class="c" fill="#fff" cx="204" cy="164" r="64"/>
      <path class="c" fill="#fff" d="M256,146 C296,142 300,182 258,180 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="228" cy="148" r="10"/>
    </svg>`
  },
  {
    name: '大象',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <ellipse class="c" fill="#fff" cx="200" cy="298" rx="88" ry="68"/>
      <rect class="c" fill="#fff" x="140" y="330" width="44" height="44" rx="14"/>
      <rect class="c" fill="#fff" x="216" y="330" width="44" height="44" rx="14"/>
      <ellipse class="c" fill="#fff" cx="112" cy="172" rx="54" ry="64"/>
      <ellipse class="c" fill="#fff" cx="288" cy="172" rx="54" ry="64"/>
      <path fill="none" d="M104,138 C82,168 86,206 110,228 M296,138 C318,168 314,206 290,228"/>
      <circle class="c" fill="#fff" cx="200" cy="182" r="88"/>
      <path class="c" fill="#fff" d="M176,238 C168,288 186,318 218,312 C232,309 232,292 219,290 C206,287 208,278 210,246 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="166" cy="160" r="10"/>
      <circle fill="#3a3a3a" stroke="none" cx="234" cy="160" r="10"/>
    </svg>`
  },
  {
    name: '長頸鹿',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M166,130 L226,130 L246,250 L156,250 Z"/>
      <path fill="none" stroke-width="6" d="M298,278 C326,286 330,312 316,322"/>
      <ellipse class="c" fill="#fff" cx="210" cy="290" rx="90" ry="62"/>
      <rect class="c" fill="#fff" x="150" y="330" width="34" height="42" rx="12"/>
      <rect class="c" fill="#fff" x="238" y="330" width="34" height="42" rx="12"/>
      <circle class="c" fill="#fff" cx="180" cy="280" r="20"/>
      <circle class="c" fill="#fff" cx="250" cy="300" r="20"/>
      <circle class="c" fill="#fff" cx="208" cy="322" r="17"/>
      <ellipse class="c" fill="#fff" cx="142" cy="102" rx="28" ry="15" transform="rotate(-25 142 102)"/>
      <ellipse class="c" fill="#fff" cx="254" cy="102" rx="28" ry="15" transform="rotate(25 254 102)"/>
      <ellipse class="c" fill="#fff" cx="198" cy="112" rx="52" ry="42"/>
      <path fill="none" d="M180,76 L174,50 M216,76 L222,50"/>
      <path fill="#3a3a3a" stroke="none" d="M166,46 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0 M214,46 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0"/>
      <circle fill="#3a3a3a" stroke="none" cx="182" cy="104" r="9"/>
      <circle fill="#3a3a3a" stroke="none" cx="214" cy="104" r="9"/>
      <path fill="none" d="M186,134 C192,142 204,142 210,134"/>
    </svg>`
  },
  {
    name: '企鵝',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M200,66 C136,66 102,132 102,214 C102,300 146,346 200,346 C254,346 298,300 298,214 C298,132 264,66 200,66 Z"/>
      <path class="c" fill="#fff" d="M200,182 C166,182 150,216 150,254 C150,298 172,320 200,320 C228,320 250,298 250,254 C250,216 234,182 200,182 Z"/>
      <path class="c" fill="#fff" d="M126,180 C88,196 66,254 84,306 C106,296 118,240 142,198 Z"/>
      <path class="c" fill="#fff" d="M274,180 C312,196 334,254 316,306 C294,296 282,240 258,198 Z"/>
      <path class="c" fill="#fff" d="M158,330 L126,364 L188,364 Z"/>
      <path class="c" fill="#fff" d="M242,330 L212,364 L274,364 Z"/>
      <path class="c" fill="#fff" d="M180,140 L220,140 L200,172 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="162" cy="124" r="11"/>
      <circle fill="#3a3a3a" stroke="none" cx="238" cy="124" r="11"/>
    </svg>`
  },
  {
    name: '小猴子',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="6" d="M270,306 C324,312 344,262 314,246 C296,236 284,258 302,266"/>
      <ellipse class="c" fill="#fff" cx="200" cy="292" rx="74" ry="72"/>
      <ellipse class="c" fill="#fff" cx="126" cy="292" rx="24" ry="44"/>
      <ellipse class="c" fill="#fff" cx="274" cy="292" rx="24" ry="44"/>
      <ellipse class="c" fill="#fff" cx="162" cy="352" rx="32" ry="20"/>
      <ellipse class="c" fill="#fff" cx="238" cy="352" rx="32" ry="20"/>
      <circle class="c" fill="#fff" cx="116" cy="150" r="32"/>
      <circle class="c" fill="#fff" cx="284" cy="150" r="32"/>
      <ellipse class="c" fill="#fff" cx="200" cy="158" rx="84" ry="78"/>
      <ellipse class="c" fill="#fff" cx="200" cy="176" rx="56" ry="46"/>
      <circle fill="#3a3a3a" stroke="none" cx="180" cy="158" r="10"/>
      <circle fill="#3a3a3a" stroke="none" cx="220" cy="158" r="10"/>
      <path fill="#3a3a3a" stroke="none" d="M186,190 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0 M204,190 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0"/>
      <path fill="none" d="M182,202 C190,214 210,214 218,202"/>
    </svg>`
  },
  {
    name: '貓頭鷹',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M138,104 L124,52 L180,84 Z"/>
      <path class="c" fill="#fff" d="M262,104 L276,52 L220,84 Z"/>
      <path class="c" fill="#fff" d="M200,66 C134,66 100,132 100,216 C100,304 146,348 200,348 C254,348 300,304 300,216 C300,132 266,66 200,66 Z"/>
      <path class="c" fill="#fff" d="M148,206 C130,246 134,296 156,326 C174,296 168,240 176,216 Z"/>
      <path class="c" fill="#fff" d="M252,206 C270,246 266,296 244,326 C226,296 232,240 224,216 Z"/>
      <circle class="c" fill="#fff" cx="160" cy="152" r="34"/>
      <circle class="c" fill="#fff" cx="240" cy="152" r="34"/>
      <circle fill="#3a3a3a" stroke="none" cx="160" cy="152" r="12"/>
      <circle fill="#3a3a3a" stroke="none" cx="240" cy="152" r="12"/>
      <path class="c" fill="#fff" d="M200,176 L218,200 L200,222 L182,200 Z"/>
      <line x1="34" y1="362" x2="366" y2="362" stroke-width="6"/>
      <path fill="none" stroke-width="6" d="M172,342 L172,358 M158,368 L172,358 L172,372 M172,358 L186,368 M228,342 L228,358 M214,368 L228,358 L228,372 M228,358 L242,368"/>
    </svg>`
  },
  {
    name: '鯨魚',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <circle class="c" fill="#fff" cx="118" cy="96" r="16"/>
      <circle class="c" fill="#fff" cx="150" cy="60" r="20"/>
      <circle class="c" fill="#fff" cx="196" cy="44" r="16"/>
      <path class="c" fill="#fff" d="M300,240 L368,190 C374,216 372,240 364,262 Z"/>
      <path class="c" fill="#fff" d="M300,258 L364,288 C356,312 342,330 322,344 Z"/>
      <path class="c" fill="#fff" d="M170,290 C154,340 176,372 214,364 C210,332 194,304 178,288 Z"/>
      <path class="c" fill="#fff" d="M70,244 C70,180 130,140 200,140 C268,140 316,182 322,248 C316,300 268,330 200,330 C130,330 70,306 70,244 Z"/>
      <path class="c" fill="#fff" d="M104,288 C146,314 208,318 248,300 C230,282 152,270 104,288 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="120" cy="216" r="11"/>
      <path fill="none" d="M92,254 C104,266 124,268 138,258"/>
    </svg>`
  }
];

/* classic script 裡的 const 不會掛上 window，coloring.js 是用 window.LINEART_ANIMALS 取值（缺檔時要能安全跳過），所以這裡補一行。 */
window.LINEART_ANIMALS = LINEART_ANIMALS;
