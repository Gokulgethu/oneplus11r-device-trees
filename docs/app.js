/* ============================================================
   Virtual OnePlus 11R — RisingOS 9 Alpha interactive simulator
   ============================================================ */
"use strict";
const $ = s => document.querySelector(s);
const svg0 = inner => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

/* ------------------------------------------------ icons --- */
const I = {
  wifi:svg0('<path d="M2.5 9a15 15 0 0 1 19 0"/><path d="M5.5 12.5a10.5 10.5 0 0 1 13 0"/><path d="M8.6 16a6 6 0 0 1 6.8 0"/><path d="M12 19.4h.01"/>'),
  signal:svg0('<path d="M5 20v-3.5"/><path d="M9.5 20v-7"/><path d="M14 20V9.5"/><path d="M18.5 20V4"/>'),
  plane:svg0('<path d="M10.5 13.5 3 11l1.5-1.5 6.5.6 4.6-6.4a1.7 1.7 0 0 1 2.4-2.2l2.2 2.2A1.7 1.7 0 0 1 18 6.1L11.6 10.7l.6 6.5L10.7 19z" fill="currentColor" stroke="none" transform="rotate(45 12 12)"/>'),
  bt:svg0('<path d="M6.5 7.5l11 9L12 21V3l5.5 4.5-11 9"/>'),
  moon:svg0('<path d="M20 13.5A7.5 7.5 0 1 1 10.5 4a6 6 0 0 0 9.5 9.5z"/>'),
  belloff:svg0('<path d="M8.6 6.2A6 6 0 0 1 18 9c0 5 2 6 2 6h-3.5M6.2 9.3C6 12 5 14 4 15h7"/><path d="M10 19a2 2 0 0 0 4 0"/><path d="M4 4l16 16"/>'),
  bell:svg0('<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/>'),
  torch:svg0('<path d="M8 3h8v3l-2 2.5V20a2 2 0 0 1-2 2 2 2 0 0 1-2-2V8.5L8 6z"/><path d="M12 12v2.5"/>'),
  saver:svg0('<path d="M5 19C5 9 12 4 20 4c0 8-5 15-15 15z"/><path d="M5 19c3-6 7-9 11-11"/>'),
  dark:svg0('<path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/>'),
  rotate:svg0('<path d="M21 12a9 9 0 1 1-2.6-6.3"/><path d="M21 3v6h-6"/>'),
  game:svg0('<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M8 10.5v4M6 12.5h4"/><path d="M15.5 11h.01M17.8 14h.01"/>'),
  dolby:svg0('<path d="M3 6h3.5a6 6 0 0 1 0 12H3z"/><path d="M21 6h-3.5a6 6 0 0 0 0 12H21z"/>'),
  edit:svg0('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
  power:svg0('<path d="M12 3v8"/><path d="M6.3 6.5a8 8 0 1 0 11.4 0"/>'),
  screen:svg0('<path d="M8 3H4v4M16 3h4v4M8 21H4v-4M16 21h4v-4"/>'),
  gear:svg0('<circle cx="12" cy="12" r="3.2"/><path d="M19.4 14.5a8 8 0 0 0 0-5l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2.6-1.5L14 2h-4l-.4 2.5a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5a8 8 0 0 0 0 5l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 2.6 1.5L10 22h4l.4-2.5a8 8 0 0 0 2.6-1.5l2.4 1 2-3.5z"/>'),
  back:svg0('<path d="M15 5l-7 7 7 7"/>'),
  search:svg0('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>'),
  phone:svg0('<path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11 11 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .6 3.6 1 1 0 0 1-.25 1z"/>'),
  chat:svg0('<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4z"/>'),
  camera:svg0('<rect x="2.5" y="6" width="19" height="13.5" rx="3"/><path d="M8 6l1.5-2.5h5L16 6"/><circle cx="12" cy="12.7" r="3.5"/>'),
  clock:svg0('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.5 2"/>'),
  folder:svg0('<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  yt:svg0('<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none"/>'),
  mail:svg0('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7.5l8 5.5 8-5.5"/>'),
  sun:svg0('<path d="M6.5 16a5.5 5.5 0 0 1 11 0"/><path d="M12 4.5v3M4.9 8.5l2.1 2.1M19.1 8.5l-2.1 2.1M3 16h2M19 16h2"/><path d="M2 19.5h20"/>'),
  finger:svg0('<path d="M6.5 4.8A8.8 8.8 0 0 1 20 10.2c0 2.4.2 4.8-.4 7.2M4.6 8a9 9 0 0 0-.6 4.2c0 1-.1 2.4-.6 3.6M8.4 11a3.9 3.9 0 0 1 7.6.1c.1 2 0 3.9-.4 5.7M10.7 14.2c0 1.5-.3 3-.8 4.4M14 13.5c0 2-.3 4-.9 5.9"/>'),
  zap:svg0('<path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H13z"/>'),
  cosmos:svg0('<circle cx="12" cy="12" r="5"/><path d="M3.5 9.2C9.5 15.4 15.4 15.4 20.5 10.6"/><path d="M4.5 15.2c5 3.4 10.2 3.2 14.6.3"/>'),
  info:svg0('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  link:svg0('<path d="M10 14a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.1M14 10a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.1"/>'),
  loc:svg0('<path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>'),
  shield:svg0('<path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z"/>'),
  sim:svg0('<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M9 2.5V7M9 12h6v6H9z"/>'),
  bright:svg0('<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/>'),
  play:svg0('<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>'),
  pause:svg0('<rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/>'),
  mic:svg0('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4"/>'),
  lens:svg0('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>'),
  camswitch:svg0('<rect x="2.5" y="6" width="19" height="13.5" rx="3"/><path d="M15.3 9.8A3.6 3.6 0 0 0 9 11.5M8.7 15.6a3.6 3.6 0 0 0 6.3-1.7"/><path d="M9 9.4v2.1h2.1M15 16v-2.1h-2.1"/>'),
  check:svg0('<path d="M5 13l4 4L19 7"/>'),
  x:svg0('<path d="M6 6l12 12M18 6L6 18"/>'),
  chev:svg0('<path d="M9 6l6 6-6 6"/>'),
  alert:svg0('<rect x="8.5" y="4" width="7" height="16" rx="3.5"/><path d="M12 8.5h.01"/>'),
  vol:svg0('<path d="M4 10v4h3l4 4V6l-4 4z"/><path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a8 8 0 0 1 0 10"/>'),
  volx:svg0('<path d="M4 10v4h3l4 4V6l-4 4z"/><path d="M16 9l5 5M21 9l-5 5"/>'),
  globe:svg0('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  star:svg0('<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8z"/>'),
  send:svg0('<path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>'),
  alarm:svg0('<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.5M4.5 4 7 6M19.5 4 17 6"/>'),
  apps:svg0('<rect x="4" y="4" width="7" height="7" rx="1.8"/><rect x="13" y="4" width="7" height="7" rx="1.8"/><rect x="4" y="13" width="7" height="7" rx="1.8"/><rect x="13" y="13" width="7" height="7" rx="1.8"/>'),
  lock:svg0('<rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>'),
};
const SPECIAL = {
  Chrome:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="#fff"/><path d="M12 2.5A9.5 9.5 0 0 1 21.5 12H12z" fill="#ea4335"/><path d="M21.5 12A9.5 9.5 0 0 1 6.8 20.6L12 12z" fill="#fbbc05"/><path d="M6.8 20.6A9.5 9.5 0 0 1 4.7 6.2L12 12z" fill="#34a853"/><circle cx="12" cy="12" r="4.3" fill="#fff"/><circle cx="12" cy="12" r="3.7" fill="#4285f4"/></svg>',
  Photos:'<svg viewBox="0 0 24 24"><path d="M12 12V4.6a7.4 7.4 0 0 1 7.4 7.4z" fill="#ea4335"/><path d="M12 12h7.4a7.4 7.4 0 0 1-7.4 7.4z" fill="#fbbc05"/><path d="M12 12v7.4A7.4 7.4 0 0 1 4.6 12z" fill="#4285f4"/><path d="M12 12H4.6A7.4 7.4 0 0 1 12 4.6z" fill="#34a853"/></svg>',
  'Play Store':'<svg viewBox="0 0 24 24"><path d="M4.5 3.2l10 8.8-2.4 2L4.8 3.8z" fill="#34a853"/><path d="M4.5 3.2l4.6 4-4.3 3.6z" fill="#4285f4"/><path d="M4.8 20.8l7.3-10.2 2.4 2z" fill="#ea4335"/><path d="M14.5 12l5-3.4c1-.6 1 1.5 0 2.1z" fill="#fbbc05"/></svg>',
};

/* ------------------------------------------------ state --- */
const DEF = {
  theme:'dark', accent:'#ff8a5c', clockPos:'Left', battStyle:'Portrait', battPct:true,
  qsStyle:'Rising', pmStyle:'Rising', lockStyle:'Rise default', fodIcon:'Ripple', fps:'120',
  ringer:'Ring', wifi:true, bt:true, dnd:false, torch:false, airplane:false, saver:false,
  rotate:true, gaming:false, dolby:true, bright:78, vol:55, playing:false, tfs:true, aod:true,
};
let S = {...DEF};
try{ S = {...DEF, ...JSON.parse(localStorage.getItem('v11r-state')||'{}')}; }catch(e){}
const save = () => { try{ localStorage.setItem('v11r-state', JSON.stringify(S)); }catch(e){} };
let powered=true, unlocked=false, drawerOpen=false, curApp=null, volume=55;

/* ------------------------------------------------ clock --- */
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function t12(){const d=new Date();let h=d.getHours()%12; if(h===0)h=12; return h+':'+String(d.getMinutes()).padStart(2,'0');}
function dshort(){const d=new Date();return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;}
function tick(){
  const t=t12(), d=dshort();
  $('#lcTime').textContent=t; $('#lcDate').textContent=d;
  $('#sbTime').textContent = S.clockPos==='Hidden' ? '' : t;
  $('#qsTime').textContent=t; $('#qsDate').textContent=d;
  $('#aodTime').textContent=t; $('#aodDate').textContent=d;
  $('#glanceDate').textContent=d;
  const bc=$('#bigClockNow'); if(bc){bc.textContent=t; $('#bigClockDate').textContent=d;}
}

/* ------------------------------------------------ toast --- */
let toastT;
function toast(msg){ const t=$('#toast'); t.innerHTML=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),1900); }

/* ------------------------------------------------ status bar --- */
function sb(){
  const r=$('#sbRight'); let h='';
  if(S.dnd) h+=`<span class="ic">${I.moon}</span>`;
  if(S.ringer==='Silent'&&!S.airplane) h+=`<span class="ic">${I.belloff}</span>`;
  if(S.bt&&!S.airplane) h+=`<span class="ic" style="width:15px">${I.bt}</span>`;
  if(S.airplane) h+=`<span class="ic" style="width:20px">${I.plane}</span>`;
  else{
    if(S.wifi) h+=`<span class="ic">${I.wifi}</span>`;
    h+=`<span class="ic">${I.signal}</span>`;
  }
  if(S.battStyle!=='Hidden'){
    if(S.battStyle==='Circle') h+=`<span class="batcircle" style="--lv:87%"></span>`;
    else h+=`<span class="batt ${S.saver?'saver':''}" style="${S.battStyle==='Landscape'?'transform:rotate(-90deg) scale(.92);margin:0 3px':''}"><i style="transform:scaleX(.87)"></i></span>`;
    if(S.battPct) h+=`<span class="sb-alarm">87%</span>`;
  }
  r.innerHTML=h;
  const bar=$('#statusbar');
  bar.style.flexDirection = S.clockPos==='Right' ? 'row-reverse' : 'row';
  $('#sbTime').style.display = S.clockPos==='Hidden' ? 'none':'';
  renderLockNotifs();
}
function renderLockNotifs(){
  const n=$('#lockNotifs');
  if(S.dnd){ n.innerHTML=`<div class="dndnote">🔕 Do Not Disturb is on — notifications hidden</div>`; return; }
  n.innerHTML=`
    <div class="notif"><div class="ni" style="background:#229ed922">${I.send}</div>
      <div><b>Telegram · RisingOS udon</b><p>Build finished ✓ RisingOS-9-Alpha-260826-2207</p></div></div>
    <div class="notif"><div class="ni" style="background:#ea433522">${I.mail}</div>
      <div><b>Gmail</b><p>Your Google Play system update is available</p></div></div>`;
}

/* ------------------------------------------------ boot / lock --- */
function showBoot(cb){
  const b=$('#boot'); b.classList.remove('hidden');
  const s=b.querySelector('.sunrise'); s.style.animation='none'; void s.offsetWidth; s.style.animation='';
  setTimeout(()=>{ b.classList.add('hidden'); cb&&cb(); }, 2500);
}
function lockScreen(){ unlocked=false; $('#lock').classList.remove('away'); $('#lock').classList.remove('hidden'); tick(); }
function unlock(){
  if(unlocked) return;
  unlocked=true;
  $('#lock').classList.add('away');
  setTimeout(()=>{ if(unlocked) $('#lock').classList.add('hidden'); }, 520);
}

/* FOD styles */
const FOD = { Ripple:I.finger, Energy:I.zap, Cosmos:I.cosmos };
function renderFod(){ $('#fod').innerHTML=FOD[S.fodIcon]||I.finger; }

/* ------------------------------------------------ launcher --- */
const APPS=[
  {id:'phone', n:'Phone', bg:'#2ba84a', ic:I.phone},
  {id:'messages', n:'Messages', bg:'#1a73e8', ic:I.chat},
  {id:'chrome', n:'Chrome', bg:'#fff', sp:'Chrome'},
  {id:'photos', n:'Photos', bg:'#fff', sp:'Photos'},
  {id:'camera', n:'Camera', bg:'#3c4043', ic:I.camera},
  {id:'playstore', n:'Play Store', bg:'#fff', sp:'Play Store'},
  {id:'settings', n:'Settings', bg:'#5f6368', ic:I.gear},
  {id:'custom', n:'Customise', bg:'linear-gradient(140deg,#ffb35c,#ff6a88)', ic:I.sun, accentLabel:true},
  {id:'clock', n:'Clock', bg:'#1c2b45', ic:I.clock},
  {id:'files', n:'Files', bg:'#f9ab00', ic:I.folder},
  {id:'yt', n:'YouTube', bg:'#ff0000', ic:I.yt},
  {id:'gmail', n:'Gmail', bg:'#fff', ic:I.mail}
];
function appIcon(a){
  const inner = a.sp ? SPECIAL[a.sp] : a.ic;
  return `<button class="appbtn" data-app="${a.id}"><span class="appicon" style="background:${a.bg};color:${a.sp?'inherit':'#fff'}">${inner}</span><small>${a.n}</small></button>`;
}
function buildLauncher(){
  $('#homeGrid').innerHTML = APPS.filter(a=>['playstore','settings','custom','clock','photos','files','yt','gmail'].includes(a.id)).map(appIcon).join('');
  $('#dock').innerHTML = APPS.filter(a=>['phone','messages','chrome','camera'].includes(a.id)).map(appIcon).join('');
  $('#drawerGrid').innerHTML = APPS.map(appIcon).join('');
  document.querySelectorAll('.appbtn').forEach(b=>b.onclick=()=>{ closeDrawer(); openApp(b.dataset.app); });
  $('#searchPill').onclick=()=>toast('Google app — simulated in this preview');
  $('#pillIcons').innerHTML=`<span style="width:18px;height:18px;display:inline-flex">${I.mic}</span><span style="width:18px;height:18px;display:inline-flex">${I.lens}</span>`;
}
function openDrawer(){ if(!unlocked)return; drawerOpen=true; $('#drawer').classList.add('open'); }
function closeDrawer(){ drawerOpen=false; $('#drawer').classList.remove('open'); }

/* ------------------------------------------------ app window --- */
const NAV=[];
function openApp(id, page){
  closeDrawer(); closeQS();
  const win=$('#appwin'); curApp=id;
  win.classList.add('open'); win.classList.toggle('fullbleed', id==='camera');
  $('#appBack').style.display = id==='camera' ? 'none':'flex';
  NAV.length=0; NAV.push({id, page});
  renderApp(id, page);
}
function closeApp(){ curApp=null; NAV.length=0; $('#appwin').classList.remove('open'); }
$('#appBack').onclick=()=>{
  if(NAV.length>1){ NAV.pop(); const top=NAV[NAV.length-1]; renderApp(top.id, top.page); }
  else closeApp();
};
function navTo(page){ NAV.push({id:'settings', page}); renderApp('settings', page); }

function renderApp(id, page){
  const B=$('#appbody');
  $('#appTitle').textContent = ({settings:'Settings', phone:'Phone', messages:'Messages', chrome:'Chrome', photos:'Photos', camera:'', playstore:'Play Store', clock:'Clock', files:'Files', yt:'YouTube', gmail:'Gmail', custom:'Customisations'})[id]||'';
  B.style.background=''; B.style.position='relative';
  switch(id){
    case 'settings': return renderSettingsPage(page||'root');
    case 'custom': $('#appTitle').textContent='Customisations'; return renderSettingsPage('custom');
    case 'camera': return renderCamera(B);
    case 'phone': return renderDialer(B);
    case 'messages': return renderMessages(B);
    case 'chrome': return renderChrome(B);
    case 'photos': return renderPhotos(B);
    case 'playstore': return renderPlayStore(B);
    case 'clock': return renderClock(B);
    case 'files': return renderFiles(B);
    case 'yt': return renderYT(B);
    case 'gmail': return renderGmail(B);
  }
}

/* ------------------------------------------------ mock apps --- */
function renderCamera(B){
  B.innerHTML=`
    <div class="viewfinder"><div class="vf-grid"></div>
      <div class="vf-top"><span>HDR</span><span>Dolby Vision 4K60</span><span>OIS</span></div>
      <div class="vf-modes"><span>Night</span><span>Portrait</span><b>Photo</b><span>Video</span><span>Pro</span></div>
      <div class="vf-thumb" id="vfThumb"></div>
      <div class="shutter" id="shutter"></div>
      <div class="vf-cam">${I.camswitch}</div>
    </div>`;
  $('#shutter').onclick=()=>{
    const f=$('#flash'); f.classList.add('go');
    setTimeout(()=>f.classList.remove('go'),160);
    toast('50 MP RAW+JPEG captured · IMX890 (simulated)');
  };
}
function renderDialer(B){
  const keys=[['1',''],['2','ABC'],['3','DEF'],['4','GHI'],['5','JKL'],['6','MNO'],['7','PQRS'],['8','TUV'],['9','WXYZ'],['*',''],['0','+'],['#','']];
  B.innerHTML=`<div class="dialout" id="dialout"></div>
    <div class="dialpad">${keys.map(k=>`<button data-k="${k[0]}">${k[0]}<small>${k[1]}</small></button>`).join('')}</div>
    <div class="callrow"><button class="callbtn" id="callBtn">${I.phone}</button></div>
    <div class="webnote" style="text-align:center">VoLTE · Wi-Fi calling enabled on Jio 5G (SIM 1)</div>`;
  let num='';
  B.querySelectorAll('.dialpad button').forEach(b=>b.onclick=()=>{ num=(num+b.dataset.k).slice(0,14); $('#dialout').textContent=num; });
  $('#callBtn').onclick=()=>toast(num?`Calling ${num}… (simulated)`:'Enter a number first');
}
function renderMessages(B){
  const T=[['RisingOS · udon','#ff6a88','OTA 9-Alpha flashing notes are live 🔥','2:14 pm'],['Ammu','#7c4dff','Check out the new lock clocks, so clean!','1:02 pm'],['Google','#34a853','Your security code is 481 516','11:48 am']];
  B.innerHTML=T.map((t,i)=>`<div class="listrow" data-i="${i}"><div class="lavatar" style="background:${t[1]}">${t[0][0]}</div>
    <div class="ltx"><b>${t[0]}<span>${t[3]}</span></b><p>${t[2]}</p></div></div>`).join('')+
    `<div class="webnote">RCS chat features ON · end-to-end encrypted</div>`;
  B.querySelectorAll('.listrow').forEach(r=>r.onclick=()=>renderThread(B,T[+r.dataset.i]));
}
function renderThread(B,t){
  B.innerHTML=`<div style="padding:18px 16px;display:flex;flex-direction:column;gap:10px" id="bubbles">
      <div class="msg-l">${t[2]}</div>
    </div>
    <div class="msgbar">
      <input id="msgIn" class="msgin" placeholder="Text message">
      <button id="msgSend" class="msgsnd">${I.send}</button>
    </div>`;
  const send=()=>{ const v=$('#msgIn').value.trim(); if(!v)return;
    $('#bubbles').insertAdjacentHTML('beforeend',`<div class="msg-r">${v.replace(/</g,'&lt;')}</div>`);
    $('#msgIn').value='';
    setTimeout(()=>$('#bubbles').insertAdjacentHTML('beforeend',`<div class="msg-l">Nice! This thread is simulated 😄</div>`),900);
  };
  $('#msgSend').onclick=send; $('#msgIn').onkeydown=e=>{if(e.key==='Enter')send();};
}
function renderChrome(B){
  B.innerHTML=`<div style="margin:4px 16px 12px;height:44px;border-radius:999px;background:var(--surf2-d);display:flex;align-items:center;gap:10px;padding:0 16px;font-size:13.5px;color:#8f8c99">${I.globe}&nbsp;risingos.github.io</div>
    <div class="quickt">
      <div id="q1">${I.globe}<span>RisingOS</span></div><div id="q2">${I.info}<span>Changelog</span></div>
      <div id="q3">${I.send}<span>Telegram</span></div><div id="q4">${I.star}<span>XDA</span></div>
    </div>
    <div class="webnote">Web rendering is simulated in this interactive preview — but these shortcuts point to the real RisingOS project pages you'd visit on-device.</div>`;
  B.querySelectorAll('.quickt div').forEach(d=>d.onclick=()=>toast('Browser rendering is simulated 🌐'));
}
function renderPhotos(B){
  const grads=['linear-gradient(140deg,#ffb35c,#ff6a88)','linear-gradient(140deg,#3a1c71,#d76d77 60%,#ffaf7b)','linear-gradient(140deg,#0f2027,#2c5364)','linear-gradient(140deg,#586074,#2a3245)','linear-gradient(140deg,#c99bf1,#6d3bc9)','linear-gradient(140deg,#f857a6,#ff5858)','linear-gradient(140deg,#43cea2,#185a9d)','linear-gradient(140deg,#ff9068,#ff4b1f)','url(assets/wallpaper.jpg) center/cover'];
  B.innerHTML=`<div class="webnote" style="padding-top:14px">Today · 9 items · OPlus Camera folder</div>
    <div class="photogrid">${Array.from({length:9},(_,i)=>`<div style="background:${grads[i%grads.length]}"></div>`).join('')}</div>`;
}
function renderPlayStore(B){
  const L=[['Genshin Impact','Adventure RPG · 4.6★','#7c4dff'],['Telegram','Messaging · 4.4★','#229ed9'],['KernelSU Next','Tools · Root manager','#00897b'],['Dolby On','Music & Audio recorder','#1b1b1f']];
  B.innerHTML=`<div style="margin:2px 16px 14px;height:44px;border-radius:999px;background:var(--surf2-d);display:flex;align-items:center;gap:10px;padding:0 16px;font-size:13.5px;color:#8f8c99">${I.search} Search apps &amp; games</div>
    <div class="sect">Recommended for you</div>` +
    L.map((a,i)=>`<div class="listrow"><div class="lavatar" style="border-radius:13px;background:${a[2]};color:#fff">${a[0][0]}</div>
      <div class="ltx"><b>${a[0]}</b><p>${a[1]}</p></div>
      <button class="inst" data-i="${i}" style="border:none;border-radius:999px;padding:8px 16px;font-size:12px;font-weight:700;background:var(--surf2-d);color:var(--accent)">Install</button></div>`).join('');
  B.querySelectorAll('.inst').forEach(b=>b.onclick=function(){ this.textContent='Open'; this.style.background='var(--accent)'; this.style.color='var(--accent-ink)'; toast(L[+this.dataset.i][0]+' installed ✓ (simulated)'); });
}
function renderClock(B){
  B.innerHTML=`<div class="bigclock" id="bigClockNow">${t12()}</div><div class="bigdate" id="bigClockDate">${dshort()}</div>
    <div class="alarmcard"><div><b>07:30</b><p>Alarm · Mon–Fri · Sunrise chime</p></div><button class="tgl on" id="al1"></button></div>
    <div class="alarmcard"><div><b>05:45</b><p>Gym · Sat · Dolby wake</p></div><button class="tgl" id="al2"></button></div>`;
  $('#al1').onclick=function(){this.classList.toggle('on');};
  $('#al2').onclick=function(){this.classList.toggle('on');};
  tick();
}
function renderFiles(B){
  const F=[['Download','Folder · 14 items'],['RisingOS-OTA','Folder · 1 item · 3.5 GB'],['DCIM','Folder · 51 items'],['Screenshots','Folder · 3 items'],['rising_udon.mk','Document · 2.1 KB'],['BUILD_STATUS.md','Document · 2.6 KB']];
  B.innerHTML=`<div class="sect">Internal storage · 118 GB free of 256 GB</div>`+
    F.map(f=>`<div class="listrow"><div class="fileico">${f[0].endsWith('.mk')||f[0].endsWith('.md')?I.edit:I.folder}</div>
      <div class="ltx"><b>${f[0]}</b><p>${f[1]}</p></div></div>`).join('')+
    `<div class="webnote">Yes — that OTA zip is your build 😉</div>`;
}
function renderYT(B){
  const V=[['RisingOS 9 Alpha — hands-on','Rising Hub · 128K views','linear-gradient(140deg,#ff8a5c,#ff6a88)','12:47'],['Android 16 hidden features','MKBHD-style · 2.1M views','linear-gradient(140deg,#232526,#414345)','9:21'],['OnePlus 11R in 2026 — still worth it?','TechBurner-ish · 890K views','linear-gradient(140deg,#c31432,#240b36)','14:05']];
  B.innerHTML=V.map(v=>`<div class="ytc"><div class="ytthumb" style="background:${v[2]}"><span>${v[3]}</span></div>
    <div class="ltx"><b>${v[0]}</b><p>${v[1]}</p></div></div>`).join('')+`<div class="webnote">Playback is simulated — AV1 hardware decode via SM8475 ✓</div>`;
  B.querySelectorAll('.ytc').forEach(c=>c.onclick=()=>toast('▶ Now playing… (simulated)'));
}
function renderGmail(B){
  const M=[['RisingOS CI','#ff6a88','Build #260826-2207 succeeded — artifacts ready','12:07'],['Google Play','#34a853','Security playbook: August updates','Wed'],['XDA Forums','#f57c00','Your thread “[ROM][16] RisingOS udon” has 4 new replies','Tue']];
  B.innerHTML=M.map(m=>`<div class="listrow"><div class="lavatar" style="background:${m[1]}">${m[0][0]}</div>
    <div class="ltx"><b>${m[0]}<span>${m[3]}</span></b><p>${m[2]}</p></div></div>`).join('');
}

/* ================================================= settings == */
function srow(icon,title,sub,onclick,extra){
  return `<div class="srow" ${onclick?`data-act="${onclick}"`:''}>
    <div class="sic">${icon}</div>
    <div class="stx"><b>${title}</b>${sub?`<p>${sub}</p>`:''}</div>
    ${extra||`<span class="schev">${I.chev}</span>`}
  </div>`;
}
function renderSettingsPage(page){
  $('#appTitle').textContent = ({root:'Settings', custom:'Customisations', about:'About phone', display:'Display', sound:'Sound & vibration'})[page]||'Settings';
  const B=$('#appbody');
  if(page==='root') return pageRoot(B);
  if(page==='custom') return pageCustom(B);
  if(page==='about') return pageAbout(B);
  if(page==='display') return pageDisplay(B);
  if(page==='sound') return pageSound(B);
  return pageGeneric(B,page);
}
function pageRoot(B){
  B.innerHTML=`<div class="sear">${I.search} Search settings</div>
  <div class="scard" style="margin-top:14px">
    ${srow(I.wifi,'Network & internet','Wi-Fi · Mobile · SIMs','net')}
    ${srow(I.link,'Connected devices','Bluetooth · Pairing','con')}
    ${srow(I.apps,'Apps','Recently opened apps','apps')}
    ${srow(I.bell,'Notifications','History · Conversations','notif')}
  </div>
  <div class="scard">
    ${srow(I.saver,'Battery','87% · about 14 h left','batt')}
    ${srow(I.bright,'Display','Dark theme · Refresh rate · 120 Hz','','')}
    ${srow(I.vol,'Sound & vibration','Ring mode · Dolby Atmos','','')}
  </div>
  <div class="scard">
    ${srow(I.shield,'Security & privacy','Screen lock · Fingerprint','sec')}
    ${srow(I.loc,'Location','On','loc')}
  </div>
  <div class="scard" style="border:1px solid ${S.accent}55">
    ${srow(I.sun,'Customisations','Themes · Status bar · Lock screen · QS','','')}
    ${srow(I.info,'About phone','RisingOS 9-Alpha · Android 16','','')}
  </div>`;
  const rows=B.querySelectorAll('.srow');
  // order: 0 net · 1 con · 2 apps · 3 notif · 4 batt · 5 display · 6 sound · 7 sec · 8 loc · 9 custom · 10 about
  rows[0].onclick=()=>navTo('net'); rows[1].onclick=()=>navTo('con'); rows[2].onclick=()=>navTo('apps'); rows[3].onclick=()=>navTo('notif');
  rows[4].onclick=()=>navTo('batt'); rows[5].onclick=()=>navTo('display'); rows[6].onclick=()=>navTo('sound');
  rows[7].onclick=()=>navTo('sec'); rows[8].onclick=()=>navTo('loc');
  rows[9].onclick=()=>navTo('custom'); rows[10].onclick=()=>navTo('about');
}
function seg(opts, cur, cb){
  return `<div class="seg">${opts.map(o=>`<button class="${o===cur?'on':''}" data-v="${o}">${o}</button>`).join('')}</div>`;
}
function wireSeg(container,cb){ container.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{ cb(b.dataset.v); }); }

let eggTaps=0, eggTimer;
function pageAbout(B){
  B.innerHTML=`
    <div class="bigabout">
      <div class="rsun"><svg width="46" height="46" viewBox="0 0 48 48"><defs><linearGradient id="asg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffb35c"/><stop offset=".6" stop-color="#ff6a88"/><stop offset="1" stop-color="#c99bf1"/></linearGradient></defs><circle cx="24" cy="28" r="11" fill="url(#asg)"/><path d="M6 40h36M24 12V6M10 20l-4-4M38 20l4-4" stroke="url(#asg)" stroke-width="3.2" stroke-linecap="round"/></svg></div>
      <h2>RisingOS 9-Alpha</h2><p>Rise up ☀️ · COMMUNITY build · GAPPS included</p>
    </div>
    <div class="scard">
      ${srow(I.info,'Device name','OnePlus 11R 5G')}
      ${srow(I.sim,'SIM status','Jio 5G · VoLTE active')}
      ${srow(I.gear,'Model &amp; hardware','CPH2487 · Snapdragon 8+ Gen 1 (SM8475)')}
    </div>
    <div class="scard">
      ${srow(I.apps,'Android version','16 (Baklava)',null,'<span class="sval">tap ×7 🥞</span>')}
      ${srow(I.shield,'Android security update','5 August 2026')}
      ${srow(I.rotate,'Google Play system update','1 August 2026')}
    </div>
    <div class="scard" style="border:1px solid ${S.accent}55">
      ${srow(I.sun,'RisingOS version','9-Alpha · 260826-2207')}
      ${srow(I.edit,'Build number','RisingOS-9-Alpha-260826-2207-GAPPS-COMMUNITY-udon')}
      ${srow(I.finger,'Build fingerprint','OnePlus/CPH2487/OP5961L1:16/BP2A.250605.015/T.R4T3.2e09920:user/release-keys')}
      ${srow(I.gear,'Kernel version','5.10-android16-9-gki · GKI + waipio/oplus fragments')}
      ${srow(I.dolby,'Audio &amp; camera','Dolby Atmos · OPlus Camera (OIS/EIS)')}
      ${srow(I.star,'Maintainer','Gokulgethu · Community build')}
    </div>
    <div class="subnote">Device image built from <b>Gokulgethu/oneplus11r-device-trees</b> · firmware base OxygenOS CPH2487_16.0.5.1002(EX01).</div>`;
  const rows=B.querySelectorAll('.srow');
  // order: 0 device · 1 sim · 2 model · 3 android · 4 security · 5 gplay · 6 rising ver · 7 build# · 8 fingerprint · 9 kernel · 10 audio · 11 maintainer
  rows[3].onclick=()=>{ // android version easter egg
    eggTaps++; clearTimeout(eggTimer); eggTimer=setTimeout(()=>eggTaps=0,1600);
    if(eggTaps<7) toast(`🥞 You are ${7-eggTaps} taps away from dessert…`);
    else { eggTaps=0; openEgg(); }
  };
  rows[6].onclick=()=>toast('RisingOS 9-Alpha · rise up ☀️');
  rows[11].onclick=()=>toast('github.com/Gokulgethu/oneplus11r-device-trees ❤️');
}
function optRow(icon,title,val,key,options){
  return `<div class="srow" data-opt="${key}">
    <div class="sic">${icon}</div>
    <div class="stx"><b>${title}</b></div>
    <span class="sval" id="val-${key}">${val}</span><span class="schev">${I.chev}</span>
  </div>`;
}
function pageCustom(B){
  B.innerHTML=`
    <div class="sect">Theme &amp; style</div>
    <div class="scard"><div class="pad16" style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:14px">Dark theme</b>
        <div class="seg" id="themeSeg"><button data-v="Light" class="${S.theme==='Light'?'on':''}">Light</button><button data-v="dark" class="${S.theme==='dark'?'on':''}">Dark</button></div></div>
      <div><b style="font-size:14px">Accent colour — RiseUI Monet</b>
        <div class="sws" id="accents" style="margin-top:10px">
          ${['#ff8a5c','#ff5d73','#a8c7fa','#8fd0a4','#c99bf1','#ffd35c'].map(c=>`<span class="sw ${S.accent===c?'on':''}" data-c="${c}" style="background:${c};--acc:${c}"></span>`).join('')}
        </div></div>
    </div></div>
    <div class="sect">Status bar</div>
    <div class="scard">
      ${optRow(I.clock,'Clock position',S.clockPos,'clockPos',['Left','Right','Hidden'])}
      ${optRow(I.saver,'Battery icon style',S.battStyle,'battStyle',['Portrait','Landscape','Circle','Hidden'])}
      <div class="srow"><div class="sic">${I.info}</div><div class="stx"><b>Battery percentage</b></div><button class="tgl ${S.battPct?'on':''}" id="tglPct"></button></div>
    </div>
    <div class="sect">Panels</div>
    <div class="scard">
      ${optRow(I.apps,'Quick settings style',S.qsStyle,'qsStyle',['Rising','Classic'])}
      ${optRow(I.power,'Power menu style',S.pmStyle,'pmStyle',['Rising','Android 12','Classic'])}
    </div>
    <div class="sect">Lock screen</div>
    <div class="scard">
      ${optRow(I.clock,'Lock screen clock',S.lockStyle,'lockStyle',['Rise default','Oxygen classic','Minimal'])}
      ${optRow(I.finger,'FOD fingerprint icon',S.fodIcon,'fodIcon',['Ripple','Energy','Cosmos'])}
      <div class="srow"><div class="sic">${I.moon}</div><div class="stx"><b>Ambient display (AOD)</b><p>Dim clock shown when screen is off</p></div><button class="tgl ${S.aod?'on':''}" id="tglAod"></button></div>
    </div>
    <div class="sect">Display &amp; hardware</div>
    <div class="scard">
      ${optRow(I.rotate,'Refresh rate',S.fps+' Hz','fps',['60','90','120'])}
      <div class="srow"><div class="sic">${I.game}</div><div class="stx"><b>Gaming mode</b><p>Performance profile · block calls while gaming</p></div><button class="tgl ${S.gaming?'on':''}" id="tglGame"></button></div>
      <div class="srow"><div class="sic">${I.dolby}</div><div class="stx"><b>Dolby Atmos</b><p>Dynamic · powered by SM8475 DSP</p></div><button class="tgl ${S.dolby?'on':''}" id="tglDolby"></button></div>
      <div class="srow"><div class="sic">${I.screen}</div><div class="stx"><b>Three-finger screenshot</b></div><button class="tgl ${S.tfs?'on':''}" id="tgl3f"></button></div>
      <div class="srow"><div class="sic">${I.alert}</div><div class="stx"><b>Alert slider</b><p>Try the physical switch on the left edge!</p></div><span class="sval" id="sliderState">${S.ringer}</span></div>
    </div>
    <div class="subnote">Every option above is <b>live</b> — changes apply to this virtual phone instantly, just like RisingOS's own Customisations app.</div>`;

  $('#themeSeg').querySelectorAll('button').forEach(b=>b.onclick=()=>{ setTheme(b.dataset.v); pageCustom(B); });
  $('#accents').querySelectorAll('.sw').forEach(s=>s.onclick=()=>{ setAccent(s.dataset.c); pageCustom(B); });
  const opts={clockPos:['Left','Right','Hidden'],battStyle:['Portrait','Landscape','Circle','Hidden'],qsStyle:['Rising','Classic'],pmStyle:['Rising','Android 12','Classic'],lockStyle:['Rise default','Oxygen classic','Minimal'],fodIcon:['Ripple','Energy','Cosmos'],fps:['60','90','120']};
  B.querySelectorAll('[data-opt]').forEach(r=>r.onclick=()=>{
    const k=r.dataset.opt;
    openSheet(r.querySelector('b').textContent, opts[k], S[k], v=>applyOpt(k,v));
  });
  $('#tglPct').onclick=function(){ S.battPct=!S.battPct; this.classList.toggle('on',S.battPct); save(); sb(); };
  $('#tglAod').onclick=function(){ S.aod=!S.aod; this.classList.toggle('on',S.aod); save(); toast(S.aod?'Ambient display on':'Ambient display off'); };
  $('#tglGame').onclick=function(){ S.gaming=!S.gaming; this.classList.toggle('on',S.gaming); save(); renderTiles(); toast(S.gaming?'🎮 Gaming mode on — FPS overlay enabled':'Gaming mode off'); };
  $('#tglDolby').onclick=function(){ S.dolby=!S.dolby; this.classList.toggle('on',S.dolby); save(); renderTiles(); toast(S.dolby?'Dolby Atmos — Dynamic profile':'Dolby Atmos off'); };
  $('#tgl3f').onclick=function(){ S.tfs=!S.tfs; this.classList.toggle('on',S.tfs); save(); };
}
function applyOpt(k,v){
  S[k]=v; save();
  if(k==='clockPos'||k==='battStyle') sb();
  if(k==='qsStyle') renderQS();
  if(k==='lockStyle') renderLockClock();
  if(k==='fodIcon') renderFod();
  if(k==='fps'){ document.documentElement.style.setProperty('--dur', v==='60'?'.42s':'.28s'); toast(`Refresh rate: ${v} Hz ${v==='120'?'· buttery ✨':v==='60'?'· power saving':''}`); }
  const val=$('#val-'+k); if(val) val.textContent=k==='fps'?v+' Hz':v;
}
function pageDisplay(B){
  B.innerHTML=`
    <div class="scard"><div class="srow"><div class="sic">${I.dark}</div><div class="stx"><b>Dark theme</b></div><button class="tgl ${S.theme==='dark'?'on':''}" id="tglDark2"></button></div></div>
    <div class="scard">
      ${optRow(I.rotate,'Refresh rate',S.fps+' Hz','fps',['60','90','120'])}
      <div class="pad16"><b style="font-size:14px">Brightness level</b>
        <div class="brightrow">${I.bright}<input type="range" id="bright2" min="15" max="100" value="${S.bright}"></div></div>
    </div>
    <div class="scard">
      <div class="srow"><div class="sic">${I.info}</div><div class="stx"><b>Resolution</b><p>1240 × 2772 · 450 ppi · HDR10+</p></div></div>
      <div class="srow"><div class="sic">${I.sun}</div><div class="stx"><b>Panel</b><p>6.74" AMOLED · 1B colours · 1,450 nits peak</p></div></div>
    </div>`;
  $('#tglDark2').onclick=function(){ setTheme(S.theme==='dark'?'Light':'dark'); this.classList.toggle('on',S.theme==='dark'); };
  const bs=$('#bright2'); bs.oninput=()=>setBright(+bs.value);
  bs.style.setProperty('--v',S.bright+'%');
  B.querySelectorAll('[data-opt]').forEach(r=>r.onclick=()=>openSheet('Refresh rate',['60','90','120'],S.fps,v=>{applyOpt('fps',v);pageDisplay(B);}));
}
function pageSound(B){
  B.innerHTML=`
    <div class="scard"><div class="pad16">
      <b style="font-size:14px">Ring mode — synced with alert slider</b>
      <div class="seg" id="ringSeg" style="margin-top:12px;width:100%">
        ${['Ring','Vibrate','Silent'].map(r=>`<button data-v="${r}" style="flex:1" class="${S.ringer===r?'on':''}">${r}</button>`).join('')}
      </div></div></div>
    <div class="scard"><div class="pad16"><b style="font-size:14px">Media volume</b>
      <div class="brightrow">${I.vol}<input type="range" id="vol2" min="0" max="100" value="${volume}"></div></div></div>
    <div class="scard">
      <div class="srow"><div class="sic">${I.dolby}</div><div class="stx"><b>Dolby Atmos</b><p>${S.dolby?'Dynamic':'Off'}</p></div><button class="tgl ${S.dolby?'on':''}" id="tglDolby2"></button></div>
      <div class="srow"><div class="sic">${I.vol}</div><div class="stx"><b>Dirac speaker tuning</b><p>Dual stereo speakers · AAC/LDAC/LHDC</p></div></div>
    </div>`;
  $('#ringSeg').querySelectorAll('button').forEach(b=>b.onclick=()=>{ setRinger(b.dataset.v); pageSound(B); });
  $('#vol2').oninput=e=>{volume=+e.target.value; e.target.style.setProperty('--v',volume+'%');};
  $('#vol2').style.setProperty('--v',volume+'%');
  $('#tglDolby2').onclick=function(){ S.dolby=!S.dolby; save(); this.classList.toggle('on',S.dolby); pageSound(B); toast(S.dolby?'Dolby Atmos on':'Dolby Atmos off'); renderTiles(); };
}
function pageGeneric(B,page){
  const T={net:'Network & internet',con:'Connected devices',apps:'Apps',notif:'Notifications',batt:'Battery',sec:'Security & privacy',loc:'Location'};
  B.innerHTML=`<div class="subnote" style="padding-top:26px">${I.info}<br><br>
    <b>${T[page]||'Settings'}</b> is part of the live simulation — on the real ROM this opens the full Android 16 page.
    Try <b>Customisations</b>, <b>Display</b>, <b>Sound</b> and <b>About phone</b> — those are fully interactive here.</div>
    <div class="scard">
      <div class="srow"><div class="sic">${I.check}</div><div class="stx"><b>Works on real build</b><p>Verified in RisingOS 9 bring-up checklist</p></div></div>
    </div>`;
}

/* ------------------------------------------------ options sheet --- */
function openSheet(title, options, current, cb){
  $('#sheetTitle').textContent=title;
  $('#sheetOpts').innerHTML=options.map(o=>`<div class="sopt ${o===current?'on':''}" data-v="${o}">${o}<span class="rd"></span></div>`).join('');
  $('#sheetscrim').classList.add('open'); $('#sheet').classList.add('open');
  $('#sheetOpts').querySelectorAll('.sopt').forEach(r=>r.onclick=()=>{ closeSheet(); cb(r.dataset.v); });
}
function closeSheet(){ $('#sheetscrim').classList.remove('open'); $('#sheet').classList.remove('open'); }
$('#sheetscrim').onclick=closeSheet;

/* ------------------------------------------------ quick settings --- */
function tilesData(){
  return [
    {k:'wifi', label:'Wi-Fi', ic:I.wifi, on:S.wifi, sub:()=>S.wifi?'OnePlus_5G':'Off', act(){S.wifi=!S.wifi; if(S.wifi&&S.airplane){S.airplane=false;} }},
    {k:'bt', label:'Bluetooth', ic:I.bt, on:S.bt, sub:()=>S.bt?'Buds 3 Pro':'Off', act(){S.bt=!S.bt;}},
    {k:'dnd', label:'Do Not Disturb', ic:I.moon, on:S.dnd, sub:()=>S.dnd?'On':'Off', act(){S.dnd=!S.dnd; toast(S.dnd?'🔕 DND on — notifications hidden':'DND off');}},
    {k:'torch', label:'Torch', ic:I.torch, on:S.torch, sub:()=>S.torch?'On':'Off', act(){S.torch=!S.torch; toast(S.torch?'🔦 Torch on':'Torch off');}},
    {k:'airplane', label:'Aeroplane mode', ic:I.plane, on:S.airplane, sub:()=>S.airplane?'On':'Off', act(){S.airplane=!S.airplane; if(S.airplane){S.wifi=false;S.bt=false;} }},
    {k:'saver', label:'Battery Saver', ic:I.saver, on:S.saver, sub:()=>'87% left', act(){S.saver=!S.saver; toast(S.saver?'🔋 Battery Saver on':'Battery Saver off');}},
    {k:'dark', label:'Dark theme', ic:I.dark, on:S.theme==='dark', sub:()=>S.theme==='dark'?'On':'Off', act(){setTheme(S.theme==='dark'?'Light':'dark');}},
    {k:'rotate', label:'Auto-rotate', ic:I.rotate, on:S.rotate, sub:()=>S.rotate?'On':'Off', act(){S.rotate=!S.rotate;}},
    ...(S.gaming?[{k:'gaming', label:'Gaming mode', ic:I.game, on:true, sub:()=>'FPS overlay on', act(){S.gaming=false; toast('Gaming mode off'); renderTiles();}}]:[]),
    ...(S.dolby?[{k:'dolby', label:'Dolby Atmos', ic:I.dolby, on:true, sub:()=>'Dynamic', act(){S.dolby=false; toast('Dolby Atmos off'); renderTiles(); }}]:[]),
  ];
}
function renderTiles(){
  const grid=$('#tiles');
  grid.innerHTML=tilesData().map((t,i)=>`<button class="tile ${t.on?'on':''}" data-i="${i}">
    <span class="ti">${t.ic}</span><span><b>${t.label}</b><span>${t.sub()}</span></span></button>`).join('');
  grid.querySelectorAll('.tile').forEach(el=>el.onclick=()=>{
    const t=tilesData()[+el.dataset.i]; t.act(); save(); sb(); renderTiles();
  });
}
function renderQS(){
  $('#qs').classList.toggle('classic', S.qsStyle==='Classic');
  renderTiles();
}
let qsOpen=false;
function openQS(){ if(!powered)return; qsOpen=true; $('#qsscrim').classList.add('open'); $('#qs').classList.add('open'); }
function closeQS(){ qsOpen=false; $('#qsscrim').classList.remove('open'); $('#qs').classList.remove('open'); }
$('#qsscrim').onclick=closeQS;

/* qs header icons */
function qsHeader(){
  $('#qsIcons').innerHTML=`<button id="qsEdit">${I.edit}</button><button id="qsPower">${I.power}</button><button id="qsSet">${I.gear}</button>`;
  $('#qsEdit').onclick=()=>toast('Tile editor — simulated');
  $('#qsPower').onclick=()=>{ closeQS(); openPM(); };
  $('#qsSet').onclick=()=>{ closeQS(); openApp('settings'); };
  $('#bsun').innerHTML=I.bright;
}

/* ------------------------------------------------ theme/accent/brightness --- */
function setTheme(t){
  S.theme=t==='Light'?'Light':'dark'; $('#screen').dataset.theme=S.theme; save(); renderTiles(); sb();
  const tb=$('#tbTheme'); if(tb) tb.textContent = S.theme==='dark' ? '🌙 Theme' : '☀️ Theme';
}
function setAccent(c){ S.accent=c; document.documentElement.style.setProperty('--accent',c); save(); }
function setBright(v){ S.bright=v; $('#screen').style.setProperty('--bright',(0.55+v/100*0.45).toFixed(2)); $('#bright').value=v; const b2=$('#bright2'); if(b2){b2.value=v;b2.style.setProperty('--v',v+'%');} $('#bright').style.setProperty('--v',v+'%'); save(); }

/* ------------------------------------------------ power menu --- */
function openPM(){
  if(!powered)return;
  const pm=$('#pm');
  pm.className='pm open pm-'+(S.pmStyle==='Android 12'?'a12':S.pmStyle==='Classic'?'classic':'rising');
  pm.innerHTML=(S.pmStyle==='Rising'?'<h3>Power menu · Rising style</h3>':'')+`
    <button class="pmb hot" data-a="restart">${I.rotate} Restart</button>
    <button class="pmb" data-a="off">${I.power} Power off</button>
    <button class="pmb" data-a="shot">${I.screen} Screenshot</button>
    <button class="pmb" data-a="sos">${I.bell} Emergency</button>`;
  $('#pmscrim').classList.add('open');
  pm.querySelectorAll('.pmb').forEach(b=>b.onclick=()=>pmAction(b.dataset.a));
}
function closePM(){ $('#pmscrim').classList.remove('open'); $('#pm').classList.remove('open'); }
$('#pmscrim').onclick=closePM;
function pmAction(a){
  closePM();
  if(a==='restart'){ toast('Restarting…'); setTimeout(rebootSim,500); }
  if(a==='off'){ screenOff(true); }
  if(a==='shot'){ const f=$('#flash'); f.classList.add('go'); setTimeout(()=>f.classList.remove('go'),200); toast(S.tfs?'Screenshot saved to Pictures/Screenshots ✓':'Screenshot saved ✓'); }
  if(a==='sos'){ toast('Emergency SOS — simulated 🚨'); }
}
function rebootSim(){
  powered=true; unlocked=false; closeApp(); closeDrawer(); closeQS(); closeSheet();
  $('#off').classList.add('hidden'); $('#lock').classList.remove('hidden','away');
  showBoot(()=>$('#lock').classList.remove('hidden','away'));
}
function screenOff(full){
  powered=false; closeQS(); closePM(); closeDrawer();
  const off=$('#off');
  off.querySelector('.at').style.display = S.aod?'':'none';
  off.querySelector('.ad').style.display = S.aod?'':'none';
  off.querySelector('.hint').textContent = full?'Device is off · press & hold the power key':'Press the power key to wake';
  off.classList.remove('hidden');
}
function wake(){
  powered=true; $('#off').classList.add('hidden');
  if(!unlocked){ $('#lock').classList.remove('hidden','away'); tick(); }
}

/* ------------------------------------------------ volume + slider --- */
let volT;
function pokeVol(d){
  volume=Math.max(0,Math.min(100,volume+d));
  const p=$('#volpanel');
  $('#vfill').style.height=volume+'%'; $('#vnum').textContent=volume;
  $('#volIco').innerHTML = volume===0?I.volx:I.vol;
  p.style.opacity=1; clearTimeout(volT); volT=setTimeout(()=>p.style.opacity=0,2200);
}
function setRinger(r){
  S.ringer=r; save();
  $('#slider').className='slider m-'+(r==='Ring'?'ring':r==='Vibrate'?'vib':'silent');
  const ss=$('#sliderState'); if(ss) ss.textContent=r;
  sb();
  const ico=r==='Silent'?'🔕':r==='Vibrate'?'📳':'🔔';
  toast(`${ico} ${r} mode — alert slider`);
}
$('#slider').onclick=()=>{ setRinger(S.ringer==='Ring'?'Vibrate':S.ringer==='Vibrate'?'Silent':'Ring'); };
$('#volUp').onclick=()=>powered&&pokeVol(+8);
$('#volDn').onclick=()=>powered&&pokeVol(-8);

/* ------------------------------------------------ lock extras --- */
function renderLockClock(){
  const lc=$('#lockClock');
  lc.className='lc'+(S.lockStyle==='Oxygen classic'?' lc-alt':S.lockStyle==='Minimal'?' lc-min':'');
}
$('#lockTorch').innerHTML=I.torch; $('#lockCam').innerHTML=I.camera;
$('#lockTorch').onclick=e=>{e.stopPropagation(); S.torch=!S.torch; save(); renderTiles(); toast(S.torch?'🔦 Torch on':'Torch off'); $('#lockTorch').style.color=S.torch?S.accent:'#fff';};
$('#lockCam').onclick=e=>{e.stopPropagation(); unlock(); setTimeout(()=>openApp('camera'),350);};

/* fod hold-to-unlock */
let fodHold;
$('#fod').addEventListener('pointerdown',e=>{
  e.stopPropagation();
  $('#fod').classList.add('hold');
  fodHold=setTimeout(()=>{ $('#fod').classList.remove('hold'); unlock(); },680);
});
['pointerup','pointerleave','pointercancel'].forEach(ev=>$('#fod').addEventListener(ev,()=>{ clearTimeout(fodHold); $('#fod').classList.remove('hold'); }));

/* ------------------------------------------------ easter egg --- */
function openEgg(){ $('#egg').classList.remove('hidden'); }
$('#egg').onclick=()=>$('#egg').classList.add('hidden');

/* ------------------------------------------------ power key --- */
let pwrTimer, pwrHeld=false;
$('#powerBtn').addEventListener('pointerdown',()=>{
  pwrHeld=false;
  pwrTimer=setTimeout(()=>{ pwrHeld=true; if(powered) openPM(); else { /* long-press while off = power on */ $('#off').classList.add('hidden'); showBoot(()=>{powered=true; lockScreen();}); } },650);
});
['pointerup','pointerleave'].forEach(ev=>$('#powerBtn').addEventListener(ev,()=>{
  clearTimeout(pwrTimer);
  if(pwrHeld) return;
  /* short press: sleep / wake */
  if(powered){ screenOff(false); }
  else wake();
}));

/* ------------------------------------------------ gestures --- */
function drag(el,cb){
  el.addEventListener('pointerdown',e=>{
    const y=e.clientY;
    const mv=ev=>{ cb(ev.clientY-y, ev); };
    const up=()=>{ document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up); };
    document.addEventListener('pointermove',mv);
    document.addEventListener('pointerup',up);
  });
}
/* bottom gesture pill: swipe-up = drawer/home · tap = back */
drag($('#ghit'),(dy,orig)=>{
  if(dy===null) return;
  if(!powered) return;
  if(dy<-24){
    closeQS();
    if(curApp) closeApp();
    else if(!drawerOpen) openDrawer();
  }
  if(dy>24 && drawerOpen) closeDrawer();
});
$('#statusbar').addEventListener('pointerdown',()=>{
  const up=()=>{ document.removeEventListener('pointerup',up); qsOpen ? closeQS() : openQS(); };
  document.addEventListener('pointerup',up);
});
/* lock swipe up */
drag($('#lock'),dy=>{ if(dy!==null&&dy<-46) unlock(); });
/* qs swipe up to close */
drag($('#qs'),dy=>{ if(dy!==null&&dy<-30) closeQS(); });
/* drawer swipe down to close */
drag($('#drawer'),dy=>{ if(dy!==null&&dy>40) closeDrawer(); });

/* ------------------------------------------------ media + brightness widget --- */
$('#mediaPlay').onclick=function(){ S.playing=!S.playing; this.innerHTML=S.playing?I.pause:I.play; save(); };

/* ------------------------------------------------ toolbar (AI-Studio style) --- */
$('#tbInfo').onclick=()=>$('#specPanel').classList.toggle('open');
$('#panelClose').onclick=()=>$('#specPanel').classList.remove('open');
$('#tbTour').onclick=()=>{ tStep=0; renderTour(); $('#tour').classList.remove('hidden'); };
$('#tbTheme').onclick=()=>setTheme(S.theme==='dark'?'Light':'dark');
$('#tbReboot').onclick=()=>{ if(powered){ toast('Restarting…'); setTimeout(rebootSim,400);} else { $('#off').classList.add('hidden'); showBoot(()=>{powered=true;lockScreen();}); } };
$('#tbPower').onclick=()=>{
  if(powered) openPM();
  else { $('#off').classList.add('hidden'); showBoot(()=>{powered=true;lockScreen();}); }
};

/* ------------------------------------------------ tour --- */
const TOUR=[
  ['☀️ Welcome to RisingOS 9','This simulator recreates your <b>RisingOS-9-Alpha-260826-2207-GAPPS-COMMUNITY-udon</b> build. Boot → unlock → explore. Every panel you see matches the real ROM\'s behaviour on the OnePlus 11R (udon).'],
  ['🔒 Optical fingerprint unlock','On the lock screen, <b>press and hold the fingerprint icon</b> — placed exactly where your tree defines it (FOD pos 445×2200). The icon glows like the real FOD sensor firing up. Swiping up works too.'],
  ['🌞 Quick settings + power menu','Pull down from the top for the new <b>RisingOS toggle-style QS panel</b> with live tiles. <b>Long-press the power key</b> for the power menu — style it in Customisations (Rising / Android 12 / Classic, from the v7+ feature set).'],
  ['🎚️ Hardware: alert slider','Click the <b>slider above the volume keys</b> (left edge) — it cycles Ring → Vibrate → Silent, just like the physical OnePlus slider wired through the KeyHandler in your common.mk.'],
  ['🎨 RiseUI customisations','Open the <b>Customise</b> app: accent colours, status-bar clock, battery styles, lock clocks, FOD icons, refresh rate, Gaming mode and Dolby Atmos — every switch visibly changes this phone.'],
  ['🥞 One last thing…','Settings → About phone shows your real build fingerprint, kernel and OTA metadata. Tap <b>Android version ×7</b> for the Android 16 “Baklava” easter egg. Enjoy the build! 🔥'],
];
let tStep=0;
function renderTour(){
  $('#tTitle').innerHTML=TOUR[tStep][0]; $('#tText').innerHTML=TOUR[tStep][1];
  $('#tDots').innerHTML=TOUR.map((_,i)=>`<i class="${i===tStep?'on':''}"></i>`).join('');
  $('#tNext').textContent=tStep===TOUR.length-1?'Done ✓':'Next →';
}
$('#tourBtn').onclick=()=>{ tStep=0; renderTour(); $('#tour').classList.remove('hidden'); };
$('#tClose').onclick=()=>$('#tour').classList.add('hidden');
$('#tNext').onclick=()=>{ if(tStep<TOUR.length-1){tStep++; renderTour();} else $('#tour').classList.add('hidden'); };

/* ------------------------------------------------ fit & init --- */
function fit(){
  const st=$('.stage'); const s=Math.min((st.clientWidth-30)/400,(st.clientHeight-30)/894,1.12);
  $('#scaler').style.transform=`scale(${Math.max(s,.42)})`;
}
addEventListener('resize',fit);

(function init(){
  setTheme(S.theme); setAccent(S.accent); setBright(S.bright);
  renderLockClock(); renderLockClock(); renderFod(); sb(); renderQS(); qsHeader();
  $('#mediaPlay').innerHTML=S.playing?I.pause:I.play;
  $('#bright').oninput=e=>{setBright(+e.target.value); e.target.style.setProperty('--v',e.target.value+'%');};
  $('#bright').style.setProperty('--v',S.bright+'%');
  $('#slider').className='slider m-'+(S.ringer==='Ring'?'ring':S.ringer==='Vibrate'?'vib':'silent');
  buildLauncher(); tick(); setInterval(tick,1000); fit();
  $('#lock').classList.add('hidden');
  showBoot(()=>{ lockScreen(); });
})();
