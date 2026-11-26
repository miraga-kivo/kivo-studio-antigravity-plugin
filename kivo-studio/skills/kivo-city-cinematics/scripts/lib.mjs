import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
export function args(argv = process.argv.slice(2)) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--') || !argv[i + 1] || argv[i + 1].startsWith('--')) throw Error(`Expected --option value: ${argv[i]}`);
    const key = argv[i++].slice(2);
    if (key in out) throw Error(`Duplicate option: ${key}`);
    out[key] = argv[i];
  }
  return out;
}
export function check(condition, message) { if (!condition) throw Error(message); }
export function xml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[c])); }
export function brief(value) {
  check(value && typeof value === 'object', 'Brief must be a JSON object');
  const text = (v, label, max = 3000) => { check(typeof v === 'string' && v.trim() && v.length <= max && !/[\x00-\x08\x0b-\x1f]/.test(v), `Invalid ${label}`); return v.trim(); };
  const b = { ...value };
  b.city = text(b.city, 'city', 80);
  check(Array.isArray(b.locations) && b.locations.length >= 1 && b.locations.length <= 6, 'Provide 1–6 locations');
  b.locations = b.locations.map(l => text(l, 'location', 60));
  check(new Set(b.locations).size === b.locations.length, 'Location names must be distinct');
  check(b.character && typeof b.character === 'object', 'Provide a character name and appearance');
  b.character = { name: text(b.character.name, 'character name', 80), appearance: text(b.character.appearance, 'character appearance') };
  b.geography ||= 'coastal'; check(['coastal','river','inland'].includes(b.geography), 'geography: coastal, river or inland');
  b.look = text(b.look, 'look');
  b.template ||= 'character-intro'; check(['character-intro','city-trailer'].includes(b.template), 'template: character-intro or city-trailer');
  b.ratio ||= '16:9'; check(['16:9','9:16'].includes(b.ratio), 'The local renderer supports 16:9 or 9:16');
  b.language ||= 'en'; check(['en','zh'].includes(b.language), 'Renderer labels support en or zh; retain other languages in creative prompts and supply translated graphic labels');
  b.draftCandidates ??= 2; check(Number.isInteger(b.draftCandidates) && b.draftCandidates >= 1 && b.draftCandidates <= 10, 'draftCandidates must be 1–10, then verify the live model limits');
  b.budgetCredits ??= 500; check(Number.isSafeInteger(b.budgetCredits) && b.budgetCredits > 0, 'budgetCredits must be a positive integer');
  b.finalResolution ||= '1080p'; check(['1080p','4K'].includes(b.finalResolution), 'finalResolution: 1080p or 4K, subject to the live catalog');
  return b;
}
export const dimensions = ratio => ratio === '9:16' ? [1080,1920] : [1920,1080];
export async function readJson(file) { return JSON.parse(await fs.readFile(file, 'utf8')); }
export function run(bin, argv) {
  const r = spawnSync(bin, argv, { encoding:'utf8', maxBuffer:8*1024*1024 });
  if (r.error) throw Error(`Cannot run ${bin}. Install FFmpeg/FFprobe or set FFMPEG_BIN / FFPROBE_BIN. ${r.error.message}`);
  if (r.status !== 0) throw Error(`${path.basename(bin)} failed (${r.status}): ${(r.stderr || r.stdout).slice(-5000)}`);
  return r.stdout;
}
export function probe(file) { return JSON.parse(run(process.env.FFPROBE_BIN || 'ffprobe', ['-v','error','-show_format','-show_streams','-of','json',file])); }
export async function png(svg, output) {
  const { default: sharp } = await import('sharp');
  await sharp(Buffer.from(svg), { limitInputPixels:40e6 }).png().toFile(output);
}
