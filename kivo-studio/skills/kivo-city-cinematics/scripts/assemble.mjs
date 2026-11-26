import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { args, check, readJson, dimensions, probe, run } from './lib.mjs';
const ffmpeg=process.env.FFMPEG_BIN||'ffmpeg';
async function main(){
  const a=args(); if(!a.manifest||!a.out)throw Error('Usage: node scripts/assemble.mjs --manifest work/neon-harbor/assembly.json --out work/neon-harbor/cinematic.mp4');
  const manifestPath=path.resolve(a.manifest), manifest=await readJson(manifestPath), base=path.dirname(manifestPath);
  check(['16:9','9:16'].includes(manifest.ratio),'Unsupported ratio');
  check(Number.isInteger(manifest.fps)&&manifest.fps>=15&&manifest.fps<=60,'fps must be 15–60');
  check(Array.isArray(manifest.segments)&&manifest.segments.length>=1&&manifest.segments.length<=40,'Provide 1–40 segments');
  const out=path.resolve(a.out);check(path.extname(out).toLowerCase()==='.mp4','Output must be .mp4');
  const [w,h]=dimensions(manifest.ratio), fps=manifest.fps;
  let total=0;
  for(const segment of manifest.segments){
    check(['image','video'].includes(segment.kind),'Unknown segment kind');
    check(typeof segment.path==='string'&&segment.path.length>0,'Missing segment path');
    check(Number.isFinite(segment.seconds)&&segment.seconds>0&&segment.seconds<=120,'Invalid segment duration');
    check(Math.abs(segment.seconds*fps-Math.round(segment.seconds*fps))<1e-6,'Segment duration must align to the selected frame rate');
    segment.file=path.resolve(base,segment.path);await fs.access(segment.file);
    check(segment.file!==out,'Cannot overwrite a source with the output');
    if(segment.kind==='video'){
      const info=probe(segment.file);check(info.streams.some(s=>s.codec_type==='video'),'Segment has no video');
      const seconds=Number(info.format.duration);check(Number.isFinite(seconds)&&seconds+.08>=segment.seconds,`Video is shorter than requested segment: ${segment.path}`);
    }
    if(segment.hud){
      check(typeof segment.hud==='string','hud must be a local PNG path');
      segment.hudPosition??='bottom-right';
      check(['bottom-left','bottom-right','top-left','top-right'].includes(segment.hudPosition),'Invalid hudPosition');
      segment.hud=path.resolve(base,segment.hud);await fs.access(segment.hud);
    }
    total+=segment.seconds;
  }
  check(total<=180,'This renderer is limited to three-minute clips');
  await fs.mkdir(path.dirname(out),{recursive:true});
  // Reserve the output name before rendering so repeated invocations never silently overwrite it.
  const reserved=await fs.open(out,'wx');await reserved.close();
  const scratch=await fs.mkdtemp(path.join(os.tmpdir(),'kivo-city-'));
  let finished=false;
  try{
    const rendered=[];
    for(const [index,s]of manifest.segments.entries()){
      const file=path.join(scratch,`segment-${index}.mp4`),frames=Math.round(s.seconds*fps);
      const filter=`scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=0x0c1218,setsar=1,fps=${fps}`;
      const input=s.kind==='image'?['-loop','1','-framerate',String(fps),'-i',s.file]:['-i',s.file];
      const argv=['-hide_banner','-loglevel','error','-y',...input];
      if(s.hud){
        const x=s.hudPosition.endsWith('right')?'W-w-24':'24',y=s.hudPosition.startsWith('bottom')?'H-h-24':'24';
        argv.push('-i',s.hud,'-filter_complex',`[0:v]${filter}[base];[1:v]scale=${Math.round(w*.21)}:-1[hud];[base][hud]overlay=${x}:${y}:format=auto[out]`,'-map','[out]');
      }else argv.push('-vf',filter);
      argv.push('-an','-frames:v',String(frames),'-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-video_track_timescale','24000','-movflags','+faststart',file);
      run(ffmpeg,argv);rendered.push(file);
    }
    const list=path.join(scratch,'concat.txt');await fs.writeFile(list,rendered.map(f=>`file '${f.replaceAll("'","'\\''")}'`).join('\n')+'\n');
    const concat=['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',list];
    if(manifest.audio){
      const audio=path.resolve(base,manifest.audio);check(audio!==out,'Audio cannot be the output');await fs.access(audio);
      concat.push('-i',audio,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-af','apad','-t',String(total));
    }else concat.push('-map','0:v:0','-c:v','copy','-an');
    concat.push('-movflags','+faststart',out);run(ffmpeg,concat);
    const info=probe(out),video=info.streams.find(s=>s.codec_type==='video');
    check(video?.width===w&&video?.height===h,'Unexpected rendered dimensions');
    check(Math.abs(Number(info.format.duration)-total)<=2/fps,'Rendered duration differs from manifest');
    await fs.writeFile(out.replace(/\.mp4$/i,'.render.json'),JSON.stringify({width:w,height:h,fps,durationSeconds:Number(info.format.duration),segments:manifest.segments.map(({file,...s})=>({...s,hud:s.hud?path.basename(s.hud):undefined})),audio:!!manifest.audio},null,2)+'\n');
    finished=true;console.log(JSON.stringify({output:out,width:w,height:h,durationSeconds:Number(info.format.duration)}));
  }finally{await fs.rm(scratch,{recursive:true,force:true});if(!finished)await fs.rm(out,{force:true});}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
