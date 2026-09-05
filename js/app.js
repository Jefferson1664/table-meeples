const GH='https://raw.githubusercontent.com/Kamalisk/arkhamdb-json-data/master';
const CYCLES=['core','dwl','ptc','tfa','tcu','tde','tic','eoe','tsk','fhv','tdc','core_ch2'];
let all=[], selectedScenario=null, langMode='both', frMap=new Map(), scenarioSets=new Map(), setNames=new Map();
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=v=>String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
async function get(url){const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw Error(`${r.status} ${url}`);return r.json()}
const campaigns=[
{name:'The Night of the Zealot',fr:'La Nuit de la Zélatrice',scenarios:[['The Gathering','torch'],['The Midnight Masks','arkham'],['The Devourer Below','tentacles']]},
{name:'The Dunwich Legacy',fr:'L’Héritage de Dunwich',scenarios:[['Extracurricular Activity','extracurricular_activity'],['The House Always Wins','the_house_always_wins'],['The Miskatonic Museum','the_miskatonic_museum'],['The Essex County Express','essex_county_express'],['Blood on the Altar','blood_on_the_altar'],['Undimensioned and Unseen','undimensioned_and_unseen'],['Where Doom Awaits','where_doom_awaits'],['Lost in Time and Space','lost_in_time_and_space']]},
{name:'The Path to Carcosa',fr:'La Route de Carcosa',scenarios:[['Curtain Call','curtain_call'],['The Last King','the_last_king'],['Echoes of the Past','echoes_of_the_past'],['The Unspeakable Oath','the_unspeakable_oath'],['A Phantom of Truth','a_phantom_of_truth'],['The Pallid Mask','the_pallid_mask'],['Black Stars Rise','black_stars_rise'],['Dim Carcosa','dim_carcosa']]},
{name:'The Forgotten Age',fr:'L’Âge oublié',scenarios:[['The Untamed Wilds','wilds'],['The Doom of Eztli','eztli'],['Threads of Fate','threads_of_fate'],['The Boundary Beyond','the_boundary_beyond'],['Heart of the Elders','heart_of_the_elders'],['The City of Archives','the_city_of_archives'],['The Depths of Yoth','the_depths_of_yoth'],['Shattered Aeons','shattered_aeons']]},
{name:'The Circle Undone',fr:'Le Cercle brisé',scenarios:[['The Witching Hour','the_witching_hour'],['At Death’s Doorstep','at_deaths_doorstep'],['The Secret Name','the_secret_name'],['The Wages of Sin','the_wages_of_sin'],['For the Greater Good','for_the_greater_good'],['Union and Disillusion','union_and_disillusion'],['In the Clutches of Chaos','in_the_clutches_of_chaos'],['Before the Black Throne','before_the_black_throne']]},
{name:'The Dream-Eaters',fr:'Les Dévoreurs de rêves',scenarios:[['Beyond the Gates of Sleep','beyond_the_gates_of_sleep'],['The Search for Kadath','the_search_for_kadath'],['A Thousand Shapes of Horror','a_thousand_shapes_of_horror'],['Dark Side of the Moon','dark_side_of_the_moon'],['Point of No Return','point_of_no_return'],['Where the Gods Dwell','where_the_gods_dwell'],['Weaver of the Cosmos','weaver_of_the_cosmos']]},
{name:'The Innsmouth Conspiracy',fr:'La Conspiration d’Innsmouth',scenarios:[['The Pit of Despair','the_pit_of_despair'],['The Vanishing of Elina Harper','the_vanishing_of_elina_harper'],['In Too Deep','in_too_deep'],['Devil Reef','devil_reef'],['Horror in High Gear','horror_in_high_gear'],['A Light in the Fog','a_light_in_the_fog'],['The Lair of Dagon','the_lair_of_dagon'],['Into the Maelstrom','into_the_maelstrom']]},
{name:'Edge of the Earth',fr:'Aux confins de la Terre',scenarios:[['Ice and Death','ice_and_death'],['The Crash','the_crash'],['To the Forbidden Peaks','to_the_forbidden_peaks'],['City of the Elder Things','city_of_the_elder_things'],['The Heart of Madness','the_heart_of_madness']]},
{name:'The Scarlet Keys',fr:'Les Clés écarlates',scenarios:[['Riddles in the Dark','riddles_in_the_dark'],['Dead Heat','dead_heat'],['Sanguine Shadows','sanguine_shadows'],['Dealings in the Dark','dealings_in_the_dark'],['Dogs of War','dogs_of_war'],['Shades of Suffering','shades_of_suffering'],['Without a Trace','without_a_trace'],['Congress of the Keys','congress_of_the_keys']]},
{name:'The Feast of Hemlock Vale',fr:'La Fête de Hemlock Vale',scenarios:[['Written in Rock','written_in_rock'],['The Silent Heath','the_silent_heath'],['Hemlock House','hemlock_house'],['The Lost Sister','the_lost_sister'],['The Longest Night','the_longest_night'],['The Thing in the Woods','the_thing_in_the_woods'],['The Dying Light','the_dying_light']]},
{name:'The Drowned City',fr:'La Cité engloutie',scenarios:[['Dead Heat','dead_heat_tdc'],['The Apiary','the_apiary'],['The Grand Voyage','the_grand_voyage'],['The Tides of Fate','the_tides_of_fate'],['The Devil in the Flesh','the_devil_in_the_flesh'],['The Ennui','the_ennui'],['The Obsidian Gates','the_obsidian_gates'],['The Depths of Yoth','the_depths_of_yoth_tdc']]}
];

async function init(){
 $('tree').innerHTML='<div class="empty">Chargement des données de cartes…</div>';
 try{
   await loadCardsFromRepository();
   indexSetNames();
   buildTree(); bindGlobal();
   if(!all.length) throw Error('Aucune carte de scénario n’a été chargée.');
 }catch(e){console.error(e);$('tree').innerHTML=`<div class="empty error"><b>Impossible de charger les données</b><br><br>${esc(e.message)}<br><br>Recharge la page. Le site utilise les données publiques du dépôt ArkhamDB.</div>`}
}

async function loadCardsFromRepository(){
 const packs=await get(`${GH}/packs.json`);
 const wanted=packs.filter(p=>CYCLES.includes(p.cycle_code)&&p.code);
 const chunks=await Promise.all(wanted.map(async p=>{
   const url=`${GH}/pack/${encodeURIComponent(p.code)}/${encodeURIComponent(p.code)}_encounter.json`;
   try{const data=await get(url);return Array.isArray(data)?data:[]}catch(e){return []}
 }));
 all=chunks.flat();
 // Deduplicate by card code while keeping the first complete record.
 const byCode=new Map(); for(const c of all){if(c&&c.code&&!byCode.has(c.code))byCode.set(c.code,c)} all=[...byCode.values()];
}

function indexSetNames(){for(const c of all){if(c.encounter_code&&c.encounter_name)setNames.set(c.encounter_code,c.encounter_name)}}
function buildTree(){
 const root=$('tree');root.innerHTML='';
 campaigns.forEach(c=>{
   const box=document.createElement('div');box.className='campaign';
   const head=document.createElement('button');head.className='campHead';head.type='button';head.setAttribute('aria-expanded','true');
   head.innerHTML=`<span class="arrow">▾</span><span class="campName">${esc(c.name)}</span><small>${esc(c.fr)}</small>`;
   const list=document.createElement('div');list.className='scenarios';
   c.scenarios.forEach(s=>{const b=document.createElement('button');b.className='scenario';b.type='button';b.innerHTML=`<span>${esc(s[0])}</span>`;b.onclick=()=>selectScenario(s,b,c);list.appendChild(b)});
   head.onclick=()=>{const open=!list.hidden;list.hidden=open;head.setAttribute('aria-expanded',String(!open));head.querySelector('.arrow').textContent=open?'▸':'▾';};
   box.append(head,list);root.appendChild(box);
 });
}
function selectScenario(s,el,c){document.querySelectorAll('.scenario').forEach(x=>x.classList.remove('active'));el.classList.add('active');selectedScenario={name:s[0],code:s[1],campaign:c.name};renderScenario()}
function bindGlobal(){$('search').addEventListener('input',renderScenario);$('hideFr').onclick=()=>{langMode='en';renderScenario()};$('hideEn').onclick=()=>{langMode='fr';renderScenario()};$('both').onclick=()=>{langMode='both';renderScenario()};$('reset').onclick=()=>{$('search').value='';langMode='both';renderScenario()}}

function getScenarioSetCodes(){
 const s=selectedScenario;
 const codes=[];
 const lookup=new Map();
 for(const c of all){
   if(c.encounter_code){
     lookup.set(norm(c.encounter_code),c.encounter_code);
     if(c.encounter_name)lookup.set(norm(c.encounter_name),c.encounter_code);
   }
 }
 // Prefer an exact encounter code, then the encounter set whose name is the scenario name.
 const direct=lookup.get(norm(s.code));
 const byName=lookup.get(norm(s.name));
 if(direct) codes.push(direct);
 if(byName && !codes.includes(byName)) codes.push(byName);
 // Also accept a normalized partial match for scenario encounter names.
 if(!codes.length){
   const target=norm(s.name);
   for(const [k,v] of lookup){
     if(k && (k.includes(target)||target.includes(k)) && !codes.includes(v)){codes.push(v);break;}
   }
 }
 return codes;
}

async function loadFrenchFor(cards){
 const packs=[...new Set(cards.map(c=>String(c.pack_code||'').toLowerCase()).filter(Boolean))];
 await Promise.all(packs.map(async pack=>{const url=`${GH}/translations/fr/pack/${encodeURIComponent(pack)}/${encodeURIComponent(pack)}_encounter.json`;try{const data=await get(url);if(Array.isArray(data))data.forEach(x=>frMap.set(x.code,x))}catch(e){}}));
}
async function renderScenario(){
 if(!selectedScenario)return;
 const q=norm($('search').value);const codes=getScenarioSetCodes();let cards=all.filter(c=>codes.includes(c.encounter_code));
 $('welcome').style.display='none';
 $('cards').innerHTML=`<div class="scenarioHead"><div><div class="eyebrow">${esc(selectedScenario.campaign)}</div><h2>${esc(selectedScenario.name)}</h2><div class="sub">${codes.length} encounter sets · recherche en cours…</div></div><div class="count">${cards.length} cartes</div></div><div class="empty">Chargement des traductions…</div>`;
 await loadFrenchFor(cards);
 cards=cards.filter(c=>!q||norm(`${c.name} ${c.text||''} ${c.encounter_name||''} ${frMap.get(c.code)?.name||''} ${frMap.get(c.code)?.text||''} ${c.code}`).includes(q));
 const groups=[];for(const code of codes){const gc=cards.filter(c=>c.encounter_code===code);if(gc.length)groups.push({code,name:setNames.get(code)||gc[0].encounter_name||code,cards:gc.sort((a,b)=>(a.position||0)-(b.position||0))});}
 const missing=codes.filter(code=>!groups.some(g=>g.code===code));
 $('cards').innerHTML=`<div class="scenarioHead"><div><div class="eyebrow">${esc(selectedScenario.campaign)}</div><h2>${esc(selectedScenario.name)}</h2><div class="sub">${groups.length} encounter sets · toutes les cartes de ces sets</div></div><div class="count">${cards.length} cartes</div></div>${missing.length?`<div class="warning">Sets demandés mais absents des données chargées : ${missing.map(x=>esc(setNames.get(x)||x)).join(', ')}</div>`:''}${groups.map(g=>`<div class="set"><div class="setHead"><h3>${esc(g.name)}</h3><span>${g.cards.length}</span></div><div class="paired">${g.cards.map(pair).join('')}</div></div>`).join('')||'<div class="empty">Aucune carte trouvée. Ouvre le diagnostic ci-dessous pour voir les codes recherchés.</div>'}<details class="diag"><summary>Diagnostic</summary><p>Encounter codes recherchés : <code>${esc(codes.join(', '))}</code></p><p>Cartes de scénario chargées : ${all.length}</p><p>Cartes correspondant aux sets : ${cards.length}</p><p>Sets trouvés : ${groups.length}</p></details>`;
}
function pair(c){
 const ei=englishImageUrl(c.code);
 const fi=frenchImageUrl(c.code);
 return `<article class="pair ${langMode}">
   <div class="side en">${langMode!=='fr'?cardFace(c,ei,'English',false):''}</div>
   <div class="side fr">${langMode!=='en'?cardFace(c,fi,'Français',true):''}</div>
 </article>`;
}

function cardFace(c,src,label,isFrench){
 const missing=isFrench?'Image française indisponible':'Image anglaise indisponible';
 const code=esc(c?.code||'');
 const name=esc(c?.name||'');
 const safeSrc=esc(src||'');
 return `<div class="lang">${label}</div><div class="card">
   ${src?`<img class="cardImg" loading="lazy" src="${safeSrc}" alt="${name}" data-code="${code}" data-lang="${isFrench?'fr':'en'}" onerror="retryImage(this)">`:`<div class="noimg">${missing}</div>`}
   <div class="noimg imgError" style="display:none">${missing}</div>
   <div class="meta"><b>${name}</b><span>${code}</span></div>
 </div>`;
}

function englishImageUrl(code){
 const n=String(code||'').trim();
 return n ? `https://arkhamdb.com/bundles/cards/${n}.png` : '';
}

function frenchImageUrl(code){
 const n=String(code||'').trim();
 return n ? `https://assets.arkhamhorror.app/img/arkham/fr/cards/${n}.avif` : '';
}

function retryImage(img){
 const lang=img.dataset.lang;
 const code=img.dataset.code;
 const attempts=lang==='fr'
   ? [
       `https://assets.arkhamhorror.app/img/arkham/fr/cards/${code}.avif`,
       `https://assets.arkhamhorror.app/img/arkham/fr/cards/${code}.webp`,
       `https://assets.arkhamhorror.app/img/arkham/fr/cards/${code}.png`
     ]
   : [
       `https://arkhamdb.com/bundles/cards/${code}.png`,
       `https://arkhamdb.com/bundles/cards/${code}.jpg`
     ];
 const i=Number(img.dataset.attempt||0)+1;
 if(i<attempts.length){img.dataset.attempt=String(i);img.src=attempts[i];return;}
 img.style.display='none';
 const err=img.parentElement.querySelector('.imgError');
 if(err)err.style.display='block';
}
