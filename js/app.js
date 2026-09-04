const API='https://arkhamdb.com/api/public';
const GH='https://raw.githubusercontent.com/Kamalisk/arkhamdb-json-data/master';
const MAP_XLSX='https://raw.githubusercontent.com/erikoliver/arkham-lcg-tools/master/Scenario%20Mapping.xlsx';
let all=[], selectedScenario=null, langMode='both', frMap=new Map(), scenarioSets=new Map(), setNames=new Map();
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=v=>String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
async function get(url,options={}){const r=await fetch(url,{...options,cache:'no-store'});if(!r.ok)throw Error(`${r.status} ${url}`);return r.json()}
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
 $('tree').innerHTML='<div class="empty">Chargement des cartes et de la correspondance des scénarios…</div>';
 try{const [en]=await Promise.all([get(API+'/cards/?encounter=1'),loadScenarioMapping()]);all=Array.isArray(en)?en:[];indexSetNames();buildTree();bindGlobal();
   if(!all.length)throw Error('ArkhamDB n’a renvoyé aucune carte.');
 }catch(e){$('tree').innerHTML=`<div class="empty error"><b>Impossible de charger les données</b><br><br>${esc(e.message)}<br><br>Recharge la page. Si le problème persiste, vérifie la connexion à ArkhamDB.</div>`;console.error(e)}
}
async function loadScenarioMapping(){
 try{
  const r=await fetch(MAP_XLSX,{cache:'no-store'}); if(!r.ok)throw Error('mapping unavailable');
  const buf=await r.arrayBuffer(); const wb=XLSX.read(buf,{type:'array'});
  wb.SheetNames.forEach(sn=>{const rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:''});
    for(const row of rows){const vals=row.map(v=>String(v).trim()).filter(Boolean);if(vals.length<2)continue;
      const scenario=vals[0]; const sets=vals.slice(1).filter(v=>norm(v)!==norm(scenario));
      if(scenario && sets.length) scenarioSets.set(norm(scenario),sets);
    }
  });
 }catch(e){console.warn('Scenario Mapping.xlsx indisponible; fallback aux encounter codes',e)}
}
function indexSetNames(){for(const c of all){if(c.encounter_code&&c.encounter_name)setNames.set(c.encounter_code,c.encounter_name)}
 // Make the fallback resilient: the scenario's own encounter code is always included.
}
function buildTree(){const root=$('tree');root.innerHTML='';campaigns.forEach(c=>{const box=document.createElement('div');box.className='campaign';box.innerHTML=`<button class="campHead" aria-expanded="true"><span class="arrow">▾</span><span class="campName">${esc(c.name)}</span><small>${esc(c.fr)}</small></button><div class="scenarios"></div>`;const list=box.querySelector('.scenarios');c.scenarios.forEach(s=>{const b=document.createElement('button');b.className='scenario';b.innerHTML=`<span>${esc(s[0])}</span>`;b.onclick=()=>selectScenario(s,b,c);list.appendChild(b)});box.querySelector('.campHead').onclick=()=>{const open=list.hidden===false;list.hidden=open;box.querySelector('.campHead').setAttribute('aria-expanded',String(!open));box.querySelector('.arrow').textContent=open?'▸':'▾';};root.appendChild(box)})}
function selectScenario(s,el,c){document.querySelectorAll('.scenario').forEach(x=>x.classList.remove('active'));el.classList.add('active');selectedScenario={name:s[0],code:s[1],campaign:c.name};renderScenario()}
function bindGlobal(){$('search').addEventListener('input',()=>renderScenario());$('hideFr').onclick=()=>{langMode='en';renderScenario()};$('hideEn').onclick=()=>{langMode='fr';renderScenario()};$('both').onclick=()=>{langMode='both';renderScenario()};$('reset').onclick=()=>{$('search').value='';langMode='both';renderScenario()}}
function getScenarioSetCodes(){const s=selectedScenario;const raw=scenarioSets.get(norm(s.name))||[];const codes=[];
 // mapping rows may contain names or codes; resolve both.
 for(const value of raw){const n=norm(value);for(const [code,name] of setNames){if(norm(code)===n||norm(name)===n){codes.push(code);break}}if(!codes.includes(value)&&all.some(c=>c.encounter_code===value))codes.push(value)}
 if(!codes.includes(s.code))codes.unshift(s.code);
 // Some mapping files contain only the set name of the scenario; retain its code and avoid duplicates.
 return [...new Set(codes)];
}
function cardSet(c){return c.encounter_code||''}
async function loadFrenchFor(cards){
 const packs=[...new Set(cards.map(c=>String(c.pack_code||'').toLowerCase()).filter(Boolean))];
 await Promise.all(packs.map(async pack=>{const url=`${GH}/translations/fr/pack/${encodeURIComponent(pack)}/${encodeURIComponent(pack)}_encounter.json`;try{const data=await get(url);if(Array.isArray(data))data.forEach(x=>frMap.set(x.code,x));}catch(e){}}));
}
async function renderScenario(){if(!selectedScenario)return;const q=norm($('search').value);const codes=getScenarioSetCodes();let cards=all.filter(c=>codes.includes(cardSet(c)));
 cards=cards.filter(c=>!q||norm(`${c.name} ${c.text||''} ${c.encounter_name||''} ${c.code}`).includes(q));
 $('welcome').style.display='none';$('cards').innerHTML=`<div class="scenarioHead"><div><div class="eyebrow">${esc(selectedScenario.campaign)}</div><h2>${esc(selectedScenario.name)}</h2><div class="sub">${codes.length} encounter sets · chargement des traductions…</div></div><div class="count">${cards.length} cartes</div></div><div class="empty">Chargement…</div>`;
 await loadFrenchFor(cards); if(q)cards=cards.filter(c=>norm(`${c.name} ${c.text||''} ${c.encounter_name||''} ${frMap.get(c.code)?.name||''} ${frMap.get(c.code)?.text||''} ${c.code}`).includes(q));
 const groups=[];for(const code of codes){const gc=cards.filter(c=>cardSet(c)===code);if(gc.length)groups.push({code,name:setNames.get(code)||gc[0].encounter_name||code,cards:gc.sort((a,b)=>(a.position||0)-(b.position||0))});}
 const missing=codes.filter(code=>!groups.some(g=>g.code===code));
 $('cards').innerHTML=`<div class="scenarioHead"><div><div class="eyebrow">${esc(selectedScenario.campaign)}</div><h2>${esc(selectedScenario.name)}</h2><div class="sub">${groups.length} encounter sets · toutes les cartes disponibles pour ces sets</div></div><div class="count">${cards.length} cartes</div></div>${missing.length?`<div class="warning">Sets demandés mais absents des données chargées : ${missing.map(x=>esc(setNames.get(x)||x)).join(', ')}</div>`:''}${groups.map(g=>`<div class="set"><div class="setHead"><h3>${esc(g.name)}</h3><span>${g.cards.length}</span></div><div class="paired">${g.cards.map(pair).join('')}</div></div>`).join('')||'<div class="empty">Aucune carte trouvée. Consulte le diagnostic ci-dessous.</div>'}<details class="diag"><summary>Diagnostic</summary><p>Encounter codes recherchés : <code>${esc(codes.join(', '))}</code></p><p>Cartes de scénario chargées : ${all.length}</p><p>Sets trouvés : ${groups.length}</p></details>`;
}
function pair(c){const fr=frMap.get(c.code);const ei=image(c),fi=image(fr);return `<article class="pair ${langMode}"><div class="side en">${langMode!=='fr'?cardFace(c,ei,'English'):''}</div><div class="side fr">${langMode!=='en'?cardFace(fr||{name:'Traduction française indisponible',code:c.code},fi||ei,'Français'):''}</div></article>`}
function cardFace(c,src,label){return `<div class="lang">${label}</div><div class="card">${src?`<img loading="lazy" src="${esc(src)}" alt="${esc(c.name||'')}">`:'<div class="noimg">Image indisponible</div>'}<div class="meta"><b>${esc(c.name||'')}</b><span>${esc(c.code||'')}</span></div></div>`}
function image(c){let u=c?.imagesrc||c?.imagesrc_front||c?.image_url||'';if(!u)return '';if(u.startsWith('//'))return 'https:'+u;if(u.startsWith('/'))return 'https://arkhamdb.com'+u;return u}
init();
