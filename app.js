async function loadData(){ const r = await fetch('./data/investors.json'); return r.json(); }

const state = { data:[], filtered:[], sort:{key:null, dir:1} };

function match(x, q){ if(!q) return true; return (x.name+' '+x.firm+' '+x.style+' '+x.strategy).toLowerCase().includes(q.toLowerCase()); }
function matchRisk(x, r){ return !r || (x.risk||'').toLowerCase()===r.toLowerCase(); }
function matchHorizon(x, h){ return !h || (x.horizon||'').toLowerCase()===h.toLowerCase(); }

function filterData(){
  const q = document.getElementById('q').value.trim();
  const r = document.getElementById('risk').value;
  const h = document.getElementById('horizon').value;
  state.filtered = state.data.filter(x=>match(x,q)&&matchRisk(x,r)&&matchHorizon(x,h));
  render();
}

function sortBy(key){
  if(state.sort.key===key) state.sort.dir*=-1; else { state.sort.key=key; state.sort.dir=1; }
  state.filtered.sort((a,b)=>{
    const A=a[key]??'', B=b[key]??'';
    if(typeof A==='number' && typeof B==='number') return (A-B)*state.sort.dir;
    return (''+A).localeCompare(''+B)*state.sort.dir;
  });
  render();
}

function simulateAnswer(item, q){
  const s=(item.style||'').toLowerCase();
  if(s.includes('cuantitativo')) return `${item.name}: modelaría el edge esperado y controlaría riesgo (VaR) antes de actuar. Pregunta: "${q}"`;
  if(s.includes('macro')) return `${item.name}: depende del ciclo macro, tasas y flujo global de liquidez. Pregunta: "${q}"`;
  if(s.includes('activismo')) return `${item.name}: buscaría catalizadores y mejoras de gobierno corporativo. Pregunta: "${q}"`;
  if(s.includes('corto')) return `${item.name}: el timing y la gestión de posiciones mandan. Pregunta: "${q}"`;
  return `${item.name}: evaluaría asimetría riesgo/beneficio y disciplina. Pregunta: "${q}"`;
}

function card(item){
  const el=document.createElement('div'); el.className='card';
  el.innerHTML=`
    <h3>${item.name}</h3>
    <div class="badge">${item.firm||''}</div>
    <div class="badge">Riesgo: ${item.risk||'—'}</div>
    <div class="badge">Horizonte: ${item.horizon||'—'}</div>
    <p><b>Estilo:</b> ${item.style||'—'}</p>
    <p><b>Estrategia:</b> ${item.strategy||'—'}</p>
    <p><b>CAGR:</b> ${fmt(item.cagr)} · <b>Sharpe:</b> ${fmt(item.sharpe)} · <b>MaxDD:</b> ${fmt(item.max_drawdown)}%</p>
    <button data-name="${item.name}">Preguntar (Avatar)</button>
  `;
  el.querySelector('button').addEventListener('click',()=>{
    const q=prompt(`¿Qué quieres preguntarle a ${item.name}?`); if(!q) return; alert(simulateAnswer(item,q));
  });
  return el;
}

function tableView(data){
  const headers=[
    ['name','Inversionista'],['firm','Firma'],['style','Estilo'],['horizon','Horizonte'],
    ['strategy','Estrategia'],['risk','Riesgo'],['cagr','CAGR %'],['sharpe','Sharpe'],['max_drawdown','Max Drawdown %']
  ];
  const ths=headers.map(([k,t])=>`<th><button onclick="sortBy('${k}')">${t}</button></th>`).join('');
  const rows=data.map(x=>`
    <tr>
      <td>${x.name||''}</td><td>${x.firm||''}</td><td>${x.style||''}</td><td>${x.horizon||''}</td>
      <td>${x.strategy||''}</td><td>${x.risk||''}</td><td>${fmt(x.cagr)}</td><td>${fmt(x.sharpe)}</td><td>${fmt(x.max_drawdown)}</td>
    </tr>`).join('');
  return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
}

function fmt(v){ if(v===null||v===undefined||v==='') return '—'; if(typeof v==='number') return Number.isInteger(v)? v : v.toFixed(2); return v; }

function render(){
  const cardsRoot=document.getElementById('cards');
  const tableRoot=document.getElementById('table');
  const cardsHtml=state.filtered.map(card);
  cardsRoot.innerHTML=''; cardsHtml.forEach(el=>cardsRoot.appendChild(el));
  tableRoot.innerHTML=tableView(state.filtered);
}

function exportCsv(){
  const fields=['name','firm','style','horizon','strategy','risk','cagr','sharpe','max_drawdown'];
  const lines=[fields.join(',')].concat(
    state.filtered.map(x=>fields.map(k=>{
      const v=x[k]; if(v===null||v===undefined) return ''; const s=(''+v).replaceAll('"','""'); return `"${s}"`;
    }).join(','))
  );
  const blob=new Blob([lines.join('\n')],{type:'text/csv'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='investors.csv'; a.click();
}

function setView(which){
  const cardsBtn=document.getElementById('cardsView');
  const tableBtn=document.getElementById('tableView');
  const cards=document.getElementById('cards');
  const table=document.getElementById('table');
  if(which==='cards'){ cards.hidden=false; table.hidden=true; cardsBtn.classList.add('active'); tableBtn.classList.remove('active'); }
  else { cards.hidden=true; table.hidden=false; tableBtn.classList.add('active'); cardsBtn.classList.remove('active'); }
}

window.sortBy=sortBy;

(async()=>{
  state.data=await loadData();
  state.filtered=[...state.data];
  document.getElementById('q').addEventListener('input',filterData);
  document.getElementById('risk').addEventListener('change',filterData);
  document.getElementById('horizon').addEventListener('change',filterData);
  document.getElementById('exportCsv').addEventListener('click',exportCsv);
  document.getElementById('cardsView').addEventListener('click',()=>{ setView('cards'); });
  document.getElementById('tableView').addEventListener('click',()=>{ setView('table'); });
  setView('cards');
  render();
})();