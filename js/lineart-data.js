/* 著色線稿資料。
   每張圖是一段 SVG 字串，class="c" 的區域可以點擊上色。
   想加新圖：照同樣格式在陣列裡加一筆即可。 */
const LINEART = [
  {
    name: '小貓咪',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M310,260 C360,250 375,205 355,185 C345,220 320,230 305,232 Z"/>
      <ellipse class="c" fill="#fff" cx="200" cy="295" rx="95" ry="72"/>
      <ellipse class="c" fill="#fff" cx="150" cy="355" rx="26" ry="14"/>
      <ellipse class="c" fill="#fff" cx="250" cy="355" rx="26" ry="14"/>
      <path class="c" fill="#fff" d="M138,115 L116,38 L182,92 Z"/>
      <path class="c" fill="#fff" d="M262,115 L284,38 L218,92 Z"/>
      <path class="c" fill="#fff" d="M144,104 L133,64 L167,92 Z"/>
      <path class="c" fill="#fff" d="M256,104 L267,64 L233,92 Z"/>
      <circle class="c" fill="#fff" cx="200" cy="165" r="82"/>
      <circle fill="#3a3a3a" stroke="none" cx="170" cy="155" r="9"/>
      <circle fill="#3a3a3a" stroke="none" cx="230" cy="155" r="9"/>
      <path class="c" fill="#fff" d="M191,182 L209,182 L200,196 Z"/>
      <path fill="none" d="M200,196 C200,210 188,214 180,208 M200,196 C200,210 212,214 220,208"/>
      <path fill="none" d="M120,175 L75,165 M120,190 L78,192 M280,175 L325,165 M280,190 L322,192"/>
      <circle class="c" fill="#fff" cx="152" cy="185" r="13"/>
      <circle class="c" fill="#fff" cx="248" cy="185" r="13"/>
    </svg>`
  },
  {
    name: '蝴蝶',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M188,185 C120,80 40,90 45,160 C48,205 120,225 185,215 Z"/>
      <path class="c" fill="#fff" d="M212,185 C280,80 360,90 355,160 C352,205 280,225 215,215 Z"/>
      <path class="c" fill="#fff" d="M188,225 C130,240 90,310 130,335 C165,355 190,290 195,240 Z"/>
      <path class="c" fill="#fff" d="M212,225 C270,240 310,310 270,335 C235,355 210,290 205,240 Z"/>
      <circle class="c" fill="#fff" cx="110" cy="155" r="24"/>
      <circle class="c" fill="#fff" cx="290" cy="155" r="24"/>
      <circle class="c" fill="#fff" cx="158" cy="290" r="16"/>
      <circle class="c" fill="#fff" cx="242" cy="290" r="16"/>
      <ellipse class="c" fill="#fff" cx="200" cy="235" rx="20" ry="72"/>
      <circle class="c" fill="#fff" cx="200" cy="140" r="26"/>
      <path fill="none" d="M188,120 C175,95 160,88 148,90 M212,120 C225,95 240,88 252,90"/>
      <circle fill="#3a3a3a" stroke="none" cx="147" cy="89" r="7"/>
      <circle fill="#3a3a3a" stroke="none" cx="253" cy="89" r="7"/>
      <circle fill="#3a3a3a" stroke="none" cx="191" cy="136" r="5"/>
      <circle fill="#3a3a3a" stroke="none" cx="209" cy="136" r="5"/>
      <path fill="none" d="M192,152 C196,157 204,157 208,152"/>
    </svg>`
  },
  {
    name: '小魚',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M300,200 L365,140 C375,185 375,215 365,260 Z"/>
      <path class="c" fill="#fff" d="M175,120 C205,90 240,95 255,115 L215,150 Z"/>
      <path class="c" fill="#fff" d="M175,280 C205,310 240,305 255,285 L215,250 Z"/>
      <ellipse class="c" fill="#fff" cx="185" cy="200" rx="120" ry="80"/>
      <path class="c" fill="#fff" d="M235,130 C275,160 275,240 235,270 C255,235 255,165 235,130 Z"/>
      <circle class="c" fill="#fff" cx="120" cy="180" r="22"/>
      <circle fill="#3a3a3a" stroke="none" cx="120" cy="180" r="9"/>
      <path fill="none" d="M95,235 C105,245 120,245 130,235"/>
      <circle class="c" fill="#fff" cx="330" cy="80" r="16"/>
      <circle class="c" fill="#fff" cx="290" cy="50" r="11"/>
      <circle class="c" fill="#fff" cx="345" cy="330" r="14"/>
      <circle class="c" fill="#fff" cx="60" cy="330" r="12"/>
      <circle class="c" fill="#fff" cx="45" cy="80" r="13"/>
    </svg>`
  },
  {
    name: '小花',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="7" d="M200,230 C200,290 195,330 195,385"/>
      <path class="c" fill="#fff" d="M196,320 C150,300 120,305 100,330 C135,350 175,345 196,330 Z"/>
      <path class="c" fill="#fff" d="M197,355 C240,335 275,340 295,365 C260,385 220,378 197,368 Z"/>
      <ellipse class="c" fill="#fff" cx="200" cy="80" rx="38" ry="48"/>
      <ellipse class="c" fill="#fff" cx="120" cy="125" rx="38" ry="48" transform="rotate(-60 120 125)"/>
      <ellipse class="c" fill="#fff" cx="280" cy="125" rx="38" ry="48" transform="rotate(60 280 125)"/>
      <ellipse class="c" fill="#fff" cx="130" cy="210" rx="38" ry="48" transform="rotate(-120 130 210)"/>
      <ellipse class="c" fill="#fff" cx="270" cy="210" rx="38" ry="48" transform="rotate(120 270 210)"/>
      <circle class="c" fill="#fff" cx="200" cy="160" r="48"/>
      <circle fill="#3a3a3a" stroke="none" cx="188" cy="152" r="5"/>
      <circle fill="#3a3a3a" stroke="none" cx="212" cy="152" r="5"/>
      <path fill="none" d="M188,172 C193,179 207,179 212,172"/>
      <circle class="c" fill="#fff" cx="330" cy="60" r="26"/>
      <path fill="none" d="M330,20 L330,8 M370,60 L382,60 M358,32 L367,23 M358,88 L367,97 M302,32 L293,23"/>
    </svg>`
  },
  {
    name: '小汽車',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path fill="none" stroke-width="6" d="M20,330 L380,330"/>
      <path class="c" fill="#fff" d="M60,300 C40,300 40,260 65,255 L90,250 L120,195 C128,182 140,175 155,175 L250,175 C265,175 276,182 285,195 L315,250 L340,255 C365,260 365,300 345,300 Z"/>
      <path class="c" fill="#fff" d="M135,250 L150,205 C153,198 158,195 165,195 L195,195 L195,250 Z"/>
      <path class="c" fill="#fff" d="M215,250 L215,195 L245,195 C252,195 257,198 260,205 L272,250 Z"/>
      <circle class="c" fill="#fff" cx="125" cy="305" r="34"/>
      <circle class="c" fill="#fff" cx="125" cy="305" r="14"/>
      <circle class="c" fill="#fff" cx="285" cy="305" r="34"/>
      <circle class="c" fill="#fff" cx="285" cy="305" r="14"/>
      <circle class="c" fill="#fff" cx="330" cy="90" r="34"/>
      <path fill="none" d="M330,40 L330,25 M330,140 L330,155 M380,90 L395,90 M280,90 L265,90 M365,55 L376,44 M295,125 L284,136 M365,125 L376,136 M295,55 L284,44"/>
      <path class="c" fill="#fff" d="M60,120 C60,100 85,95 95,105 C100,85 130,85 135,105 C150,95 170,105 165,122 C160,135 70,135 60,120 Z"/>
    </svg>`
  },
  {
    name: '小公主',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M128,155 C104,225 92,300 112,345 L145,345 C128,295 132,220 155,165 Z"/>
      <path class="c" fill="#fff" d="M272,155 C296,225 308,300 288,345 L255,345 C272,295 268,220 245,165 Z"/>
      <ellipse class="c" fill="#fff" cx="200" cy="145" rx="80" ry="64"/>
      <circle class="c" fill="#fff" cx="200" cy="178" r="68"/>
      <polygon class="c" fill="#fff" points="166,116 166,104 180,74 195,98 200,70 205,98 220,74 234,104 234,116"/>
      <circle class="c" fill="#fff" cx="150" cy="200" r="14"/>
      <circle class="c" fill="#fff" cx="250" cy="200" r="14"/>
      <circle fill="#3a3a3a" stroke="none" cx="176" cy="178" r="8"/>
      <circle fill="#3a3a3a" stroke="none" cx="224" cy="178" r="8"/>
      <path fill="none" d="M186,206 C194,215 206,215 214,206"/>
      <path class="c" fill="#fff" d="M148,235 C112,240 92,270 98,305 C114,295 136,265 162,244 Z"/>
      <path class="c" fill="#fff" d="M252,235 C288,240 308,270 302,305 C286,295 264,265 238,244 Z"/>
      <path class="c" fill="#fff" d="M168,233 L232,233 L245,258 L200,275 L155,258 Z"/>
      <path class="c" fill="#fff" d="M200,252 L182,238 C176,234 176,246 182,250 L200,258 L218,250 C224,246 224,234 218,238 Z"/>
      <path class="c" fill="#fff" d="M160,258 C115,290 88,340 78,375 L322,375 C312,340 285,290 240,258 L200,278 Z"/>
    </svg>`
  },
  {
    name: '夢幻城堡',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <line x1="20" y1="360" x2="380" y2="360" stroke-width="6"/>
      <rect class="c" fill="#fff" x="50" y="200" width="70" height="160"/>
      <polygon class="c" fill="#fff" points="45,200 85,140 125,200"/>
      <line x1="85" y1="140" x2="85" y2="112"/>
      <polygon class="c" fill="#fff" points="85,112 112,123 85,134"/>
      <rect class="c" fill="#fff" x="70" y="230" width="30" height="42" rx="15"/>
      <rect class="c" fill="#fff" x="280" y="200" width="70" height="160"/>
      <polygon class="c" fill="#fff" points="275,200 315,140 355,200"/>
      <line x1="315" y1="140" x2="315" y2="112"/>
      <polygon class="c" fill="#fff" points="315,112 342,123 315,134"/>
      <rect class="c" fill="#fff" x="300" y="230" width="30" height="42" rx="15"/>
      <rect class="c" fill="#fff" x="150" y="224" width="20" height="18"/>
      <rect class="c" fill="#fff" x="190" y="224" width="20" height="18"/>
      <rect class="c" fill="#fff" x="230" y="224" width="20" height="18"/>
      <rect class="c" fill="#fff" x="140" y="240" width="120" height="120"/>
      <path class="c" fill="#fff" d="M180,360 L180,300 A20,20 0 0 1 220,300 L220,360 Z"/>
      <rect class="c" fill="#fff" x="170" y="120" width="60" height="140"/>
      <polygon class="c" fill="#fff" points="165,120 200,58 235,120"/>
      <line x1="200" y1="58" x2="200" y2="32"/>
      <polygon class="c" fill="#fff" points="200,32 227,43 200,54"/>
      <path class="c" fill="#fff" d="M200,192 C200,178 182,172 182,186 C182,195 200,208 200,208 C200,208 218,195 218,186 C218,172 200,178 200,192 Z"/>
    </svg>`
  },
  {
    name: '辮子公主',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <ellipse class="c" fill="#fff" cx="200" cy="145" rx="80" ry="64"/>
      <circle class="c" fill="#fff" cx="200" cy="178" r="68"/>
      <path class="c" fill="#fff" d="M150,168 C120,192 108,232 118,272 C128,312 116,342 128,372 L164,372 C156,337 170,302 156,266 C146,236 158,196 178,170 Z"/>
      <path fill="none" d="M120,202 L166,197 M114,242 L164,240 M118,282 L160,284 M126,322 L162,327"/>
      <circle class="c" fill="#fff" cx="112" cy="178" r="7"/>
      <circle class="c" fill="#fff" cx="126" cy="168" r="8"/>
      <circle class="c" fill="#fff" cx="140" cy="176" r="7"/>
      <circle class="c" fill="#fff" cx="127" cy="184" r="6"/>
      <polygon class="c" fill="#fff" points="166,116 166,104 180,74 195,98 200,70 205,98 220,74 234,104 234,116"/>
      <circle class="c" fill="#fff" cx="150" cy="200" r="14"/>
      <circle class="c" fill="#fff" cx="250" cy="200" r="14"/>
      <circle fill="#3a3a3a" stroke="none" cx="176" cy="178" r="8"/>
      <circle fill="#3a3a3a" stroke="none" cx="224" cy="178" r="8"/>
      <path fill="none" d="M186,206 C194,215 206,215 214,206"/>
      <path class="c" fill="#fff" d="M148,235 C112,240 92,270 98,305 C114,295 136,265 162,244 Z"/>
      <path class="c" fill="#fff" d="M252,235 C288,240 308,270 302,305 C286,295 264,265 238,244 Z"/>
      <path class="c" fill="#fff" d="M168,233 L232,233 L245,258 L200,275 L155,258 Z"/>
      <path class="c" fill="#fff" d="M200,252 L182,238 C176,234 176,246 182,250 L200,258 L218,250 C224,246 224,234 218,238 Z"/>
      <path class="c" fill="#fff" d="M160,258 C115,290 88,340 78,375 L322,375 C312,340 285,290 240,258 L200,278 Z"/>
    </svg>`
  },
  {
    name: '美人魚公主',
    svg: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" stroke="#3a3a3a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <path class="c" fill="#fff" d="M130,150 C95,220 80,300 100,360 C115,345 130,300 140,250 C150,210 150,180 160,160 Z"/>
      <path class="c" fill="#fff" d="M270,150 C305,220 320,300 300,360 C285,345 270,300 260,250 C250,210 250,180 240,160 Z"/>
      <ellipse class="c" fill="#fff" cx="200" cy="145" rx="80" ry="64"/>
      <circle class="c" fill="#fff" cx="200" cy="178" r="68"/>
      <polygon class="c" fill="#fff" points="150,120 156,136 172,136 159,146 164,162 150,152 136,162 141,146 128,136 144,136"/>
      <circle class="c" fill="#fff" cx="150" cy="200" r="14"/>
      <circle class="c" fill="#fff" cx="250" cy="200" r="14"/>
      <circle fill="#3a3a3a" stroke="none" cx="176" cy="178" r="8"/>
      <circle fill="#3a3a3a" stroke="none" cx="224" cy="178" r="8"/>
      <path fill="none" d="M186,206 C194,215 206,215 214,206"/>
      <path class="c" fill="#fff" d="M150,235 C120,225 95,240 90,270 C100,290 125,275 155,255 Z"/>
      <path class="c" fill="#fff" d="M250,235 C280,225 305,240 310,270 C300,290 275,275 245,255 Z"/>
      <path class="c" fill="#fff" d="M175,225 C160,225 155,245 170,255 C180,260 190,250 185,235 Z"/>
      <path class="c" fill="#fff" d="M225,225 C240,225 245,245 230,255 C220,260 210,250 215,235 Z"/>
      <path fill="none" d="M185,233 C195,224 205,224 215,233"/>
      <path class="c" fill="#fff" d="M165,258 C140,290 130,330 145,360 C160,340 175,310 185,290 L215,290 C225,310 240,340 255,360 C270,330 260,290 235,258 L200,278 Z"/>
      <path fill="none" d="M170,300 C175,305 180,305 185,300 M195,310 C200,315 205,315 210,310 M175,330 C180,335 185,335 190,330 M210,330 C215,335 220,335 225,330"/>
      <path class="c" fill="#fff" d="M145,360 C120,375 100,400 95,420 C120,415 145,395 160,370 Z"/>
      <path class="c" fill="#fff" d="M255,360 C280,375 300,400 305,420 C280,415 255,395 240,370 Z"/>
    </svg>`
  }
];
