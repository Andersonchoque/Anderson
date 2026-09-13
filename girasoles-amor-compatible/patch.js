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
      // Deja libre únicamente la entrada visual del camino.
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

// Solo sustituye el dibujo del campo para insertar el relleno de fondo.
// El camino, tamaños, cantidad de flores cercanas y movimiento se mantienen como estaban.
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
