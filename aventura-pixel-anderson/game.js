(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const startScreen = document.getElementById('startScreen');
  const pauseScreen = document.getElementById('pauseScreen');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const winScreen = document.getElementById('winScreen');
  const messageScreen = document.getElementById('messageScreen');
  const messageBadge = document.getElementById('messageBadge');
  const messageTitle = document.getElementById('messageTitle');
  const messageText = document.getElementById('messageText');
  const messageBtn = document.getElementById('messageBtn');
  const finalScore = document.getElementById('finalScore');
  const soundBtn = document.getElementById('soundBtn');

  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = 440;
  const keys = { left:false, right:false, jump:false };

  let state = 'menu';
  let levelIndex = 0;
  let score = 0;
  let lives = 3;
  let heartsCollected = 0;
  let soundOn = true;
  let audioCtx = null;
  let cameraX = 0;
  let last = performance.now();
  let checkpointX = 80;
  let levelRuntime = null;
  let levelTime = 0;
  let objectiveFlash = 0;
  let respawnFlash = 0;

  const player = {
    x:80, y:GROUND_Y-48, w:30, h:48,
    vx:0, vy:0, onGround:false, facing:1,
    invuln:0, walkTime:0,
    coyote:0, jumpBuffer:0,
    standingMover:null
  };

  const LEVELS = [
    {
      name:'Nivel 1 · Camino de Flores', sky:'#87d4fb', hills:'#76a86b', accent:'#62be62',
      worldWidth:3900, spawn:{x:80}, goalX:3700, time:95, requiredHearts:7,
      ground:[[0,930],[1060,650],[1840,570],[2520,620],[3290,610]],
      platforms:[[350,350,135,22],[610,295,105,22],[870,335,90,22],[1130,325,110,22],[1370,270,90,22],[1600,330,105,22],[1930,315,115,22],[2180,260,90,22],[2410,335,90,22],[2610,285,105,22],[2870,230,90,22],[3140,315,110,22],[3420,260,90,22]],
      hearts:[[405,310],[655,255],[905,295],[1180,285],[1415,230],[1650,290],[1980,275],[2225,220],[2655,245],[2915,190],[3185,275],[3465,220]],
      enemies:[[760,408,120,70],[1260,408,120,75],[2000,408,130,80],[2710,408,125,82],[3480,408,110,88]],
      checkpoints:[1780,3160],
      movers:[[980,315,80,18,75,0],[1730,300,80,18,0,60],[2440,260,82,18,85,0],[3220,245,82,18,0,65]],
      spikes:[[520,GROUND_Y,70],[1480,GROUND_Y,80],[2300,GROUND_Y,70],[3010,GROUND_Y,85]],
      crumble:[[740,250,78,18],[1780,220,78,18],[3070,190,78,18]]
    },
    {
      name:'Nivel 2 · Noche de Estrellas', sky:'#172447', hills:'#2c4254', accent:'#365a48',
      worldWidth:4300, spawn:{x:80}, goalX:4080, time:88, requiredHearts:8,
      ground:[[0,760],[900,540],[1590,620],[2350,500],[3000,520],[3690,610]],
      platforms:[[280,335,95,22],[510,275,88,22],[720,220,80,22],[980,330,100,22],[1210,260,86,22],[1440,205,78,22],[1700,330,100,22],[1940,270,82,22],[2190,215,76,22],[2440,325,90,22],[2690,255,82,22],[2920,205,76,22],[3090,330,95,22],[3370,270,84,22],[3600,210,76,22],[3830,315,100,22]],
      hearts:[[330,295],[550,235],[760,180],[1025,290],[1250,220],[1480,165],[1745,290],[1980,230],[2230,175],[2485,285],[2730,215],[2960,165],[3135,290],[3410,230],[3640,170],[3880,275]],
      enemies:[[620,408,120,82],[1100,408,120,88],[1770,408,130,92],[2490,408,110,95],[3150,408,130,100],[3860,408,115,105]],
      checkpoints:[2120,3510],
      movers:[[820,295,76,18,0,75],[1510,290,76,18,80,0],[2280,275,78,18,0,80],[2860,300,78,18,90,0],[3650,275,78,18,0,85]],
      spikes:[[390,GROUND_Y,75],[1320,GROUND_Y,75],[2050,GROUND_Y,90],[2790,GROUND_Y,85],[3440,GROUND_Y,85]],
      crumble:[[610,185,72,18],[1880,190,72,18],[2570,180,72,18],[3490,165,72,18]]
    },
    {
      name:'Nivel 3 · Jardín del Corazón', sky:'#ffb6d5', hills:'#bf6c91', accent:'#6fc476',
      worldWidth:4800, spawn:{x:80}, goalX:4540, time:82, requiredHearts:10,
      ground:[[0,690],[850,500],[1500,520],[2180,500],[2830,480],[3470,500],[4120,680]],
      platforms:[[260,340,90,22],[480,285,80,22],[690,225,72,22],[920,330,88,22],[1120,260,76,22],[1330,205,70,22],[1580,325,88,22],[1790,250,74,22],[2010,195,68,22],[2260,330,86,22],[2470,255,72,22],[2680,200,68,22],[2910,325,85,22],[3120,250,72,22],[3330,195,66,22],[3550,330,85,22],[3770,250,72,22],[3980,190,66,22],[4210,320,90,22],[4430,250,78,22]],
      hearts:[[305,300],[520,245],[725,185],[965,290],[1160,220],[1365,165],[1625,285],[1830,210],[2045,155],[2305,290],[2510,215],[2715,160],[2955,285],[3160,210],[3365,155],[3595,290],[3810,210],[4015,150],[4255,280],[4470,210]],
      enemies:[[560,408,110,90],[980,408,120,95],[1650,408,120,100],[2310,408,110,105],[2960,408,120,110],[3610,408,120,115],[4300,408,120,120]],
      checkpoints:[2050,3970],
      movers:[[760,305,72,18,0,82],[1420,290,72,18,85,0],[2110,285,72,18,0,88],[2760,280,72,18,90,0],[3400,275,72,18,0,92],[4060,270,72,18,95,0]],
      spikes:[[370,GROUND_Y,80],[1220,GROUND_Y,85],[1880,GROUND_Y,90],[2550,GROUND_Y,90],[3210,GROUND_Y,90],[3890,GROUND_Y,90]],
      crumble:[[580,190,68,18],[1260,160,68,18],[1920,150,68,18],[2600,155,68,18],[3270,150,68,18],[3950,145,68,18]],
      final:true
    }
  ];

  function cloneLevel(src){
    return {
      ...src,
      hearts:src.hearts.map(([x,y])=>({x,y,r:11,taken:false,bob:Math.random()*6.28})),
      enemies:src.enemies.map(([x,y,range,speed=80])=>({x,y,w:32,h:30,startX:x,range,vx:speed,alive:true})),
      checkpoints:src.checkpoints.map(x=>({x,active:false})),
      movers:src.movers.map(([x,y,w,h,dx,dy])=>({x,y,w,h,baseX:x,baseY:y,dx,dy,t:Math.random()*6.28,prevX:x,prevY:y})),
      spikes:(src.spikes||[]).map(([x,y,w])=>({x,y,w,h:16})),
      crumble:(src.crumble||[]).map(([x,y,w,h])=>({x,y,w,h,state:'solid',timer:0,alpha:1}))
    };
  }

  function startLevel(i){
    levelIndex=i;
    levelRuntime=cloneLevel(LEVELS[i]);
    checkpointX=levelRuntime.spawn.x;
    levelTime=levelRuntime.time;
    objectiveFlash=0;
    respawnFlash=0;
    player.x=levelRuntime.spawn.x;
    player.y=GROUND_Y-player.h;
    player.vx=0;player.vy=0;player.invuln=0;player.onGround=true;
    player.coyote=.1;player.jumpBuffer=0;player.standingMover=null;
    cameraX=0;state='playing';hideAllOverlays();tone(440,.05);
  }

  function newGame(){score=0;lives=3;heartsCollected=0;startLevel(0)}
  function hideAllOverlays(){[startScreen,pauseScreen,gameOverScreen,winScreen,messageScreen].forEach(el=>el.classList.remove('show'))}
  function showMessage(title,text,button='CONTINUAR ▶',badge='NIVEL COMPLETADO'){messageBadge.textContent=badge;messageTitle.textContent=title;messageText.textContent=text;messageBtn.textContent=button;messageScreen.classList.add('show')}

  function finishLevel(){
    if(state!=='playing')return;
    state='message';melody([523,659,784],.09);
    if(levelIndex<LEVELS.length-1){
      showMessage('¡Nivel completado!',levelIndex===0?'Superaste el primer recorrido. Desde aquí los saltos serán más precisos y los enemigos más rápidos.':'Llegaste al último tramo. Es el nivel más difícil: cuidado con las plataformas frágiles y los huecos.','SIGUIENTE NIVEL ▶');
    }else{
      state='won';finalScore.textContent=`PUNTAJE ${String(score).padStart(5,'0')}`;
      setTimeout(()=>{messageScreen.classList.remove('show');winScreen.classList.add('show');melody([523,659,784,1047,1319],.12)},350);
    }
  }

  function loseLife(reason='golpe'){
    if(player.invuln>0||state!=='playing')return;
    lives--;tone(reason==='tiempo'?90:120,.18);
    if(navigator.vibrate)navigator.vibrate(reason==='tiempo'?[80,50,80]:70);
    if(lives<=0){state='gameover';gameOverScreen.classList.add('show');return}
    player.x=checkpointX;player.y=GROUND_Y-player.h-4;player.vx=0;player.vy=-120;player.invuln=1.6;player.onGround=false;player.coyote=0;player.standingMover=null;
    cameraX=Math.max(0,checkpointX-220);levelTime=Math.max(25,Math.min(levelRuntime.time,levelTime+18));respawnFlash=.8;
  }

  function ensureAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume()}
  function tone(freq=440,d=.07,delay=0){if(!soundOn)return;try{ensureAudio();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(.022,audioCtx.currentTime+delay);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+delay+d);o.connect(g).connect(audioCtx.destination);o.start(audioCtx.currentTime+delay);o.stop(audioCtx.currentTime+delay+d)}catch(_){}}
  function melody(notes,d=.08){notes.forEach((n,i)=>tone(n,d,i*(d+.03)))}
  function rectsOverlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}

  function getPlatforms(){
    const p=[];
    levelRuntime.ground.forEach(([x,w])=>p.push({x,y:GROUND_Y,w,h:120,type:'ground'}));
    levelRuntime.platforms.forEach(([x,y,w,h])=>p.push({x,y,w,h,type:'block'}));
    levelRuntime.movers.forEach(m=>p.push({...m,type:'moving',ref:m}));
    levelRuntime.crumble.forEach(c=>{if(c.state!=='gone')p.push({...c,type:'crumble',ref:c})});
    return p;
  }

  function levelHeartCount(){return levelRuntime.hearts.reduce((n,h)=>n+(h.taken?1:0),0)}
  function attemptJump(){player.jumpBuffer=.13}

  function updatePlayer(dt){
    const accel=player.onGround?1900:1120,maxSpeed=285,friction=player.onGround?.76:.94;
    if(keys.left){player.vx-=accel*dt;player.facing=-1}
    if(keys.right){player.vx+=accel*dt;player.facing=1}
    if(!keys.left&&!keys.right)player.vx*=Math.pow(friction,dt*60);
    player.vx=Math.max(-maxSpeed,Math.min(maxSpeed,player.vx));

    if(keys.jump){attemptJump();keys.jump=false}
    if(player.onGround)player.coyote=.105;else player.coyote=Math.max(0,player.coyote-dt);
    player.jumpBuffer=Math.max(0,player.jumpBuffer-dt);
    if(player.jumpBuffer>0&&player.coyote>0){player.vy=-665;player.onGround=false;player.coyote=0;player.jumpBuffer=0;player.standingMover=null;tone(520,.07)}

    player.vy+=1825*dt;player.vy=Math.min(player.vy,930);player.walkTime+=Math.abs(player.vx)*dt*.052;
    if(player.invuln>0)player.invuln-=dt;if(objectiveFlash>0)objectiveFlash-=dt;if(respawnFlash>0)respawnFlash-=dt;

    if(player.standingMover&&player.onGround){const m=player.standingMover;player.x+=m.x-m.prevX;player.y+=m.y-m.prevY}
    const platforms=getPlatforms();

    player.x+=player.vx*dt;
    for(const p of platforms){if(rectsOverlap(player,p)){if(player.vx>0)player.x=p.x-player.w;else if(player.vx<0)player.x=p.x+p.w;player.vx=0}}

    const prevBottom=player.y+player.h,prevTop=player.y;
    player.y+=player.vy*dt;player.onGround=false;player.standingMover=null;
    for(const p of platforms){
      if(!rectsOverlap(player,p))continue;
      if(player.vy>=0&&prevBottom<=p.y+8){player.y=p.y-player.h;player.vy=0;player.onGround=true;player.coyote=.105;if(p.type==='moving')player.standingMover=p.ref;if(p.type==='crumble'&&p.ref.state==='solid'){p.ref.state='shaking';p.ref.timer=.65}}
      else if(player.vy<0&&prevTop>=p.y+p.h-8){player.y=p.y+p.h;player.vy=30}
    }

    player.x=Math.max(0,Math.min(levelRuntime.worldWidth-player.w,player.x));
    if(player.y>H+120){loseLife('caida');return}

    for(const s of levelRuntime.spikes){const hit={x:s.x+5,y:s.y-s.h+4,w:s.w-10,h:s.h-4};if(rectsOverlap(player,hit)){loseLife('pinchos');return}}

    levelRuntime.hearts.forEach(h=>{if(h.taken)return;const box={x:h.x-12,y:h.y-12,w:24,h:24};if(rectsOverlap(player,box)){h.taken=true;heartsCollected++;score+=100;tone(880,.06)}});

    for(const cp of levelRuntime.checkpoints){if(!cp.active&&player.x+player.w>cp.x){levelRuntime.checkpoints.forEach(c=>c.active=false);cp.active=true;checkpointX=cp.x+24;score+=175;melody([392,523,659],.05)}}

    for(const e of levelRuntime.enemies){
      if(!e.alive)continue;
      if(rectsOverlap(player,e)){
        const playerBottom=player.y+player.h,stomp=player.vy>100&&playerBottom-e.y<18;
        if(stomp){e.alive=false;player.y=e.y-player.h;player.vy=-410;score+=275;tone(190,.08)}else{loseLife('enemigo');return}
      }
    }

    if(player.x>levelRuntime.goalX){
      const got=levelHeartCount();
      if(got>=levelRuntime.requiredHearts){score+=Math.max(0,Math.floor(levelTime))*5;finishLevel()}
      else{player.x=levelRuntime.goalX-4;player.vx=0;objectiveFlash=1.5;tone(160,.12)}
    }

    const target=player.x-W*.36;cameraX+=(target-cameraX)*Math.min(1,dt*6.2);cameraX=Math.max(0,Math.min(levelRuntime.worldWidth-W,cameraX));
  }

  function updateWorld(dt){
    levelTime-=dt;
    if(levelTime<=0){levelTime=0;loseLife('tiempo');return}
    for(const e of levelRuntime.enemies){if(!e.alive)continue;e.x+=e.vx*dt;if(e.x<e.startX-e.range/2){e.x=e.startX-e.range/2;e.vx=Math.abs(e.vx)}if(e.x>e.startX+e.range/2){e.x=e.startX+e.range/2;e.vx=-Math.abs(e.vx)}}
    for(const m of levelRuntime.movers){m.prevX=m.x;m.prevY=m.y;m.t+=dt;m.x=m.baseX+Math.sin(m.t*1.45)*m.dx;m.y=m.baseY+Math.sin(m.t*1.38)*m.dy}
    for(const c of levelRuntime.crumble){if(c.state==='shaking'){c.timer-=dt;if(c.timer<=0){c.state='gone';c.timer=2.2;c.alpha=0}}else if(c.state==='gone'){c.timer-=dt;if(c.timer<=0){c.state='solid';c.alpha=1}}}
    levelRuntime.hearts.forEach(h=>h.bob+=dt*3.4);
  }

  function drawPixelText(text,x,y,size=14,color='#fff',align='left'){ctx.save();ctx.font=`${size}px 'Press Start 2P', monospace`;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillStyle='#000';ctx.fillText(text,x+2,y+2);ctx.fillStyle=color;ctx.fillText(text,x,y);ctx.restore()}
  function drawCloud(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='rgba(255,255,255,.95)';ctx.fillRect(0,18,78,28);ctx.fillRect(16,6,34,24);ctx.fillRect(43,12,26,22);ctx.restore()}

  function drawBackground(){
    const l=levelRuntime;ctx.fillStyle=l.sky;ctx.fillRect(0,0,W,H);
    if(levelIndex===1){ctx.fillStyle='#fff';for(let i=0;i<38;i++){const sx=(i*173-cameraX*.08)%1100,sy=35+(i*71)%235;ctx.fillRect(sx,sy,3,3)}ctx.fillStyle='#fff1b0';ctx.fillRect(790,54,50,50);ctx.fillStyle=l.sky;ctx.fillRect(775,45,28,28)}
    else{drawCloud(100-(cameraX*.08)%1100,80,1);drawCloud(520-(cameraX*.05)%1200,125,.8);drawCloud(830-(cameraX*.07)%1300,62,.65);if(levelIndex===2){ctx.fillStyle='#ffe2ef';ctx.fillRect(820,55,46,46)}else{ctx.fillStyle='#ffe56f';ctx.fillRect(820,54,54,54)}}
    ctx.fillStyle=l.hills;for(let i=-1;i<7;i++){const x=i*270-(cameraX*.18)%270;ctx.beginPath();ctx.moveTo(x,420);ctx.lineTo(x+135,210+(i%2)*45);ctx.lineTo(x+270,420);ctx.closePath();ctx.fill()}
  }

  function drawGround(x,y,w,h,grass){ctx.fillStyle=grass;ctx.fillRect(x,y,w,14);ctx.fillStyle='#9b673c';ctx.fillRect(x,y+14,w,h-14);ctx.fillStyle='rgba(255,255,255,.06)';for(let ix=x;ix<x+w;ix+=44)for(let iy=y+14;iy<y+h;iy+=44)ctx.fillRect(ix,iy,22,22);ctx.fillStyle='rgba(0,0,0,.08)';for(let ix=x+22;ix<x+w;ix+=44)for(let iy=y+36;iy<y+h;iy+=44)ctx.fillRect(ix,iy,22,22)}
  function drawBlock(x,y,w,h,color,shake=0){const sy=y+shake;ctx.fillStyle='#3a2a22';ctx.fillRect(x-3,sy-3,w+6,h+6);ctx.fillStyle=color;ctx.fillRect(x,sy,w,h);ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(x+5,sy+4,Math.max(0,w-10),5)}
  function drawFlower(x,y,c){ctx.fillStyle='#3c8d4c';ctx.fillRect(x,y-18,4,18);ctx.fillStyle=c;ctx.fillRect(x-5,y-22,6,6);ctx.fillRect(x+3,y-22,6,6);ctx.fillRect(x-1,y-27,6,6)}
  function drawHeart(x,y){ctx.save();ctx.translate(x,y);ctx.fillStyle='#e94070';ctx.fillRect(-10,-6,8,8);ctx.fillRect(2,-6,8,8);ctx.fillRect(-12,-2,24,8);ctx.fillRect(-8,6,16,6);ctx.fillRect(-4,12,8,4);ctx.restore()}
  function drawEnemy(x,y){ctx.fillStyle='#26313b';ctx.fillRect(x,y+8,32,22);ctx.fillStyle='#6bbf68';ctx.fillRect(x+3,y+3,26,23);ctx.fillStyle='#17202a';ctx.fillRect(x+8,y+11,4,4);ctx.fillRect(x+20,y+11,4,4);ctx.fillRect(x+5,y+30,8,4);ctx.fillRect(x+19,y+30,8,4)}

  function drawSpikes(x,groundY,w){const n=Math.max(1,Math.floor(w/18)),step=w/n;ctx.fillStyle='#d8dde3';ctx.strokeStyle='#4c5560';ctx.lineWidth=2;for(let i=0;i<n;i++){const sx=x+i*step;ctx.beginPath();ctx.moveTo(sx,groundY);ctx.lineTo(sx+step/2,groundY-16);ctx.lineTo(sx+step,groundY);ctx.closePath();ctx.fill();ctx.stroke()}}
  function drawCheckpoint(x,active){ctx.fillStyle='#5a3820';ctx.fillRect(x,350,8,90);ctx.fillStyle=active?'#ffd166':'#fff7e7';ctx.fillRect(x+8,354,45,26);ctx.fillStyle='#e94070';ctx.fillRect(x+17,360,9,9);ctx.fillRect(x+29,360,9,9);ctx.fillRect(x+21,369,13,8)}
  function drawGoal(x,y,locked){ctx.fillStyle='#5a3820';ctx.fillRect(x,y,8,75);ctx.fillStyle=locked?'#d5c3b0':'#fff7e7';ctx.fillRect(x+8,y,92,38);ctx.strokeStyle='#3b2a20';ctx.lineWidth=4;ctx.strokeRect(x+8,y,92,38);drawPixelText(locked?'BLOQUEADO':'META ♥',x+54,y+12,7,locked?'#7a4253':'#e94070','center')}
  function drawAlejandra(x,y,locked){ctx.save();ctx.translate(x,y);ctx.globalAlpha=locked?.5:1;ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(-3,76,52,8);ctx.fillStyle='#211914';ctx.fillRect(8,0,40,18);ctx.fillRect(4,12,8,30);ctx.fillRect(44,12,8,30);ctx.fillStyle='#e2ae87';ctx.fillRect(10,12,36,32);ctx.fillStyle='#222';ctx.fillRect(18,25,4,4);ctx.fillRect(34,25,4,4);ctx.fillStyle='#d65d8f';ctx.fillRect(8,44,40,40);ctx.fillStyle='#3f3a51';ctx.fillRect(10,84,15,28);ctx.fillRect(31,84,15,28);drawHeart(28,-18);drawPixelText('ALEJANDRA',28,-44,7,'#fff','center');ctx.restore()}

  function drawWorld(){
    const l=levelRuntime,ox=-cameraX;
    for(const [x,w] of l.ground)drawGround(x+ox,GROUND_Y,w,120,l.accent);
    for(const [x,y,w,h] of l.platforms)drawBlock(x+ox,y,w,h,levelIndex===2?'#bd6f8f':'#9b673c');
    for(const m of l.movers)drawBlock(m.x+ox,m.y,m.w,m.h,'#7255a3');
    for(const c of l.crumble){if(c.state==='gone')continue;const shake=c.state==='shaking'?(Math.random()>.5?2:-2):0;drawBlock(c.x+ox,c.y,c.w,c.h,'#c48752',shake)}
    for(let x=80;x<l.worldWidth;x+=160){if((x%320)===0)drawFlower(x+ox,428,levelIndex===2?'#fff':'#ff6fae')}
    for(const s of l.spikes)drawSpikes(s.x+ox,s.y,s.w);
    for(const cp of l.checkpoints)drawCheckpoint(cp.x+ox,cp.active);
    for(const h of l.hearts)if(!h.taken)drawHeart(h.x+ox,h.y+Math.sin(h.bob)*5);
    for(const e of l.enemies)if(e.alive)drawEnemy(e.x+ox,e.y);
    const locked=levelHeartCount()<l.requiredHearts;
    if(levelIndex<2)drawGoal(l.goalX+45+ox,365,locked);else drawAlejandra(l.goalX+55+ox,358,locked);
  }

  function drawPlayer(){
    const x=Math.round(player.x-cameraX),y=Math.round(player.y);
    if(player.invuln>0&&Math.floor(player.invuln*12)%2===0)return;
    ctx.save();ctx.translate(x+player.w/2,y);ctx.scale(player.facing,1);ctx.translate(-player.w/2,0);
    const walking=player.onGround&&Math.abs(player.vx)>35,step=walking?Math.sin(player.walkTime)*2:0;
    ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(3,45,24,3);
    ctx.fillStyle='#2f251f';ctx.fillRect(5,0,22,6);ctx.fillRect(14,4,17,5);
    ctx.fillStyle='#d8a178';ctx.fillRect(7,6,18,14);ctx.fillStyle='#161616';ctx.fillRect(11,12,3,3);ctx.fillRect(20,12,3,3);
    ctx.fillStyle='#315a8e';ctx.fillRect(6,20,19,15);ctx.fillStyle='#4477b3';ctx.fillRect(6,20,19,5);
    ctx.fillStyle='#d8a178';ctx.fillRect(2,22+step,4,13);ctx.fillRect(25,22-step,4,13);
    ctx.fillStyle='#2c304d';ctx.fillRect(8,35,7,12+Math.max(0,step));ctx.fillRect(18,35,7,12+Math.max(0,-step));
    ctx.fillStyle='#17192b';ctx.fillRect(7,45,9,3);ctx.fillRect(17,45,9,3);
    ctx.restore();
  }

  function drawHUD(){
    ctx.fillStyle='rgba(20,23,31,.82)';ctx.fillRect(10,10,445,44);ctx.strokeStyle='#fff7e7';ctx.lineWidth=2;ctx.strokeRect(10,10,445,44);
    drawPixelText(`♥ ${lives}`,24,24,10,'#ff668f');drawPixelText(`CORAZONES ${String(levelHeartCount()).padStart(2,'0')}/${String(levelRuntime.requiredHearts).padStart(2,'0')}`,84,24,8,'#ffd0de');drawPixelText(`PUNTOS ${String(score).padStart(5,'0')}`,260,24,8,'#ffd166');
    const warning=levelTime<20;drawPixelText(`TIEMPO ${String(Math.ceil(levelTime)).padStart(2,'0')}`,365,24,8,warning?'#ff6b6b':'#fff7e7');
    drawPixelText(`NIVEL ${levelIndex+1}/3`,W-18,18,10,'#fff','right');const p=Math.min(1,player.x/levelRuntime.goalX);ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(W-235,40,217,9);ctx.fillStyle='#e94070';ctx.fillRect(W-235,40,217*p,9);
    if(objectiveFlash>0){const got=levelHeartCount(),a=Math.min(1,objectiveFlash*2);ctx.save();ctx.globalAlpha=a;ctx.fillStyle='rgba(31,24,32,.88)';ctx.fillRect(W/2-245,82,490,64);ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.strokeRect(W/2-245,82,490,64);drawPixelText('META BLOQUEADA',W/2,95,12,'#ffd166','center');drawPixelText(`NECESITAS ${levelRuntime.requiredHearts-got} CORAZÓN(ES) MÁS`,W/2,120,8,'#fff','center');ctx.restore()}
    if(respawnFlash>0){ctx.save();ctx.globalAlpha=Math.min(1,respawnFlash*1.5);drawPixelText('CHECKPOINT',W/2,165,10,'#ffd166','center');ctx.restore()}
  }

  function render(){if(!levelRuntime){ctx.fillStyle='#8ed6ff';ctx.fillRect(0,0,W,H);return}drawBackground();drawWorld();drawPlayer();drawHUD();if(state==='paused'){ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(0,0,W,H)}}
  function loop(now){let dt=(now-last)/1000;last=now;dt=Math.min(dt,.033);if(state==='playing'&&levelRuntime){updateWorld(dt);if(state==='playing')updatePlayer(dt)}render();requestAnimationFrame(loop)}
  function setPause(force){if(state==='menu'||state==='gameover'||state==='won'||state==='message')return;const pause=typeof force==='boolean'?force:state==='playing';state=pause?'paused':'playing';pauseScreen.classList.toggle('show',pause)}

  document.getElementById('playBtn').addEventListener('click',()=>{ensureAudio();newGame()});
  document.getElementById('resumeBtn').addEventListener('click',()=>setPause(false));
  document.getElementById('pauseBtn').addEventListener('click',()=>setPause());
  document.getElementById('retryBtn').addEventListener('click',()=>newGame());
  document.getElementById('againBtn').addEventListener('click',()=>newGame());
  messageBtn.addEventListener('click',()=>{messageScreen.classList.remove('show');if(levelIndex<LEVELS.length-1)startLevel(levelIndex+1)});
  soundBtn.addEventListener('click',()=>{soundOn=!soundOn;soundBtn.textContent=soundOn?'♪':'×';if(soundOn)tone(600,.06)});
  document.getElementById('fullscreenBtn').addEventListener('click',async()=>{try{if(!document.fullscreenElement){await document.documentElement.requestFullscreen?.();try{await screen.orientation?.lock?.('landscape')}catch(_){}}else await document.exitFullscreen?.()}catch(_){}});

  const keyMap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump'};
  addEventListener('keydown',e=>{if(keyMap[e.code]){e.preventDefault();if(keyMap[e.code]==='jump'&&!keys.jump)attemptJump();keys[keyMap[e.code]]=true}if(e.code==='KeyP'||e.code==='Escape'){e.preventDefault();setPause()}});
  addEventListener('keyup',e=>{if(keyMap[e.code]){e.preventDefault();keys[keyMap[e.code]]=false;if(keyMap[e.code]==='jump'&&player.vy<0)player.vy*=.55}});

  function bindTouch(id,key){
    const el=document.getElementById(id);
    const down=e=>{e.preventDefault();ensureAudio();if(key==='jump')attemptJump();else keys[key]=true;el.classList.add('active')};
    const up=e=>{e.preventDefault();if(key!=='jump')keys[key]=false;else if(player.vy<0)player.vy*=.6;el.classList.remove('active')};
    el.addEventListener('pointerdown',down,{passive:false});el.addEventListener('pointerup',up,{passive:false});el.addEventListener('pointercancel',up,{passive:false});el.addEventListener('pointerleave',up,{passive:false});
  }
  bindTouch('leftBtn','left');bindTouch('rightBtn','right');bindTouch('jumpBtn','jump');
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')setPause(true)});
  requestAnimationFrame(loop);
})();