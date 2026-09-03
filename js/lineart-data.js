/* 著色線稿資料。
   每張圖是一段 SVG 字串，class="c" 的區域可以點擊上色。
   想加新圖：照同樣格式在陣列裡加一筆即可。 */
const LINEART = [
  {
    name: '喵喵貓',
    cat: 'animal',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="4.5" d="M306,296 C352,288 368,254 348,236 C334,224 316,236 328,252"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M146,226 C110,250 90,290 90,322 C90,357 122,372 200,372 C278,372 310,357 310,322 C310,290 290,250 254,226 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="200" cy="318" rx="40" ry="32"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M124,288 C116,314 112,340 114,358 C115,369 140,369 141,358 C142,342 140,316 136,292"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M276,288 C284,314 288,340 286,358 C285,369 260,369 259,358 C258,342 260,316 264,292"/>
      <path fill="none" stroke-width="1.88" d="M121,366 L121,354 M132,366 L132,354 M268,366 L268,354 M279,366 L279,354"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M200,238 C148,238 106,212 102,166 C100,142 106,118 120,98 L110,44 C109,35 116,31 123,36 L160,64 C172,58 186,54 200,54 C214,54 228,58 240,64 L277,36 C284,31 291,35 290,44 L280,98 C294,118 300,142 298,166 C294,212 252,238 200,238 Z"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M130,60 L124,90 C131,80 140,73 149,68 Z"/>
      <path class="c" fill="#fff" stroke-width="1.88" d="M270,60 L276,90 C269,80 260,73 251,68 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="1.88" cx="200" cy="198" rx="36" ry="26"/>
      <circle fill="#3a3a3a" stroke="none" cx="162" cy="170" r="10"/>
      <circle fill="#3a3a3a" stroke="none" cx="238" cy="170" r="10"/>
      <path fill="#3a3a3a" stroke="none" d="M191,188 L209,188 L200,200 Z"/>
      <path fill="none" stroke-width="1.88" d="M200,200 C200,211 190,215 182,209 M200,200 C200,211 210,215 218,209"/>
      <path fill="none" stroke-width="1.88" d="M116,182 L72,174 M118,198 L74,200 M284,182 L328,174 M282,198 L326,200"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="138" cy="196" r="14"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="262" cy="196" r="14"/>
      </svg>`
  },
  {
    name: '花蝴蝶',
    cat: 'animal',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="6.75" d="M184,188 C162,112 108,50 62,54 C28,58 26,112 46,152 C64,186 122,208 184,210 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M216,188 C238,112 292,50 338,54 C372,58 374,112 354,152 C336,186 278,208 216,210 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M186,224 C130,224 76,244 62,284 C50,322 84,348 122,336 C158,324 182,280 190,240 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M214,224 C270,224 324,244 338,284 C350,322 316,348 278,336 C242,324 218,280 210,240 Z"/>
      <ellipse class="c" fill="#fff" stroke-width="2.25" cx="97" cy="116" rx="34" ry="46" transform="rotate(-38 97 116)"/>
      <ellipse class="c" fill="#fff" stroke-width="2.25" cx="303" cy="116" rx="34" ry="46" transform="rotate(38 303 116)"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="146" cy="178" r="16"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="254" cy="178" r="16"/>
      <ellipse class="c" fill="#fff" stroke-width="2.25" cx="110" cy="290" rx="30" ry="26"/>
      <ellipse class="c" fill="#fff" stroke-width="2.25" cx="290" cy="290" rx="30" ry="26"/>
      <ellipse class="c" fill="#fff" stroke-width="4.5" cx="200" cy="248" rx="23" ry="72"/>
      <path fill="none" stroke-width="1.88" d="M180,222 L220,222 M177,250 L223,250 M181,278 L219,278"/>
      <circle class="c" fill="#fff" stroke-width="4.5" cx="200" cy="140" r="31"/>
      <path fill="none" stroke-width="2.63" d="M188,113 C176,88 160,76 146,74 M212,113 C224,88 240,76 254,74"/>
      <circle fill="#3a3a3a" stroke="none" cx="145" cy="73" r="6"/>
      <circle fill="#3a3a3a" stroke="none" cx="255" cy="73" r="6"/>
      <circle fill="#3a3a3a" stroke="none" cx="190" cy="150" r="5.5"/>
      <circle fill="#3a3a3a" stroke="none" cx="210" cy="150" r="5.5"/>
      <path fill="none" stroke-width="1.88" d="M192,160 C196,165 204,165 208,160"/>
      </svg>`
  },
  {
    name: '泡泡魚',
    cat: 'animal',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="4.5" d="M198,102 C204,52 240,32 276,46 C270,66 268,88 272,108"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M168,294 C150,322 160,348 186,350 C202,351 212,340 210,320"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M90,206 C90,144 148,96 215,96 C275,96 320,136 328,184 L366,140 C373,132 381,136 379,146 C375,172 373,228 379,254 C381,264 373,268 366,260 L328,216 C320,264 275,304 215,304 C148,304 90,268 90,206 Z"/>
      <path fill="none" stroke-width="2.25" d="M330,178 C338,196 338,206 330,224"/>
      <path fill="none" stroke-width="1.88" d="M240,136 C250,146 250,158 240,168 M272,136 C282,146 282,158 272,168 M256,172 C266,182 266,194 256,204 M276,204 C286,214 286,226 276,236"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="148" cy="184" r="20"/>
      <circle fill="#3a3a3a" stroke="none" cx="148" cy="184" r="10"/>
      <path fill="none" stroke-width="2.25" d="M102,222 C110,240 128,246 144,238"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="168" cy="240" r="11"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="80" cy="70" r="18"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="120" cy="42" r="12"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="52" cy="120" r="11"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="84" cy="190" r="8"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="66" cy="330" r="13"/>
      </svg>`
  },
  {
    name: '太陽小花',
    cat: 'other',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="4.5" d="M200,280 C204,316 198,344 200,375"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M198,318 C150,294 100,296 66,328 C100,354 156,348 198,330 Z"/>
      <path fill="none" stroke-width="1.88" d="M78,326 C118,330 160,328 192,324"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M202,346 C246,324 300,328 334,360 C300,382 244,374 202,358 Z"/>
      <path fill="none" stroke-width="1.88" d="M322,358 C286,354 240,356 208,352"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="200" cy="82" rx="30" ry="42"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="257" cy="105" rx="30" ry="42" transform="rotate(45 257 105)"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="280" cy="162" rx="30" ry="42" transform="rotate(90 280 162)"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="257" cy="219" rx="30" ry="42" transform="rotate(135 257 219)"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="200" cy="242" rx="30" ry="42"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="143" cy="219" rx="30" ry="42" transform="rotate(45 143 219)"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="120" cy="162" rx="30" ry="42" transform="rotate(90 120 162)"/>
      <ellipse class="c" fill="#fff" stroke-width="3.75" cx="143" cy="105" rx="30" ry="42" transform="rotate(135 143 105)"/>
      <path fill="none" stroke-width="1.88" d="M200,48 L200,74 M283,79 L263,99 M318,162 L290,162 M283,245 L263,225 M200,278 L200,250 M117,245 L137,225 M82,162 L110,162 M117,79 L137,99"/>
      <circle class="c" fill="#fff" stroke-width="4.5" cx="200" cy="162" r="54"/>
      <circle fill="#3a3a3a" stroke="none" cx="181" cy="176" r="7"/>
      <circle fill="#3a3a3a" stroke="none" cx="219" cy="176" r="7"/>
      <path fill="none" stroke-width="1.88" d="M185,192 C192,200 208,200 215,192"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="166" cy="190" r="10"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="234" cy="190" r="10"/>
      </svg>`
  },
  {
    name: '嘟嘟小汽車',
    cat: 'other',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="2.63" d="M30,362 L370,362"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M50,320 C32,320 26,296 32,276 C36,258 52,250 72,248 L96,182 C108,152 132,134 164,132 L236,132 C268,134 292,152 304,182 L328,248 C348,250 364,258 368,276 C374,296 368,320 350,320 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M116,248 L140,190 C145,178 154,172 166,172 L190,172 L190,248 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M214,248 L214,172 L238,172 C250,172 259,178 264,190 L288,248 Z"/>
      <path fill="none" stroke-width="2.63" d="M202,248 L202,318"/>
      <rect fill="#3a3a3a" stroke="none" x="210" y="266" width="18" height="7" rx="3.5"/>
      <circle class="c" fill="#fff" stroke-width="4.5" cx="118" cy="320" r="42"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="118" cy="320" r="19"/>
      <circle fill="#3a3a3a" stroke="none" cx="118" cy="320" r="6"/>
      <circle class="c" fill="#fff" stroke-width="4.5" cx="282" cy="320" r="42"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="282" cy="320" r="19"/>
      <circle fill="#3a3a3a" stroke="none" cx="282" cy="320" r="6"/>
      <circle class="c" fill="#fff" stroke-width="2.63" cx="344" cy="272" r="12"/>
      <rect class="c" fill="#fff" stroke-width="2.63" x="44" y="262" width="13" height="20" rx="5"/>
      <path fill="none" stroke-width="1.88" d="M330,158 C340,150 340,138 330,130 M346,170 C362,156 362,140 346,126"/>
      </svg>`
  },
  {
    name: '微笑小公主',
    cat: 'fantasy',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="3.75" d="M186,204 C186,222 191,230 200,230 C209,230 214,222 214,204 Z"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="200" cy="150" r="60"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M148,124 C132,136 124,158 125,184 C126,208 128,228 136,244 C144,256 160,256 166,244 C157,233 152,216 151,200 C150,176 149,148 148,124 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M252,124 C268,136 276,158 275,184 C274,208 272,228 264,244 C256,256 240,256 234,244 C243,233 248,216 249,200 C250,176 251,148 252,124 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M200,92 C168,92 146,108 140,136 C138,148 141,158 146,166 C156,146 174,132 200,120 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M200,92 C232,92 254,108 260,136 C262,148 259,158 254,166 C244,146 226,132 200,120 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M170,92 L164,54 L184,72 L200,44 L216,72 L236,54 L230,92 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="164" cy="50" r="4.5"/>
      <circle fill="#3a3a3a" stroke="none" cx="200" cy="40" r="4.5"/>
      <circle fill="#3a3a3a" stroke="none" cx="236" cy="50" r="4.5"/>
      <circle fill="#3a3a3a" stroke="none" cx="176" cy="176" r="8"/>
      <circle fill="#3a3a3a" stroke="none" cx="224" cy="176" r="8"/>
      <path fill="none" stroke-width="1.88" d="M182,196 C190,208 210,208 218,196"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="158" cy="190" r="11"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="242" cy="190" r="11"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M176,228 C184,222 216,222 224,228 L232,296 L168,296 Z"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M168,294 C148,324 112,346 86,360 C79,368 82,374 90,374 L310,374 C318,374 321,368 314,360 C288,346 252,324 232,294 Z"/>
      <path fill="none" stroke-width="2.63" d="M146,318 C158,348 180,356 200,348 M254,318 C242,348 220,356 200,348"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M200,334 C196,326 184,326 184,334 C184,342 200,354 200,354 C200,354 216,342 216,334 C216,326 204,326 200,334 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M178,232 C158,238 144,252 138,270 C136,282 146,290 156,284 C162,270 172,258 184,250 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M222,232 C242,238 256,252 262,270 C264,282 254,290 244,284 C238,270 228,258 216,250 Z"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="146" cy="288" r="9.5"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="254" cy="288" r="9.5"/>
      </svg>`
  },
  {
    name: '星光城堡',
    cat: 'fantasy',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="2.63" d="M30,374 L370,374"/>
      <rect class="c" fill="#fff" stroke-width="4.5" x="168" y="120" width="64" height="130"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M158,120 L200,52 L242,120 Z"/>
      <path fill="none" stroke-width="2.25" d="M200,52 L200,26"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M200,26 L230,36 L200,46 Z"/>
      <rect class="c" fill="#fff" stroke-width="4.5" x="48" y="190" width="64" height="184"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M38,190 L80,118 L122,190 Z"/>
      <path fill="none" stroke-width="2.25" d="M80,118 L80,84"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M80,84 L112,96 L80,108 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M66,272 L66,246 A14,14 0 0 1 94,246 L94,272 Z"/>
      <rect class="c" fill="#fff" stroke-width="4.5" x="288" y="150" width="64" height="224"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M278,150 L320,74 L362,150 Z"/>
      <path fill="none" stroke-width="2.25" d="M320,74 L320,42"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M320,42 L352,54 L320,66 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M306,230 L306,204 A14,14 0 0 1 334,204 L334,230 Z"/>
      <rect class="c" fill="#fff" stroke-width="4.5" x="120" y="240" width="160" height="134"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M120,258 L120,222 L138,222 L138,236 L158,236 L158,222 L176,222 L176,236 L191,236 L191,222 L209,222 L209,236 L224,236 L224,222 L242,222 L242,236 L262,236 L262,222 L280,222 L280,258 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M120,308 L120,286 L134,286 L134,296 L154,296 L154,286 L170,286 L170,296 L192,296 L192,286 L208,286 L208,296 L230,296 L230,286 L246,286 L246,296 L266,296 L266,286 L280,286 L280,308 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M172,374 L172,322 A28,28 0 0 1 228,322 L228,374 Z"/>
      <path fill="none" stroke-width="1.88" d="M187,302 L187,372 M200,296 L200,372 M213,302 L213,372"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M138,344 L138,326 A10,10 0 0 1 158,326 L158,344 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M242,344 L242,326 A10,10 0 0 1 262,326 L262,344 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M148,62 L154,78 L170,84 L154,90 L148,106 L142,90 L126,84 L142,78 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M262,76 L267,89 L280,94 L267,99 L262,112 L257,99 L244,94 L257,89 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M352,240 L357,253 L370,258 L357,263 L352,276 L347,263 L334,258 L347,253 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="130" cy="130" r="3.5"/>
      <circle fill="#3a3a3a" stroke="none" cx="242" cy="58" r="3.5"/>
      <circle fill="#3a3a3a" stroke="none" cx="288" cy="120" r="3.5"/>
      <circle fill="#3a3a3a" stroke="none" cx="42" cy="152" r="3.5"/>
      </svg>`
  },
  {
    name: '麻花辮公主',
    cat: 'fantasy',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="3.75" d="M186,204 C186,222 191,230 200,230 C209,230 214,222 214,204 Z"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="200" cy="148" r="60"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M200,90 C160,92 140,110 138,140 C137,152 140,160 144,166 C151,150 159,141 168,137 C180,145 190,149 200,149 C210,149 220,145 232,137 C241,141 249,150 256,166 C260,160 263,152 262,140 C260,110 240,92 200,90 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M176,86 L182,60 L194,76 L200,52 L206,76 L218,60 L224,86 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="200" cy="76" r="4"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="132" cy="188" r="17"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="124" cy="222" r="17"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="119" cy="256" r="17"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="117" cy="290" r="17"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M105,300 C102,316 106,330 116,334 C126,330 130,316 127,302 Z"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="268" cy="188" r="17"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="276" cy="222" r="17"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="281" cy="256" r="17"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="283" cy="290" r="17"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M295,300 C298,316 294,330 284,334 C274,330 270,316 273,302 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="176" cy="174" r="8"/>
      <circle fill="#3a3a3a" stroke="none" cx="224" cy="174" r="8"/>
      <path fill="none" stroke-width="1.88" d="M184,196 C192,206 208,206 216,196"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="152" cy="192" r="11"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="248" cy="192" r="11"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M170,228 C180,222 220,222 230,228 L262,360 C264,368 260,374 252,374 L148,374 C140,374 136,368 138,360 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M163,266 L237,266 L240,282 L160,282 Z"/>
      <path fill="none" stroke-width="1.88" d="M180,292 C178,318 176,344 174,368 M220,292 C222,318 224,344 226,368"/>
      <path fill="none" stroke-width="1.88" d="M150,352 C158,344 166,344 172,352 M180,352 C188,344 196,344 202,352 M210,352 C218,344 226,344 232,352 M240,352 C248,344 254,344 260,352"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M168,240 C156,254 154,272 162,288 L174,294 C168,280 170,262 178,250 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M232,240 C244,254 246,272 238,288 L226,294 C232,280 230,262 222,250 Z"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="187" cy="298" r="9"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="213" cy="298" r="9"/>
      <circle class="c" fill="#fff" stroke-width="4.5" cx="164" cy="236" r="14"/>
      <circle class="c" fill="#fff" stroke-width="4.5" cx="236" cy="236" r="14"/>
      </svg>`
  },
  {
    name: '小美人魚',
    cat: 'fantasy',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="3.75" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" stroke-width="4.5" d="M190,54 C140,56 106,88 106,134 C107,174 102,212 90,240 C84,254 86,266 96,266 C90,276 96,286 108,280 C126,270 136,240 139,204 C141,172 144,146 152,128 C160,112 174,104 190,100 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M196,56 C246,58 278,90 276,132 C275,158 282,184 296,204 C304,216 298,228 286,224 C292,234 286,242 276,238 C260,230 250,206 248,176 C246,148 240,122 228,106 C219,95 208,89 196,85 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M168,148 C160,168 158,186 162,202 L230,198 C224,184 220,168 218,152 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M158,168 C142,182 134,200 136,218 C140,226 150,226 154,218 C154,204 160,190 168,180 Z"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="140" cy="222" r="9"/>
      <path class="c" fill="#fff" stroke-width="6.75" d="M160,202 C150,238 150,274 166,302 C186,336 232,350 272,338 C294,331 308,318 314,300 C318,286 314,272 302,264 C282,252 260,244 246,224 C238,212 232,204 230,198 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M306,282 C326,258 352,250 366,258 C368,274 354,290 330,300 Z"/>
      <path class="c" fill="#fff" stroke-width="4.5" d="M314,300 C338,298 358,312 362,330 C348,340 324,334 308,318 Z"/>
      <path class="c" fill="#fff" stroke-width="3.75" d="M224,160 C240,174 248,192 246,210 C242,218 232,218 228,210 C228,196 222,184 214,174 Z"/>
      <circle class="c" fill="#fff" stroke-width="3.75" cx="240" cy="216" r="9"/>
      <path fill="none" stroke-width="1.88" d="M196,258 C204,268 216,270 226,264 M232,278 C240,288 252,290 262,284 M204,296 C212,306 224,308 234,302 M244,310 C252,318 262,320 270,316 M180,276 C186,286 196,290 206,286"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M156,196 C170,206 224,208 236,196 L232,214 C214,222 176,220 160,214 Z"/>
      <circle class="c" fill="#fff" stroke-width="6.75" cx="192" cy="112" r="54"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M190,60 C160,62 140,78 136,104 C135,114 138,124 142,130 C150,114 166,100 190,90 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M194,60 C224,62 244,78 248,104 C249,114 246,124 242,130 C234,114 218,100 194,90 Z"/>
      <path class="c" fill="#fff" stroke-width="2.25" d="M200,44 L206,58 L221,59 L209,68 L213,82 L200,74 L187,82 L191,68 L179,59 L194,58 Z"/>
      <circle fill="#3a3a3a" stroke="none" cx="170" cy="134" r="7.5"/>
      <circle fill="#3a3a3a" stroke="none" cx="214" cy="134" r="7.5"/>
      <path fill="none" stroke-width="1.88" d="M178,152 C186,161 200,161 208,152"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="154" cy="150" r="10"/>
      <circle class="c" fill="#fff" stroke-width="1.88" cx="230" cy="150" r="10"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M160,172 C158,188 166,196 178,196 C188,196 194,188 192,174 Z"/>
      <path class="c" fill="#fff" stroke-width="2.63" d="M198,174 C196,188 202,196 212,196 C224,196 232,188 230,172 Z"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="330" cy="80" r="14"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="356" cy="130" r="10"/>
      <circle class="c" fill="#fff" stroke-width="2.25" cx="60" cy="330" r="12"/>
      </svg>`
  }
];
