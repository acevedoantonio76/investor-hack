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
    const res = await fetch('investors.json', { cache: 'no-store' });
    const data = await res.json();
    PANEL = data.investors || [];
    for (const inv of PANEL) {
      const opt = document.createElement('option');
      opt.value = inv.id;
      opt.textContent = inv.name;
      whoSel.appendChild(opt);
    }
    showStatus('Panel cargado ✅', 'ok');
  } catch (e) {
    console.error(e);
    showStatus('Error cargando investors.json', 'error');
  }
}

const ROUTES = [
  { key: /macro|fed|tasa|bono|bonos|yield|inflaci|cpi|pce|petroleo|oil|commodities|forex|dólar|dolar/i, id: 'soros' },
  { key: /momentum|tendenc|rally|break(out)?|tape|swing/i, id: 'ptj' },
  { key: /opcion|options|puts?|calls?|derivados|volatil|skew|crypto|bitcoin|ethereum|doge|xrp/i, id: 'cardona' },
  { key: /short|fraude|contable|burbuja|sobrevalor|scam/i, id: 'chanos' },
  { key: /activis|buyback|consejo|board|icahn|proxy|activista/i, id: 'ackman' },
  { key: /cuant|estad|alpha|señal|backtest|datos|machine learning|algoritmo/i, id: 'simons' },
  { key: /market(-|\s)?making|hft|liquidez|intra|spread|execution/i, id: 'griffin' },
  { key: /nvidia|amd|tesla|apple|meta|google|microsoft|earnings|guidance|resultados|catalizador|tech|tecnolog/i, id: 'cohen' }
];

function autoPickInvestor(question) {
  for (const r of ROUTES) {
    if (r.key.test(question)) return r.id;
  }
  return 'ptj';
}

function formatAnswer(inv, question) {
  const q = question.trim();
  const bullets = [];

  if (/opcion|puts?|calls?|derivados|volatil/i.test(q)) {
    bullets.push('Usa estructuras como spreads o collars para controlar riesgo.');
  }
  if (/inflaci|cpi|pce|tasa|bono|yield/i.test(q)) {
    bullets.push('Monitorea sorpresas macro y diferenciales de tasas.');
  }
  if (/crypto|bitcoin|ethereum|doge|xrp/i.test(q)) {
    bullets.push('Crypto es muy volátil, conviene posiciones pequeñas y stops claros.');
  }
  if (/nvidia|amd|tesla|apple|meta|google|microsoft/i.test(q)) {
    bullets.push('Atento a resultados trimestrales y múltiplos de valoración.');
  }
  if (/petroleo|oil|commodities/i.test(q)) {
    bullets.push('Los commodities dependen de shocks de oferta y demanda global.');
  }
  if (/short|burbuja|fraude/i.test(q)) {
    bullets.push('En cortos, paciencia y catalizadores claros son clave.');
  }

  return (
`👤 **${inv.name}** — estilo: ${inv.style.join(', ')} · horizonte: ${inv.horizon} · riesgo: ${inv.risk}

_${inv.voice}_

**Cómo abordaría tu pregunta:**
• Tesis: resume qué esperas que pase.  
• Entrada: niveles claros, tamaño pequeño al inicio.  
• Gestión: añade si se confirma; corta si no valida.  
• Riesgo: define stop técnico/temporal (0.5–1.0R máx).  

${bullets.length ? `**Notas específicas:**\n• ${bullets.join('\n• ')}` : ''}

⚠️ Esto es educativo, no asesoría financiera.`
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
