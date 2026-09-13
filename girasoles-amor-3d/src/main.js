const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js');
const parts = ['./chunks/part00','./chunks/part01','./chunks/part02','./chunks/part03','./chunks/part04'];
let source = (await Promise.all(parts.map(async p => (await fetch(p + '?v=2')).text()))).join('');
source = source
  .replace("powerPreference: 'high-performance'", "powerPreference: MOBILE ? 'default' : 'high-performance', failIfMajorPerformanceCaveat: false")
  .replace("antialias: !MOBILE,", "antialias: !MOBILE,");
try {
  eval(source);
} catch (err) {
  console.error('Error iniciando experiencia 3D:', err);
  const fallback = document.querySelector('#fallback');
  if (fallback) {
    fallback.hidden = false;
    const p = fallback.querySelector('p');
    if (p) p.textContent = 'No se pudo iniciar el modo 3D aquí. Si abriste el enlace dentro de WhatsApp, toca ⋮ y elige “Abrir en Chrome” o “Abrir en Safari”.';
  }
}
