const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js');
const parts = ['./chunks/part00','./chunks/part01','./chunks/part02','./chunks/part03','./chunks/part04'];
const source = (await Promise.all(parts.map(async p => (await fetch(p)).text()))).join('');
eval(source);
