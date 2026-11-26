import { run } from './lib.mjs';
const checks=[];
const [major,minor]=process.versions.node.split('.').map(Number);
checks.push({name:'Node.js ≥22.12',ok:major>22||(major===22&&minor>=12)});
try{await import('sharp');checks.push({name:'Sharp SVG/PNG renderer',ok:true});}catch{checks.push({name:'Sharp SVG/PNG renderer',ok:false,fix:'Run npm ci in this skill folder'});}
for(const [name,bin]of [['FFmpeg',process.env.FFMPEG_BIN||'ffmpeg'],['FFprobe',process.env.FFPROBE_BIN||'ffprobe']]){
 try{const version=run(bin,['-version']).split('\n')[0];checks.push({name,ok:true,version});}catch(e){checks.push({name,ok:false,fix:e.message});}
}
try{const encoders=run(process.env.FFMPEG_BIN||'ffmpeg',['-hide_banner','-encoders']);checks.push({name:'H.264 encoder (libx264)',ok:/\blibx264\b/.test(encoders),fix:'Use an FFmpeg build with libx264 enabled'});}catch(e){checks.push({name:'H.264 encoder (libx264)',ok:false,fix:e.message});}
console.log(JSON.stringify({localChecks:checks,mcp:'Connect https://kivst.com/mcp in your agent, authorize in the browser, then call catalog.get and projects.list to verify the connected account. Local checks do not verify OAuth.'},null,2));
if(checks.some(c=>!c.ok))process.exitCode=1;
