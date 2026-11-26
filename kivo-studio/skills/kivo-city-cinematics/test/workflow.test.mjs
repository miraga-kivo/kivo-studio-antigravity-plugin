import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
import {plan} from '../scripts/plan.mjs';
import {graphics} from '../scripts/render-map.mjs';
import {probe,run} from '../scripts/lib.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const example=JSON.parse(await fs.readFile(path.join(root,'examples/neon-harbor.json'),'utf8'));
const copy=()=>structuredClone(example);
test('both templates account for real generated seconds and preserve references',()=>{
  const compact=plan(copy());
  assert.equal(compact.durationSeconds,12);
  assert.equal(compact.generation.filter(x=>x.type==='draft').reduce((s,x)=>s+x.duration,0),5);
  assert.deepEqual(compact.generation.at(-1).references,['city','character']);
  const trailer=plan({...copy(),template:'city-trailer',ratio:'9:16'});
  assert.equal(trailer.durationSeconds,15);
  assert.equal(trailer.assembly.ratio,'9:16');
  assert.equal(trailer.generation.filter(x=>x.type==='draft').length,2);
});
test('rejects invalid brief before generating plans',()=>{
  for(const change of [{locations:[]},{locations:['Duplicate','Duplicate']},{locations:Array(7).fill('x')},{budgetCredits:-1},{draftCandidates:0},{ratio:'3:2'},{character:{name:'x',appearance:''}},{city:'bad\u0000city'}])assert.throws(()=>plan({...copy(),...change}));
});
test('Chinese planning retains Chinese instructions and user names',()=>{
  const p=plan({...copy(),city:'雾都',language:'zh'});
  assert.ok(p.prompts.heroVideo.includes('雾都'));
  assert.ok(p.prompts.heroVideo.includes('五秒'));
});
test('untrusted names render as text, including XML-sensitive characters',async()=>{
  const g=graphics({...copy(),city:'<script>alert("city")</script>',locations:['A & B','X < Y']});
  assert.ok(!g.map.includes('<script>'));
  assert.ok(g.map.includes('A &amp; B'));
  const m=await sharp(Buffer.from(g.map)).png().toBuffer({resolveWithObject:true});
  assert.equal(m.info.width,1600);assert.equal(m.info.height,900);
});
test('portrait, six long locations and Chinese graphics remain renderable',async()=>{
  const g=graphics({...copy(),ratio:'9:16',language:'zh',city:'山城与江畔',locations:['旧码头','山城巷','高架桥','观景台','夜市','江心岛']});
  const image=await sharp(Buffer.from(g.map)).png().toBuffer({resolveWithObject:true});
  assert.equal(image.info.width,900);assert.equal(image.info.height,1600);
  assert.ok(g.hud.includes('山城与江畔'));
});
const ffmpeg=process.env.FFMPEG_BIN||'ffmpeg',ffprobe=process.env.FFPROBE_BIN||'ffprobe';
const mediaReady=!spawnSync(ffmpeg,['-version']).error&&!spawnSync(ffprobe,['-version']).error;
test('assembly encodes HUD, exact timing, portrait and refuses short inputs/overwrites',{skip:!mediaReady&&'Set FFMPEG_BIN/FFPROBE_BIN to run media integration'},async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'city-skill-test-'));
  const invoke=(manifest,out)=>spawnSync(process.execPath,[path.join(root,'scripts/assemble.mjs'),'--manifest',manifest,'--out',out],{encoding:'utf8'});
  try{
    await sharp({create:{width:640,height:360,channels:3,background:'#172b37'}}).png().toFile(path.join(dir,'city.png'));
    await sharp(Buffer.from(graphics(copy()).hud)).png().toFile(path.join(dir,'hud.png'));
    run(ffmpeg,['-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc2=s=640x360:r=24','-t','1','-c:v','libx264','-pix_fmt','yuv420p',path.join(dir,'clip.mp4')]);
    const review=spawnSync(process.execPath,[path.join(root,'scripts/review-clip.mjs'),'--video',path.join(dir,'clip.mp4'),'--out',path.join(dir,'review.png')],{encoding:'utf8'});
    assert.equal(review.status,0,review.stderr);
    const report=JSON.parse(await fs.readFile(path.join(dir,'review.json'),'utf8'));
    assert.equal(report.width,640);assert.equal(report.durationSeconds,1);assert.equal(report.sampledSeconds.length,6);assert.equal(report.audioStreams,0);
    assert.equal((await sharp(path.join(dir,'review.png')).metadata()).width,1440);
    const m={ratio:'16:9',fps:24,segments:[{kind:'image',path:'city.png',seconds:.5},{kind:'video',path:'clip.mp4',seconds:1,hud:'hud.png'}]};
    const mp=path.join(dir,'assembly.json'),out=path.join(dir,'result.mp4');
    await fs.writeFile(mp,JSON.stringify(m));
    const r=invoke(mp,out);assert.equal(r.status,0,r.stderr);
    const p=probe(out);assert.equal(p.streams[0].width,1920);assert.equal(Number(p.format.duration),1.5);
    const before=await fs.readFile(out);assert.notEqual(invoke(mp,out).status,0);assert.deepEqual(await fs.readFile(out),before);
    m.segments[1].seconds=2;await fs.writeFile(mp,JSON.stringify(m));
    assert.notEqual(invoke(mp,path.join(dir,'too-short.mp4')).status,0);
    await assert.rejects(fs.access(path.join(dir,'too-short.mp4')));
    m.ratio='9:16';m.segments=[{kind:'image',path:'city.png',seconds:.5}];await fs.writeFile(mp,JSON.stringify(m));
    const portrait=path.join(dir,'portrait.mp4'),pr=invoke(mp,portrait);assert.equal(pr.status,0,pr.stderr);
    const pv=probe(portrait).streams[0];assert.equal(pv.width,1080);assert.equal(pv.height,1920);
  }finally{await fs.rm(dir,{recursive:true,force:true});}
});
