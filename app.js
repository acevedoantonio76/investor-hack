async function loadData() {
  const res = await fetch('./data/investors.json');
  return res.json();
}

function matchRisk(risk, filter) {
  if (!filter) return true;
  return (risk || '').toLowerCase().includes(filter.toLowerCase());
}
function matchHorizon(horizon, filter) {
  if (!filter) return true;
  return (horizon || '').toLowerCase().includes(filter.toLowerCase());
}
function matchQuery(item, q) {
  if (!q) return true;
  const hay = [item.name, item.firm, item.style, item.strategy].join(' ').toLowerCase();
  return hay.includes(q.toLowerCase());
}

function render(data) {
  const root = document.getElementById('cards');
  root.innerHTML = '';
  data.forEach(item => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <h3>${item.name}</h3>
      <div class="badge">${item.firm || ''}</div>
      <div class="badge">Riesgo: ${item.risk || '—'}</div>
      <div class="badge">Horizonte: ${item.horizon || '—'}</div>
      <p><b>Estilo:</b> ${item.style || '—'}</p>
      <p><b>Estrategia:</b> ${item.strategy || '—'}</p>
      <button data-name="${item.name}">Preguntar (Avatar)</button>
    `;
    el.querySelector('button').addEventListener('click', () => {
      const q = prompt(`¿Qué quieres preguntarle a ${item.name}?`);
      if (!q) return;
      // Respuesta simulada simple según estilo
      alert(simulateAnswer(item, q));
    });
    root.appendChild(el);
  });
}

function simulateAnswer(item, q) {
  const s = (item.style || '').toLowerCase();
  if (s.includes('cuantitativo')) {
    return `${item.name}: Según los datos y señales estadísticas, la probabilidad de éxito depende de la ventaja esperada y el control del riesgo. Tu pregunta: "${q}"`;
  }
  if (s.includes('macro')) {
    return `${item.name}: Lo clave es el ciclo macro y la liquidez global. Considera tasas, inflación y flujos. Tu pregunta: "${q}"`;
  }
  if (s.includes('activismo')) {
    return `${item.name}: Buscaría catalizadores en la gestión y gobierno corporativo. Tu pregunta: "${q}"`;
  }
  if (s.includes('venta en corto')) {
    return `${item.name}: Analizaría la calidad de ganancias y el balance para detectar riesgos. Tu pregunta: "${q}"`;
  }
  return `${item.name}: Interesante. Evaluaría asimetría riesgo/beneficio y disciplina en la ejecución. Tu pregunta: "${q}"`;
}

(async () => {
  const data = await loadData();
  const qInput = document.getElementById('q');
  const riskSel = document.getElementById('risk');
  const horizonSel = document.getElementById('horizon');

  function applyFilters() {
    const q = qInput.value.trim();
    const risk = riskSel.value;
    const horizon = horizonSel.value;
    const filtered = data.filter(it => matchQuery(it, q) && matchRisk(it.risk, risk) && matchHorizon(it.horizon, horizon));
    render(filtered);
  }

  qInput.addEventListener('input', applyFilters);
  riskSel.addEventListener('change', applyFilters);
  horizonSel.addEventListener('change', applyFilters);

  render(data);
})();