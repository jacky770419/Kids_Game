#!/usr/bin/env bash
# 故事書分鏡截圖（調分鏡用）：用無頭 Edge 開 story.html?shot=<故事id>,<頁>,<秒>[,en]，存成 PNG。
#   bash tools/shot_story.sh <輸出.png> <故事id> <頁> <秒> [en]
# 要先有本機伺服器在 8080（python -m http.server 8080，或 .claude/launch.json 的 kids-game）。
# 每次用全新的瀏覽器設定檔，不會吃到 service worker 的舊快取。
# 機器忙的時候常截到空白或選書畫面：等久一點（15 秒虛擬時間），截壞（檔太小）就再試，最多 3 次。
set -e
out="$1"; id="$2"; pg="$3"; sec="$4"; lang="${5:-}"
url="http://localhost:8080/story.html?shot=$id,$pg,$sec${lang:+,$lang}"
prof="$(mktemp -d)"
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
"$EDGE" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$prof" \
  --window-size=1180,820 --virtual-time-budget=6000 --screenshot="$(cygpath -w "$(realpath -m "$out")")" "$url" >/dev/null 2>&1 || true
rm -rf "$prof"
[ -s "$out" ] || { echo "截圖失敗：$url" >&2; exit 1; }
echo "$out"
