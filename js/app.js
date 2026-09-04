const API='https://arkhamdb.com/api/public';
const FR='https://fr.arkhamdb.com/api/public';
const DATA='https://raw.githubusercontent.com/Kamalisk/arkhamdb-json-data/master/encounters.json';
let all=[], selectedScenario=null, selectedSets=new Set(), langMode='both';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

// Scenario encounter-set mapping. The first set is always the scenario's own set.
// Additional thematic sets are included where they are stable/known; the UI also
// allows browsing the complete pack when no mapping exists.
const campaigns=[
{name:'The Night of the Zealot',fr:'La Nuit de la Zélatrice',scenarios:[
['The Gathering','torch',['torch','rats','ghouls','striking_fear','ancient_evils','chilling_cold']],
['The Midnight Masks','arkham',['arkham','rats','ghouls','striking_fear','ancient_evils','chilling_cold']],
['The Devourer Below','tentacles',['tentacles','cultists','rats','ghouls','striking_fear','ancient_evils','chilling_cold']]]},
{name:'The Dunwich Legacy',fr:'L’Héritage de Dunwich',scenarios:[
['Extracurricular Activity','extracurricular_activity',['extracurricular_activity','sorcery','whippoorwills','bad_luck','the_beyond','hideous_abominations']],
['The House Always Wins','the_house_always_wins',['the_house_always_wins','sorcery','whippoorwills','bad_luck','the_beyond','hideous_abominations']],
['The Miskatonic Museum','the_miskatonic_museum',['the_miskatonic_museum','sorcery','whippoorwills','bad_luck','the_beyond','hideous_abominations']],
['The Essex County Express','essex_county_express',['essex_county_express','sorcery','whippoorwills','bad_luck','the_beyond','hideous_abominations']],
['Blood on the Altar','blood_on_the_altar',['blood_on_the_altar','sorcery','whippoorwills','bad_luck','the_beyond','hideous_abominations']],
['Undimensioned and Unseen','undimensioned_and_unseen',['undimensioned_and_unseen','sorcery','whippoorwills','bad_luck','the_beyond','hideous_abominations']],
['Where Doom Awaits','where_doom_awaits',['where_doom_awaits','sorcery','whippoorwills','bad_luck','the_beyond','hideous_abominations']],
['Lost in Time and Space','lost_in_time_and_space',['lost_in_time_and_space','sorcery','whippoorwills','bad_luck','the_beyond','hideous_abominations']]]},
{name:'The Path to Carcosa',fr:'La Route de Carcosa',scenarios:[
['Curtain Call','curtain_call',['curtain_call','delusions','byakhee','inhabitants_of_carcosa','evil_portents','hauntings']],
['The Last King','the_last_king',['the_last_king','delusions','byakhee','inhabitants_of_carcosa','evil_portents','hauntings']],
['Echoes of the Past','echoes_of_the_past',['echoes_of_the_past','delusions','byakhee','inhabitants_of_carcosa','evil_portents','hauntings']],
['The Unspeakable Oath','the_unspeakable_oath',['the_unspeakable_oath','delusions','byakhee','inhabitants_of_carcosa','evil_portents','hauntings']],
['A Phantom of Truth','a_phantom_of_truth',['a_phantom_of_truth','delusions','byakhee','inhabitants_of_carcosa','evil_portents','hauntings']],
['The Pallid Mask','the_pallid_mask',['the_pallid_mask','delusions','byakhee','inhabitants_of_carcosa','evil_portents','hauntings']],
['Black Stars Rise','black_stars_rise',['black_stars_rise','delusions','byakhee','inhabitants_of_carcosa','evil_portents','hauntings']],
['Dim Carcosa','dim_carcosa',['dim_carcosa','delusions','byakhee','inhabitants_of_carcosa','evil_portents','hauntings']]]},
{name:'The Forgotten Age',fr:'Les Contrées du Rêve? / L’Âge oublié',scenarios:[
['The Doom of Eztli','eztli',['eztli','wilds','venom','poison','rainforest','serpents']],['The Untamed Wilds','wilds',['wilds','traps','expedition','ruins','rainforest','serpents']],['Threads of Fate','threads_of_fate',['threads_of_fate','traps','expedition','ruins','rainforest','serpents']],['The Boundary Beyond','the_boundary_beyond',['the_boundary_beyond','traps','expedition','ruins','rainforest','serpents']],['Heart of the Elders','heart_of_the_elders',['heart_of_the_elders','traps','expedition','ruins','rainforest','serpents']],['The City of Archives','the_city_of_archives',['the_city_of_archives','traps','expedition','ruins','rainforest','serpents']],['The Depths of Yoth','the_depths_of_yoth',['the_depths_of_yoth','traps','expedition','ruins','rainforest','serpents']],['Shattered Aeons','shattered_aeons',['shattered_aeons','traps','expedition','ruins','rainforest','serpents']]]},
{name:'The Circle Undone',fr:'Le Cercle brisé',scenarios:[['The Witching Hour','the_witching_hour',['the_witching_hour','hexcraft','bloodthirsty_spirits','unspeakable_fate']],['At Death’s Doorstep','at_deaths_doorstep',['at_deaths_doorstep','hexcraft','bloodthirsty_spirits','unspeakable_fate']],['The Secret Name','the_secret_name',['the_secret_name','hexcraft','bloodthirsty_spirits','unspeakable_fate']],['The Wages of Sin','the_wages_of_sin',['the_wages_of_sin','hexcraft','bloodthirsty_spirits','unspeakable_fate']],['For the Greater Good','for_the_greater_good',['for_the_greater_good','hexcraft','bloodthirsty_spirits','unspeakable_fate']],['Union and Disillusion','union_and_disillusion',['union_and_disillusion','hexcraft','bloodthirsty_spirits','unspeakable_fate']],['In the Clutches of Chaos','in_the_clutches_of_chaos',['in_the_clutches_of_chaos','hexcraft','bloodthirsty_spirits','unspeakable_fate']],['Before the Black Throne','before_the_black_throne',['before_the_black_throne','hexcraft','bloodthirsty_spirits','unspeakable_fate']]]},
{name:'The Dream-Eaters',fr:'Les Dévoreurs de rêves',scenarios:[['Beyond the Gates of Sleep','beyond_the_gates_of_sleep',['beyond_the_gates_of_sleep','dreamlands','dreamers_curse']],['The Search for Kadath','the_search_for_kadath',['the_search_for_kadath','dreamlands','dreamers_curse']],['A Thousand Shapes of Horror','a_thousand_shapes_of_horror',['a_thousand_shapes_of_horror','dreamlands','dreamers_curse']],['Dark Side of the Moon','dark_side_of_the_moon',['dark_side_of_the_moon','dreamlands','dreamers_curse']],['Point of No Return','point_of_no_return',['point_of_no_return','dreamlands','dreamers_curse']],['Where the Gods Dwell','where_the_gods_dwell',['where_the_gods_dwell','dreamlands','dreamers_curse']],['Weaver of the Cosmos','weaver_of_the_cosmos',['weaver_of_the_cosmos','dreamlands','dreamers_curse']]]},
{name:'The Innsmouth Conspiracy',fr:'La Conspiration d’Innsmouth',scenarios:[['The Pit of Despair','the_pit_of_despair',['the_pit_of_despair','creatures_of_the_deep','flooded_caverns']],['The Vanishing of Elina Harper','the_vanishing_of_elina_harper',['the_vanishing_of_elina_harper','the_locals','fog_over_innsmouth']],['In Too Deep','in_too_deep',['in_too_deep','agents_of_dagon','agents_of_hydra']],['Devil Reef','devil_reef',['devil_reef','agents_of_dagon','agents_of_hydra']],['Horror in High Gear','horror_in_high_gear',['horror_in_high_gear','agents_of_dagon','agents_of_hydra']],['A Light in the Fog','a_light_in_the_fog',['a_light_in_the_fog','agents_of_dagon','agents_of_hydra']],['The Lair of Dagon','the_lair_of_dagon',['the_lair_of_dagon','agents_of_dagon','agents_of_hydra']],['Into the Maelstrom','into_the_maelstrom',['into_the_maelstrom','agents_of_dagon','agents_of_hydra']]]},
{name:'Edge of the Earth',fr:'Aux confins de la Terre',scenarios:[['Ice and Death','ice_and_death',['ice_and_death','creatures_in_the_ice','deadly_weather','hazards_of_antarctica']],['The Crash','the_crash',['the_crash','creatures_in_the_ice','deadly_weather','hazards_of_antarctica']],['To the Forbidden Peaks','to_the_forbidden_peaks',['to_the_forbidden_peaks','silence_and_mystery','elder_things']],['City of the Elder Things','city_of_the_elder_things',['city_of_the_elder_things','nameless_horrors','seeping_nightmares']],['The Heart of Madness','the_heart_of_madness',['the_heart_of_madness','fatal_mirage','memorials_of_the_lost']]]}
];

async function get(url){const r=await fetch(url);if(!r.ok)throw Error(r.status);return r.json()}
async function init(){
 try{
  const [packs,en,fr]=await Promise.all([get(API+'/packs/'),get(API+'/cards/'),get(FR+'/cards/')]);
  const frMap=new Map(fr.map(x=>[x.code,x])); all=en.map(x=>({...x,fr:frMap.get(x.code)}));
  window.packs=packs; buildTree(); bindGlobal();
 }catch(e){$('tree').innerHTML='<div class="empty">Impossible de charger les données. Ouvrez le site via GitHub Pages et vérifiez votre connexion.</div>';console.error(e)}
}
function buildTree(){const root=$('tree');root.innerHTML=''; campaigns.forEach((c,i)=>{const box=document.createElement('div');box.className='campaign';box.innerHTML=`<button class="campHead" aria-expanded="true">▾ ${esc(c.name)}<small>${esc(c.fr)}</small></button><div class="scenarios"></div>`;const list=box.querySelector('.scenarios'); c.scenarios.forEach(s=>{const b=document.createElement('button');b.className='scenario';b.innerHTML=`<span>${esc(s[0])}</span>`;b.onclick=()=>selectScenario(s,b,c);list.appendChild(b)});box.querySelector('.campHead').onclick=()=>{const open=list.style.display!=='none';list.style.display=open?'none':'block';box.querySelector('.campHead').firstChild.textContent=open?'▸ ':'▾ ';};root.appendChild(box)})}
function selectScenario(s,el,c){document.querySelectorAll('.scenario').forEach(x=>x.classList.remove('active'));el.classList.add('active');selectedScenario={name:s[0],code:s[1],sets:s[2],campaign:c.name};selectedSets=new Set(s[2]);renderScenario()}
function bindGlobal(){ $('search').addEventListener('input',renderScenario); $('hideFr').onclick=()=>{langMode='en';renderScenario()};$('hideEn').onclick=()=>{langMode='fr';renderScenario()};$('reset').onclick=()=>{langMode='both';$('search').value='';renderScenario()}}
function bySet(code){return all.filter(c=>c.encounter_code===code || c.encounter_code===String(code))}
function renderScenario(){if(!selectedScenario)return; const q=$('search').value.toLowerCase().trim(); const cards=all.filter(c=>selectedSets.has(c.encounter_code)&&(!q||(`${c.name} ${c.text||''} ${c.fr?.name||''} ${c.fr?.text||''} ${c.code}`).toLowerCase().includes(q))); const groups=selectedScenario.sets.map(code=>({code,cards:cards.filter(c=>c.encounter_code===code)})).filter(g=>g.cards.length); $('welcome').style.display='none'; $('cards').innerHTML=`<div class="scenarioHead"><div><div class="eyebrow">${esc(selectedScenario.campaign)}</div><h2>${esc(selectedScenario.name)}</h2></div><div class="count">${cards.length} cartes</div></div>${groups.map(g=>{const title=(g.cards[0]?.encounter_name)||g.code;return `<div class="set"><div class="setHead"><h3>${esc(title)}</h3><span>${g.cards.length}</span></div><div class="paired">${g.cards.map(c=>pair(c)).join('')}</div></div>`}).join('') || '<div class="empty">Aucune carte trouvée pour ce scénario avec ce filtre.</div>'}`}
function pair(c){const fr=c.fr||c; const enImg=image(c),frImg=image(fr)||enImg;return `<article class="pair ${langMode}"><div class="side en">${langMode!=='fr'?cardFace(c,enImg,'English'):''}</div><div class="side fr">${langMode!=='en'?cardFace(fr,frImg,'Français'):''}</div></article>`}
function cardFace(c,src,label){return `<div class="lang">${label}</div><div class="card">${src?`<img loading="lazy" src="${esc(src)}" alt="${esc(c.name)}">`:''}<div class="meta"><b>${esc(c.name||'')}</b><span>${esc(c.code||'')}</span></div></div>`}
function image(c){return c?.imagesrc||c?.imagesrc_front||c?.image_url||''}
init();
