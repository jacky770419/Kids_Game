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
    name: '抱抱熊',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="6.75" d="M148,64 C130,34 92,42 96,78 C98,94 108,104 120,108 C98,128 86,154 88,178 C89,198 96,214 108,224 C78,248 62,290 64,322 C66,352 88,368 124,370 L276,370 C312,368 334,352 336,322 C338,290 322,248 292,224 C304,214 311,198 312,178 C314,154 302,128 280,108 C292,104 302,94 304,78 C308,42 270,34 252,64 C236,50 218,44 200,44 C182,44 164,50 148,64 Z"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="118" cy="72" r="15"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="282" cy="72" r="15"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="200" cy="296" rx="60" ry="52"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="130" cy="346" rx="40" ry="24"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="270" cy="346" rx="40" ry="24"/>
      <path fill="none" stroke-width="1.88" d="M118,332 C122,338 128,338 132,332 M142,334 C146,340 152,340 156,334 M244,334 C248,340 254,340 258,334 M268,332 C272,338 278,338 282,332"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M112,234 C90,262 98,298 138,308 C150,311 160,306 164,296 C154,296 144,292 138,284 C126,268 126,250 134,238"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M288,234 C310,262 302,298 262,308 C250,311 240,306 236,296 C246,296 256,292 262,284 C274,268 274,250 266,238"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M200,252 C188,232 158,234 158,260 C158,282 184,294 200,306 C216,294 242,282 242,260 C242,234 212,232 200,252 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="200" cy="184" rx="42" ry="32"/>
      <circle fill="#3a3a3a" stroke="none" cx="162" cy="156" r="9"/>
      <circle fill="#3a3a3a" stroke="none" cx="238" cy="156" r="9"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="200" cy="174" rx="13" ry="9"/>
      <path fill="none" stroke-width="2.25" d="M200,184 C200,196 190,200 183,194 M200,184 C200,196 210,200 217,194"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="126" cy="184" r="13"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="274" cy="184" r="13"/>
      </svg>`
  },
  {
    name: '圓圓貓熊',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <circle fill="#3a3a3a" stroke="none" cx="122" cy="66" r="30"/>
      <circle fill="#3a3a3a" stroke="none" cx="278" cy="66" r="30"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M116,96 C96,120 84,150 86,176 C87,198 95,215 108,226 C78,250 62,292 64,324 C66,354 90,370 126,370 L274,370 C310,370 334,354 336,324 C338,292 322,250 292,226 C305,215 313,198 314,176 C316,150 304,120 284,96 C260,72 230,60 200,60 C170,60 140,72 116,96 Z"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="156" cy="160" rx="24" ry="30" transform="rotate(-18 156 160)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="244" cy="160" rx="24" ry="30" transform="rotate(18 244 160)"/>
      <circle fill="#fff" stroke="none" cx="160" cy="156" r="10"/>
      <circle fill="#fff" stroke="none" cx="240" cy="156" r="10"/>
      <circle fill="#3a3a3a" stroke="none" cx="161" cy="158" r="5"/>
      <circle fill="#3a3a3a" stroke="none" cx="239" cy="158" r="5"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="200" cy="300" rx="58" ry="50"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="132" cy="348" rx="38" ry="24"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="268" cy="348" rx="38" ry="24"/>
      <path fill="none" stroke-width="1.88" d="M120,334 C124,340 130,340 134,334 M144,336 C148,342 154,342 158,336 M242,336 C246,342 252,342 256,336 M266,334 C270,340 276,340 280,334"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M112,238 C92,264 98,298 136,310 C148,313 158,308 162,298 C152,298 142,294 136,286 C126,272 126,254 134,242"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M288,238 C308,264 302,298 264,310 C252,313 242,308 238,298 C248,298 258,294 264,286 C274,272 274,254 266,242"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="200" cy="198" rx="38" ry="28"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="200" cy="188" rx="12" ry="8"/>
      <path fill="none" stroke-width="2.25" d="M200,197 C200,208 191,212 184,206 M200,197 C200,208 209,212 216,206"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="120" cy="198" r="12"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="280" cy="198" r="12"/>
      </svg>`
  },
  {
    name: '長耳兔',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="6.75" d="M152,118 C128,92 112,60 116,42 C119,24 141,22 152,38 C160,50 168,74 172,92 C182,86 218,86 228,92 C232,74 240,50 248,38 C259,22 281,24 284,42 C288,60 272,92 248,118 C266,132 276,152 277,172 C278,192 271,208 259,218 C286,240 300,278 298,310 C296,344 272,366 232,368 L168,368 C128,366 104,344 102,310 C100,278 114,240 141,218 C129,208 122,192 123,172 C124,152 134,132 152,118 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="2.63" cx="139" cy="70" rx="11" ry="32" transform="rotate(-14 139 70)"/>
      <ellipse class="c" fill="#fff" stroke-width="2.63" cx="261" cy="70" rx="11" ry="32" transform="rotate(14 261 70)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="200" cy="300" rx="52" ry="44"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="146" cy="350" rx="38" ry="20"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="254" cy="350" rx="38" ry="20"/>
      <path fill="none" stroke-width="1.88" d="M136,338 C140,344 146,344 150,338 M158,340 C162,346 168,346 172,340 M228,340 C232,346 238,346 242,340 M250,338 C254,344 260,344 264,338"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M142,240 C124,262 126,292 152,302 C164,306 174,301 177,292 C168,292 160,288 155,281 C146,268 146,254 153,244"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M258,240 C276,262 274,292 248,302 C236,306 226,301 223,292 C232,292 240,288 245,281 C254,268 254,254 247,244"/>
      <circle fill="#3a3a3a" stroke="none" cx="166" cy="164" r="9"/>
      <circle fill="#3a3a3a" stroke="none" cx="234" cy="164" r="9"/>
      <path fill="#3a3a3a" stroke="none" d="M191,184 L209,184 L200,196 Z"/>
      <path fill="none" stroke-width="2.25" d="M200,196 C200,207 191,211 184,205 M200,196 C200,207 209,211 216,205"/>
      <path fill="none" stroke-width="1.88" d="M118,178 L72,170 M120,194 L74,198 M282,178 L328,170 M280,194 L326,198"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="140" cy="190" r="12"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="260" cy="190" r="12"/>
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
    name: '呱呱蛙',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="200" cy="350" rx="162" ry="22"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M110,132 C86,110 88,70 118,62 C146,54 168,74 166,100 C176,92 186,88 200,88 C214,88 224,92 234,100 C232,74 254,54 282,62 C312,70 314,110 290,132 C318,156 334,192 334,232 C334,300 274,348 200,348 C126,348 66,300 66,232 C66,192 82,156 110,132 Z"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="118" cy="168" r="12"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="282" cy="168" r="12"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="200" cy="280" rx="84" ry="58"/>
      <circle fill="#3a3a3a" stroke="none" cx="138" cy="92" r="12"/>
      <circle fill="#3a3a3a" stroke="none" cx="262" cy="92" r="12"/>
      <circle fill="#fff" stroke="none" cx="142" cy="88" r="4"/>
      <circle fill="#fff" stroke="none" cx="266" cy="88" r="4"/>
      <circle fill="#3a3a3a" stroke="none" cx="188" cy="168" r="3.5"/>
      <circle fill="#3a3a3a" stroke="none" cx="212" cy="168" r="3.5"/>
      <path fill="none" stroke-width="3.75" d="M122,196 C152,234 248,234 278,196"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="126" cy="222" r="13"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="274" cy="222" r="13"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M136,306 C118,314 108,332 118,346 C122,340 128,340 132,346 C136,338 142,338 148,346 C152,338 158,338 164,344 C168,330 158,312 148,304"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M264,306 C282,314 292,332 282,346 C278,340 272,340 268,346 C264,338 258,338 252,346 C248,338 242,338 236,344 C232,330 242,312 252,304"/>
      </svg>`
  },
  {
    name: '黃色小鴨',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="6.75" d="M105,150 C102,96 142,48 200,48 C258,48 298,96 295,150 C293,178 280,200 262,214 C300,238 318,276 314,304 C308,346 262,358 200,358 C138,358 92,346 86,304 C82,276 100,238 138,214 C120,200 107,178 105,150 Z"/>
      <path fill="none" stroke-width="2.63" d="M200,48 C194,30 208,22 216,32 M186,52 C178,34 164,34 162,46"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M104,258 C74,270 62,300 76,326 C84,318 90,318 94,326 C100,316 106,316 112,322 C118,308 116,284 112,268"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M296,258 C326,270 338,300 324,326 C316,318 310,318 306,326 C300,316 294,316 288,322 C282,308 284,284 288,268"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="200" cy="308" rx="56" ry="36"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M120,352 C104,362 106,374 124,372 C138,371 148,364 152,354"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M280,352 C296,362 294,374 276,372 C262,371 252,364 248,354"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M152,160 C164,150 236,150 248,160 C256,166 254,176 244,179 C216,186 184,186 156,179 C146,176 144,166 152,160 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M176,183 C182,193 218,193 224,183 C208,187 192,187 176,183 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="156" cy="140" r="10"/>
      <circle fill="#3a3a3a" stroke="none" cx="244" cy="140" r="10"/>
      <circle fill="#fff" stroke="none" cx="159" cy="136" r="3.5"/>
      <circle fill="#fff" stroke="none" cx="247" cy="136" r="3.5"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="126" cy="168" r="12"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="274" cy="168" r="12"/>
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
    name: '高高長頸鹿',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="3.75" d="M96,52 L90,26 M126,54 L130,28"/>
      <circle fill="#3a3a3a" stroke="none" cx="88" cy="22" r="8"/>
      <circle fill="#3a3a3a" stroke="none" cx="131" cy="24" r="8"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="154" cy="84" rx="26" ry="13" transform="rotate(30 154 84)"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M180,300 L178,352 C178,364 186,368 192,368 C200,368 204,362 204,354 L208,306"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M292,296 L294,352 C294,364 302,368 308,368 C316,368 320,362 320,354 L320,300"/>
      <path fill="none" stroke-width="3.75" d="M322,254 C348,268 352,296 340,314"/>
      <path fill="#3a3a3a" stroke="none" d="M340,310 C350,320 350,336 340,340 C332,334 332,320 340,310 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M96,50 C70,52 54,74 56,98 C57,118 68,132 86,136 C120,180 140,220 148,262 C130,268 118,282 116,298 L112,352 C112,366 120,370 128,370 L138,370 C146,370 150,364 150,354 L154,306 C182,314 218,314 246,306 L248,352 C248,366 256,370 264,370 L274,370 C282,370 286,364 286,352 L288,300 C310,290 322,272 320,252 C314,238 300,232 284,234 C258,238 230,238 208,232 C184,196 164,150 152,102 C150,80 136,60 112,52 C106,50 100,50 96,50 Z"/>
      <path fill="none" stroke-width="2.63" d="M152,106 C162,108 164,118 157,124 M164,130 C174,132 176,142 169,148 M176,154 C186,156 188,166 181,172 M188,178 C198,180 200,190 193,196"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="70" cy="106" rx="24" ry="20"/>
      <circle fill="#3a3a3a" stroke="none" cx="62" cy="100" r="3.5"/>
      <path fill="none" stroke-width="2.25" d="M52,116 C58,124 68,126 76,122"/>
      <circle fill="#3a3a3a" stroke="none" cx="102" cy="94" r="9"/>
      <circle fill="#fff" stroke="none" cx="105" cy="91" r="3"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="160" cy="188" r="13"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="184" cy="234" r="14"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="220" cy="272" r="17"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="262" cy="264" r="16"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="292" cy="288" r="13"/>
      <path fill="none" stroke-width="2.63" d="M112,358 L150,358 M248,358 L286,358 M178,356 L204,356 M294,356 L320,356"/>
      </svg>`
  },
  {
    name: '搖擺企鵝',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="6.75" d="M200,42 C136,42 96,102 96,196 C96,290 136,344 200,344 C264,344 304,290 304,196 C304,102 264,42 200,42 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M102,148 C62,168 44,220 58,266 C64,284 78,286 86,274 C72,242 78,196 98,168"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M298,148 C338,168 356,220 342,266 C336,284 322,286 314,274 C328,242 322,196 302,168"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="168" cy="118" r="34"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="232" cy="118" r="34"/>
      <ellipse class="c" fill="#fff" stroke-width="2.63" cx="200" cy="232" rx="66" ry="90"/>
      <circle fill="#3a3a3a" stroke="none" cx="166" cy="120" r="10"/>
      <circle fill="#3a3a3a" stroke="none" cx="234" cy="120" r="10"/>
      <circle fill="#fff" stroke="none" cx="169" cy="117" r="3.5"/>
      <circle fill="#fff" stroke="none" cx="237" cy="117" r="3.5"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M186,140 L214,140 L200,160 Z"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="136" cy="146" r="11"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="264" cy="146" r="11"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="150" cy="342" rx="32" ry="17"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="250" cy="342" rx="32" ry="17"/>
      <path fill="none" stroke-width="1.88" d="M140,352 L140,340 M156,354 L156,342 M244,354 L244,342 M260,352 L260,340"/>
      <path fill="none" stroke-width="1.88" d="M176,262 C184,270 216,270 224,262 M182,286 C190,293 210,293 218,286"/>
      </svg>`
  },
  {
    name: '頑皮小猴',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="4.5" d="M278,300 C332,300 354,268 346,236 C340,214 318,212 314,230 C312,244 326,248 334,240"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M132,102 C120,90 100,88 90,102 C78,116 82,138 96,148 C104,154 114,156 122,152 C118,168 118,184 122,198 C130,222 152,236 172,240 C142,258 122,290 122,318 C122,350 152,368 200,368 C248,368 278,350 278,318 C278,290 258,258 228,240 C248,236 270,222 278,198 C282,184 282,168 278,152 C286,156 296,154 304,148 C318,138 322,116 310,102 C300,88 280,90 268,102 C252,84 228,74 200,74 C172,74 148,84 132,102 Z"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="100" cy="122" r="12"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="300" cy="122" r="12"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M200,134 C188,120 164,122 154,138 C145,153 145,172 152,188 C162,209 180,220 200,220 C220,220 238,209 248,188 C255,172 255,153 246,138 C236,122 212,120 200,134 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="200" cy="310" rx="44" ry="38"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M262,250 C298,242 318,220 324,192 C318,178 306,172 296,178 C290,192 280,204 268,212"/>
      <circle class="c" fill="#fff" stroke-width="4.5" cx="316" cy="176" r="17"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M138,252 C118,270 112,294 120,314 C124,324 134,326 140,318 C134,304 138,286 150,274"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="158" cy="352" rx="34" ry="20"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="242" cy="352" rx="34" ry="20"/>
      <circle fill="#3a3a3a" stroke="none" cx="176" cy="156" r="9"/>
      <circle fill="#3a3a3a" stroke="none" cx="224" cy="156" r="9"/>
      <circle fill="#fff" stroke="none" cx="179" cy="153" r="3"/>
      <circle fill="#fff" stroke="none" cx="227" cy="153" r="3"/>
      <circle fill="#3a3a3a" stroke="none" cx="192" cy="186" r="3"/>
      <circle fill="#3a3a3a" stroke="none" cx="208" cy="186" r="3"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M184,200 C190,214 210,214 216,200 C206,204 194,204 184,200 Z"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="160" cy="186" r="10"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="240" cy="186" r="10"/>
      </svg>`
  },
  {
    name: '大眼貓頭鷹',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="6.75" d="M136,80 C120,56 96,48 76,54 C88,66 96,84 100,104 C84,132 76,166 76,204 C76,290 128,340 200,340 C272,340 324,290 324,204 C324,166 316,132 300,104 C304,84 312,66 324,54 C304,48 280,56 264,80 C244,68 222,62 200,62 C178,62 156,68 136,80 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M96,192 C80,238 86,294 110,322 C126,298 122,244 128,208"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M304,192 C320,238 314,294 290,322 C274,298 278,244 272,208"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="200" cy="280" rx="66" ry="48"/>
      <path fill="none" stroke-width="1.88" d="M168,268 C173,276 183,276 188,268 M194,268 C199,276 209,276 214,268 M220,268 C225,276 235,276 240,268 M180,292 C185,300 195,300 200,292 M206,292 C211,300 221,300 226,292"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="154" cy="158" r="45"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="246" cy="158" r="45"/>
      <circle fill="#3a3a3a" stroke="none" cx="154" cy="158" r="19"/>
      <circle fill="#3a3a3a" stroke="none" cx="246" cy="158" r="19"/>
      <circle fill="#fff" stroke="none" cx="161" cy="151" r="6"/>
      <circle fill="#fff" stroke="none" cx="253" cy="151" r="6"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M200,190 L216,210 L200,232 L184,210 Z"/>
      <rect class="c" fill="#fff" stroke-width="4.5" x="36" y="344" width="328" height="24" rx="12"/>
      <path fill="none" stroke-width="2.63" d="M60,344 C68,332 82,328 94,332 M320,368 C326,378 338,382 348,378"/>
      <path fill="none" stroke-width="2.63" d="M164,336 L164,352 M154,358 L164,352 L164,360 M164,352 L174,358 M236,336 L236,352 M226,358 L236,352 L236,360 M236,352 L246,358"/>
      </svg>`
  },
  {
    name: '噴水鯨魚',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="2.63" d="M172,116 C160,90 140,76 118,74 C110,60 118,44 134,46 C158,50 176,66 182,84 C188,66 206,50 230,46 C246,44 254,60 246,74 C224,76 204,90 192,116 Z"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="106" cy="36" r="10"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="258" cy="34" r="10"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="182" cy="26" r="9"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M30,346 C56,330 82,330 108,342 C134,354 162,354 188,342 C214,330 242,330 268,342 C294,354 322,354 348,342 C356,338 364,336 370,336 L370,372 L30,372 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M56,220 C56,160 120,116 200,116 C264,116 314,146 330,192 C334,180 336,168 334,156 C348,130 372,122 386,134 C392,144 388,156 374,162 C386,172 390,190 380,200 C370,210 352,206 342,194 C342,216 338,236 328,252 C300,296 256,322 200,322 C120,322 56,284 56,220 Z"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M72,250 C112,300 288,300 326,244 C298,292 252,316 200,316 C142,316 96,290 72,250 Z"/>
      <path fill="none" stroke-width="1.88" d="M96,264 C150,296 250,296 304,260 M116,282 C164,306 236,306 284,278"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M176,262 C164,296 180,318 212,312 C214,292 202,272 190,258"/>
      <circle fill="#3a3a3a" stroke="none" cx="110" cy="196" r="10"/>
      <circle fill="#fff" stroke="none" cx="113" cy="193" r="3.5"/>
      <path fill="none" stroke-width="2.63" d="M74,228 C88,244 110,248 128,240"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="130" cy="222" r="12"/>
      </svg>`
  }
];

/* classic script 裡的 const 不會掛上 window，coloring.js 是用 window.LINEART_ANIMALS 取值（缺檔時要能安全跳過），所以這裡補一行。 */
window.LINEART_ANIMALS = LINEART_ANIMALS;
