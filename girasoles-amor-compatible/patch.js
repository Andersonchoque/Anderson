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
  sky(t);
  drawGreenGround(horizon);
  let path=drawPath(horizon,walk);
  drawGroundPlants(t,walk,horizon,path);
  drawFarGapFill(t,horizon,path);

  let visible=[];
  for(const f of field){
    let z=f.z-walk;
    if(z<1||z>65)continue;
    let sc=Math.min(1.7,6/z),
        center=W*.5+Math.sin((walk+z)*.05)*W*.025,
        px=center+f.side*(W*(.06+f.lane*.06))*sc,
        py=horizon+(H-horizon)*Math.pow(1-z/65,1.55),
        size=(20+f.h*28)*sc*(W/390);
    visible.push({z,px,py,size,f});
  }
  visible.sort((a,b)=>b.z-a.z);
  for(const q of visible){
    let open=.72+.28*smooth(range(9-q.z,0,8)),
        w=Math.sin(t*1.7+q.f.seed)*.18;
    flower(q.px,q.py,q.size,open,w,clamp(1-(q.z-52)/15));
  }
};

// Música sincronizada: Yellow comienza exactamente cuando se inicia la experiencia.
const musicTrack=new Audio('https://raw.githubusercontent.com/Andersonchoque/Anderson/yellow-audio/girasoles-amor-compatible/yellow-sync.mp3');
musicTrack.preload='auto';
musicTrack.volume=.72;
musicTrack.playsInline=true;

// Sustituye el sonido ambiental anterior por la canción elegida.
audioStart=function(){
  try{
    musicTrack.pause();
    musicTrack.currentTime=0;
    musicTrack.muted=false;
    muted=false;
    soundBtn.textContent='♪';
    const playPromise=musicTrack.play();
    if(playPromise&&playPromise.catch)playPromise.catch(()=>{});
  }catch(e){}
};

// El botón de sonido controla únicamente la canción.
soundBtn.onclick=()=>{
  muted=!muted;
  musicTrack.muted=muted;
  soundBtn.textContent=muted?'×':'♪';
  if(!muted&&musicTrack.paused&&started){
    const p=musicTrack.play();
    if(p&&p.catch)p.catch(()=>{});
  }
};

// Repetir reinicia música y animación juntas.
replay.onclick=()=>{
  startTime=performance.now();
  cap.style.opacity=0;
  try{
    musicTrack.currentTime=0;
    if(!muted){const p=musicTrack.play();if(p&&p.catch)p.catch(()=>{});}
  }catch(e){}
};

// Si el navegador recupera la pestaña después de una pausa larga, mantenemos la música cercana al tiempo visual.
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&started&&!muted){
    const visualTime=Math.min(99,(performance.now()-startTime)/1000);
    if(Math.abs(musicTrack.currentTime-visualTime)>2.5){
      try{musicTrack.currentTime=visualTime}catch(e){}
    }
    const p=musicTrack.play();if(p&&p.catch)p.catch(()=>{});
  }
});
