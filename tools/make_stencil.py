# 把黑線白底的線稿（AI 產圖、掃描）轉成引擎要的 stencil：800 邊長、透明底、#3a3a3a 線（含 1px 加粗，跟 photo-tool 一致）
# 用法：python tools/make_stencil.py assets/lineart-src/xxx.png assets/lineart/xxx.png [x1,y1,x2,y2 ...補缺口的線段]
# 跑完會印封閉區數量與天空／雲兩個抽樣點是否分離；只需要 Pillow 與 numpy。
import sys, numpy as np
from PIL import Image, ImageDraw
from collections import deque
SIZE=800
src,dst=sys.argv[1],sys.argv[2]
bridges=[tuple(map(int,b.split(','))) for b in sys.argv[3:]]  # x1,y1,x2,y2 補缺口用
img=Image.open(src).convert('L')
s=min(SIZE/img.width,SIZE/img.height); w,h=round(img.width*s),round(img.height*s)
img=img.resize((w,h),Image.LANCZOS)
canvas=Image.new('L',(SIZE,SIZE),255); canvas.paste(img,((SIZE-w)//2,(SIZE-h)//2))
d=ImageDraw.Draw(canvas)
for x1,y1,x2,y2 in bridges: d.line((x1,y1,x2,y2),fill=0,width=4)
g=np.array(canvas); line=g<128
m=line.copy()
for dy in (-1,0,1):
  for dx in (-1,0,1): m|=np.roll(np.roll(line,dy,0),dx,1)
out=np.zeros((SIZE,SIZE,4),np.uint8); out[m]=(58,58,58,255)
Image.fromarray(out,'RGBA').save(dst,optimize=True)
# 重算封閉區，確認缺口補好
free=~m; lab=np.zeros((SIZE,SIZE),np.int32); n=0; sizes=[]
for y in range(SIZE):
  for x in range(SIZE):
    if free[y,x] and lab[y,x]==0:
      n+=1; q=deque([(y,x)]); lab[y,x]=n; c=0
      while q:
        cy,cx=q.popleft(); c+=1
        for ny,nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
          if 0<=ny<SIZE and 0<=nx<SIZE and free[ny,nx] and lab[ny,nx]==0: lab[ny,nx]=n; q.append((ny,nx))
      sizes.append(c)
sizes=np.array(sizes)
print('regions',n,'>=900:',(sizes>=900).sum(),'sky(600,40)=',lab[40,600],'cloud(700,265)=',lab[265,700],'same' if lab[40,600]==lab[265,700] else 'SEPARATED')
