// Corrección mínima: solo cubre los huecos verdes del fondo con girasoles pequeños.
// No cambia el camino, no cambia los tamaños del campo y no agrega flores gigantes cercanas.
function drawFarGapFill(t,horizon,path){
  const rows=[
    {y:9,size:9,step:17,seed:12000},
    {y:22,size:12,step:20,seed:13000},
    {y:37,size:15,step:24,seed:14000}
  ];
  for(const row of rows){
    let n=0;
    for(let px=4;px<W;px+=row.step){
      const insidePath=px>path.topL-10 && px<path.topR+10;
      if(insidePath){n++;continue;}
      const jitter=(rand(row.seed+n)-.5)*9;
      const py=horizon+row.y+(rand(row.seed+500+n)-.5)*8;
      const s=(row.size+rand(row.seed+900+n)*5)*(W/390);
      const wind=Math.sin(t*1.25+n*.7)*.09;
      flower(px+jitter,py,s,.96,wind,.96);
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

  // Solo relleno de fondo, en la zona marcada anteriormente.
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
