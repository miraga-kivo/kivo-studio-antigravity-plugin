import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import {args,check,probe,run,xml} from './lib.mjs';
const a=args();
try {
  check(a.video&&a.out,'Usage: node scripts/review-clip.mjs --video work/hero-selected.mp4 --out work/hero-review.png');
  check(path.extname(a.out).toLowerCase()==='.png','Review output must be PNG');
  const info=probe(path.resolve(a.video)),v=info.streams.find(s=>s.codec_type==='video'),duration=Number(info.format.duration);
  check(v&&Number.isFinite(duration)&&duration>0,'Expected a playable video with duration');
  const portrait=v.height>v.width,[w,h]=portrait?[270,480]:[480,270],footer=30;
  const scratch=await fs.mkdtemp(path.join(os.tmpdir(),'kivo-review-'));
  try {
    const layers=[];
    const times=[0,.2,.4,.6,.8,.96].map(x=>Math.min(duration*x,Math.max(0,duration-.08)));
    for(const [i,t] of times.entries()) {
      const frame=path.join(scratch,`${i}.png`);
      run(process.env.FFMPEG_BIN||'ffmpeg',['-hide_banner','-loglevel','error','-ss',String(t),'-i',path.resolve(a.video),'-frames:v','1',frame]);
      const image=await sharp(frame).resize(w,h,{fit:'contain',background:'#0c1218'}).png().toBuffer();
      const label=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${footer}"><rect width="100%" height="100%" fill="#18252c"/><text x="10" y="21" fill="#ececf4" font-family="Arial,sans-serif" font-size="15">${xml(t.toFixed(2))}s</text></svg>`);
      const left=(i%3)*w,top=Math.floor(i/3)*(h+footer);
      layers.push({input:image,left,top},{input:label,left,top:top+h});
    }
    const png=await sharp({create:{width:w*3,height:(h+footer)*2,channels:3,background:'#0c1218'}}).composite(layers).png().toBuffer();
    await fs.mkdir(path.dirname(path.resolve(a.out)),{recursive:true});
    await fs.writeFile(a.out,png,{flag:'wx'});
    const report={file:path.basename(a.video),width:v.width,height:v.height,durationSeconds:duration,fps:v.avg_frame_rate,audioStreams:info.streams.filter(s=>s.codec_type==='audio').length,sampledSeconds:times};
    await fs.writeFile(a.out.replace(/\.png$/i,'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    console.log(JSON.stringify({contactSheet:path.resolve(a.out),...report}));
  }finally{await fs.rm(scratch,{recursive:true,force:true});}
}catch(e){console.error(e.message);process.exitCode=1;}
