/* 城堡／公主主題的 Q 版著色線稿（第二批）。
   風格對齊 js/lineart-data.js 與 js/lineart-animals.js：同一組 viewBox（0 0 400 400）、
   同一組線條參數（stroke #3a3a3a、stroke-width 5、圓角接合），Q 版大頭圓身比例。
   畫法規則：可上色區＝class="c" fill="#fff"；分層靠「後畫的白色區塊蓋掉前面區塊的線」，
   不重複描同一段輪廓、不用放大剪影墊底、不做同心的雙重輪廓（甜甜圈的洞、輪轂那種
   本來就該有的內圈不算）。
   已經畫好、不給上色的細節（眼珠、鼻子、嘴巴、旗子）用 fill="#3a3a3a" stroke="none"；
   純線條（鬍鬚、南瓜瓣紋、輪輻、螺旋紋、裙褶）用 fill="none"。
   coloring.js 會讀 window.LINEART_FANTASY，接在內建線稿後面。 */
const LINEART_FANTASY = [
  {
    name: '糖果城堡',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <line x1="25" y1="364" x2="375" y2="364" stroke-width="6"/>
      <rect class="c" fill="#fff" x="50" y="200" width="74" height="164"/>
      <rect class="c" fill="#fff" x="276" y="200" width="74" height="164"/>
      <circle class="c" fill="#fff" cx="87" cy="186" r="44"/>
      <circle class="c" fill="#fff" cx="87" cy="126" r="34"/>
      <circle fill="#3a3a3a" stroke="none" cx="87" cy="84" r="13"/>
      <circle class="c" fill="#fff" cx="313" cy="176" r="46"/>
      <circle class="c" fill="#fff" cx="313" cy="176" r="17"/>
      <path fill="none" d="M290,150 L297,144 M336,152 L343,158 M298,202 L305,208"/>
      <rect class="c" fill="#fff" x="72" y="250" width="32" height="42" rx="16"/>
      <rect class="c" fill="#fff" x="296" y="250" width="32" height="42" rx="16"/>
      <path class="c" fill="#fff" d="M132,364 L132,222 L164,222 L164,246 L192,246 L192,222 L224,222 L224,246 L252,246 L252,222 L284,222 L284,364 Z"/>
      <path class="c" fill="#fff" d="M186,364 L186,300 A22,22 0 0 1 230,300 L230,364 Z"/>
      <circle class="c" fill="#fff" cx="152" cy="310" r="26"/>
      <path fill="none" d="M152,310 C152,301 163,301 163,310 C163,323 145,323 145,310 C145,293 171,293 171,310"/>
      <line x1="152" y1="336" x2="152" y2="362"/>
      <circle class="c" fill="#fff" cx="264" cy="310" r="26"/>
      <path fill="none" d="M264,310 C264,301 253,301 253,310 C253,323 271,323 271,310 C271,293 245,293 245,310"/>
      <line x1="264" y1="336" x2="264" y2="362"/>
    </svg>`
  },
  {
    name: '雲朵城堡',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M100,44 C44,52 40,134 78,142 C88,110 92,72 100,44 Z"/>
      <polygon class="c" fill="#fff" points="150,34 156,50 173,51 160,61 164,77 150,68 136,77 141,61 127,51 144,50"/>
      <polygon class="c" fill="#fff" points="320,56 326,72 343,73 330,83 334,99 320,90 306,99 311,83 297,73 314,72"/>
      <rect class="c" fill="#fff" x="88" y="190" width="48" height="110"/>
      <rect class="c" fill="#fff" x="264" y="190" width="48" height="110"/>
      <polygon class="c" fill="#fff" points="66,216 112,148 158,216"/>
      <polygon class="c" fill="#fff" points="242,216 288,148 334,216"/>
      <rect class="c" fill="#fff" x="170" y="170" width="60" height="130"/>
      <polygon class="c" fill="#fff" points="146,186 200,110 254,186"/>
      <line x1="200" y1="112" x2="200" y2="86"/>
      <polygon fill="#3a3a3a" stroke="none" points="200,86 228,97 200,108"/>
      <rect class="c" fill="#fff" x="97" y="228" width="30" height="40" rx="15"/>
      <rect class="c" fill="#fff" x="273" y="228" width="30" height="40" rx="15"/>
      <rect class="c" fill="#fff" x="184" y="206" width="32" height="42" rx="16"/>
      <path class="c" fill="#fff" d="M80,364 C44,364 36,326 74,314 C86,278 118,262 146,290 C164,258 232,262 246,292 C286,270 336,288 326,314 C356,322 352,364 320,364 Z"/>
    </svg>`
  },
  {
    name: 'Q版小公主',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M178,222 L222,222 L232,268 L168,268 Z"/>
      <path class="c" fill="#fff" d="M166,264 L234,264 C268,300 300,332 312,358 L88,358 C100,332 132,300 166,264 Z"/>
      <path fill="none" d="M144,296 L112,350 M256,296 L288,350"/>
      <ellipse class="c" fill="#fff" cx="156" cy="285" rx="20" ry="34" transform="rotate(20 156 285)"/>
      <ellipse class="c" fill="#fff" cx="244" cy="285" rx="20" ry="34" transform="rotate(-20 244 285)"/>
      <circle class="c" fill="#fff" cx="200" cy="158" r="72"/>
      <path class="c" fill="#fff" d="M96,250 C84,166 112,58 200,58 C288,58 316,166 304,250 C296,204 276,172 254,150 C228,170 172,170 146,150 C124,172 106,206 96,250 Z"/>
      <path class="c" fill="#fff" d="M296,116 C280,100 268,108 272,124 C276,138 290,132 296,122 C302,132 316,138 320,124 C324,108 312,100 296,116 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="178" cy="190" r="11"/>
      <circle fill="#3a3a3a" stroke="none" cx="222" cy="190" r="11"/>
      <circle fill="#fff" stroke="none" cx="182" cy="186" r="4"/>
      <circle fill="#fff" stroke="none" cx="226" cy="186" r="4"/>
      <path fill="none" d="M188,212 C194,221 206,221 212,212"/>
      <ellipse class="c" fill="#fff" cx="200" cy="266" rx="17" ry="22"/>
      <ellipse class="c" fill="#fff" cx="170" cy="282" rx="17" ry="22" transform="rotate(-60 170 282)"/>
      <ellipse class="c" fill="#fff" cx="230" cy="282" rx="17" ry="22" transform="rotate(60 230 282)"/>
      <ellipse class="c" fill="#fff" cx="172" cy="318" rx="17" ry="22" transform="rotate(-120 172 318)"/>
      <ellipse class="c" fill="#fff" cx="228" cy="318" rx="17" ry="22" transform="rotate(120 228 318)"/>
      <circle class="c" fill="#fff" cx="200" cy="300" r="20"/>
    </svg>`
  },
  {
    name: '捲髮公主',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M112,250 C86,232 80,208 98,190 C84,168 88,144 110,130 C114,102 128,86 152,88 C162,70 180,62 200,72 C220,62 238,70 248,88 C272,86 286,102 290,130 C312,144 316,168 302,190 C320,208 314,232 288,250 C270,270 250,268 236,252 C220,272 180,272 164,252 C150,268 130,270 112,250 Z"/>
      <rect class="c" fill="#fff" x="182" y="196" width="36" height="44"/>
      <path class="c" fill="#fff" d="M184,232 L216,232 C252,272 286,322 296,368 L104,368 C114,322 148,272 184,232 Z"/>
      <circle class="c" fill="#fff" cx="200" cy="150" r="68"/>
      <circle fill="#3a3a3a" stroke="none" cx="176" cy="146" r="11"/>
      <circle fill="#3a3a3a" stroke="none" cx="224" cy="146" r="11"/>
      <circle fill="#fff" stroke="none" cx="180" cy="142" r="4"/>
      <circle fill="#fff" stroke="none" cx="228" cy="142" r="4"/>
      <path fill="none" d="M188,192 C194,201 206,201 212,192"/>
      <circle class="c" fill="#fff" cx="162" cy="180" r="15"/>
      <circle class="c" fill="#fff" cx="238" cy="180" r="15"/>
      <ellipse class="c" fill="#fff" cx="200" cy="332" rx="46" ry="24"/>
      <polygon class="c" fill="#fff" points="172,260 156,220 198,248"/>
      <polygon class="c" fill="#fff" points="228,260 244,220 202,248"/>
      <circle class="c" fill="#fff" cx="200" cy="282" r="38"/>
      <circle fill="#3a3a3a" stroke="none" cx="186" cy="276" r="7"/>
      <circle fill="#3a3a3a" stroke="none" cx="214" cy="276" r="7"/>
      <path fill="#3a3a3a" stroke="none" d="M194,290 L206,290 L200,298 Z"/>
      <path fill="none" d="M200,298 C200,306 192,308 187,303 M200,298 C200,306 208,308 213,303"/>
      <path fill="none" d="M162,286 L132,280 M162,298 L132,302 M238,286 L268,280 M238,298 L268,302"/>
      <ellipse class="c" fill="#fff" cx="162" cy="330" rx="28" ry="16" transform="rotate(-18 162 330)"/>
      <ellipse class="c" fill="#fff" cx="238" cy="330" rx="28" ry="16" transform="rotate(18 238 330)"/>
    </svg>`
  },
  {
    name: '南瓜馬車',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <line x1="25" y1="356" x2="375" y2="356" stroke-width="6"/>
      <polygon class="c" fill="#fff" points="62,84 68,100 85,101 72,111 76,127 62,118 48,127 53,111 39,101 56,100"/>
      <polygon class="c" fill="#fff" points="344,88 350,104 367,105 354,115 358,131 344,122 330,131 335,115 321,105 338,104"/>
      <path fill="none" stroke-width="6" d="M112,220 C76,214 46,226 30,244"/>
      <path fill="none" stroke-width="6" d="M110,240 L28,264"/>
      <ellipse class="c" fill="#fff" cx="210" cy="230" rx="110" ry="92"/>
      <path fill="none" d="M172,150 C154,192 154,268 172,310 M248,150 C266,192 266,268 248,310"/>
      <path fill="none" stroke-width="7" d="M210,140 C206,116 218,102 234,106"/>
      <line x1="180" y1="142" x2="180" y2="94"/>
      <polygon fill="#3a3a3a" stroke="none" points="180,94 216,106 180,118"/>
      <circle class="c" fill="#fff" cx="210" cy="178" r="22"/>
      <path class="c" fill="#fff" d="M180,308 L180,246 A30,30 0 0 1 240,246 L240,308 Z"/>
      <circle class="c" fill="#fff" cx="136" cy="308" r="52"/>
      <circle class="c" fill="#fff" cx="284" cy="308" r="52"/>
      <path fill="none" d="M136,256 L136,360 M84,308 L188,308 M99,271 L173,345 M99,345 L173,271 M284,256 L284,360 M232,308 L336,308 M247,271 L321,345 M247,345 L321,271"/>
      <circle class="c" fill="#fff" cx="136" cy="308" r="18"/>
      <circle class="c" fill="#fff" cx="284" cy="308" r="18"/>
    </svg>`
  },
  {
    name: '獨角獸',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M300,248 C342,252 358,290 340,326 C332,342 320,350 308,352 C320,326 326,296 312,276 C304,264 298,260 292,262 Z"/>
      <path class="c" fill="#fff" d="M298,226 C336,224 358,256 346,296 C340,314 326,326 312,330 C324,304 332,272 320,252 C312,238 306,232 292,238 Z"/>
      <path class="c" fill="#fff" d="M158,290 L184,290 L184,344 L188,364 L154,364 L158,344 Z M198,290 L224,290 L224,344 L228,364 L194,364 L198,344 Z M240,290 L266,290 L266,344 L270,364 L236,364 L240,344 Z M280,290 L306,290 L306,344 L310,364 L276,364 L280,344 Z"/>
      <path fill="none" d="M156,348 L186,348 M196,348 L226,348 M238,348 L268,348 M278,348 L308,348"/>
      <ellipse class="c" fill="#fff" cx="172" cy="156" rx="32" ry="18" transform="rotate(-40 172 156)"/>
      <ellipse class="c" fill="#fff" cx="193" cy="187" rx="38" ry="20" transform="rotate(-25 193 187)"/>
      <ellipse class="c" fill="#fff" cx="204" cy="212" rx="30" ry="17" transform="rotate(-15 204 212)"/>
      <polygon class="c" fill="#fff" points="110,158 152,150 206,240 152,250"/>
      <ellipse class="c" fill="#fff" cx="118" cy="86" rx="16" ry="28" transform="rotate(-15 118 86)"/>
      <ellipse class="c" fill="#fff" cx="154" cy="98" rx="16" ry="28" transform="rotate(12 154 98)"/>
      <polygon class="c" fill="#fff" points="84,116 72,34 114,104"/>
      <ellipse class="c" fill="#fff" cx="228" cy="268" rx="88" ry="60"/>
      <ellipse class="c" fill="#fff" cx="112" cy="146" rx="56" ry="44" transform="rotate(-18 112 146)"/>
      <ellipse class="c" fill="#fff" cx="72" cy="164" rx="30" ry="24"/>
      <circle fill="#3a3a3a" stroke="none" cx="104" cy="128" r="10"/>
      <circle fill="#fff" stroke="none" cx="108" cy="124" r="4"/>
      <circle fill="#3a3a3a" stroke="none" cx="56" cy="164" r="5"/>
      <path fill="none" d="M48,176 C54,182 64,182 70,176"/>
      <path fill="none" d="M84,96 L100,90 M80,76 L92,72 M78,58 L84,56"/>
    </svg>`
  },
  {
    name: '公主與城堡',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M240,316 L240,150 L262,104 L284,150 L284,316 Z"/>
      <path class="c" fill="#fff" d="M328,316 L328,150 L350,104 L372,150 L372,316 Z"/>
      <path class="c" fill="#fff" d="M272,316 L272,140 L288,140 L288,158 L298,158 L298,140 L314,140 L314,158 L324,158 L324,140 L340,140 L340,316 Z"/>
      <path fill="#3a3a3a" stroke="none" d="M248,180 L264,180 L264,202 L248,202 Z M348,180 L364,180 L364,202 L348,202 Z"/>
      <circle class="c" fill="#fff" cx="306" cy="216" r="15"/>
      <path class="c" fill="#fff" d="M286,316 L286,274 A20,20 0 0 1 326,274 L326,316 Z"/>
      <path class="c" fill="#fff" d="M24,374 L24,318 C90,304 150,312 214,300 C264,290 320,286 376,292 L376,374 Z"/>
      <path class="c" fill="#fff" d="M98,300 L126,300 C158,316 180,344 188,372 L32,372 C40,344 62,316 98,300 Z"/>
      <rect class="c" fill="#fff" x="92" y="270" width="36" height="42"/>
      <path class="c" fill="#fff" d="M164,322 C182,302 192,274 194,242 L216,246 C214,282 202,314 182,338 Z"/>
      <path class="c" fill="#fff" d="M110,148 C54,148 30,190 30,232 C30,268 36,296 42,320 L80,320 C70,296 66,268 66,240 L154,240 C154,268 150,296 140,320 L178,320 C184,296 190,268 190,232 C190,190 166,148 110,148 Z"/>
      <circle class="c" fill="#fff" cx="110" cy="222" r="62"/>
      <polygon class="c" fill="#fff" points="88,172 88,158 97,130 104,152 110,122 116,152 123,130 132,158 132,172"/>
      <circle fill="#3a3a3a" stroke="none" cx="92" cy="222" r="11"/>
      <circle fill="#3a3a3a" stroke="none" cx="128" cy="222" r="11"/>
      <circle fill="#fff" stroke="none" cx="96" cy="218" r="4"/>
      <circle fill="#fff" stroke="none" cx="132" cy="218" r="4"/>
      <path fill="none" d="M98,252 C104,261 116,261 122,252"/>
      <circle class="c" fill="#fff" cx="209" cy="221" r="20"/>
      <path fill="none" d="M199,203 L195,185 M210,199 L210,179 M221,203 L225,185"/>
    </svg>`
  },
  {
    name: '皇冠與寶石',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <rect class="c" fill="#fff" x="60" y="286" width="280" height="72" rx="26"/>
      <path fill="none" d="M78,342 L322,342"/>
      <path class="c" fill="#fff" d="M118,268 L118,146 L158,196 L200,124 L242,196 L282,146 L282,268 Z"/>
      <circle class="c" fill="#fff" cx="156" cy="222" r="17"/>
      <circle class="c" fill="#fff" cx="200" cy="222" r="17"/>
      <circle class="c" fill="#fff" cx="244" cy="222" r="17"/>
      <rect class="c" fill="#fff" x="112" y="250" width="176" height="58" rx="10"/>
      <circle class="c" fill="#fff" cx="150" cy="279" r="15"/>
      <circle class="c" fill="#fff" cx="200" cy="279" r="20"/>
      <circle class="c" fill="#fff" cx="250" cy="279" r="15"/>
      <circle fill="#3a3a3a" stroke="none" cx="118" cy="146" r="11"/>
      <circle fill="#3a3a3a" stroke="none" cx="200" cy="124" r="11"/>
      <circle fill="#3a3a3a" stroke="none" cx="282" cy="146" r="11"/>
      <path fill="none" d="M60,150 L60,180 M45,165 L75,165 M336,132 L336,158 M323,145 L349,145"/>
    </svg>`
  }
];

/* classic script 裡的 const 不會掛上 window，coloring.js 是用 window.LINEART_FANTASY 取值（缺檔時要能安全跳過），所以這裡補一行。 */
window.LINEART_FANTASY = LINEART_FANTASY;
