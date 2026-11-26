import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { args, brief, readJson } from './lib.mjs';
export function plan(input) {
  const b = brief(input), zh = b.language === 'zh';
  const setting = `${b.city}; ${b.locations.join(', ')}. ${b.look}`;
  const prompts = {
    city: `Create an ORIGINAL open-world video-game environment concept for ${setting}. Wide elevated oblique establishing view, clear ${b.geography} geography, coherent streets and a visible waterfront or river only when appropriate. Keep the named districts in a single believable city. Use the supplied concept map for relative composition when attached, not as exact geographic data. No franchise logos, no copied game screenshots, no HUD, no text, no people in the foreground. ${b.ratio} composition.`,
    character: `Create one full-body, three-quarter REAR VIEW reference of ${b.character.name}, an original adult game character: ${b.character.appearance}. Place the character at ${b.locations[0]} in ${setting}. High-end rendered game frame, consistent grounded scale. If a city image is supplied, preserve its architecture, lighting and terrain. Show the full outfit and bag clearly. A single character, no pose sheet or split panels, no UI or text. ${b.ratio} composition.`,
    heroVideo: `A single continuous five-second third-person open-world GAME CINEMATIC in ${b.city}, at ${b.locations[0]}. Preserve the supplied character reference: ${b.character.appearance}. The character walks two calm steps forward along the street or promenade; a smooth over-the-shoulder camera follows behind at a fixed distance, then settles. Keep the city reference architecture and palette coherent: ${b.look}. Believable rendered game lighting and materials. No cuts, no new people, no costume change, no text or HUD. This is an original cinematic concept, not captured gameplay.`,
    cityVideo: `A single continuous four-second aerial establishing GAME CINEMATIC of ${setting}. Slowly glide toward ${b.locations[0]}, keeping water, street grid and distant skyline fixed relative to each other as in the city reference image. Original architecture and vehicles. No people close to camera, no UI, no text, no jump cuts.`,
  };
  if(zh) Object.assign(prompts, {
    city:`为${setting}设计原创开放世界游戏城市概念图。采用宽阔的斜俯视建立镜头，地理类型为${({coastal:'沿海',river:'河流穿城',inland:'内陆'})[b.geography]}，街区与地形连贯。若附有概念地图，只参考相对布局，不将其当作真实地理数据。各地点属于同一座可信的城市。不使用现有游戏截图、标志、文字或界面，前景无人。画幅${b.ratio}。`,
    character:`制作${b.character.name}的单人全身、后侧四分之三视角角色参考图。原创成年游戏角色外观：${b.character.appearance}。地点为${b.city}的${b.locations[0]}。视觉风格：${b.look}。若附城市参考图，保持其中建筑、地形、光线与比例；清楚显示服装和随身物品。只出一个角色，不做多视图拼版，不添加文字或界面。画幅${b.ratio}。`,
    heroVideo:`五秒单镜头的原创开放世界游戏过场，地点为${b.city}的${b.locations[0]}。严格保持角色参考图中的外观：${b.character.appearance}。角色自然向前走两步，第三人称越肩摄影机保持距离平稳跟随，然后停稳。保持城市参考图的建筑、色调与光线：${b.look}。呈现可信的游戏渲染材质与空间尺度。不切镜，不增加人物，不换装，不添加文字或界面。这是原创概念影像，不是真实游戏录屏。`,
    cityVideo:`四秒单镜头的原创游戏城市航拍建立镜头：${setting}。缓慢向${b.locations[0]}滑行，保持参考图中地形、街区和远景天际线的相对关系。建筑和车辆采用原创设计。无近景人物，不添加界面或文字，不跳切。`,
  });
  const segments = b.template === 'character-intro'
    ? [{ kind:'image', path:'map.png', seconds:2.5 }, { kind:'image', path:'city.png', seconds:3 }, { kind:'video', path:'hero-selected.mp4', seconds:5, hud:'hud.png', hudPosition:'bottom-right' }, { kind:'image', path:'endcard.png', seconds:1.5 }]
    : [{ kind:'image', path:'map.png', seconds:2 }, { kind:'video', path:'city-selected.mp4', seconds:4 }, { kind:'video', path:'hero-selected.mp4', seconds:5, hud:'hud.png', hudPosition:'bottom-right' }, { kind:'image', path:'endcard.png', seconds:4 }];
  return {
    version:1, title:b.city, brief:b, mapKind:'fictional-concept',
    objective: zh ? '原创开放世界城市与角色短片' : 'Original open-world city and character cinematic',
    durationSeconds:segments.reduce((s,x)=>s+x.seconds,0),
    billing:{ mode:'live-mcp-quotes', budgetCredits:b.budgetCredits, consentRequired:true },
    generation:[{ key:'city', type:'image', count:1 },{ key:'character', type:'image', count:1 },
      ...(b.template === 'city-trailer' ? [{ key:'cityVideo', type:'draft', duration:4, count:b.draftCandidates, references:['city'] }] : []),
      { key:'heroVideo', type:'draft', duration:5, count:b.draftCandidates, references:['city','character'] }],
    prompts, assembly:{ version:1, ratio:b.ratio, fps:24, segments },
  };
}
async function main() {
  const a = args();
  if (!a.brief || !a.out) throw Error('Usage: node scripts/plan.mjs --brief examples/neon-harbor.json --out work/neon-harbor');
  const p = plan(await readJson(a.brief));
  await fs.mkdir(a.out, { recursive:true });
  for(const name of ['plan.json','assembly.json','city-bible.md']) {
    const file=path.join(a.out,name);
    try {await fs.access(file);} catch(e) {if(e.code==='ENOENT') continue; throw e;}
    throw Error(`Refusing to overwrite ${file}; use a new output directory`);
  }
  await fs.writeFile(path.join(a.out,'plan.json'),JSON.stringify(p,null,2)+'\n',{flag:'wx'});
  await fs.writeFile(path.join(a.out,'assembly.json'),JSON.stringify(p.assembly,null,2)+'\n',{flag:'wx'});
  await fs.writeFile(path.join(a.out,'city-bible.md'),`# ${p.brief.city}\n\nMap: fictional concept; ${p.brief.geography}.\n\nLocations, in route order: ${p.brief.locations.join(' → ')}.\n\nLook: ${p.brief.look}\n\nCharacter ${p.brief.character.name}: ${p.brief.character.appearance}\n\nContinuity: preserve this outfit, district order, time of day and palette across all shots.\n`,{flag:'wx'});
  console.log(JSON.stringify({ directory:path.resolve(a.out), template:p.brief.template, durationSeconds:p.durationSeconds, budgetCredits:p.brief.budgetCredits, paidRequestsSubmitted:0 }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(e=>{console.error(e.message);process.exitCode=1;});
