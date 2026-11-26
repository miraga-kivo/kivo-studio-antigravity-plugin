import fs from 'node:fs/promises';
import path from 'node:path';
import { args, check, readJson } from './lib.mjs';
const a=args();
try {
  check(a.prepared&&a.file,'Usage: node scripts/upload-s3.mjs --prepared private/upload.json --file work/map.png');
  const p=await readJson(a.prepared), s=await fs.stat(a.file);
  check(s.isFile()&&s.size===p.byteSize,'File size differs from assets.prepare; prepare with the actual stat byte size');
  check(s.size<=200_000_000,'File exceeds helper size limit');
  const u=new URL(p.upload?.url);
  check(u.protocol==='https:'&&!u.username&&!u.password&&/(^|\.)s3[.-][a-z0-9-]+\.amazonaws\.com$|(^|\.)s3\.amazonaws\.com$/.test(u.hostname),'Expected an HTTPS AWS S3 upload endpoint');
  const form=new FormData();
  for(const [k,v] of Object.entries(p.upload.fields)) form.append(k,String(v));
  form.append('file',new Blob([await fs.readFile(a.file)],{type:p.contentType}),path.basename(a.file));
  const response=await fetch(u,{method:'POST',body:form,redirect:'error',signal:AbortSignal.timeout(120000)});
  check(response.ok,`S3 upload failed (${response.status}); request a fresh prepared upload if expired`);
  console.log(JSON.stringify({assetId:p.id,uploaded:true,next:'Call kivo_assets_complete with this assetId, then poll assets.list until ready'}));
} catch(e) { console.error(e.message);process.exitCode=1; }
