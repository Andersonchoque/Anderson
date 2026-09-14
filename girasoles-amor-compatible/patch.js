// Corrección mínima: conserva intacta la versión verde original y solo tapa los huecos del fondo.
function drawFarGapFill(t,horizon,path){
  const rows=[
    {y:7,size:8,step:18,seed:12000},
    {y:18,size:10,step:20,seed:13000},
    {y:31,size:12,step:22,seed:14000}
  ];
  for(const row of rows){
    let n=0;
    for(let px=2;px<W;px+=row.step){
      if(px>path.topL-10&&px<path.topR+10){n++;continue;}
      const jitter=(rand(row.seed+n)-.5)*7;
      const py=horizon+row.y+(rand(row.seed+500+n)-.5)*6;
      const s=(row.size+rand(row.seed+900+n)*3.5)*(W/390);
      const wind=Math.sin(t*1.2+n*.6)*.07;
      flower(px+jitter,py,s,.97,wind,.94);
      n++;
    }
  }
}

drawField=function(t){
  const walk=range(t,23,72)*70,horizon=H*.43;
  sky(t);drawGreenGround(horizon);
  let path=drawPath(horizon,walk);
  drawGroundPlants(t,walk,horizon,path);
  drawFarGapFill(t,horizon,path);
  let visible=[];
  for(const f of field){
    let z=f.z-walk;if(z<1||z>65)continue;
    let sc=Math.min(1.7,6/z),center=W*.5+Math.sin((walk+z)*.05)*W*.025,
        px=center+f.side*(W*(.06+f.lane*.06))*sc,
        py=horizon+(H-horizon)*Math.pow(1-z/65,1.55),
        size=(20+f.h*28)*sc*(W/390);
    visible.push({z,px,py,size,f});
  }
  visible.sort((a,b)=>b.z-a.z);
  for(const q of visible){
    let open=.72+.28*smooth(range(9-q.z,0,8)),w=Math.sin(t*1.7+q.f.seed)*.18;
    flower(q.px,q.py,q.size,open,w,clamp(1-(q.z-52)/15));
  }
};

// ===== COLDPLAY - YELLOW LOCAL =====
// La música está guardada dentro del propio proyecto. No usa YouTube ni iframes.
const startBtn=document.getElementById('start');
let yellowAudio=null;
let yellowReady=false;
let yellowObjectURL=null;

startBtn.disabled=true;
startBtn.textContent='Cargando música…';
startBtn.style.opacity='.65';

async function loadYellowLocal(){
  try{
    const paths=[
      './audio/y2-part00.b64',
      './audio/y2-part01.b64',
      './audio/y2-part02.b64',
      './audio/y2-part03a.b64',
      './audio/y2-part03b.b64',
      './audio/y2-part04.b64',
      './audio/y2-part05.b64'
    ];
    const parts=await Promise.all(paths.map(async p=>{
      const r=await fetch(p,{cache:'no-store'});
      if(!r.ok)throw new Error('No se pudo cargar '+p);
      return (await r.text()).replace(/\s+/g,'');
    }));
    const b64=parts.join('');
    const raw=atob(b64);
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    const blob=new Blob([bytes],{type:'audio/ogg'});
    yellowObjectURL=URL.createObjectURL(blob);
    yellowAudio=new Audio(yellowObjectURL);
    yellowAudio.preload='auto';
    yellowAudio.setAttribute('playsinline','');
    yellowAudio.volume=.92;
    yellowAudio.load();

    const ready=()=>{
      if(yellowReady)return;
      yellowReady=true;
      startBtn.disabled=false;
      startBtn.textContent='Comenzar 💛';
      startBtn.style.opacity='1';
      hint.textContent='Música lista ♪';
    };
    yellowAudio.addEventListener('canplay',ready,{once:true});
    yellowAudio.addEventListener('loadeddata',ready,{once:true});
    yellowAudio.addEventListener('error',()=>{
      startBtn.disabled=false;
      startBtn.textContent='Comenzar 💛';
      startBtn.style.opacity='1';
      hint.textContent='Toca ♪ si no escuchas la música';
    },{once:true});
    setTimeout(ready,2200);
  }catch(err){
    console.error('Yellow local:',err);
    startBtn.disabled=false;
    startBtn.textContent='Comenzar 💛';
    startBtn.style.opacity='1';
    hint.textContent='Toca ♪ si no escuchas la música';
  }
}
loadYellowLocal();

function playYellow(reset){
  if(!yellowAudio)return;
  try{
    if(reset){yellowAudio.pause();yellowAudio.currentTime=0;}
    yellowAudio.muted=false;
    yellowAudio.volume=.92;
    const p=yellowAudio.play();
    if(p&&p.catch)p.catch(()=>{
      hint.textContent='Toca ♪ para activar la música';
      hint.style.opacity=.95;
    });
    muted=false;
    soundBtn.textContent='♪';
  }catch(e){console.warn(e);}
}

function startExperienceWithYellow(){
  if(startBtn.disabled)return;
  // Se ejecuta dentro del mismo toque del usuario para cumplir la política de Android/Chrome.
  playYellow(true);
  gate.style.display='none';
  started=true;
  startTime=performance.now();
  cap.style.opacity=0;
  requestAnimationFrame(frame);
}

startBtn.onclick=startExperienceWithYellow;
gate.onclick=e=>{if(e.target===gate&&!startBtn.disabled)startExperienceWithYellow();};

soundBtn.onclick=()=>{
  if(!yellowAudio)return;
  if(yellowAudio.muted||yellowAudio.paused){
    yellowAudio.muted=false;muted=false;soundBtn.textContent='♪';
    const p=yellowAudio.play();if(p&&p.catch)p.catch(()=>{});
  }else{
    yellowAudio.muted=true;muted=true;soundBtn.textContent='×';
  }
};

replay.onclick=()=>{
  startTime=performance.now();cap.style.opacity=0;
  if(yellowAudio){
    yellowAudio.pause();yellowAudio.currentTime=0;yellowAudio.muted=muted;
    const p=yellowAudio.play();if(p&&p.catch)p.catch(()=>{});
  }
};

window.addEventListener('pagehide',()=>{if(yellowObjectURL)URL.revokeObjectURL(yellowObjectURL);});
