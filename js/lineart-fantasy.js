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
    name: '棒棒糖城堡',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="3.75" d="M28,374 L372,374"/>
      <path fill="none" stroke-width="3.75" d="M200,150 L200,260"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="200" cy="106" r="48"/>
      <path fill="none" stroke-width="2.25" d="M200,106 C200,96 213,96 213,106 C213,121 187,121 187,106 C187,86 221,86 221,106 C221,131 179,131 179,106"/>
      <rect class="c" fill="#fff" stroke-width="4.5" x="46" y="140" width="66" height="234"/>
      <polygon class="c" fill="#fff" stroke-width="4.5" points="36,148 122,148 79,72"/>
      <path fill="none" stroke-width="1.88" d="M62,118 L88,132 M55,132 L96,144"/>
      <path fill="none" stroke-width="2.25" d="M79,72 L79,24"/>
      <polygon fill="#3a3a3a" stroke="none" points="79,24 112,34 79,44"/>
      <rect fill="#3a3a3a" stroke="none" x="66" y="196" width="26" height="40" rx="13"/>
      <rect class="c" fill="#fff" stroke-width="4.5" x="288" y="222" width="66" height="152"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M280,226 A41,41 0 0 1 362,226 Z"/>
      <path fill="none" stroke-width="1.88" d="M305,224 C303,206 308,194 315,188 M337,224 C339,206 334,194 327,188"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="321" cy="178" r="11"/>
      <rect fill="#3a3a3a" stroke="none" x="308" y="254" width="26" height="36" rx="13"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M112,374 L112,252 L138,252 L138,276 L162,276 L162,252 L188,252 L188,276 L212,276 L212,252 L238,252 L238,276 L262,276 L262,252 L288,252 L288,374 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M112,332 L112,314 L122,314 L122,302 L136,302 L136,314 L152,314 L152,302 L166,302 L166,314 L182,314 L182,302 L196,302 L196,314 L212,314 L212,302 L226,302 L226,314 L242,314 L242,302 L256,302 L256,314 L272,314 L272,302 L282,302 L282,314 L288,314 L288,332 Z"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="140" cy="350" r="14"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="260" cy="350" r="14"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M172,374 L172,318 A28,28 0 0 1 228,318 L228,374 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="216" cy="344" r="5"/>
      </svg>`
  },
  {
    name: '綿綿雲城堡',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <rect class="c" fill="#fff" stroke-width="4.5" x="88" y="180" width="64" height="160"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M82,204 L82,170 L98,170 L98,184 L112,184 L112,170 L128,170 L128,184 L142,184 L142,170 L158,170 L158,204 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M88,240 L88,224 L100,224 L100,214 L112,214 L112,224 L126,224 L126,214 L138,214 L138,224 L152,224 L152,240 Z"/>
      <rect fill="#3a3a3a" stroke="none" x="106" y="256" width="28" height="40" rx="14"/>
      <rect class="c" fill="#fff" stroke-width="6.75" x="160" y="128" width="80" height="212"/>
      <polygon class="c" fill="#fff" stroke-width="4.5" points="148,134 252,134 200,60"/>
      <path fill="none" stroke-width="2.25" d="M200,60 L200,22"/>
      <polygon fill="#3a3a3a" stroke="none" points="200,22 228,31 200,40"/>
      <rect fill="#3a3a3a" stroke="none" x="186" y="210" width="28" height="44" rx="14"/>
      <rect class="c" fill="#fff" stroke-width="4.5" x="248" y="208" width="60" height="132"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M244,212 A34,34 0 0 1 312,212 Z"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="278" cy="172" r="10"/>
      <rect fill="#3a3a3a" stroke="none" x="264" y="262" width="28" height="36" rx="14"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M74,366 C36,366 30,326 62,318 C58,292 86,276 108,288 C118,264 154,260 170,282 C188,256 230,256 248,282 C266,262 298,268 306,292 C332,280 358,296 352,322 C378,330 372,366 338,366 Z"/>
      <path fill="none" stroke-width="1.88" d="M110,334 C120,324 134,326 138,336 M240,340 C250,330 264,332 268,342"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M46,96 C30,96 28,78 44,74 C46,62 64,58 72,68 C86,62 98,72 94,84 C100,92 92,100 82,98 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M330,122 C314,122 312,104 328,100 C330,88 348,84 356,94 C370,88 382,98 378,110 C384,118 376,126 366,124 Z"/>
      </svg>`
  },
  {
    name: '花花小公主',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="6.75" d="M180,214 C188,208 212,208 220,214 L228,276 L172,276 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M172,270 C158,300 118,332 68,354 C52,362 56,372 68,372 L332,372 C344,372 348,362 332,354 C282,332 242,300 228,270 Z"/>
      <path fill="none" stroke-width="2.63" d="M146,298 C158,332 178,344 200,338 M254,298 C242,332 222,344 200,338"/>
      <ellipse class="c" fill="#fff" stroke-width="2.25" cx="200" cy="298" rx="8" ry="13"/>
      <ellipse class="c" fill="#fff" stroke-width="2.25" cx="181" cy="312" rx="8" ry="13" transform="rotate(72 181 312)"/>
      <ellipse class="c" fill="#fff" stroke-width="2.25" cx="188" cy="334" rx="8" ry="13" transform="rotate(144 188 334)"/>
      <ellipse class="c" fill="#fff" stroke-width="2.25" cx="212" cy="334" rx="8" ry="13" transform="rotate(216 212 334)"/>
      <ellipse class="c" fill="#fff" stroke-width="2.25" cx="219" cy="312" rx="8" ry="13" transform="rotate(288 219 312)"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="200" cy="318" r="10"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M152,110 C136,122 126,144 127,170 C128,200 130,228 138,246 C146,260 162,260 168,248 C159,236 154,216 153,194 C152,166 151,134 152,110 Z M248,110 C264,122 274,144 273,170 C272,200 270,228 262,246 C254,260 238,260 232,248 C241,236 246,216 247,194 C248,166 249,134 248,110 Z"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="200" cy="132" r="52"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M200,82 C176,82 158,98 153,122 C151,134 153,144 157,152 C166,134 180,122 200,110 Z M200,82 C224,82 242,98 247,122 C249,134 247,144 243,152 C234,134 220,122 200,110 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M170,88 L163,54 L182,70 L200,42 L218,70 L237,54 L230,88 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="258" cy="78" rx="6" ry="10"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="241" cy="90" rx="6" ry="10" transform="rotate(72 241 90)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="247" cy="110" rx="6" ry="10" transform="rotate(144 247 110)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="269" cy="110" rx="6" ry="10" transform="rotate(216 269 110)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="275" cy="90" rx="6" ry="10" transform="rotate(288 275 90)"/>
      <circle fill="#3a3a3a" stroke="none" cx="258" cy="96" r="7"/>
      <circle fill="#3a3a3a" stroke="none" cx="182" cy="148" r="8"/>
      <circle fill="#3a3a3a" stroke="none" cx="218" cy="148" r="8"/>
      <circle fill="#fff" stroke="none" cx="185" cy="145" r="3"/>
      <circle fill="#fff" stroke="none" cx="221" cy="145" r="3"/>
      <path fill="none" stroke-width="1.88" d="M189,168 C194,176 206,176 211,168"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="158" cy="164" r="13"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="242" cy="164" r="13"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M146,222 C152,238 164,250 180,258 L188,246 C174,240 162,230 156,218 Z M254,222 C248,238 236,250 220,258 L212,246 C226,240 238,230 244,218 Z"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="150" cy="214" r="18"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="250" cy="214" r="18"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="190" cy="260" rx="11" ry="9"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="210" cy="260" rx="11" ry="9"/>
      </svg>`
  },
  {
    name: '捲捲髮公主',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="6.75" d="M144,226 C112,232 88,210 96,184 C74,174 72,142 94,132 C86,106 106,84 130,90 C134,62 164,48 186,62 C192,42 232,44 236,64 C260,50 288,66 290,92 C314,88 332,110 324,134 C346,146 342,176 320,186 C328,212 302,232 272,224 C250,238 154,238 144,226 Z"/>
      <circle class="c" fill="#fff" stroke-width="4.5" cx="98" cy="214" r="24"/>
      <circle class="c" fill="#fff" stroke-width="4.5" cx="302" cy="214" r="24"/>
      <path fill="none" stroke-width="1.88" d="M98,214 C98,207 107,207 107,214 C107,223 89,223 89,214 C89,201 113,201 113,214"/>
      <path fill="none" stroke-width="1.88" d="M302,214 C302,207 293,207 293,214 C293,223 311,223 311,214 C311,201 287,201 287,214"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M180,216 C188,210 212,210 220,216 L228,278 L172,278 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M172,272 C158,302 118,334 66,356 C52,364 56,374 68,374 L332,374 C344,374 348,364 334,356 C282,334 242,302 228,272 Z"/>
      <path fill="none" stroke-width="2.63" d="M162,290 C152,322 146,348 143,370 M238,290 C248,322 254,348 257,370"/>
      <path fill="none" stroke-width="1.88" d="M84,372 C94,358 110,358 118,372 M170,372 C180,358 196,358 204,372 M252,372 C262,358 278,358 286,372"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M200,300 C192,286 170,288 170,304 C170,318 188,330 200,338 C212,330 230,318 230,304 C230,288 208,286 200,300 Z"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="200" cy="142" r="50"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M200,94 C178,94 162,106 156,126 C154,136 156,146 160,152 C164,140 172,132 180,136 C178,122 188,112 200,116 Z M200,94 C222,94 238,106 244,126 C246,136 244,146 240,152 C236,140 228,132 220,136 C222,122 212,112 200,116 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M184,64 L180,38 L194,50 L206,30 L218,50 L232,38 L228,64 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="183" cy="158" r="8"/>
      <circle fill="#3a3a3a" stroke="none" cx="217" cy="158" r="8"/>
      <circle fill="#fff" stroke="none" cx="186" cy="155" r="3"/>
      <circle fill="#fff" stroke="none" cx="220" cy="155" r="3"/>
      <path fill="none" stroke-width="1.88" d="M190,178 C195,186 205,186 210,178"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="160" cy="174" r="13"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="240" cy="174" r="13"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M148,226 C154,242 166,254 182,262 L190,250 C176,244 164,234 158,222 Z M252,226 C246,242 234,254 218,262 L210,250 C224,244 236,234 242,222 Z"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="152" cy="218" r="18"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="248" cy="218" r="18"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="190" cy="264" rx="11" ry="9"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="210" cy="264" rx="11" ry="9"/>
      </svg>`
  },
  {
    name: '南瓜小馬車',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="3.75" d="M28,374 L372,374"/>
      <polygon class="c" fill="#fff" stroke-width="2.63" points="60,36 66,54 84,60 66,66 60,84 54,66 36,60 54,54"/>
      <polygon class="c" fill="#fff" stroke-width="2.63" points="344,28 350,46 368,52 350,58 344,76 338,58 326,52 338,46"/>
      <ellipse class="c" fill="#fff" stroke-width="6.75" cx="200" cy="212" rx="126" ry="110"/>
      <path fill="none" stroke-width="2.63" d="M152,112 C126,162 126,264 152,314 M248,112 C274,162 274,264 248,314"/>
      <path fill="none" stroke-width="1.88" d="M186,104 C176,160 176,266 186,320 M214,104 C224,160 224,266 214,320"/>
      <path fill="none" stroke-width="3.75" d="M200,102 C196,76 210,60 228,64"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M204,88 C214,68 236,64 246,78 C236,90 218,94 204,88 Z"/>
      <path fill="none" stroke-width="1.88" d="M228,64 C242,58 250,66 244,76"/>
      <path fill="none" stroke-width="1.88" d="M176,96 C164,84 166,70 178,66"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="136" cy="182" r="17"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="264" cy="182" r="17"/>
      <path fill="none" stroke-width="1.88" d="M136,165 L136,199 M119,182 L153,182 M264,165 L264,199 M247,182 L281,182"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M172,320 L172,246 A28,28 0 0 1 228,246 L228,320 Z"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="200" cy="252" r="12"/>
      <circle fill="#3a3a3a" stroke="none" cx="216" cy="290" r="5"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="112" cy="314" r="56"/>
      <path fill="none" stroke-width="2.63" d="M112,258 L112,370 M56,314 L168,314 M72,274 L152,354 M72,354 L152,274"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="112" cy="314" r="16"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="290" cy="302" r="68"/>
      <path fill="none" stroke-width="2.63" d="M290,234 L290,370 M222,302 L358,302 M242,254 L338,350 M242,350 L338,254"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="290" cy="302" r="19"/>
      </svg>`
  },
  {
    name: '彩虹獨角獸',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="3.75" d="M28,374 L372,374"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M334,204 C366,206 378,236 370,276 C364,306 348,324 330,330 C344,298 348,262 336,238 C332,228 326,212 320,208 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M330,230 C352,238 360,264 352,292 C347,308 338,318 329,320 C338,296 340,262 330,244 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M198,176 C158,178 132,204 132,246 C132,294 170,322 234,322 C296,322 338,296 338,250 C338,208 308,182 266,180 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="238" cy="300" rx="44" ry="17"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M146,300 L146,352 C146,366 176,366 176,352 L176,300"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M196,308 L196,356 C196,370 226,370 226,356 L226,308"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M262,308 L262,356 C262,370 292,370 292,356 L292,308"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M312,300 L312,352 C312,366 342,366 342,352 L342,300"/>
      <path fill="none" stroke-width="1.88" d="M148,346 L174,346 M198,350 L224,350 M264,350 L290,350 M314,346 L340,346"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M148,64 C196,42 242,62 252,104 C259,136 252,172 234,196 C246,208 254,222 256,236 C242,244 228,244 216,240 C214,222 208,206 198,198 C216,168 218,130 202,106 C190,88 168,78 148,78 Z"/>
      <path fill="none" stroke-width="1.88" d="M224,108 C236,140 234,172 220,196 M240,118 C250,148 248,182 234,206"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M150,66 C186,64 210,88 212,126 C213,158 208,182 216,214 L162,232 C154,202 146,186 128,182 C100,178 84,160 86,138 C88,116 102,106 118,110 C114,86 130,68 150,66 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M120,64 C122,44 142,44 146,62 C140,74 126,76 120,64 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="100" cy="170" rx="28" ry="20"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="88" cy="168" rx="3.5" ry="5"/>
      <path fill="none" stroke-width="1.88" d="M84,184 C92,191 102,192 110,188"/>
      <polygon class="c" fill="#fff" stroke-width="3.75" points="152,70 180,66 168,16"/>
      <path fill="none" stroke-width="1.88" d="M158,48 L174,44 M154,62 L178,58"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M122,82 C134,70 154,70 160,84 C150,94 130,94 122,82 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="134" cy="142" r="9"/>
      <circle fill="#fff" stroke="none" cx="137" cy="139" r="3.5"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="154" cy="176" r="11"/>
      </svg>`
  },
  {
    name: '公主的城堡',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="3.75" d="M28,374 L372,374"/>
      <rect class="c" fill="#fff" stroke-width="4.5" x="214" y="118" width="56" height="256"/>
      <polygon class="c" fill="#fff" stroke-width="4.5" points="204,124 284,124 244,54"/>
      <path fill="none" stroke-width="2.25" d="M244,54 L244,20"/>
      <polygon fill="#3a3a3a" stroke="none" points="244,20 270,29 244,38"/>
      <rect fill="#3a3a3a" stroke="none" x="230" y="180" width="24" height="36" rx="12"/>
      <rect class="c" fill="#fff" stroke-width="4.5" x="312" y="204" width="52" height="170"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M306,208 A32,32 0 0 1 370,208 Z"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="338" cy="170" r="9"/>
      <rect fill="#3a3a3a" stroke="none" x="326" y="250" width="24" height="32" rx="12"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M270,374 L270,262 L284,262 L284,276 L298,276 L298,262 L312,262 L312,374 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M270,320 L270,304 L280,304 L280,294 L291,294 L291,304 L302,304 L302,294 L312,294 L312,320 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M277,374 L277,336 A14,14 0 0 1 305,336 L305,374 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="2.63" cx="216" cy="364" rx="18" ry="7"/>
      <ellipse class="c" fill="#fff" stroke-width="2.63" cx="248" cy="356" rx="15" ry="6"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M70,134 C56,146 49,166 50,190 C51,216 53,240 61,254 C68,266 82,266 88,256 C80,246 76,230 75,212 C74,188 71,158 70,134 Z M154,134 C168,146 175,166 174,190 C173,216 171,240 163,254 C156,266 142,266 136,256 C144,246 148,230 149,212 C150,188 153,158 154,134 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M98,206 C104,200 120,200 126,206 L132,256 L92,256 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M92,252 C84,278 62,312 40,340 C30,354 34,368 46,368 L178,368 C190,368 194,354 184,340 C162,312 140,278 132,252 Z"/>
      <path fill="none" stroke-width="2.63" d="M72,276 C82,304 96,314 112,310 M152,276 C142,304 128,314 112,310"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="112" cy="162" r="46"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M112,118 C92,118 77,132 73,152 C71,162 73,171 76,178 C84,162 96,152 112,142 Z M112,118 C132,118 147,132 151,152 C153,162 151,171 148,178 C140,162 128,152 112,142 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M90,120 L84,90 L99,103 L112,78 L125,103 L140,90 L134,120 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="98" cy="176" r="7"/>
      <circle fill="#3a3a3a" stroke="none" cx="126" cy="176" r="7"/>
      <circle fill="#fff" stroke="none" cx="100.5" cy="173.5" r="2.5"/>
      <circle fill="#fff" stroke="none" cx="128.5" cy="173.5" r="2.5"/>
      <path fill="none" stroke-width="1.88" d="M104,194 C108,201 116,201 120,194"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="78" cy="188" r="11"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="146" cy="188" r="11"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M74,214 C79,228 90,238 104,245 L110,234 C98,229 88,220 83,210 Z M150,214 C145,228 134,238 120,245 L114,234 C126,229 136,220 141,210 Z"/>
      <circle class="c" fill="#fff" stroke-width="4.5" cx="78" cy="208" r="14"/>
      <circle class="c" fill="#fff" stroke-width="4.5" cx="146" cy="208" r="14"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="105" cy="246" rx="9" ry="8"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="119" cy="246" rx="9" ry="8"/>
      </svg>`
  },
  {
    name: '閃亮皇冠',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <rect class="c" fill="#fff" stroke-width="6.75" x="48" y="298" width="304" height="72" rx="28"/>
      <path fill="none" stroke-width="2.63" d="M66,352 L334,352"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="44" cy="306" r="11"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="356" cy="306" r="11"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M100,252 L100,130 C126,168 152,168 164,128 C174,96 186,80 200,74 C214,80 226,96 236,128 C248,168 274,168 300,130 L300,252 Z"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="100" cy="114" r="14"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="200" cy="56" r="15"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="300" cy="114" r="14"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="200" cy="172" r="21"/>
      <path fill="none" stroke-width="1.88" d="M200,151 L200,193 M179,172 L221,172"/>
      <circle fill="#3a3a3a" stroke="none" cx="144" cy="180" r="5"/>
      <circle fill="#3a3a3a" stroke="none" cx="256" cy="180" r="5"/>
      <rect class="c" fill="#fff" stroke-width="6.75" x="92" y="244" width="216" height="62" rx="16"/>
      <polygon class="c" fill="#fff" stroke-width="3.75" points="200,248 224,274 200,300 176,274"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="134" cy="274" r="14"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="266" cy="274" r="14"/>
      <circle fill="#3a3a3a" stroke="none" cx="162" cy="274" r="4"/>
      <circle fill="#3a3a3a" stroke="none" cx="238" cy="274" r="4"/>
      <polygon class="c" fill="#fff" stroke-width="2.63" points="56,56 63,77 84,84 63,91 56,112 49,91 28,84 49,77"/>
      <polygon class="c" fill="#fff" stroke-width="2.63" points="344,56 351,77 372,84 351,91 344,112 337,91 316,84 337,77"/>
      <polygon class="c" fill="#fff" stroke-width="2.63" points="60,188 65,203 80,208 65,213 60,228 55,213 40,208 55,203"/>
      <polygon class="c" fill="#fff" stroke-width="2.63" points="340,188 345,203 360,208 345,213 340,228 335,213 320,208 335,203"/>
      <path fill="none" stroke-width="1.88" d="M200,26 L200,40 M193,33 L207,33 M124,52 L124,64 M118,58 L130,58 M276,44 L276,56 M270,50 L282,50"/>
      </svg>`
  },
  {
    name: '城堡前的公主',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <line x1="20" y1="382" x2="380" y2="382" stroke-width="6"/>
      <rect class="c" fill="#fff" x="20" y="230" width="80" height="152"/>
      <circle class="c" fill="#fff" cx="60" cy="222" r="38"/>
      <circle fill="#3a3a3a" stroke="none" cx="60" cy="178" r="9"/>
      <rect class="c" fill="#fff" x="42" y="280" width="30" height="46" rx="15"/>
      <rect class="c" fill="#fff" x="300" y="230" width="80" height="152"/>
      <circle class="c" fill="#fff" cx="340" cy="222" r="38"/>
      <circle fill="#3a3a3a" stroke="none" cx="340" cy="178" r="9"/>
      <rect class="c" fill="#fff" x="328" y="280" width="30" height="46" rx="15"/>
      <path class="c" fill="#fff" d="M178,240 L222,240 L232,286 L168,286 Z"/>
      <path class="c" fill="#fff" d="M168,286 L232,286 C248,320 256,350 260,376 L140,376 C144,350 152,320 168,286 Z"/>
      <path class="c" fill="#fff" d="M150,296 L168,286 C152,320 144,350 140,376 L60,376 C68,340 92,308 150,296 Z"/>
      <path class="c" fill="#fff" d="M250,296 L232,286 C248,320 256,350 260,376 L340,376 C332,340 308,308 250,296 Z"/>
      <circle class="c" fill="#fff" cx="138" cy="298" r="25"/>
      <circle class="c" fill="#fff" cx="262" cy="298" r="25"/>
      <circle class="c" fill="#fff" cx="200" cy="178" r="72"/>
      <path class="c" fill="#fff" d="M110,270 C100,186 124,78 200,78 C276,78 300,186 290,270 C283,224 266,192 247,170 C224,190 176,190 153,170 C134,192 119,226 110,270 Z"/>
      <path fill="#3a3a3a" stroke="none" d="M168,80 L176,52 L188,68 L200,46 L212,68 L224,52 L232,80 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="178" cy="210" r="11"/>
      <circle fill="#3a3a3a" stroke="none" cx="222" cy="210" r="11"/>
      <circle fill="#fff" stroke="none" cx="182" cy="206" r="4"/>
      <circle fill="#fff" stroke="none" cx="226" cy="206" r="4"/>
      <path fill="none" d="M188,232 C194,241 206,241 212,232"/>
    </svg>`
  },
  {
    name: '城堡前的小公主',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="3.75" d="M30,374 L370,374"/>
      <rect class="c" fill="#fff" stroke-width="4.5" x="40" y="170" width="60" height="204"/>
      <rect class="c" fill="#fff" stroke-width="4.5" x="300" y="170" width="60" height="204"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M28,170 L112,170 L70,102 Z M288,170 L372,170 L330,102 Z"/>
      <rect fill="#3a3a3a" stroke="none" x="58" y="210" width="24" height="36" rx="12"/>
      <rect fill="#3a3a3a" stroke="none" x="318" y="210" width="24" height="36" rx="12"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M247,246 L247,112 L242,112 L262,84 L282,112 L277,112 L277,246 Z"/>
      <rect fill="#3a3a3a" stroke="none" x="257" y="114" width="10" height="18" rx="5"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M100,374 L100,244 L124,244 L124,218 L150,218 L150,244 L187,244 L187,218 L213,218 L213,244 L250,244 L250,218 L276,218 L276,244 L300,244 L300,374 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M100,324 L100,312 L110,312 L110,300 L126,300 L126,312 L146,312 L146,300 L162,300 L162,312 L182,312 L182,300 L198,300 L198,312 L218,312 L218,300 L234,300 L234,312 L254,312 L254,300 L270,300 L270,312 L290,312 L290,300 L300,300 L300,324 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M186,190 C186,210 190,220 200,220 C210,220 214,210 214,190 Z"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="200" cy="152" r="48"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M152,132 C138,142 130,162 131,186 C132,212 134,236 142,252 C150,264 164,264 170,254 C161,244 156,226 155,206 C154,182 153,155 152,132 Z M248,132 C262,142 270,162 269,186 C268,212 266,236 258,252 C250,264 236,264 230,254 C239,244 244,226 245,206 C246,182 247,155 248,132 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M200,104 C176,104 158,120 153,144 C151,156 153,166 157,174 C166,156 180,144 200,132 Z M200,104 C224,104 242,120 247,144 C249,156 247,166 243,174 C234,156 220,144 200,132 Z"/>
      <path fill="none" stroke-width="3" d="M200,88 L200,24"/>
      <path fill="#3a3a3a" stroke="none" d="M200,24 L226,31 L200,38 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M168,106 L164,74 L182,88 L200,66 L218,88 L236,74 L232,106 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="181" cy="156" r="7.5"/>
      <circle fill="#3a3a3a" stroke="none" cx="219" cy="156" r="7.5"/>
      <path fill="none" stroke-width="2.63" d="M188,178 C194,186 206,186 212,178"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M178,228 C186,222 214,222 222,228 L228,292 L172,292 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M172,290 C148,308 112,332 92,354 C85,362 88,368 96,368 L304,368 C312,368 315,362 308,354 C288,332 252,308 228,290 Z"/>
      <path fill="none" stroke-width="4.5" d="M151,311 C160,344 180,352 200,341 M249,311 C240,344 220,352 200,341"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M144,220 C150,234 162,246 178,254 L186,242 C172,236 160,226 154,214 Z M256,220 C250,234 238,246 222,254 L214,242 C228,236 240,226 246,214 Z"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="150" cy="206" r="19"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="250" cy="206" r="19"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="190" cy="256" rx="11" ry="9"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="210" cy="256" rx="11" ry="9"/>
      </svg>`
  },
  {
    name: '公主與小狗',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="3.75" d="M130,72 C118,72 113,57 125,50 C125,38 144,33 152,42 C160,31 181,34 183,47 C195,47 199,64 187,70 Z M225,58 C215,58 211,46 221,40 C222,30 237,26 244,34 C251,26 268,29 269,40 C279,41 281,54 271,58 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M198,306 C192,290 202,278 216,280 C222,270 238,270 244,280 C258,278 266,290 260,306 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M30,318 C80,300 140,312 200,306 C260,300 320,312 370,304 L370,370 L30,370 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M150,370 C168,350 204,342 246,344 C236,352 226,358 222,370 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M66,150 C70,200 68,260 62,316 L96,316 C90,260 88,200 92,150 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M85,40 C105,38 120,48 126,62 C142,64 152,80 146,95 C156,106 152,124 138,130 C136,148 118,158 102,152 C92,166 68,166 58,152 C40,158 26,146 28,130 C18,122 16,104 26,94 C22,78 32,64 48,64 C52,48 70,38 85,40 Z"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="58" cy="84" rx="6" ry="9" transform="rotate(-20 58 84)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="108" cy="66" rx="6" ry="9" transform="rotate(15 108 66)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="42" cy="118" rx="6" ry="9" transform="rotate(-30 42 118)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="92" cy="128" rx="6" ry="9" transform="rotate(10 92 128)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="132" cy="104" rx="6" ry="9" transform="rotate(30 132 104)"/>
      <path fill="none" stroke-width="2.25" d="M38,352 C36,344 38,338 42,334 M46,352 C46,342 50,336 54,332 M112,348 C110,340 112,334 116,330 M120,348 C120,338 124,332 128,328"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M26,314 C18,302 18,286 28,280 L34,290 L42,278 L50,288 L56,278 C66,284 66,302 58,314 Z M208,326 C200,314 200,298 210,292 L216,302 L224,290 L232,300 L238,290 C248,296 248,314 240,326 Z M82,366 C74,354 74,340 84,334 L90,344 L98,332 L106,342 L112,332 C122,338 122,354 114,366 Z"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="118" cy="298" r="16"/>
      <path fill="none" stroke-width="2.25" d="M118,298 C122,292 129,294 128,301 C127,306 121,307 118,303"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M140,152 C146,162 153,168 163,172 C170,168 182,168 189,170 C196,164 204,155 210,148 C216,158 221,172 222,186 C227,196 230,208 228,218 L235,223 L227,228 C223,240 216,248 208,252 C215,262 220,276 221,290 C222,306 215,319 206,322 C202,328 194,330 188,327 C184,325 180,325 176,327 C170,331 160,331 154,327 C149,324 146,322 146,320 C136,318 129,308 128,295 C127,280 132,262 136,250 C128,246 121,236 118,228 L109,222 L117,216 C114,205 117,194 122,186 C124,171 131,160 140,152 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="172" cy="288" rx="13" ry="20"/>
      <ellipse class="c" fill="#fff" stroke-width="3" cx="130" cy="325" rx="11" ry="6.5"/>
      <ellipse class="c" fill="#fff" stroke-width="3" cx="214" cy="325" rx="11" ry="6.5"/>
      <path class="c" fill="#fff" stroke-width="3" d="M143,291 L141,318 C141,326 147,330 152,329 C157,328 158,323 156,317 L157,291 M187,291 L186,317 C184,323 185,328 190,329 C195,330 201,326 201,318 L199,291"/>
      <ellipse class="c" fill="#fff" stroke-width="3" cx="147" cy="326" rx="12" ry="7"/>
      <ellipse class="c" fill="#fff" stroke-width="3" cx="197" cy="326" rx="12" ry="7"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="172" cy="237" rx="26" ry="15"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="172" cy="229" rx="6.5" ry="5"/>
      <path fill="none" stroke-width="1.88" d="M172,234 C172,239 168,242 163,240 M172,234 C172,239 176,242 181,240"/>
      <circle fill="#3a3a3a" stroke="none" cx="146" cy="219" r="5.5"/>
      <circle fill="#3a3a3a" stroke="none" cx="198" cy="219" r="5.5"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="145" cy="205" rx="5.5" ry="4"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="199" cy="205" rx="5.5" ry="4"/>
      <path fill="none" stroke-width="1.88" d="M126,183 C137,177 150,173 161,172 M219,183 C209,176 198,171 190,170"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M140,160 L132,174 L152,169 Z"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M208,156 L215,171 L196,165 Z"/>
      <path class="c" fill="#fff" stroke-width="6" d="M286,174 C260,180 250,198 250,220 C250,242 246,258 234,268 C246,272 260,270 268,262 C266,240 268,218 272,200 C275,188 280,180 286,174 Z"/>
      <circle class="c" fill="#fff" stroke-width="4.5" cx="302" cy="132" r="40"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M302,78 C330,78 348,98 350,124 C351,148 350,170 354,192 C348,200 336,202 330,196 C333,170 335,146 336,116 C324,128 280,128 268,116 C267,146 269,170 274,196 C268,202 256,200 250,192 C254,170 253,148 254,124 C256,98 274,78 302,78 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M288,88 L286,58 L301,72 L315,52 L329,70 L342,60 L336,98 Z"/>
      <path fill="none" stroke-width="1.88" d="M284,134 C288,131 293,131 297,134 M311,134 C315,131 320,131 324,134"/>
      <circle fill="#3a3a3a" stroke="none" cx="290" cy="146" r="6"/>
      <circle fill="#3a3a3a" stroke="none" cx="318" cy="146" r="6"/>
      <path fill="none" stroke-width="2.25" d="M300,158 C304,164 312,164 316,158"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M292,178 C300,172 318,172 324,178 L330,204 C342,232 350,264 354,300 C357,326 356,344 352,358 L234,362 C238,330 248,298 260,270 C272,244 280,222 286,204 Z"/>
      <path fill="none" stroke-width="2.25" d="M286,204 C298,210 318,210 330,204"/>
      <path fill="none" stroke-width="2.25" d="M293,181 L293,194 L322,194 L322,181"/>
      <circle class="c" fill="#fff" stroke-width="6" cx="330" cy="198" r="15"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="342" cy="222" rx="10" ry="9"/>
      <path fill="none" stroke-width="2.25" d="M344,262 C338,292 338,324 342,352"/>
      <path fill="none" stroke-width="2.25" d="M278,352 C280,334 284,316 290,300 M312,358 C312,340 314,320 318,304"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="272" cy="357" rx="16" ry="9"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M270,178 L244,162 C236,172 238,188 247,193 Z M272,186 L254,212 C262,221 276,220 281,210 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="272" cy="182" r="5"/>
      </svg>`
  }
];

/* classic script 裡的 const 不會掛上 window，coloring.js 是用 window.LINEART_FANTASY 取值（缺檔時要能安全跳過），所以這裡補一行。 */
window.LINEART_FANTASY = LINEART_FANTASY;
