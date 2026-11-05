/* 著色線稿資料。
   每張圖是一段 SVG 字串，class="c" 的區域可以點擊上色。
   想加新圖：照同樣格式在陣列裡加一筆即可。 */
const LINEART = [
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
    cat: 'vehicle',
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
  // 公主與城堡：點陣線稿（2026-11 Codex 生圖、tools/make_stencil.py 轉檔），原本的手繪 SVG 換掉
  { name: '微笑小公主', cat: 'fantasy', src: 'assets/lineart/princess-smile.png' },
  { name: '星光城堡', cat: 'fantasy', src: 'assets/lineart/castle-star.png' },
  { name: '麻花辮公主', cat: 'fantasy', src: 'assets/lineart/princess-braid.png' },
  { name: '小美人魚', cat: 'fantasy', src: 'assets/lineart/mermaid.png' }
];
