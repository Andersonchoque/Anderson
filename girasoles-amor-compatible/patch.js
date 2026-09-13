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

// ===== Música fiable para Android: Coldplay - Yellow (YouTube oficial) =====
// Se precarga el reproductor antes de habilitar el botón. Así el toque del usuario
// inicia música y animación al mismo tiempo y Chrome no bloquea el sonido.
let ytPlayer=null;
let ytReady=false;
let stopTimer=null;
const startBtn=document.getElementById('start');
startBtn.disabled=true;
startBtn.textContent='Cargando música…';
startBtn.style.opacity='.65';

const ytHolder=document.createElement('div');
ytHolder.id='yt-player';
ytHolder.style.cssText='position:fixed;width:2px;height:2px;left:-20px;top:-20px;opacity:.01;pointer-events:none;overflow:hidden;';
document.body.appendChild(ytHolder);

window.onYouTubeIframeAPIReady=function(){
  ytPlayer=new YT.Player('yt-player',{
    width:'2',height:'2',
    videoId:'yKNxeF4KMsY',
    playerVars:{
      autoplay:0,
      controls:0,
      disablekb:1,
      fs:0,
      playsinline:1,
      rel:0,
      start:0,
      origin:location.origin
    },
    events:{
      onReady:function(){
        ytReady=true;
        try{ytPlayer.setVolume(72);ytPlayer.unMute();}catch(e){}
        startBtn.disabled=false;
        startBtn.textContent='Comenzar 💛';
        startBtn.style.opacity='1';
      },
      onError:function(){
        startBtn.disabled=false;
        startBtn.textContent='Comenzar 💛';
        startBtn.style.opacity='1';
      }
    }
  });
};

(function loadYT(){
  const s=document.createElement('script');
  s.src='https://www.youtube.com/iframe_api';
  s.async=true;
  document.head.appendChild(s);
})();

function playYellowFromStart(){
  if(!ytReady||!ytPlayer)return false;
  try{
    ytPlayer.unMute();
    ytPlayer.setVolume(72);
    ytPlayer.seekTo(0,true);
    ytPlayer.playVideo();
    muted=false;
    soundBtn.textContent='♪';
    clearTimeout(stopTimer);
    stopTimer=setTimeout(()=>{try{ytPlayer.pauseVideo();}catch(e){}},99000);
    return true;
  }catch(e){return false;}
}

function startExperienceWithMusic(){
  if(!ytReady){
    startBtn.textContent='Espera un momento…';
    return;
  }
  playYellowFromStart();
  gate.style.display='none';
  started=true;
  startTime=performance.now();
  cap.style.opacity=0;
  requestAnimationFrame(frame);
}

startBtn.onclick=startExperienceWithMusic;
gate.onclick=e=>{if(e.target===gate&&!startBtn.disabled)startExperienceWithMusic()};

soundBtn.onclick=()=>{
  muted=!muted;
  soundBtn.textContent=muted?'×':'♪';
  if(!ytPlayer)return;
  try{
    if(muted)ytPlayer.mute();
    else{ytPlayer.unMute();ytPlayer.setVolume(72);if(started)ytPlayer.playVideo();}
  }catch(e){}
};

replay.onclick=()=>{
  startTime=performance.now();
  cap.style.opacity=0;
  if(ytPlayer){
    try{
      ytPlayer.seekTo(0,true);
      if(muted)ytPlayer.mute(); else{ytPlayer.unMute();ytPlayer.setVolume(72);}
      ytPlayer.playVideo();
      clearTimeout(stopTimer);
      stopTimer=setTimeout(()=>{try{ytPlayer.pauseVideo();}catch(e){}},99000);
    }catch(e){}
  }
};
