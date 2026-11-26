import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { args, brief, readJson, xml, png } from './lib.mjs';
const places = [[.25,.66],[.42,.40],[.65,.57],[.52,.17],[.18,.23],[.65,.83]];
const font = `Arial, 'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`;
function text(value,x,y,size,color='#ecedf4',maxWidth=1400) {
  const fitted = Math.min(size,maxWidth/Math.max(1,Array.from(String(value)).length*.78));
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${fitted}" font-family="${font}">${xml(value)}</text>`;
}
function mapContent(b,x,y,w,h,labels=true) {
  let s = `<defs><clipPath id="city-map-bounds"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/></clipPath></defs><g clip-path="url(#city-map-bounds)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#18252c"/>`;
  for(let row=0;row<7;row++) for(let col=0;col<10;col++) {
    const bx=x+w*(.045+col*.068), by=y+h*(.045+row*.123);
    s+=`<rect x="${bx}" y="${by}" width="${w*.046}" height="${h*.080}" rx="3" fill="${['#24343b','#293b42','#213038'][(row+col)%3]}"/>`;
  }
  if(b.geography==='coastal') s+=`<path d="M ${x+w*.75} ${y} C ${x+w*.58} ${y+h*.23}, ${x+w*.83} ${y+h*.35}, ${x+w*.72} ${y+h*.54} S ${x+w*.63} ${y+h*.82}, ${x+w*.78} ${y+h} H ${x+w} V ${y} Z" fill="#133449"/>`;
  if(b.geography==='river') s+=`<path d="M ${x+w*.64} ${y-10} C ${x+w*.25} ${y+h*.22}, ${x+w*.88} ${y+h*.55}, ${x+w*.40} ${y+h+10}" fill="none" stroke="#133449" stroke-width="${w*.12}"/>`;
  for(let i=0;i<7;i++) {
    const yy=y+h*(.08+i*.13);
    s+=`<path d="M ${x+w*.035} ${yy} L ${x+w*.70} ${yy+h*.025}" fill="none" stroke="#59666e" stroke-width="${w*.005}"/>`;
  }
  for(let i=0;i<6;i++) {
    const xx=x+w*(.07+i*.12);
    s+=`<path d="M ${xx} ${y+h*.035} L ${xx+w*.015} ${y+h*.95}" fill="none" stroke="#59666e" stroke-width="${w*.005}"/>`;
  }
  s+=`<path d="M ${x+w*.10} ${y+h*.94} C ${x+w*.15} ${y+h*.52}, ${x+w*.48} ${y+h*.80}, ${x+w*.67} ${y+h*.10}" fill="none" stroke="#c0c6c8" stroke-width="${w*.012}"/>`;
  s+=`<path d="M ${x+w*.10} ${y+h*.94} C ${x+w*.15} ${y+h*.52}, ${x+w*.48} ${y+h*.80}, ${x+w*.67} ${y+h*.10}" fill="none" stroke="#34444d" stroke-width="${w*.004}"/>`;
  const points=b.locations.map((_,i)=>[x+w*places[i][0],y+h*places[i][1]]);
  if(points.length>1) s+=`<polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#b5a0ff" stroke-width="${Math.max(3,w*.005)}" stroke-linejoin="round" stroke-linecap="round"/>`;
  points.forEach(([px,py],i)=>{
    s+=`<circle cx="${px}" cy="${py}" r="${labels?15:9}" fill="#b5a0ff" stroke="#10161c" stroke-width="4"/>`;
    if(labels) s+=text(i+1,px-5,py+5,14,'#10161c',20);
  });
  const [px,py]=points[0];
  s+=`<path d="M ${px+25} ${py-2} l 14 22 l -28 0 Z" fill="#f2bc73" stroke="#10161c" stroke-width="2"/>`;
  return s+'</g>';
}
export function graphics(input) {
  const b=brief(input), portrait=b.ratio==='9:16', zh=b.language==='zh';
  const [w,h]=portrait?[900,1600]:[1600,900];
  const start=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
  const bg=`<rect width="${w}" height="${h}" fill="#0c1218"/>`;
  const mapBox=portrait?[50,230,800,780]:[60,190,1000,600];
  let map=start+bg+text(zh?'城市概念 / 原创世界':'CITY CONCEPT / ORIGINAL WORLD',60,65,17,'#b5a0ff',w-120)+text(b.city,60,portrait?145:143,portrait?64:72,'#f2f0f7',w-120);
  map+=mapContent(b,...mapBox);
  const legendX=portrait?60:1120, legendY=portrait?1085:250;
  map+=text(zh?'地点与路线':'LOCATIONS / ROUTE',legendX,legendY,17,'#a0a8b4',portrait?780:400);
  b.locations.forEach((name,i)=>{const yy=legendY+60+i*(portrait?53:76);map+=text(String(i+1).padStart(2,'0'),legendX,yy,17,'#b5a0ff',40)+text(name,legendX+48,yy,portrait?27:24,'#ecedf4',portrait?730:360);});
  map+=text(zh?'虚构地理概念图 · 非导航地图':'FICTIONAL GEOGRAPHY · CONCEPT MAP, NOT NAVIGATION',60,h-44,14,'#87929e',w-120)+'</svg>';
  const hud=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect x="2" y="2" width="596" height="396" rx="22" fill="#0c1218" fill-opacity=".91" stroke="#b5a0ff" stroke-width="2"/>${text(b.city,25,43,25,'#ecedf4',550)}${mapContent(b,22,64,556,270,false)}${text(zh?'概念镜头 · 城市探索':'CINEMATIC CONCEPT · CITY EXPLORATION',25,373,17,'#b5a0ff',550)}</svg>`;
  const end=start+bg+`<rect x="60" y="${h*.35}" width="76" height="5" fill="#b5a0ff"/>`+text(b.city,60,h*.47,portrait?72:104,'#ecedf4',w-120)+text(b.character.name,60,h*.47+75,30,'#b5a0ff',w-120)+text(zh?'原创开放世界城市影像':'AN ORIGINAL OPEN-WORLD CITY CINEMATIC',60,h*.47+125,18,'#9da7b5',w-120)+(b.branding?text('CREATED WITH KIVO STUDIO',60,h-60,16,'#9da7b5',w-120):'')+'</svg>';
  return { map,hud,endcard:end };
}
async function main() {
  const a=args(); if(!a.brief||!a.out)throw Error('Usage: node scripts/render-map.mjs --brief examples/neon-harbor.json --out work/neon-harbor');
  const images=graphics(await readJson(a.brief)); await fs.mkdir(a.out,{recursive:true});
  for(const name of Object.keys(images)) for(const ext of ['svg','png']) {
    const file=path.join(a.out,name+'.'+ext);
    try {await fs.access(file);} catch(e) {if(e.code==='ENOENT') continue; throw e;}
    throw Error(`Refusing to overwrite ${file}; use a new output directory`);
  }
  for(const [name,svg] of Object.entries(images)){
    const svgPath=path.join(a.out,name+'.svg'),pngPath=path.join(a.out,name+'.png');
    // Keep SVG as an editable master; the PNG is accepted by Kivo upload/model APIs.
    await fs.writeFile(svgPath,svg,{flag:'wx'});
    await png(svg,pngPath);
    console.log(path.resolve(pngPath));
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(e=>{console.error(e.message);process.exitCode=1;});
