#!/usr/bin/env python3
"""Code-drawn 2D short film, made with Pillow and encoded via ffmpeg.

The drawings are deterministic vectors/raster primitives (no image/video AI). Run:
  python3 render.py [--fps 15] [--size 1280x720] [--keep-frames]
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, json, math, random, wave, struct, subprocess, argparse, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = json.loads((ROOT / 'story/shots.json').read_text(encoding='utf-8'))
FONT_PATH = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD_PATH = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
PALETTE = {
 'hero':'#de694f', 'leon':'#f2c14e', 'mia':'#e48bb5', 'brother':'#78a6d8',
 'vendor':'#57b49a', 'black':'#956de0', 'mother':'#e6b95d',
 'ink':'#10101b', 'cream':'#f5e9d2', 'gold':'#ffd078', 'blue':'#72ccff', 'coral':'#fa816c'
}
MOODS = {
 'cafe':('#17152a','#aa5575','#ffbb72'), 'power':('#0a1224','#192f57','#81dcff'),
 'shop':('#151427','#7d4f43','#f4c179'), 'interview':('#111421','#3c465f','#d6e2f4'),
 'alerts':('#0c1325','#153d58','#5ed8c3'), 'mira':('#171327','#563255','#eea4b7'),
 'cost':('#100f1d','#352442','#cb91bb'), 'home':('#171523','#594038','#ffc47c'),
 'event':('#101321','#28334d','#ffd281'), 'evidence':('#0c1726','#123b55','#76d8ff'),
 'science':('#06152a','#0a3150','#68d8ff'), 'hug':('#171421','#634338','#ffd28c'),
 'end':('#080f20','#152846','#90ccff')
}
W=1280; H=720; FPS=15

def font(n,bold=False): return ImageFont.truetype(BOLD_PATH if bold else FONT_PATH,n)
def clamp(x,a=0,b=1): return max(a,min(b,x))
def smooth(x):
 x=clamp(x); return x*x*(3-2*x)
def mix(a,b,t): return round(a+(b-a)*t)
def rgb(c):
 c=c.lstrip('#'); return tuple(int(c[i:i+2],16) for i in (0,2,4))
def colalpha(c,a): return (*rgb(c),int(a))
_BG_CACHE={}
def grad_bg(kind):
 key=(kind,W,H)
 if key not in _BG_CACHE:
  top,mid,light=map(rgb,MOODS[kind]); im=Image.new('RGB',(W,H)); p=im.load()
  # Precompute the dusk gradient once per location, then only draw moving layers per frame.
  xmod=[0.11*math.sin(x/W*math.pi) for x in range(W)]
  for y in range(H):
   base=y/(H-1)*1.05
   for x in range(W):
    v=clamp(base+xmod[x])
    if v<.72: k=v/.72; c=tuple(mix(top[i],mid[i],k) for i in range(3))
    else: k=(v-.72)/.28; c=tuple(mix(mid[i],light[i],k*.16) for i in range(3))
    p[x,y]=c
  _BG_CACHE[key]=im.convert('RGBA')
 return _BG_CACHE[key].copy()

def glow(im,x,y,r,color,alpha=110):
 layer=Image.new('RGBA',(W,H)); d=ImageDraw.Draw(layer)
 d.ellipse((x-r,y-r,x+r,y+r),fill=colalpha(color,alpha))
 layer=layer.filter(ImageFilter.GaussianBlur(max(1,r*.52))); im.alpha_composite(layer)
def rounded(d,box,r,fill,outline=None,width=1): d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=width)

def window(d,x,y,w,h,lit='#f5bb71',panes=3):
 rounded(d,(x,y,x+w,y+h),5,(18,21,37,255),(71,67,93,220),3)
 d.rounded_rectangle((x+8,y+8,x+w-8,y+h-8),radius=3,fill=(*rgb(lit),90))
 d.line((x+w/2,y+7,x+w/2,y+h-7),fill=(30,29,47,235),width=5)
 if panes>=3: d.line((x+7,y+h*.55,x+w-7,y+h*.55),fill=(30,29,47,230),width=4)

def draw_bg(im,kind,t):
 d=ImageDraw.Draw(im,'RGBA'); top,mid,light=MOODS[kind]
 # distant city / architecture silhouettes
 d.rectangle((0,425,W,H),fill=(11,12,23,210))
 rng=random.Random(41+list(MOODS).index(kind))
 for i in range(24):
  x=i*59-10; h=rng.randint(70,190)
  d.rectangle((x,430-h,x+55,440),fill=(17+rng.randrange(12),19,36,220))
  for yy in range(448-h,424,24):
   if rng.random()>.35:d.rectangle((x+8,yy,x+13,yy+7),fill=(*rgb(light),rng.randint(30,100)))
 d.rectangle((0,478,W,720),fill=(13,13,25,235))
 # Large window grid and architectural light
 for x,y,w,h in [(80,85,290,275),(875,70,310,260)]:
  if kind in ('cafe','home','hug','interview','mira','cost','end'):
   window(d,x,y,w,h,light)
 if kind in ('shop','interview'):
  d.rectangle((0,365,W,390),fill=(35,32,47,255)); d.line((0,365,W,365),fill=(*rgb(light),145),width=3)
 if kind=='home' or kind=='hug':
  d.rectangle((0,475,W,720),fill=(29,21,24,255)); d.rectangle((104,325,1170,338),fill=(63,43,37,255))
  for x in (260,315,370): d.line((x,300,x,323),fill=(255,194,114,210),width=3)
  d.ellipse((1020,170,1090,240),fill=(*rgb(light),190))
 if kind=='event' or kind=='evidence':
  d.rectangle((250,105,1050,397),fill=(14,21,38,255),outline=(*rgb(light),100),width=3)
  # stage, spot beams, audience rows
  d.polygon([(400,100),(570,100),(835,520),(680,520)],fill=(*rgb(light),12))
  d.polygon([(745,100),(930,100),(660,520),(520,520)],fill=(*rgb(light),9))
  for row in range(3):
   for i in range(19):
    x=20+i*69+(row%2)*25; y=505+row*48
    d.ellipse((x,y,x+34,y+34),fill=(13,14,24,250)); d.arc((x-9,y+23,x+44,y+86),180,360,fill=(18,20,32,255),width=18)
 if kind=='science':
  for x in range(0,W,48):d.line((x,0,x,H),fill=(51,151,192,24),width=1)
  for y in range(0,H,48):d.line((0,y,W,y),fill=(51,151,192,24),width=1)
 if kind=='end':
  for i in range(8):
   x=i*190+30; d.rectangle((x,275-(i*17%100),x+120,540),fill=(11,17,31,230))
   for yy in range(305-(i*17%100),530,29):
    d.rectangle((x+18,yy,x+24,yy+8),fill=(*rgb(light),60+i%3*20))
 # floor perspective, warm reflections
 d.line((0,485,W,485),fill=(202,154,111,38),width=2)
 for x in range(-200,1500,150):d.line((640,480,x,720),fill=(191,141,119,20),width=1)
 # vignette subtle overlay
 return im

def figure(im,x,ground,s=1,garment='#de694f',pose='stand',face='neutral',t=0,side=1,scale=1):
 d=ImageDraw.Draw(im,'RGBA'); bob=math.sin(t*2.2+x*.01)*3*s
 x=int(x); gy=int(ground+bob); head=(x,gy-int(142*s)); r=int(27*s)
 # contact shadow
 d.ellipse((x-50*s,gy-3*s,x+50*s,gy+9*s),fill=(0,0,0,95))
 # shoulder/hip joint coordinates
 neck=(x,gy-107*s); hip=(x,gy-45*s)
 armcolor=(15,14,24,255); light=(*rgb(garment),255)
 if pose=='sit': hip=(x,gy-48*s); knees=[(x-48*s,gy-20*s),(x+45*s,gy-18*s)]; feet=[(x-80*s,gy),(x+75*s,gy)]
 else: knees=[(x-20*s,gy-24*s),(x+25*s,gy-23*s)]; feet=[(x-31*s,gy),(x+42*s,gy)]
 # legs and shoes
 for a,b,c in [(hip,knees[0],feet[0]),(hip,knees[1],feet[1])]:
  d.line((a,b),fill=(12,12,23,255),width=max(5,int(13*s)))
  d.line((b,c),fill=(12,12,23,255),width=max(5,int(11*s)))
  d.ellipse((c[0]-7*s,c[1]-4*s,c[0]+16*s,c[1]+3*s),fill=(10,10,19,255))
 # torso
 shoulder=(x,gy-101*s)
 d.line((shoulder,(x,gy-53*s)),fill=(13,12,22,255),width=max(8,int(26*s)))
 d.polygon([(x-16*s,gy-100*s),(x+16*s,gy-100*s),(x+18*s,gy-57*s),(x-18*s,gy-57*s)],fill=(*rgb(garment),230))
 d.line((x-9*s,gy-94*s,x-7*s,gy-61*s),fill=(255,219,186,90),width=max(1,int(2*s)))
 if pose=='phone': arms=[((x-13*s,gy-96*s),(x-33*s,gy-69*s)),((x+13*s,gy-96*s),(x+29*s,gy-71*s))]
 elif pose in ('point','alert'): arms=[((x-12*s,gy-96*s),(x-32*s,gy-67*s)),((x+13*s,gy-96*s),(x+64*s,gy-121*s))]
 elif pose in ('hug','hold'): arms=[((x-13*s,gy-96*s),(x-34*s,gy-63*s)),((x+13*s,gy-96*s),(x+35*s,gy-63*s))]
 elif pose=='sit': arms=[((x-13*s,gy-95*s),(x-38*s,gy-70*s)),((x+13*s,gy-95*s),(x+38*s,gy-70*s))]
 elif pose=='shrug':arms=[((x-13*s,gy-96*s),(x-53*s,gy-120*s)),((x+13*s,gy-96*s),(x+53*s,gy-120*s))]
 else: arms=[((x-13*s,gy-96*s),(x-35*s,gy-59*s)),((x+13*s,gy-96*s),(x+37*s,gy-61*s))]
 for a,b in arms:
  d.line((a,b),fill=(12,12,22,255),width=max(5,int(12*s)))
  d.ellipse((b[0]-5*s,b[1]-5*s,b[0]+5*s,b[1]+5*s),fill=(*rgb(garment),255))
 # head rim + face
 d.ellipse((head[0]-r-4*s,head[1]-r-4*s,head[0]+r+4*s,head[1]+r+4*s),fill=(*rgb(garment),55))
 d.ellipse((head[0]-r,head[1]-r,head[0]+r,head[1]+r),fill=(10,10,19,255),outline=(232,203,171,225),width=max(2,int(3*s)))
 eye_y=head[1]-2*s; eye_dx=8*s
 d.ellipse((head[0]-eye_dx-2*s,eye_y-2*s,head[0]-eye_dx+2*s,eye_y+2*s),fill=(246,230,206,255))
 d.ellipse((head[0]+eye_dx-2*s,eye_y-2*s,head[0]+eye_dx+2*s,eye_y+2*s),fill=(246,230,206,255))
 if face in ('sad','worried'):
  d.arc((head[0]-8*s,head[1]+7*s,head[0]+9*s,head[1]+19*s),190,350,fill=(244,223,203,235),width=max(1,int(2*s)))
 elif face=='smile':d.arc((head[0]-9*s,head[1]+2*s,head[0]+10*s,head[1]+17*s),5,170,fill=(244,223,203,235),width=max(1,int(2*s)))
 else:d.line((head[0]-4*s,head[1]+13*s,head[0]+5*s,head[1]+13*s),fill=(244,223,203,225),width=max(1,int(2*s)))
 if pose=='phone':
  px=x+32*s; py=gy-82*s
  rounded(d,(px-9*s,py-18*s,px+8*s,py+18*s),4,(22,30,49,255),(*rgb('#88d8ff'),255),2)
  d.line((px-4*s,py-8*s,px+4*s,py-8*s),fill=(154,224,250,255),width=2)

def draw_prop(im,kind,t):
 d=ImageDraw.Draw(im,'RGBA')
 if kind=='cafe':
  # tabletop, cups, pendant
  d.rectangle((180,471,1100,495),fill=(63,40,40,255)); d.line((195,469,1080,469),fill=(221,171,121,170),width=3)
  for x in (492,777):
   d.ellipse((x-20,445,x+19,452),fill=(245,205,161,255));d.rounded_rectangle((x-18,409,x+18,450),5,fill=(31,29,45,255),outline=(231,198,158,220),width=2)
   d.arc((x+12,417,x+31,442),270,100,fill=(228,192,153,255),width=3)
  for x in (415,870):
   d.line((x,0,x,83),fill=(214,172,126,210),width=2);glow(im,x,104,88,MOODS['cafe'][2],45);d=ImageDraw.Draw(im,'RGBA');d.ellipse((x-28,90,x+28,116),fill=(255,211,150,220))
 if kind=='shop':
  rounded(d,(385,330,875,470),20,(20,24,41,255), (93,110,144,220),3)
  d.rectangle((415,351,845,440),fill=(28,45,62,255));d.line((435,365,810,365),fill=(97,218,211,120),width=2)
  d.text((457,380),'NEW · 100%',font=font(30,True),fill=(238,229,214,235))
 if kind=='interview':
  d.rectangle((220,430,1060,458),fill=(38,41,55,255)); d.rectangle((300,458,327,548),fill=(25,27,40,255));d.rectangle((970,458,997,548),fill=(25,27,40,255))
  rounded(d,(820,302,1000,426),8,(31,37,55,255),(151,128,111,180),2)
  d.text((847,322),'SELECTED',font=font(18,True),fill=(220,178,133,210));d.line((848,362,966,362),fill=(177,183,196,120),width=2)
 if kind=='alerts':
  # floating message tiles and call alert
  for i,(txt,x,y) in enumerate([('ԶԱՆԳ',880,175),('ՍԿԱՄ',960,285),('ՀԱՐՑ',760,260)]):
   yy=y+math.sin(t*1.8+i)*7
   rounded(d,(x,yy,x+145,yy+56),15,(19,35,53,235),(*rgb('#70d9df'),130),2)
   d.text((x+16,yy+15),txt,font=font(20,True),fill=(224,244,237,240))
 if kind=='mira':
  for r in (70,100,135):d.ellipse((640-r,315-r,640+r,315+r),outline=(238,145,184,45),width=2)
 if kind=='cost':
  for i,txt in enumerate(('ԴՈՒ ԼԱՎՆ ԵՍ','ԿԱՐԾՈՒՄ ԵՄ','ԻՆՁ ՄԻԵՎՆՈՒՅՆ Է')):
   x=170+i*355;y=190+i%2*125
   rounded(d,(x,y,x+280,y+61),21,(31,25,43,210),(*rgb('#db9aba'),90),1)
   d.text((x+17,y+17),txt,font=font(20,True),fill=(239,216,226,190))
 if kind in ('home','hug'):
  # steam from tea, warm table
  d.ellipse((932,493,1095,521),fill=(69,44,37,255));d.rounded_rectangle((969,441,1055,497),10,fill=(28,25,37,255),outline=(219,178,123,210),width=3)
  for i in range(3):
   x=984+i*22;d.arc((x,408-math.sin(t+i)*5,x+19,450),180,320,fill=(255,212,148,145),width=3)
 if kind=='event':
  d.text((410,177),'ՀԱՆՈՒՆ ԵՐԵԽԱՆԵՐԻ',font=font(34,True),fill=(255,225,173,235))
  d.text((493,245),'ԲԱՐԵԳՈՐԾՈՒԹՅՈՒՆ',font=font(24,True),fill=(184,205,219,190))
 if kind=='evidence':
  rounded(d,(364,130,918,403),12,(13,34,51,255),(115,214,240,200),3)
  d.text((408,157),'ՀՐԱՊԱՐԱԿԱՅԻՆ ՀԱՇՎԵՏՎՈՒԹՅՈՒՆ',font=font(22,True),fill=(149,223,243,245))
  for i,(a,b) in enumerate([('Բուժօգնություն','68%'),('Վարչարարություն','12%'),('Այլ ծախսեր','20%')]):
   y=216+i*50;d.text((408,y),a,font=font(20),fill=(234,238,233,225));d.text((810,y),b,font=font(20,True),fill=(255,212,137,255))
   d.line((408,y+31,850,y+31),fill=(102,187,218,70),width=2)
 if kind=='science':
  # brain/memory sketch and waveforms
  d.ellipse((342,170,572,387),outline=(105,219,250,200),width=4)
  for x in range(385,560,36):
   d.arc((x-45,195,x+45,300),185,340,fill=(89,200,241,155),width=2)
  d.line((384,282,434,255,465,285,505,231,541,261),fill=(243,184,106,225),width=4)
  d.text((382,405),'ՀԻՇՈՂՈՒԹՅՈՒՆ',font=font(19,True),fill=(150,222,240,230))
  # polygraph wave right
  pts=[]
  for x in range(700,1115,5):pts.append((x,290+math.sin(x*.04+t*2)*17+math.sin(x*.15+t*3)*6))
  d.line(pts,fill=(117,220,241,220),width=3)
  d.text((756,330),'ԱՆԿԵՂԾ ≠ ՃԻՇՏ',font=font(26,True),fill=(255,207,127,250))
 if kind=='end':
  # glowing phone question card
  glow(im,640,365,200,'#4298d0',42);d=ImageDraw.Draw(im,'RGBA')
  rounded(d,(508,180,775,534),30,(15,26,44,255),(122,200,229,220),3)
  d.rounded_rectangle((529,205,754,475),18,fill=(9,17,31,255))
  d.text((555,245),'ԱՆԾԱՆՈԹ',font=font(19,True),fill=(129,206,236,230))
  d.line((555,284,723,284),fill=(97,143,170,100),width=2)
  d.text((555,320),'ԿԱՐՈ՞Ղ ԵՍ',font=font(22,True),fill=(242,232,215,245))
  d.text((555,353),'ՏԵՍՆԵԼ՝ ՈՎ Է',font=font(20,True),fill=(242,232,215,245))
  d.text((555,387),'ԻՆՔՆ ԻՐԵՆ ԽԱԲՈՒՄ',font=font(18,True),fill=(242,232,215,245))
  d.ellipse((625,488,657,520),fill=(78,133,162,220))

def draw_blueprint_fig(d,cx,cy,r,color):
 d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=(*rgb(color),180),width=3)
 d.arc((cx-r*.6,cy-r*.6,cx+r*.6,cy+r*.6),0,360,fill=(*rgb(color),120),width=2)
 d.line((cx-r*.55,cy,cx+r*.55,cy),fill=(*rgb(color),100),width=2)

def make_frame(shot,local,prev=None,blend=0):
 kind=shot['kind']; t=local; im=grad_bg(kind); draw_bg(im,kind,t)
 # soft lights, moving dust particles
 glow(im,1010+20*math.sin(t*.5),155,260,MOODS[kind][2],35)
 d=ImageDraw.Draw(im,'RGBA')
 for i in range(34):
  x=(i*173+math.sin(t*.55+i*4)*20)%W; y=(i*89+int(t*13*(1+i%3)*.15))%470
  d.ellipse((x,y,x+2+i%3,y+2+i%3),fill=(*rgb(MOODS[kind][2]),65+i%5*15))
 draw_prop(im,kind,t)
 # camera drift / gentle parallax
 if kind=='cafe':
  figure(im,465+math.sin(t*.6)*8,500,1.05,PALETTE['hero'],'phone','worried',t)
  figure(im,635,498,.89,PALETTE['leon'],'sit','smile',t)
  figure(im,790,498,.91,PALETTE['mia'],'sit','neutral',t)
  figure(im,937,500,.92,PALETTE['brother'],'sit','smile',t)
 elif kind=='power':
  figure(im,600,650,2.1,PALETTE['hero'],'alert','determined',t)
  d=ImageDraw.Draw(im,'RGBA')
  for i in range(3):
   r=95+i*64+int(7*math.sin(t*2+i)); d.ellipse((600-r,420-r*.65,600+r,420+r*.65),outline=(96,219,255,95-i*16),width=3)
  d.text((870,226),'ՃՇՄԱՐՏՈՒԹՅՈՒՆ',font=font(24,True),fill=(140,225,255,220))
  d.text((870,265),'ՍՈՒՏ',font=font(21,True),fill=(249,129,108,220))
  # main title
  txt='ՈՉ ՈՔ ՉԻ ԿԱՐՈՂ ՔԵԶ ԽԱԲԵԼ'; f=font(34,True); box=ImageDraw.Draw(im).textbbox((0,0),txt,font=f)
  rounded(d,(640,486,1198,552),15,(9,16,31,210),(105,187,218,100),1)
  d.text((667,501),txt,font=f,fill=(241,227,205,245))
 elif kind=='shop':
  figure(im,403,573,1.22,PALETTE['hero'],'alert','neutral',t)
  figure(im,895,573,1.28,PALETTE['vendor'],'shrug','smile',t)
 elif kind=='interview':
  figure(im,435,570,1.32,PALETTE['hero'],'point','determined',t)
  figure(im,879,568,1.33,PALETTE['black'],'sit','smile',t)
 elif kind=='alerts':
  figure(im,620,610,1.45,PALETTE['hero'],'phone','thinking',t)
 elif kind=='mira':
  figure(im,455,585,1.48,PALETTE['hero'],'stand','sad',t)
  figure(im,803,585,1.48,PALETTE['mia'],'hold','worried',t)
  d=ImageDraw.Draw(im,'RGBA'); d.line((638,403,638,570),fill=(226,149,198,75),width=2)
 elif kind=='cost':
  figure(im,640,625,1.85,PALETTE['hero'],'shrug','sad',t)
 elif kind=='home':
  figure(im,487,608,1.20,PALETTE['hero'],'sit','worried',t)
  figure(im,754,608,1.27,PALETTE['mother'],'sit','sad',t)
 elif kind=='event':
  figure(im,478,535,1.34,PALETTE['hero'],'point','determined',t)
  figure(im,802,535,1.23,PALETTE['black'],'alert','smile',t)
 elif kind=='evidence':
  figure(im,222,610,1.05,PALETTE['hero'],'point','determined',t)
  figure(im,1051,609,.98,PALETTE['vendor'],'stand','neutral',t)
  # ascending evidence bars
  d=ImageDraw.Draw(im,'RGBA')
  for i,h in enumerate((100,158,208)):
   x=497+i*103;y=522-h; d.rounded_rectangle((x,y,x+60,523),8,fill=(*rgb(('#64bfe0','#70d4b4','#f3bd71')[i]),200))
 elif kind=='science':
  figure(im,1030,609,.96,PALETTE['hero'],'think','thinking',t)
  d=ImageDraw.Draw(im,'RGBA')
  d.line((640,143,640,540),fill=(100,191,226,55),width=2)
  for x,y,r in ((210,283,65),(640,280,67),(920,470,53)):
   draw_blueprint_fig(d,x,y,r,'#64c9ef')
  d.line((278,283,566,283),fill=(93,190,226,115),width=2);d.line((710,300,868,433),fill=(93,190,226,115),width=2)
 elif kind=='hug':
  figure(im,572,612,1.53,PALETTE['hero'],'hug','smile',t)
  figure(im,707,612,1.47,PALETTE['mother'],'hug','smile',t)
  glow(im,640,453,220,'#ffb769',46)
  # repeated three knock pulses
  d=ImageDraw.Draw(im,'RGBA')
  if t<1.7:
   for i in range(3):
    if abs(t-(.28+i*.42))<.17: d.arc((1040-i*9,260-i*9,1130+i*9,350+i*9),200,335,fill=(255,204,126,220),width=4)
 elif kind=='end':
  figure(im,390,580,1.14,PALETTE['hero'],'phone','thinking',t)
  d=ImageDraw.Draw(im,'RGBA')
  d.text((857,579),'Ի՞ՆՉ ԿԱՆԵԻՐ ԴՈՒ',font=font(23,True),fill=(241,226,204,230))
  d.text((857,614),'Գրի՛ր մեկնաբանությունում',font=font(18),fill=(155,197,214,225))
 # Header label
 d=ImageDraw.Draw(im,'RGBA')
 rounded(d,(58,45,58+max(210,len(shot['location'])*17),88),12,(8,13,25,180),(255,220,178,65),1)
 d.text((78,55),shot['location'],font=font(17,True),fill=(225,215,200,220))
 # opening marker
 if shot['id']=='s01' and t<3.1:
  a=int(255*(1-smooth(t/3.3)))
  d.rounded_rectangle((0,0,W,H),fill=(4,8,18,a))
  title='ՍՏՈՒԹՅՈՒՆՆԵՐԻՑ ՄԻ ԱՇԽԱՐՀՈՒՄ'
  f=font(37,True); bb=d.textbbox((0,0),title,font=f); d.text(((W-(bb[2]-bb[0]))/2,139),title,font=f,fill=(247,228,205,a))
  d.text((535,200),'ԻՍԿ ԵԹԵ...',font=font(25,True),fill=(238,177,118,a))
 # Caption band with gently animated rise / type-on reveal
 words=[]
 for line in shot['caption']: words.extend(line.split())
 progress=clamp((t-.48)/.72); count=max(1,math.ceil(len(words)*progress))
 remaining=count; shown=[]
 for line in shot['caption']:
  ws=line.split(); n=min(len(ws),remaining); shown.append(' '.join(ws[:n])); remaining-=n
  if remaining<=0: break
 cap_y=570+int((1-smooth(clamp((t-.12)/.5)))*18)
 d.rounded_rectangle((88,cap_y,1192,692),radius=20,fill=(5,9,19,204),outline=(255,229,197,42),width=1)
 for i,line in enumerate(shown[:2]):
  if not line:continue
  f=font(27 if len(line)>49 else 31,True); bb=d.textbbox((0,0),line,font=f)
  d.text(((W-(bb[2]-bb[0]))/2,cap_y+20+i*43),line,font=f,fill=(250,239,220,245),stroke_width=1,stroke_fill=(8,12,22,255))
 # soft frame edge
 shade=Image.new('RGBA',(W,H),(0,0,0,0)); sd=ImageDraw.Draw(shade)
 for x in range(80):
  al=int(47*(1-x/80)**2)
  sd.rectangle((x,x,W-1-x,H-1-x),outline=(0,0,0,al))
 im.alpha_composite(shade)
 im=im.convert('RGB')
 if prev is not None and blend>0 and shot.get('transition')!='cut': im=Image.blend(prev,im,smooth(blend))
 transition=shot.get('transition')
 if transition=='dip' and t<.42:
  veil=Image.new('RGB',(W,H),(0,0,0)); im=Image.blend(veil,im,smooth(t/.42))
 elif transition in ('flash','smash') and t<.16:
  veil=Image.new('RGB',(W,H),(255,245,226)); im=Image.blend(im,veil,(1-smooth(t/.16))*(.62 if transition=='flash' else .9))
 elif transition=='whip' and t<.42:
  streak=Image.new('RGBA',(W,H)); sd=ImageDraw.Draw(streak)
  strength=int(105*(1-smooth(t/.42)))
  for j in range(13):
   y=(j*67+int(t*430))%H; sd.line((0,y,W,y-42),fill=(168,222,250,strength),width=2+j%3)
  im=Image.alpha_composite(im.convert('RGBA'),streak).convert('RGB')
 return im

def make_music(path,duration,sr=24000):
 # A soft cinematic pulse with evolving pad harmonics, subtle heartbeat and sparse bell notes.
 n=int((duration+.2)*sr); phases=[0.,0.,0.,0.,0.]
 freqs=(55.0,82.41,110.0,164.81,220.0)
 with wave.open(str(path),'wb') as f:
  f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr)
  buf=bytearray()
  for i in range(n):
   t=i/sr
   fade=min(1,t/1.6,max(0,(duration+.2-t)/2.5))
   val=0.0
   for k,hz in enumerate(freqs):
    phases[k]+=2*math.pi*hz/sr
    val+=math.sin(phases[k]+.08*math.sin(t*.24+k))*((.16 if k<3 else .07)/(1+k*.45))
   # muted kick-like heartbeat every 1.25 s; distant bell tones every 5.3 s
   beat=t%1.28; val+=.14*math.exp(-beat*12)*math.sin(2*math.pi*48*t)
   for j,bell in enumerate((392.0,523.25,659.25,587.33)):
    bt=(t-(6.0+j*5.3))%21.2
    if bt<2.2: val+=.045*math.sin(2*math.pi*bell*bt)*math.exp(-bt*2.1)
   val*=fade*(.82+.18*math.sin(t*.12))
   sample=int(max(-1,min(1,val))*8800); buf.extend(struct.pack('<hh',sample,sample))
   if len(buf)>=65536:f.writeframesraw(buf);buf.clear()
  if buf:f.writeframesraw(buf)

def main():
 global W,H,FPS
 ap=argparse.ArgumentParser();ap.add_argument('--fps',type=int,default=FPS,help='source drawing rate');ap.add_argument('--output-fps',type=int,default=30,help='motion-interpolated final frame rate');ap.add_argument('--size',default='1280x720');ap.add_argument('--keep-frames',action='store_true');a=ap.parse_args()
 W,H=map(int,a.size.lower().split('x')); FPS=a.fps
 build=ROOT/'build'; frames=build/'frames';build.mkdir(exist_ok=True);frames.mkdir(exist_ok=True)
 ffmpeg=str((ROOT.parents[1]/'.cache/video-tools/node_modules/@ffmpeg-installer/linux-x64/ffmpeg').resolve())
 if not Path(ffmpeg).exists():
  ffmpeg=shutil.which('ffmpeg') or ''
 if not ffmpeg:raise SystemExit('ffmpeg not found: install @ffmpeg-installer/linux-x64 into .cache/video-tools')
 shots=DATA['shots']; total=DATA['duration']; idx=0; prev=None
 for si,shot in enumerate(shots):
  duration=shot['end']-shot['start']; n=round(duration*FPS)
  for frame in range(n):
   t=frame/FPS; tr=min(.45,duration*.13); blend=(t/tr if si>0 and shot.get('transition')!='cut' and t<tr else 0)
   im=make_frame(shot,t,prev if blend>0 else None,blend)
   if frame==0: pass
   im.save(frames/f'frame_{idx:05d}.jpg',quality=93,subsampling=0)
   idx+=1
  prev=make_frame(shot,duration, None)
  print(f"[{idx:4d} frames] {shot['id']} {shot['location']}",flush=True)
 music=build/'score.wav'; make_music(music,total)
 out=ROOT/'out'/'truth-unmasked-hy.mp4';out.parent.mkdir(exist_ok=True)
 cmd=[ffmpeg,'-y','-hide_banner','-loglevel','warning','-framerate',str(FPS),'-i',str(frames/'frame_%05d.jpg'),'-i',str(music),'-vf',f'minterpolate=fps={a.output_fps}:mi_mode=mci:mc_mode=obmc:me_mode=bidir:vsbmc=1,format=yuv420p','-c:v','libx264','-preset','medium','-crf','19','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart',str(out)]
 subprocess.run(cmd,check=True)
 # SRT captions timed in Armenian
 srt=[]
 for i,s in enumerate(shots,1):
  def stamp(sec):
   ms=round(sec*1000); hh,ms=divmod(ms,3600000);mm,ms=divmod(ms,60000);ss,ms=divmod(ms,1000);return f'{hh:02}:{mm:02}:{ss:02},{ms:03}'
  srt.extend([str(i),f"{stamp(s['start']+.48)} --> {stamp(s['end']-.12)}",'\n'.join(s['caption']),''])
 (ROOT/'out'/'captions-hy.srt').write_text('\n'.join(srt),encoding='utf-8')
 probe=subprocess.run([ffmpeg,'-i',str(out)],capture_output=True,text=True).stderr
 print(f"Rendered {out} | {out.stat().st_size/1e6:.1f} MB | {idx} drawn frames @ {FPS} fps → {a.output_fps} fps interpolated",flush=True)
 if not a.keep_frames:
  shutil.rmtree(frames)
  music.unlink(missing_ok=True)

if __name__=='__main__':main()
