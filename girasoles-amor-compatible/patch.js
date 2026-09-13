// Relleno extra de girasoles para cubrir huecos laterales y del horizonte.
// Mantiene Canvas 2D para máxima compatibilidad con Android/Chrome.
for(let i=0;i<180;i++){
  field.push({
    z:5+rand(7000+i)*92,
    side:rand(7200+i)<.5?-1:1,
    lane:.35+rand(7400+i)*7.4,
    h:.85+rand(7600+i)*1.7,
    seed:8000+i
  });
}

const edgeFlowers=[];
for(let z=3;z<61;z+=1.55){
  for(const side of [-1,1]){
    edgeFlowers.push({z:z+rand(z*13+side)*.7,side,band:.02,h:1.05+rand(z*17+side)*1.25,seed:9000+edgeFlowers.length});
    edgeFlowers.push({z:z+.65+rand(z*19+side)*.55,side,band:.11,h:.9+rand(z*23+side)*1.15,seed:9500+edgeFlowers.length});
  }
}

// Camino un poco más angosto para que el campo abrace mejor el recorrido.
drawPath=function(horizon,walk){
  let wiggle=Math.sin(walk*.05)*W*.02,
      topL=W*.465+wiggle,topR=W*.535+wiggle,
      bottomL=W*.24,bottomR=W*.76;
  let pg=x.createLinearGradient(0,horizon,0,H);
  pg.addColorStop(0,'#9a7b4e');pg.addColorStop(.6,'#b08a58');pg.addColorStop(1,'#8b6942');x.fillStyle=pg;
  x.beginPath();x.moveTo(topL,horizon);x.lineTo(topR,horizon);x.lineTo(bottomR,H);x.lineTo(bottomL,H);x.closePath();x.fill();
  for(let i=0;i<42;i++){
    let q=rand(2100+i),v=rand(2300+i),yy=horizon+(H-horizon)*Math.pow(q,.78),k=(yy-horizon)/(H-horizon),
        left=topL+(bottomL-topL)*k,right=topR+(bottomR-topR)*k,xx=left+(right-left)*v;
    x.fillStyle='rgba(93,67,39,'+(0.08+rand(2500+i)*.15)+')';x.beginPath();x.ellipse(xx,yy,1+5*k,1+2*k,rand(2600+i),0,7);x.fill();
  }
  return {topL,topR,bottomL,bottomR};
};

function drawHorizonSunflowers(t,horizon,path){
  const sway=Math.sin(t*1.15)*.8;
  const gap=18;
  for(let px=0;px<W;px+=gap){
    if(px>path.topL-22&&px<path.topR+22)continue;
    const n=Math.floor(px/gap);
    const s=(7+rand(11000+n)*7)*(W/390);
    const py=horizon+5+rand(11200+n)*13;
    flower(px+rand(11400+n)*9,py,s,.92+rand(11600+n)*.08,Math.sin(t*1.4+n)*.11+sway*.01,.92);
  }
}

function drawEdgeSunflowers(t,walk,horizon,path){
  let arr=[];
  for(const e of edgeFlowers){
    let z=e.z-walk;
    if(z<1||z>59)continue;
    let sc=Math.min(2.05,6.7/z);
    let k=Math.pow(1-z/59,1.5);
    let left=path.topL+(path.bottomL-path.topL)*k;
    let right=path.topR+(path.bottomR-path.topR)*k;
    let px=e.side<0 ? left-(7+e.band*W)*sc : right+(7+e.band*W)*sc;
    let py=horizon+(H-horizon)*k;
    let size=(23+e.h*30)*sc*(W/390);
    arr.push({z,px,py,size,e});
  }
  arr.sort((a,b)=>b.z-a.z);
  for(const q of arr){
    let open=.8+.2*smooth(range(8-q.z,0,8));
    let w=Math.sin(t*1.75+q.e.seed)*.16;
    flower(q.px,q.py,q.size,open,w,clamp(1-(q.z-55)/10));
  }
}

drawField=function(t){
  const walk=range(t,23,72)*70,horizon=H*.43;
  sky(t);
  drawGreenGround(horizon);
  let path=drawPath(horizon,walk);
  drawGroundPlants(t,walk,horizon,path);
  drawHorizonSunflowers(t,horizon,path);

  let visible=[];
  for(const f of field){
    let z=f.z-walk;if(z<1||z>65)continue;
    let sc=Math.min(1.82,6.3/z),center=W*.5+Math.sin((walk+z)*.05)*W*.025,
        px=center+f.side*(W*(.05+f.lane*.056))*sc,
        py=horizon+(H-horizon)*Math.pow(1-z/65,1.55),
        size=(20+f.h*29)*sc*(W/390);
    visible.push({z,px,py,size,f});
  }
  visible.sort((a,b)=>b.z-a.z);
  for(const q of visible){
    let open=.74+.26*smooth(range(9-q.z,0,8)),w=Math.sin(t*1.7+q.f.seed)*.18;
    flower(q.px,q.py,q.size,open,w,clamp(1-(q.z-54)/12));
  }
  drawEdgeSunflowers(t,walk,horizon,path);
};
