# 把黑線白底的線稿（AI 產圖、掃描）轉成引擎要的線條圖層 PNG：透明底、#3a3a3a 線、保留抗鋸齒邊緣。
# 輸出邊長：原圖 ≤1600 時放大到 1600，更大時取原圖尺寸、上限 2048（iPad 13 吋兩倍密度剛好 2048）。
# 線條會加粗約 1px（以 800 遮罩座標計），跟 photo-tool 上傳照片時的 dilate 一致。
# 用法：python tools/make_stencil.py assets/lineart-src/xxx.png assets/lineart/xxx.png [x1,y1,x2,y2 ...補缺口的線段（800 座標）]
# 跑完會印封閉區數量與天空／雲兩個抽樣點是否分離；只需要 Pillow 與 numpy。
# 加 --debug-regions：另存 <dst>.regions.png，每個封閉區隨機上色（最大區留白），肉眼抓漏色用。
import sys, random, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from collections import deque
MASK=800
args=[a for a in sys.argv[1:] if a!='--debug-regions']
debug='--debug-regions' in sys.argv
src,dst=args[0],args[1]
bridges=[tuple(map(int,b.split(','))) for b in args[2:]]
img=Image.open(src).convert('L')
L=1600 if max(img.size)<=1600 else min(max(img.size),2048)
s=min(L/img.width,L/img.height); w,h=round(img.width*s),round(img.height*s)
img=img.resize((w,h),Image.LANCZOS)
canvas=Image.new('L',(L,L),255); canvas.paste(img,((L-w)//2,(L-h)//2))
d=ImageDraw.Draw(canvas); k=L/MASK
for x1,y1,x2,y2 in bridges: d.line((x1*k,y1*k,x2*k,y2*k),fill=0,width=round(4*k))
# 加粗：MinFilter 讓黑往外長，半徑 ≈ 1px@800
r=max(1,round(k)); canvas=canvas.filter(ImageFilter.MinFilter(2*r+1))
g=np.array(canvas).astype(np.float32)
alpha=np.clip((200-g)*255/(200-60),0,255).astype(np.uint8)   # 灰≤60 全實、≥200 全透，中間漸層
alpha=(alpha//17)*17   # 透明度量化成 16 階，PNG 小四成，肉眼看不出差別
out=np.dstack([np.full((L,L),58,np.uint8),alpha])   # 灰階+透明度（LA）比 RGBA 又小兩成
Image.fromarray(out,'LA').save(dst,optimize=True)
# 用引擎同樣的方式取 800 遮罩（縮到 800、alpha>128）並算封閉區
small=np.array(Image.fromarray(alpha).resize((MASK,MASK),Image.BILINEAR))
m=small>128; free=~m
lab=np.zeros((MASK,MASK),np.int32); n=0; sizes=[]
for y in range(MASK):
  for x in range(MASK):
    if free[y,x] and lab[y,x]==0:
      n+=1; q=deque([(y,x)]); lab[y,x]=n; c=0
      while q:
        cy,cx=q.popleft(); c+=1
        for ny,nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
          if 0<=ny<MASK and 0<=nx<MASK and free[ny,nx] and lab[ny,nx]==0: lab[ny,nx]=n; q.append((ny,nx))
      sizes.append(c)
sizes=np.array(sizes)
print('line png',L,'x',L,' mask line ratio',round(m.mean(),3))
print('regions',n,'>=900:',(sizes>=900).sum(),'sky(600,40)=',lab[40,600],'cloud(700,265)=',lab[265,700],'same' if lab[40,600]==lab[265,700] else 'SEPARATED')

if debug and n>0:
  biggest=1+int(np.argmax(sizes))
  rng=random.Random(0)
  colors={biggest:(255,255,255)}
  out_rgb=np.full((MASK,MASK,3),40,np.uint8)  # 線條底色深灰，區塊蓋上去
  for i in range(1,n+1):
    if i not in colors: colors[i]=tuple(rng.randint(60,255) for _ in range(3))
  for i,c in colors.items():
    out_rgb[lab==i]=c
  Image.fromarray(out_rgb,'RGB').save(dst+'.regions.png')
  print('debug regions saved:',dst+'.regions.png')
