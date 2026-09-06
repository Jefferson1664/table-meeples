
const API='https://arkhamdb.com/api/public';
const GH='https://raw.githubusercontent.com/Kamalisk/arkhamdb-json-data/master';
const MAP='https://github.com/erikoliver/arkham-lcg-tools/raw/refs/heads/master/Scenario%20Mapping.xlsx';
const campaigns=[
['The Night of the Zealot','La Nuit de la Zélatrice',[['The Gathering','torch'],['The Midnight Masks','arkham'],['The Devourer Below','tentacles']]],
['The Dunwich Legacy','L’Héritage de Dunwich',[['Extracurricular Activity','extracurricular_activity'],['The House Always Wins','the_house_always_wins'],['The Miskatonic Museum','the_miskatonic_museum'],['The Essex County Express','essex_county_express'],['Blood on the Altar','blood_on_the_altar'],['Undimensioned and Unseen','undimensioned_and_unseen'],['Where Doom Awaits','where_doom_awaits'],['Lost in Time and Space','lost_in_time_and_space']]],
['The Path to Carcosa','La Route de Carcosa',[['Curtain Call','curtain_call'],['The Last King','the_last_king'],['Echoes of the Past','echoes_of_the_past'],['The Unspeakable Oath','the_unspeakable_oath'],['A Phantom of Truth','a_phantom_of_truth'],['The Pallid Mask','the_pallid_mask'],['Black Stars Rise','black_stars_rise'],['Dim Carcosa','dim_carcosa']]],
['The Forgotten Age','L’Âge oublié',[['The Untamed Wilds','wilds'],['The Doom of Eztli','eztli'],['Threads of Fate','threads_of_fate'],['The Boundary Beyond','the_boundary_beyond'],['Heart of the Elders','heart_of_the_elders'],['The City of Archives','the_city_of_archives'],['The Depths of Yoth','the_depths_of_yoth'],['Shattered Aeons','shattered_aeons']]],
['The Circle Undone','Le Cercle brisé',[['The Witching Hour','the_witching_hour'],['At Death’s Doorstep','at_deaths_doorstep'],['The Secret Name','the_secret_name'],['The Wages of Sin','the_wages_of_sin'],['For the Greater Good','for_the_greater_good'],['Union and Disillusion','union_and_disillusion'],['In the Clutches of Chaos','in_the_clutches_of_chaos'],['Before the Black Throne','before_the_black_throne']]],
['The Dream-Eaters','Les Dévoreurs de rêves',[['Beyond the Gates of Sleep','beyond_the_gates_of_sleep'],['The Search for Kadath','the_search_for_kadath'],['A Thousand Shapes of Horror','a_thousand_shapes_of_horror'],['Dark Side of the Moon','dark_side_of_the_moon'],['Point of No Return','point_of_no_return'],['Where the Gods Dwell','where_the_gods_dwell'],['Weaver of the Cosmos','weaver_of_the_cosmos']]],
['The Innsmouth Conspiracy','La Conspiration d’Innsmouth',[['The Pit of Despair','the_pit_of_despair'],['The Vanishing of Elina Harper','the_vanishing_of_elina_harper'],['In Too Deep','in_too_deep'],['Devil Reef','devil_reef'],['Horror in High Gear','horror_in_high_gear'],['A Light in the Fog','a_light_in_the_fog'],['The Lair of Dagon','the_lair_of_dagon'],['Into the Maelstrom','into_the_maelstrom']]],
['Edge of the Earth','Aux confins de la Terre',[['Ice and Death','ice_and_death'],['The Crash','the_crash'],['To the Forbidden Peaks','to_the_forbidden_peaks'],['City of the Elder Things','city_of_the_elder_things'],['The Heart of Madness','the_heart_of_madness']]],
['The Scarlet Keys','Les Clés écarlates',[['Riddles in the Dark','riddles_in_the_dark'],['Dead Heat','dead_heat'],['Sanguine Shadows','sanguine_shadows'],['Dealings in the Dark','dealings_in_the_dark'],['Dogs of War','dogs_of_war'],['Shades of Suffering','shades_of_suffering'],['Without a Trace','without_a_trace'],['Congress of the Keys','congress_of_the_keys']]],
['The Feast of Hemlock Vale','La Fête de Hemlock Vale',[['Written in Rock','written_in_rock'],['The Silent Heath','the_silent_heath'],['Hemlock House','hemlock_house'],['The Lost Sister','the_lost_sister'],['The Thing in the Depths','the_thing_in_the_depths'],['The Twisted Hollow','the_twisted_hollow'],['The Longest Night','the_longest_night'],['Fate of the Vale','fate_of_the_vale']]],
['The Drowned City','La Cité engloutie',[['One Last Job','one_last_job'],['The Western Wall','the_western_wall'],['The Drowned Quarter','the_drowned_quarter'],['The Apiary','the_apiary'],['The Grand Vault','the_grand_vault'],['Court of the Ancients','court_of_the_ancients'],['Obsidian Canyons','obsidian_canyons'],['Sepulchre of the Sleeper','sepulchre_of_the_sleeper'],['The Doom of Arkham Part I','the_doom_of_arkham_part_i'],['The Doom of Arkham Part II','the_doom_of_arkham_part_ii']]]
];
let all=[],selected=null,mode='both',fr=new Map(),mapping=new Map(),setNames=new Map(),typeFilter='all';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]/g,'');
async function json(url,ms=20000){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{cache:'force-cache',signal:c.signal});if(!r.ok)throw Error(r.status);return await r.json()}finally{clearTimeout(t)}}
async function init(){
 try{
  // One API call for ALL encounter cards: avoids the many-pack/rate-limit problem.
  const [encounterCards,playerCards]=await Promise.all([json(API+'/cards/?encounter=1',30000),json(API+'/cards/',30000)]);
  const byCode=new Map();
  [...encounterCards,...playerCards].forEach(c=>{if(c&&c.code)byCode.set(c.code,c)});
  all=[...byCode.values()];
  if(!Array.isArray(all)||!all.length)throw Error('Aucune carte de scénario reçue');
  const ded=new Map();all.forEach(c=>{if(c&&c.code&&!ded.has(c.code))ded.set(c.code,c)});all=[...ded.values()];
  all.forEach(c=>{if(c.encounter_code&&c.encounter_name)setNames.set(c.encounter_code,c.encounter_name)});
  buildTree();bind();
  // Mapping is optional and has a hard timeout; it can NEVER block the application.
  loadMapping().catch(()=>{});
 }catch(e){
  $('tree').innerHTML='<div class="empty"><b>Impossible de charger les cartes.</b><br><br>Vérifie la connexion Internet puis recharge la page.<br><br>'+esc(e.message)+'</div>';
 }
}
async function loadMapping(){
 const c=new AbortController(),t=setTimeout(()=>c.abort(),8000);
 try{
  if(!window.XLSX)throw Error('SheetJS absent');
  const r=await fetch(MAP,{cache:'no-store',signal:c.signal});if(!r.ok)throw Error(r.status);
  const wb=XLSX.read(await r.arrayBuffer(),{type:'array'});
  const known=new Map(campaigns.flatMap(c=>c[2].map(s=>[norm(s[0]),s[0]])));
  for(const sn of wb.SheetNames){
   const rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:''});
   for(let r=0;r<rows.length;r++)for(let col=0;col<rows[r].length;col++){
    const k=norm(rows[r][col]);if(!known.has(k))continue;
    const vals=[];
    for(const v of rows[r])if(v&&norm(v)!==k)vals.push(v);
    for(let rr=0;rr<rows.length;rr++){const v=String(rows[rr]?.[col]??'').trim();if(v&&rr!==r)vals.push(v)}
    mapping.set(k,[...new Set(vals)]);
   }
  }
 }finally{clearTimeout(t)}
}
function buildTree(){
 const root=$('tree');root.innerHTML='';
 campaigns.forEach(c=>{
  const box=document.createElement('div');box.className='campaign';
  const h=document.createElement('button');h.className='campHead';h.type='button';h.setAttribute('aria-expanded','true');
  h.innerHTML='<span class="arrow">▾</span><span class="campName">'+esc(c[0])+'</span><small>'+esc(c[1])+'</small>';
  const list=document.createElement('div');list.className='scenarios';
  c[2].forEach(s=>{const b=document.createElement('button');b.className='scenario';b.type='button';b.textContent=s[0];b.onclick=()=>select(s,b,c);list.appendChild(b)});
  h.onclick=()=>{const open=!list.hidden;list.hidden=open;h.setAttribute('aria-expanded',String(!open));h.querySelector('.arrow').textContent=open?'▸':'▾'};
  box.append(h,list);root.append(box);
 });
}
function bind(){
 $('search').oninput=render;
 $('typeSelect').onchange=e=>{typeFilter=e.target.value;render()};
 $('both').onclick=()=>{mode='both';render()};
 $('hideFr').onclick=()=>{mode='en';render()};
 $('hideEn').onclick=()=>{mode='fr';render()};
 $('reset').onclick=()=>{$('search').value='';mode='both';typeFilter='all';$('typeSelect').value='all';render()};
 $('cards').addEventListener('click',e=>{
   const card=e.target.closest('.card[data-back-src]');
   if(!card)return;
   flipCard(card);
 });
 $('cards').addEventListener('keydown',e=>{
   if(e.key!=='Enter'&&e.key!==' ')return;
   const card=e.target.closest('.card[data-back-src]');
   if(!card)return;
   e.preventDefault();
   flipCard(card);
 });
}
function flipCard(card){
 const img=card.querySelector('img');
 if(!img)return;
 const flipped=card.dataset.side==='back';
 card.dataset.side=flipped?'front':'back';
 const src=flipped?card.dataset.frontSrc:card.dataset.backSrc;
 img.onerror=()=>{
   const fallback=flipped?card.dataset.frontFallback:card.dataset.backFallback;
   if(fallback&&img.src!==fallback){img.onerror=null;img.src=fallback;}
 };
 img.src=src;
 img.alt=flipped?card.dataset.frontName:card.dataset.backName;
 const name=card.querySelector('.meta b');
 if(name)name.textContent=flipped?card.dataset.frontName:card.dataset.backName;
 card.classList.toggle('isBack',!flipped);
}
function select(s,b,c){document.querySelectorAll('.scenario').forEach(x=>x.classList.remove('active'));b.classList.add('active');selected={name:s[0],code:s[1],campaign:c[0]};render()}
function codesForScenario(){
 if(!selected)return[];
 const vals=mapping.get(norm(selected.name))||[];
 const lookup=new Map();
 all.forEach(c=>{if(c.encounter_code){lookup.set(norm(c.encounter_code),c.encounter_code);if(c.encounter_name)lookup.set(norm(c.encounter_name),c.encounter_code)}});
 const out=[];
 if(selected.code)out.push(selected.code);
 vals.forEach(v=>{const x=lookup.get(norm(v));if(x&&!out.includes(x))out.push(x)});
 return out;
}
function encounterMatches(c,codes){
 const ec=c.encounter_code||'';
 const en=c.encounter_name||'';
 return codes.includes(ec)||codes.some(x=>norm(x)===norm(en));
}
function packCodesForScenario(codes){
 const out=new Set();
 all.forEach(c=>{if(encounterMatches(c,codes)&&c.pack_code)out.add(c.pack_code)});
 return [...out];
}
function cardMatchesType(c){
 if(typeFilter==='all')return true;
 if(typeFilter==='story'){
   const sub=String(c.subtype_code||c.subtype||'').toLowerCase();
   const tags=String(c.tags||'').toLowerCase();
   return (c.type_code==='asset'&&(sub.includes('story')||tags.includes('story'))) || c.type_code==='story';
 }
 return c.type_code===typeFilter;
}
async function loadFrench(cards){
 const packs=[...new Set(cards.map(c=>c.pack_code).filter(Boolean))];
 await Promise.all(packs.map(async p=>{
  if([...fr.values()].some(x=>x.pack_code===p))return;
  const base=GH+'/translations/fr/pack/'+encodeURIComponent(p)+'/'+encodeURIComponent(p);
  try{
   const [a,b]=await Promise.all([
    json(base+'.json',15000).catch(()=>null),
    json(base+'_encounter.json',15000).catch(()=>null)
   ]);
   ;[a,b].forEach(d=>{if(Array.isArray(d))d.forEach(x=>fr.set(x.code,x))});
  }catch(e){}
 }));
}
async function render(){
 if(!selected)return;
 const q=norm($('search').value),codes=codesForScenario();
 if($('typeSelect')) $('typeSelect').value=typeFilter;
 $('welcome').style.display='none';
 const packs=packCodesForScenario(codes);
 let cards=all.filter(c=>!c.hidden&&(encounterMatches(c,codes)||packs.includes(c.pack_code)));
 $('cards').innerHTML='<div class="scenarioHead"><div><div class="eyebrow">'+esc(selected.campaign)+'</div><h2>'+esc(selected.name)+'</h2><div class="sub">'+packs.length+' pack'+(packs.length>1?'s':'')+' · chargement des traductions françaises…</div></div><div class="count">'+cards.length+' cartes</div></div><div class="empty">Chargement…</div>';
 await loadFrench(cards);
 cards=cards.filter(c=>cardMatchesType(c)&&(!q||norm([c.name,c.text,c.encounter_name,c.code,c.pack_code,fr.get(c.code)?.name,fr.get(c.code)?.text].join(' ')).includes(q)));
 const groups=[];
 const used=new Set();
 codes.forEach(code=>{
   const cs=cards.filter(c=>encounterMatches(c,[code])).sort((a,b)=>(a.position||0)-(b.position||0));
   if(cs.length){groups.push({code,name:setNames.get(code)||cs[0].encounter_name||code,cards:cs});cs.forEach(c=>used.add(c.code));}
 });
 const player=cards.filter(c=>!used.has(c.code)&&packs.includes(c.pack_code));
 if(player.length){
   const byPack=new Map();
   player.forEach(c=>{const k=c.pack_code||'pack';if(!byPack.has(k))byPack.set(k,[]);byPack.get(k).push(c)});
   byPack.forEach((cs,p)=>groups.push({code:'pack:'+p,name:(cs[0].pack_name||p)+' · cartes du pack',cards:cs.sort((a,b)=>(a.position||0)-(b.position||0))}));
 }
 $('cards').innerHTML='<div class="scenarioHead"><div><div class="eyebrow">'+esc(selected.campaign)+'</div><h2>'+esc(selected.name)+'</h2><div class="sub">'+groups.length+' groupes · cartes du scénario et cartes du pack correspondant</div></div><div class="count">'+cards.length+' cartes</div></div>'+groups.map(g=>'<div class="set"><div class="setHead"><h3>'+esc(g.name)+'</h3><span>'+g.cards.length+'</span></div><div class="paired">'+g.cards.map(pair).join('')+'</div></div>').join('')+(groups.length?'':'<div class="empty">Aucune carte trouvée pour ce scénario.</div>')+'<details class="diag"><summary>Diagnostic</summary><p>Encounter codes : <code>'+esc(codes.join(', '))+'</code></p><p>Packs du scénario : <code>'+esc(packs.join(', '))+'</code></p><p>Cartes chargées : '+all.length+'</p><p>Cartes retenues : '+cards.length+'</p><p>Mapping scénario chargé : '+(mapping.has(norm(selected.name))?'oui':'non')+'</p></details>';
}
function frenchImageUrl(code){
  return 'https://assets.arkhamhorror.app/img/arkham/fr/cards/'+String(code)+'.avif?v=1.6.9';
}
function imageUrl(v){
  const u=v||'';
  return u?(u.startsWith('//')?'https:'+u:u.startsWith('/')?'https://arkhamdb.com'+u:u):'';
}
function backCardFor(c){
 const byCode=new Map(all.map(x=>[x.code,x]));
 const explicit=c.back_link?byCode.get(c.back_link):null;
 if(explicit)return explicit;
 return null;
}
function englishBackImageUrl(code){
 return code?'https://arkhamdb.com/bundles/cards/'+encodeURIComponent(String(code))+'b.png':'';
}
function frenchBackImageUrl(code){
 return code?'https://assets.arkhamhorror.app/img/arkham/fr/cards/'+encodeURIComponent(String(code))+'b.avif?v=1.6.9':'';
}
function pair(c){
 const f=fr.get(c.code);
 const back=backCardFor(c);
 const doubleSided=!!c.double_sided || !!back;
 /* ArkhamDB's imagesrc_front is the canonical front image when available.
    Do not special-case Location cards: their front/back ordering follows the same rule. */
 const enImg=imageUrl(c.imagesrc_front||c.imagesrc||c.image_url||'');
 const backEn=doubleSided?(englishBackImageUrl(c.code)||(imageUrl(c.backimagesrc||c.back_image||back?.imagesrc_front||back?.imagesrc||back?.image_url||''))):'';
 const fi=frenchImageUrl(c.code);
 const baseCode=String(c.code||'').replace(/b$/i,'');
 const backFr=doubleSided?frenchBackImageUrl(baseCode):'';
 const frBackName=f?.back_name||f?.backName||back?.name||c.back_name||f?.name||c.name;
 return '<article class="pair '+mode+'">'+
   '<div class="side en">'+(mode!=='fr'?face(enImg,c.name,'English',c.code,c,backEn,frBackName,enImg,''):'')+'</div>'+
   '<div class="side fr">'+(mode!=='en'?face(fi,f?.name||c.name,'Français',c.code,c,backFr,frBackName,fi,''):'')+'</div>'+
   '</article>';
}
function cardTypeLabel(c){const m={asset:'Soutien',event:'Événement',skill:'Compétence',enemy:'Ennemi',treachery:'Traîtrise',location:'Lieu',act:'Acte',agenda:'Intrigue',scenario:'Scénario',story:'Histoire',investigator:'Investigateur',weakness:'Faiblesse'};return m[c?.type_code]||c?.type_code||''}
function face(src,name,label,code,c,backSrc,backName,frontFallback,backFallback){
 const flip=!!backSrc&&backSrc!==src;
 const rv=flip?'<span class="rvBadge" aria-hidden="true">↻ RV</span>':'';
 return '<div class="lang">'+esc(label)+rv+'</div>'+
   '<div class="card'+(flip?' flippable':'')+'"'+(flip?' data-back-src="'+esc(backSrc)+'" data-front-src="'+esc(src)+'" data-front-fallback="'+esc(frontFallback||src)+'" data-back-fallback="'+esc(backFallback||'')+'" data-side="front" data-front-name="'+esc(name)+'" data-back-name="'+esc(backName||name)+'" role="button" tabindex="0" aria-label="'+esc(name)+' — appuyer pour retourner la carte"':'')+'>'+
   '<img loading="lazy" referrerpolicy="no-referrer" src="'+esc(src)+'" alt="'+esc(name)+'">'+
   '<div class="typeTag">'+esc(cardTypeLabel(c))+'</div>'+
   '<div class="qtyTag">'+esc((Number(c?.quantity)||1)===1?'1 exemplaire':'× '+(Number(c?.quantity)||1)+' exemplaires')+' dans le paquet</div>'+
   '<div class="meta"><b>'+esc(name)+'</b><span>'+esc(code)+'</span></div>'+ 
   '</div>';
}

init();
