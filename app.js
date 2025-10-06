// Carga de datos y UI básica
const whoSel = document.getElementById('who');
const qEl = document.getElementById('q');
const ansEl = document.getElementById('answer');
const statusEl = document.getElementById('status');
const askBtn = document.getElementById('askBtn');
const clearBtn = document.getElementById('clearBtn');

let PANEL = [];

function showStatus(msg, type = 'ok') {
  statusEl.style.display = 'block';
  statusEl.className = `card ${type}`;
  statusEl.textContent = msg;
  setTimeout(() => { statusEl.style.display = 'none'; }, 2500);
}

async function loadInvestors() {
  try {
    const res = await fetch('data/investors.json', { cache: 'no-store' });
    const data = await res.json();
    PANEL = data.investors || [];
    // Llenar selector
    for (const inv of PANEL) {
      const opt = document.createElement('option');
      opt.value = inv.id;
      opt.textContent = inv.name;
      whoSel.appendChild(opt);
    }
    showStatus('Panel cargado', 'ok');
  } catch (e) {
    console.error(e);
    showStatus('Error cargando data/investors.json', 'error');
  }
}

// Motor simple de ruteo por palabras clave
const ROUTES = [
  { key: /macro|fed|tasa|bono|dólar|commodities|geopol/i, id: 'soros' },
  { key: /momentum|tendenc|rally|break(out)?|tape/i, id: 'ptj' },
  { key: /opcion|options|puts?|calls?|volatil/i, id: 'cardona' },
  { key: /short|fraude|contable|burbuja|sobrevalor/i, id: 'chanos' },
  { key: /activis|buyback|consejo|board|icahn|proxy/i, id: 'ackman' },
  { key: /cuant|estad|alpha|señal|backtest|datos/i, id: 'simons' },
  { key: /market(-|\s)?making|hft|liquidez|intra|spread|execution/i, id: 'griffin' },
  { key: /catalizador|earnings|guidance|long\/short|idiosin/i, id: 'cohen' }
];

function autoPickInvestor(question) {
  for (const r of ROUTES) {
    if (r.key.test(question)) return r.id;
  }
  // fallback: momentum táctico
  return 'ptj';
}

function formatAnswer(inv, question) {
  const q = question.trim();
  const bullets = [];

  // Sugerencias según palabras clave
  if (/opcion|options|puts?|calls?|volatil|skew/i.test(q)) {
    bullets.push('Evaluaría spreads en vez de calls/puts desnudos para mejorar el perfil riesgo/beneficio.');
  }
  if (/macro|fed|tasa|bono|inflaci|cpi|pce/i.test(q)) {
    bullets.push('Atento a la asimetría macro (expectativas vs. sorpresas de datos).');
  }
  if (/short|sobrevalor|fraude|burbuja/i.test(q)) {
    bullets.push('Valida catalizadores temporales; los cortos requieren paciencia y control de margen.');
  }
  if (/momentum|rally|break(out)?|tendenc/i.test(q)) {
    bullets.push('Sigue el flujo: entra escalonado y usa stops dinámicos (ATR o mínimos/máximos).');
  }
  if (/earnings|resultados|guidance|catalizador/i.test(q)) {
    bullets.push('Reduce exposición antes del evento o usa estructuras definidas por riesgo.');
  }

  // Plantilla de respuesta con la “voz” del panelista
  return (
`👤 **${inv.name}** — estilo: ${inv.style.join(', ')} · horizonte: ${inv.horizon} · riesgo: ${inv.risk}

_${inv.voice}_

**Cómo abordaría tu pregunta:**
• Tesis: resume en 1–2 líneas qué esperas que pase.
• Entrada: niveles/plazos claros; tamaño inicial pequeño (0.25–0.5R).
• Gestión: si la tesis no se valida, sal sin dudar; si se valida, añade en confirmaciones.
• Riesgo: stop técnico o de tiempo; máximo riesgo por idea 0.5–1.0R.
${bullets.length ? `\n**Notas específicas:**\n• ${bullets.join('\n• ')}` : ''}

**Recuerda:** esto es educativo, no es asesoría financiera.`
  );
}

function handleAsk() {
  const question = qEl.value || '';
  if (!question.trim()) {
    showStatus('Escribe tu pregunta primero', 'error');
    qEl.focus();
    return;
  }
  let id = whoSel.value;
  if (id === 'auto') id = autoPickInvestor(question);
  const inv = PANEL.find(p => p.id === id) || PANEL[0];
  ansEl.textContent = 'Pensando…';
  // pequeña pausa visual
  setTimeout(() => {
    ansEl.innerHTML = formatAnswer(inv, question);
    ansEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}

askBtn?.addEventListener('click', handleAsk);
clearBtn?.addEventListener('click', () => { qEl.value=''; ansEl.textContent=''; });
qEl?.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'enter') handleAsk();
});

loadInvestors();
