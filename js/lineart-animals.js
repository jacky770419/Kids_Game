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
    name: '胖小豬',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="3.75" d="M312,286 C348,278 356,250 336,244 C320,240 318,258 336,262"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M90,354 L90,344 C90,334 99,330 112,330 C125,330 134,334 134,344 L134,354 C134,368 124,374 112,374 C100,374 90,368 90,354 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M266,354 L266,344 C266,334 275,330 288,330 C301,330 310,334 310,344 L310,354 C310,368 300,374 288,374 C276,374 266,368 266,354 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M200,228 C268,228 316,264 316,306 C316,336 292,352 258,356 C238,360 219,362 200,362 C181,362 162,360 142,356 C108,352 84,336 84,306 C84,264 132,228 200,228 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="2.25" cx="200" cy="308" rx="60" ry="40"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M134,354 L134,342 C134,332 143,328 155,328 C167,328 176,332 176,342 L176,354 C176,368 166,374 155,374 C144,374 134,368 134,354 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M224,354 L224,342 C224,332 233,328 245,328 C257,328 266,332 266,342 L266,354 C266,368 256,374 245,374 C234,374 224,368 224,354 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M200,44 C266,44 306,92 306,145 C306,198 262,240 200,240 C138,240 94,198 94,145 C94,92 134,44 200,44 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M182,60 C164,30 122,22 102,48 C94,76 106,104 128,114 C142,92 160,72 182,60 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M218,60 C236,30 278,22 298,48 C306,76 294,104 272,114 C258,92 240,72 218,60 Z"/>
      <path fill="none" stroke-width="2.25" d="M148,50 C136,58 127,72 124,88 M252,50 C264,58 273,72 276,88"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="120" cy="170" r="17"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="280" cy="170" r="17"/>
      <circle fill="#3a3a3a" stroke="none" cx="154" cy="128" r="10"/>
      <circle fill="#3a3a3a" stroke="none" cx="246" cy="128" r="10"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="200" cy="178" rx="46" ry="34"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="184" cy="178" rx="7" ry="11"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="216" cy="178" rx="7" ry="11"/>
      <path fill="none" stroke-width="2.63" d="M176,222 C186,230 214,230 224,222"/>
      <path fill="none" stroke-width="2.25" d="M112,374 L112,358 M155,374 L155,358 M245,374 L245,358 M288,374 L288,358"/>
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
    name: '大象寶寶',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="3.75" d="M296,276 C330,278 344,300 336,330"/>
      <path fill="#3a3a3a" stroke="none" d="M336,326 C345,336 344,352 335,354 C327,348 328,336 336,326 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M90,296 L134,296 L134,352 C134,368 124,374 112,374 C100,374 90,368 90,352 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M266,296 L310,296 L310,352 C310,368 300,374 288,374 C276,374 266,368 266,352 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M200,238 C258,238 301,266 302,308 C303,330 288,344 262,348 L138,348 C112,344 97,330 98,308 C99,266 142,238 200,238 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M126,352 L126,326 C126,312 136,306 148,306 C160,306 170,312 170,326 L170,352 C170,370 160,376 148,376 C136,376 126,370 126,352 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M230,352 L230,326 C230,312 240,306 252,306 C264,306 274,312 274,326 L274,352 C274,370 264,376 252,376 C240,376 230,370 230,352 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M150,70 C84,44 30,96 32,170 C34,238 86,276 148,248 C160,200 160,120 150,70 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M250,70 C316,44 370,96 368,170 C366,238 314,276 252,248 C240,200 240,120 250,70 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M144,94 C98,76 60,114 62,168 C64,218 100,248 142,228 C150,190 150,132 144,94 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M256,94 C302,76 340,114 338,168 C336,218 300,248 258,228 C250,190 250,132 256,94 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M200,44 C266,44 308,92 308,146 C308,200 264,244 200,244 C136,244 92,200 92,146 C92,92 134,44 200,44 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="160" cy="140" r="10"/>
      <circle fill="#3a3a3a" stroke="none" cx="240" cy="140" r="10"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M138,226 C126,252 126,274 140,286 C136,264 140,244 152,228 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M262,226 C274,252 274,274 260,286 C264,264 260,244 248,228 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M184,195 C170,240 154,262 158,300 C161,330 178,348 204,346 C220,345 232,338 230,322 C228,310 216,306 210,312 C202,318 192,314 190,300 C186,276 198,244 208,216 C211,207 214,200 216,195 Z"/>
      <path fill="none" stroke-width="2.25" d="M97,375 C99,362 108,362 110,375 M114,375 C116,362 125,362 127,375 M273,375 C275,362 284,362 286,375 M290,375 C292,362 301,362 303,375 M134,375 C136,362 145,362 147,375 M151,375 C153,362 162,362 164,375 M236,375 C238,362 247,362 249,375 M253,375 C255,362 264,362 266,375"/>
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
