/* 花紋顏料（像包裝紙的圖案）。
   每個花紋是一塊 40x40 的小磚，會自動重複鋪滿。
   想加新花紋：照格式加一筆，tile 裡放 SVG 圖形即可。 */
const PATTERNS = [
  {
    id: 'pat-dots',
    name: '點點',
    tile: `<rect width="40" height="40" fill="#F8BBD0"/>
           <circle cx="10" cy="10" r="5.5" fill="#fff"/>
           <circle cx="30" cy="30" r="5.5" fill="#fff"/>
           <circle cx="30" cy="10" r="3" fill="#F06292"/>
           <circle cx="10" cy="30" r="3" fill="#F06292"/>`
  },
  {
    id: 'pat-stripes',
    name: '糖果條紋',
    tile: `<rect width="40" height="40" fill="#fff"/>
           <path d="M-10,10 L10,-10 M0,40 L40,0 M30,50 L50,30" stroke="#EF5350" stroke-width="9"/>
           <path d="M-10,30 L30,-10 M10,50 L50,10" stroke="#FFCDD2" stroke-width="4"/>`
  },
  {
    id: 'pat-stars',
    name: '星星',
    tile: `<rect width="40" height="40" fill="#3F51B5"/>
           <polygon points="20,12 22,17.2 27.6,17.5 23.2,21.1 24.7,26.5 20,23.4 15.3,26.5 16.8,21.1 12.4,17.5 18,17.2" fill="#FFD54F"/>
           <circle cx="6" cy="6" r="1.8" fill="#fff"/>
           <circle cx="34" cy="32" r="1.8" fill="#fff"/>
           <circle cx="33" cy="7" r="1.2" fill="#B3E5FC"/>
           <circle cx="7" cy="33" r="1.2" fill="#B3E5FC"/>`
  },
  {
    id: 'pat-hearts',
    name: '愛心',
    tile: `<rect width="40" height="40" fill="#FFF8E1"/>
           <path d="M20 27 C 12 20, 9 15, 12 11 C 15 8, 19 9, 20 13 C 21 9, 25 8, 28 11 C 31 15, 28 20, 20 27 Z" fill="#F48FB1"/>
           <circle cx="5" cy="5" r="2" fill="#FFCC80"/>
           <circle cx="35" cy="35" r="2" fill="#FFCC80"/>`
  },
  {
    id: 'pat-gingham',
    name: '格子',
    tile: `<rect width="40" height="40" fill="#fff"/>
           <rect x="0" y="0" width="20" height="40" fill="#A5D6A7" opacity="0.75"/>
           <rect x="0" y="0" width="40" height="20" fill="#A5D6A7" opacity="0.55"/>`
  },
  {
    id: 'pat-rainbow',
    name: '彩虹',
    tile: `<rect width="40" height="7" y="0" fill="#EF9A9A"/>
           <rect width="40" height="7" y="7" fill="#FFCC80"/>
           <rect width="40" height="7" y="14" fill="#FFF59D"/>
           <rect width="40" height="7" y="21" fill="#A5D6A7"/>
           <rect width="40" height="6" y="28" fill="#90CAF9"/>
           <rect width="40" height="6" y="34" fill="#CE93D8"/>`
  }
];
