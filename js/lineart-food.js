/* 水果／甜點主題的 Q 版著色線稿。
   每張圖是一段 SVG 字串，class="c" 的區域可以點擊上色。
   coloring.js 會讀 window.LINEART_FOOD，把這一批接在其他線稿後面。
   想加新圖：照同樣格式在陣列裡加一筆即可。 */
const LINEART_FOOD = [
  {
    name: '甜心草莓',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" d="M200,64 C198,46 208,32 226,28"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M200,126 C266,118 336,152 344,224 C351,296 290,348 214,366 C205,368 195,368 186,366 C112,350 50,298 57,222 C64,152 134,118 200,126 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M200,132 C178,120 152,124 130,140 C138,116 130,94 114,80 C142,84 164,74 176,54 C186,72 214,72 224,54 C236,74 258,84 286,80 C270,94 262,116 270,140 C248,124 222,120 200,132 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="150" cy="200" rx="6" ry="9" transform="rotate(-15 150 200)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="210" cy="190" rx="6" ry="9" transform="rotate(10 210 190)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="268" cy="214" rx="6" ry="9" transform="rotate(20 268 214)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="112" cy="256" rx="6" ry="9" transform="rotate(-20 112 256)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="178" cy="252" rx="6" ry="9"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="242" cy="262" rx="6" ry="9" transform="rotate(12 242 262)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="302" cy="268" rx="6" ry="9" transform="rotate(24 302 268)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="148" cy="308" rx="6" ry="9" transform="rotate(-12 148 308)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="212" cy="318" rx="6" ry="9" transform="rotate(8 212 318)"/>
      </svg>`
  },
  {
    name: '清涼西瓜',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="4.5" d="M78,64 L282,44 C282,88 250,128 194,134 C138,140 100,106 78,64 Z" transform="rotate(-4 180 90)"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M96,72 L264,56 C260,88 234,116 192,120 C150,124 116,100 96,72 Z" transform="rotate(-4 180 90)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="160" cy="86" rx="5" ry="7" transform="rotate(-14 160 86)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="212" cy="84" rx="5" ry="7" transform="rotate(-2 212 84)"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M46,154 L354,154 C362,154 364,160 363,168 C356,238 322,306 262,340 C222,362 178,362 138,340 C78,306 44,238 37,168 C36,160 38,154 46,154 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M52,168 L348,168 C340,240 306,300 252,330 C218,349 182,349 148,330 C94,300 60,240 52,168 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M70,184 L150,184 C146,240 138,272 124,300 C96,276 76,232 70,184 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M150,184 L250,184 C254,240 262,272 276,300 C252,320 226,330 200,330 C174,330 148,320 124,300 C138,272 146,240 150,184 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M250,184 L330,184 C324,232 304,276 276,300 C262,272 254,240 250,184 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="110" cy="222" rx="6" ry="9" transform="rotate(-24 110 222)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="176" cy="238" rx="6" ry="9" transform="rotate(-8 176 238)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="226" cy="240" rx="6" ry="9" transform="rotate(8 226 240)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="290" cy="224" rx="6" ry="9" transform="rotate(24 290 224)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="142" cy="272" rx="5" ry="8" transform="rotate(-18 142 272)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="200" cy="286" rx="5" ry="8"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="258" cy="272" rx="5" ry="8" transform="rotate(18 258 272)"/>
      </svg>`
  },
  {
    name: '金黃鳳梨',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="4.5" d="M162,160 C120,146 92,112 88,74 C120,92 150,120 172,152 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M238,160 C280,146 308,112 312,74 C280,92 250,120 228,152 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M176,158 C152,120 148,76 166,40 C186,70 198,114 198,154 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M224,158 C248,120 252,76 234,40 C214,70 202,114 202,154 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M182,158 C176,112 184,66 200,30 C216,66 224,112 218,158 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M200,148 C270,148 318,198 320,262 C322,322 268,368 200,370 C132,368 78,322 80,262 C82,198 130,148 200,148 Z"/>
      <path fill="none" stroke-width="2.25" d="M104,206 L296,342 M88,258 L240,366 M136,178 L318,300 M198,150 L322,240 M296,206 L104,342 M312,258 L160,366 M264,178 L82,300 M202,150 L78,240"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M200,196 Q214,208 222,220 Q214,232 200,244 Q186,232 178,220 Q186,208 200,196 Z"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M146,248 Q160,260 168,272 Q160,284 146,296 Q132,284 124,272 Q132,260 146,248 Z"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M254,248 Q268,260 276,272 Q268,284 254,296 Q246,284 232,272 Q246,260 254,248 Z"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M200,300 Q214,312 222,324 Q214,336 200,348 Q186,336 178,324 Q186,312 200,300 Z"/>
      </svg>`
  },
  {
    name: '紅紅蘋果',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="68" cy="58" rx="9" ry="15"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="85" cy="70" rx="9" ry="15" transform="rotate(72 85 70)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="79" cy="90" rx="9" ry="15" transform="rotate(144 79 90)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="57" cy="90" rx="9" ry="15" transform="rotate(-144 57 90)"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="51" cy="70" rx="9" ry="15" transform="rotate(-72 51 70)"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="68" cy="76" r="8"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M170,126 C168,96 176,68 194,48 L212,58 C196,78 190,102 194,124 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M206,90 C230,52 280,42 312,62 C304,98 264,120 224,108 C216,102 210,96 206,90 Z"/>
      <path fill="none" stroke-width="1.88" d="M212,92 C244,80 274,72 300,68"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M162,88 C144,62 112,56 90,68 C96,96 124,110 152,104 C156,99 159,94 162,88 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M178,130 C166,102 132,94 102,110 C60,134 38,190 48,250 C58,314 112,360 178,362 C244,360 296,312 306,248 C314,190 290,134 248,110 C218,94 188,102 178,130 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="108" cy="204" rx="20" ry="34" transform="rotate(18 108 204)"/>
      <path fill="none" stroke-width="3.75" d="M316,270 C314,256 318,244 326,236"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M326,252 C338,236 356,232 368,240 C364,258 346,266 332,260 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M318,272 C344,270 362,292 362,318 C362,346 344,364 318,364 C292,364 274,346 274,318 C274,292 290,272 318,272 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="298" cy="302" rx="8" ry="14" transform="rotate(14 298 302)"/>
      </svg>`
  },
  {
    name: '彎彎香蕉',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="6.75" d="M128,80 C180,48 290,66 340,136 C348,148 344,160 332,158 C284,116 196,104 132,110 Z"/>
      <path fill="none" stroke-width="2.25" d="M150,86 C230,74 296,96 330,140"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="338" cy="148" rx="12" ry="7" transform="rotate(50 338 148)"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M116,96 C190,110 282,168 322,238 C330,252 322,262 310,256 C250,220 176,170 116,128 Z"/>
      <path fill="none" stroke-width="2.25" d="M136,110 C210,132 272,178 310,234"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="314" cy="248" rx="12" ry="7" transform="rotate(58 314 248)"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M94,36 L122,32 C128,32 130,36 129,42 L126,58 L92,64 L88,42 C87,38 90,36 94,36 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M64,58 C88,40 122,42 138,62 C144,78 140,96 128,106 L84,108 C66,96 58,74 64,58 Z"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="108" cy="35" rx="15" ry="5" transform="rotate(-8 108 35)"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M152,282 C132,296 120,318 120,340 C104,320 108,292 130,272 Z" transform="rotate(-8 180 280)"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M208,282 C228,296 240,318 240,340 C256,320 252,292 230,272 Z" transform="rotate(-8 180 280)"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M158,288 L202,288 L206,260 C210,232 202,202 188,186 C184,182 176,182 172,186 C158,202 150,232 154,260 Z" transform="rotate(-8 180 280)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="180" cy="188" rx="7" ry="4" transform="rotate(-8 180 280)"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M152,280 L166,290 L180,278 L194,290 L208,280 C216,308 216,336 204,358 C196,368 164,368 156,358 C144,336 144,308 152,280 Z" transform="rotate(-8 180 280)"/>
      </svg>`
  },
  {
    name: '紫葡萄串',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="2.25" d="M206,46 C240,40 262,52 264,76 C264,92 250,96 244,84 C240,74 250,68 256,74"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M190,120 L186,44 C186,36 192,32 200,32 C208,32 214,36 214,44 L210,120 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M182,92 C150,56 96,48 58,72 C64,120 112,148 164,132 C172,120 178,106 182,92 Z"/>
      <path fill="none" stroke-width="1.88" d="M170,100 C136,96 100,92 72,80 M150,124 C130,110 112,96 96,84"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M218,92 C250,56 304,48 342,72 C336,120 288,148 236,132 C228,120 222,106 218,92 Z"/>
      <path fill="none" stroke-width="1.88" d="M230,100 C264,96 300,92 328,80 M250,124 C270,110 288,96 304,84"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="108" cy="164" rx="37" ry="39" transform="rotate(-10 108 164)"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="172" cy="158" rx="38" ry="40" transform="rotate(6 172 158)"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="236" cy="160" rx="38" ry="39" transform="rotate(-6 236 160)"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="298" cy="166" rx="36" ry="38" transform="rotate(10 298 166)"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="138" cy="226" rx="38" ry="40" transform="rotate(8 138 226)"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="204" cy="222" rx="40" ry="41" transform="rotate(-6 204 222)"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="268" cy="226" rx="38" ry="39" transform="rotate(8 268 226)"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="170" cy="288" rx="39" ry="40" transform="rotate(-8 170 288)"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="238" cy="288" rx="39" ry="40" transform="rotate(8 238 288)"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="204" cy="334" rx="35" ry="36"/>
      </svg>`
  },
  {
    name: '三球冰淇淋',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="6.75" d="M140,262 L260,262 C268,262 272,268 270,276 C254,330 222,360 206,366 C202,369 198,369 194,366 C178,360 146,330 130,276 C128,268 132,262 140,262 Z"/>
      <path fill="none" stroke-width="2.25" d="M152,292 L224,352 M138,272 L216,340 M248,292 L176,352 M262,272 L184,340"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M200,278 Q209,287 214,296 Q209,305 200,314 Q191,305 186,296 Q191,287 200,278 Z"/>
      <path class="c" fill="#fff" stroke-width="3" d="M144,268 L164,268 C166,286 158,296 152,296 C146,296 142,284 144,268 Z"/>
      <path class="c" fill="#fff" stroke-width="3" d="M234,268 L254,268 C256,286 248,296 242,296 C236,296 232,284 234,268 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M132,238 L268,238 C276,238 280,244 278,252 L274,262 C272,268 268,270 262,270 L138,270 C132,270 128,268 126,262 L122,252 C120,244 124,238 132,238 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M112,206 C106,162 146,132 200,132 C254,132 294,162 288,206 C286,222 274,228 266,218 C262,234 244,240 234,228 C228,242 208,246 198,232 C190,244 170,244 162,230 C154,242 136,238 130,224 C120,224 114,218 112,206 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M126,158 C122,116 154,88 200,88 C246,88 278,116 274,158 C272,172 260,176 254,168 C248,180 232,184 224,172 C216,184 196,184 188,172 C180,182 164,180 158,168 C150,172 128,170 126,158 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M238,86 C248,68 254,52 254,36 L230,32 C228,48 222,64 212,80 Z"/>
      <path fill="none" stroke-width="1.88" d="M251,52 L229,47 M254,40 L233,35"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M146,110 C144,74 166,50 200,50 C234,50 256,74 254,110 C252,122 242,126 236,118 C230,128 216,130 208,120 C200,130 186,128 180,118 C172,124 158,122 146,110 Z"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="200" cy="44" r="13"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="172" cy="72" rx="8" ry="3" transform="rotate(-18 172 72)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="156" cy="148" rx="8" ry="3" transform="rotate(-15 156 148)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="244" cy="150" rx="8" ry="3" transform="rotate(15 244 150)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="140" cy="196" rx="8" ry="3" transform="rotate(10 140 196)"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="260" cy="198" rx="8" ry="3" transform="rotate(-12 260 198)"/>
      </svg>`
  },
  {
    name: '草莓杯子蛋糕',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="4.5" d="M162,148 C154,118 172,96 200,94 C228,96 246,118 238,148 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M178,52 L168,36 L188,42 L200,30 L212,42 L232,36 L222,52 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M200,114 C218,110 234,96 236,76 C238,56 220,46 200,46 C180,46 162,56 164,76 C166,96 182,110 200,114 Z"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="186" cy="70" rx="3" ry="4"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="214" cy="70" rx="3" ry="4"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="192" cy="92" rx="3" ry="4"/>
      <ellipse fill="#3a3a3a" stroke="none" cx="212" cy="90" rx="3" ry="4"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M124,208 C110,176 130,148 164,142 L236,142 C270,148 290,176 276,208 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M110,242 L290,242 C296,242 300,248 298,254 L262,350 C259,360 252,364 244,364 L156,364 C148,364 141,360 138,350 L102,254 C100,248 104,242 110,242 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M112,248 L288,248 L280,270 L120,270 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M128,276 L158,276 L172,356 L152,356 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M172,276 L202,276 L208,356 L186,356 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M214,276 L244,276 L232,356 L212,356 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M256,276 L286,276 L258,356 L242,356 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M100,238 C96,216 108,202 128,200 L272,200 C292,202 304,216 300,238 C304,252 290,262 278,252 C274,266 254,270 246,258 C238,272 218,274 210,260 C200,274 180,272 174,258 C164,270 146,268 140,254 C126,262 112,254 100,238 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="150" cy="228" r="4"/>
      <circle fill="#3a3a3a" stroke="none" cx="200" cy="234" r="4"/>
      <circle fill="#3a3a3a" stroke="none" cx="250" cy="228" r="4"/>
      <circle fill="#3a3a3a" stroke="none" cx="164" cy="176" r="4"/>
      <circle fill="#3a3a3a" stroke="none" cx="236" cy="176" r="4"/>
      </svg>`
  },
  {
    name: '繽紛甜甜圈',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="6.75" d="M200,48 C290,50 358,118 356,210 C354,300 286,364 198,364 C112,364 44,298 44,206 C46,116 112,46 200,48 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M46,206 C48,120 114,52 200,50 C288,52 354,120 354,208 C354,224 344,240 330,240 C330,262 312,272 298,258 C294,282 270,290 258,272 C250,296 222,300 212,280 C200,302 172,300 164,278 C154,296 128,294 122,272 C108,286 86,278 84,256 C68,258 52,242 50,224 C46,218 46,212 46,206 Z"/>
      <circle fill="#fff" cx="200" cy="212" r="44"/>
      <rect class="c" fill="#fff" stroke-width="1.88" x="114" y="112" width="28" height="12" rx="6" transform="rotate(-25 128 118)"/>
      <rect class="c" fill="#fff" stroke-width="1.88" x="186" y="86" width="28" height="12" rx="6" transform="rotate(10 200 92)"/>
      <rect class="c" fill="#fff" stroke-width="1.88" x="254" y="116" width="28" height="12" rx="6" transform="rotate(35 268 122)"/>
      <rect class="c" fill="#fff" stroke-width="1.88" x="78" y="174" width="28" height="12" rx="6" transform="rotate(75 92 180)"/>
      <rect class="c" fill="#fff" stroke-width="1.88" x="292" y="172" width="28" height="12" rx="6" transform="rotate(-75 306 178)"/>
      <rect class="c" fill="#fff" stroke-width="1.88" x="130" y="240" width="28" height="12" rx="6" transform="rotate(-15 144 246)"/>
      <rect class="c" fill="#fff" stroke-width="1.88" x="242" y="242" width="28" height="12" rx="6" transform="rotate(20 256 248)"/>
      <rect class="c" fill="#fff" stroke-width="1.88" x="152" y="140" width="28" height="12" rx="6" transform="rotate(18 166 146)"/>
      <rect class="c" fill="#fff" stroke-width="1.88" x="226" y="142" width="28" height="12" rx="6" transform="rotate(-22 240 148)"/>
      </svg>`
  },
  {
    name: '慶生蛋糕',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="2.63" d="M158,62 C146,50 148,36 158,30 C168,36 170,50 158,62 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M200,62 C188,50 190,36 200,30 C210,36 212,50 200,62 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M242,62 C230,50 232,36 242,30 C252,36 254,50 242,62 Z"/>
      <rect class="c" fill="#fff" stroke-width="3.75" x="149" y="66" width="18" height="58" rx="4"/>
      <rect class="c" fill="#fff" stroke-width="3.75" x="191" y="66" width="18" height="58" rx="4"/>
      <rect class="c" fill="#fff" stroke-width="3.75" x="233" y="66" width="18" height="58" rx="4"/>
      <path fill="none" stroke-width="1.88" d="M151,84 L165,76 M151,104 L165,96 M193,84 L207,76 M193,104 L207,96 M235,84 L249,76 M235,104 L249,96"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M136,122 L264,122 C272,122 276,128 276,136 L276,194 L124,194 L124,136 C124,128 128,122 136,122 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M134,120 L266,120 L266,138 C262,152 242,154 236,140 C230,156 206,158 200,142 C194,158 170,156 164,140 C158,152 138,150 134,136 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M102,190 L298,190 C306,190 310,196 310,204 L310,272 L90,272 L90,204 C90,196 94,190 102,190 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M100,188 L300,188 L300,206 C296,222 274,224 268,208 C262,228 234,230 228,210 C222,230 194,230 188,210 C182,228 154,226 148,208 C142,222 118,222 112,206 C106,216 100,210 100,204 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="200" cy="352" rx="165" ry="18"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M62,268 L338,268 C346,268 350,274 350,282 L350,338 C350,346 344,350 336,350 L64,350 C56,350 50,346 50,338 L50,282 C50,274 54,268 62,268 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M60,266 L340,266 L340,284 C338,300 316,304 310,288 C304,310 276,312 270,292 C264,314 234,314 228,294 C222,314 192,314 186,294 C180,312 152,312 146,292 C140,308 114,306 108,288 C100,302 74,298 60,284 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="112" cy="326" r="5"/>
      <circle fill="#3a3a3a" stroke="none" cx="200" cy="330" r="5"/>
      <circle fill="#3a3a3a" stroke="none" cx="288" cy="326" r="5"/>
      <circle fill="#3a3a3a" stroke="none" cx="152" cy="248" r="5"/>
      <circle fill="#3a3a3a" stroke="none" cx="248" cy="248" r="5"/>
      </svg>`
  }
];
window.LINEART_FOOD = LINEART_FOOD;
