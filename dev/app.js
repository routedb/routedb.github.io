const state = {
  data: window.RAILWAY_APP_DATA || null,
  selectedPrefCode: '',
  selectedLineKey: '',
  selectedStationGroupCode: '',
  loading: false,
  pendingFocus: null,
};

const els = {
  title: document.getElementById('app-title'),
  fixed: document.getElementById('fixed-tree'),
  list: document.getElementById('list-tree'),
  footer: document.getElementById('footer-text'),
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getPrefectures() { return state.data?.prefectures || []; }
function getLines(prefCode) { return state.data?.linesByPrefecture?.[prefCode] || []; }
function getLineMeta(lineKey) { return state.data?.lineMeta?.[lineKey] || null; }
function getStations(lineKey) { return state.data?.stationsByLine?.[lineKey] || []; }
function splitStationGroupCodes(stationGroupCode = '') {
  return String(stationGroupCode).split('/').map(v => v.trim()).filter(Boolean);
}

let stationGroupIndexCache = null;
let stationNameIndexCache = null;

function getStationGroupIndex() {
  if (stationGroupIndexCache) return stationGroupIndexCache;
  stationGroupIndexCache = {};
  const stationsByLine = state.data?.stationsByLine || {};
  Object.entries(stationsByLine).forEach(([lineKey, stations]) => {
    const lineMeta = getLineMeta(lineKey);
    stations.forEach((station) => {
      splitStationGroupCodes(station.stationGroupCode).forEach((groupCode) => {
        stationGroupIndexCache[groupCode] ||= [];
        stationGroupIndexCache[groupCode].push({
          lineKey,
          lineId: lineMeta?.lineId || null,
          lineName: lineMeta?.lineName || '',
          operatorName: lineMeta?.operatorName || '',
          displayName: lineMeta?.displayName || lineKey,
          prefectureCodes: lineMeta?.prefectureCodes || [],
          generalLineName: lineMeta?.generalLineName || lineMeta?.lineName || '',
          stationGroupCode: station.stationGroupCode,
          stationName: station.stationName,
        });
      });
    });
  });
  return stationGroupIndexCache;
}

function getStationNameIndex() {
  if (stationNameIndexCache) return stationNameIndexCache;
  stationNameIndexCache = {};
  const stationsByLine = state.data?.stationsByLine || {};
  Object.entries(stationsByLine).forEach(([lineKey, stations]) => {
    const lineMeta = getLineMeta(lineKey);
    stations.forEach((station) => {
      const prefCodes = lineMeta?.prefectureCodes || [];
      prefCodes.forEach((prefCode) => {
        const key = `${prefCode}::${station.stationName}`;
        stationNameIndexCache[key] ||= new Set();
        splitStationGroupCodes(station.stationGroupCode).forEach((groupCode) => stationNameIndexCache[key].add(groupCode));
      });
    });
  });
  return stationNameIndexCache;
}

function getCurrentStation(lineKey, stationGroupCode) {
  return getStations(lineKey).find((item) => item.stationGroupCode === stationGroupCode) || null;
}

function getCandidateGroupCodes(lineKey, stationGroupCode) {
  const currentStation = getCurrentStation(lineKey, stationGroupCode);
  const groupCodes = new Set(splitStationGroupCodes(stationGroupCode));
  if (!currentStation || !state.selectedPrefCode) return { currentStation, codes: groupCodes };
  const nameIndex = getStationNameIndex();
  const key = `${state.selectedPrefCode}::${currentStation.stationName}`;
  (nameIndex[key] || new Set()).forEach((code) => groupCodes.add(code));
  return { currentStation, codes: groupCodes };
}

function getTransfers(lineKey, stationGroupCode) {
  const exact = state.data?.transfersByLineStation?.[`${lineKey}::${stationGroupCode}`] || [];
  const stationGroupIndex = getStationGroupIndex();
  const resultMap = new Map();
  const { currentStation, codes } = getCandidateGroupCodes(lineKey, stationGroupCode);
  const currentStationName = currentStation?.stationName || '';

  exact.forEach((item) => {
    resultMap.set(item.lineKey, {
      ...item,
      targetStationGroupCode: stationGroupCode,
      targetStationName: currentStationName,
    });
  });

  codes.forEach((groupCode) => {
    const matches = stationGroupIndex[groupCode] || [];
    matches.forEach((entry) => {
      if (entry.lineKey === lineKey) return;
      if (state.selectedPrefCode && !(entry.prefectureCodes || []).includes(state.selectedPrefCode)) return;
      const previous = resultMap.get(entry.lineKey);
      const nextValue = {
        lineKey: entry.lineKey,
        lineId: entry.lineId,
        lineName: entry.lineName,
        operatorName: entry.operatorName,
        displayName: entry.displayName,
        prefectureCodes: entry.prefectureCodes,
        generalLineName: entry.generalLineName,
        targetStationGroupCode: entry.stationGroupCode,
        targetStationName: entry.stationName,
      };
      if (!previous) {
        resultMap.set(entry.lineKey, nextValue);
        return;
      }
      const previousSameName = previous.targetStationName === currentStationName ? 1 : 0;
      const nextSameName = nextValue.targetStationName === currentStationName ? 1 : 0;
      const previousComposite = String(previous.targetStationGroupCode || '').includes('/') ? 1 : 0;
      const nextComposite = String(nextValue.targetStationGroupCode || '').includes('/') ? 1 : 0;
      if (nextSameName > previousSameName || (nextSameName === previousSameName && nextComposite < previousComposite)) {
        resultMap.set(entry.lineKey, nextValue);
      }
    });
  });

  return Array.from(resultMap.values()).sort((a, b) => a.displayName.localeCompare(b.displayName, 'ja'));
}

function getNearbyTransfers(lineKey, stationGroupCode) {
  return state.data?.nearbyTransfersByLineStation?.[`${lineKey}::${stationGroupCode}`] || [];
}

function buildRowHtml(row) {
  const classes = ['row', `level-${row.level || 0}`];
  if (row.variant) classes.push(row.variant);
  if (row.onClick) classes.push('clickable');
  const attrs = [];
  if (row.onClick) {
    attrs.push(`data-action="${escapeHtml(row.onClick.action)}"`);
    attrs.push(`data-value="${escapeHtml(row.onClick.value || '')}"`);
    attrs.push(`data-extra="${escapeHtml(row.onClick.extra || '')}"`);
    attrs.push(`data-target-station="${escapeHtml(row.onClick.targetStation || '')}"`);
  } else {
    attrs.push('disabled');
  }
  if (row.focusId) attrs.push(`data-focus-id="${escapeHtml(row.focusId)}"`);
  return `<button type="button" class="${classes.join(' ')}" ${attrs.join(' ')}><span class="label">${escapeHtml(row.label)}${row.badge ? `<span class="inline-badge ${escapeHtml(row.badgeClass || '')}">${escapeHtml(row.badge)}</span>` : ''}</span>${row.meta ? `<span class="meta">${escapeHtml(row.meta)}</span>` : ''}</button>`;
}

function renderSection(element, rows) { element.innerHTML = rows.map(buildRowHtml).join(''); }

function renderFixedTree(rowsStatic, rowsTransfer, rowsNearby, stationRow) {
  const staticHtml = rowsStatic.map(buildRowHtml).join('');
  const transferHtml = rowsTransfer.map(buildRowHtml).join('');
  const nearbyHtml = rowsNearby.map(buildRowHtml).join('');
  const stationHtml = stationRow ? buildRowHtml(stationRow) : '';
  els.fixed.innerHTML = `
    <div class="fixed-shell">
      <div class="fixed-static">${staticHtml}</div>
      ${rowsTransfer.length || rowsNearby.length ? `<div class="fixed-transfer-scroll">${transferHtml}${nearbyHtml}</div>` : ''}
      ${stationHtml ? `<div class="fixed-station">${stationHtml}</div>` : ''}
    </div>`;
}

function applyPendingFocus() {
  if (!state.pendingFocus) return;
  const target = document.querySelector(`[data-focus-id="${CSS.escape(state.pendingFocus)}"]`);
  if (!target) return;
  requestAnimationFrame(() => {
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'nearest' });
    state.pendingFocus = null;
  });
}

function renderFixedRows() {
  if (!state.data || !state.selectedPrefCode) { els.fixed.innerHTML = ''; return; }
  const pref = getPrefectures().find((item) => item.prefectureCode === state.selectedPrefCode);
  const rowsStatic = [{ level:0, label: pref ? pref.prefectureName : state.selectedPrefCode, onClick:{action:'back-pref', value: state.selectedPrefCode}}];
  const rowsTransfer = [];
  const rowsNearby = [];
  let stationRow = null;
  if (state.selectedLineKey) {
    const lineMeta = getLineMeta(state.selectedLineKey);
    rowsStatic.push({ level:1, label: lineMeta ? lineMeta.displayName : state.selectedLineKey, variant:'selected-line', onClick:{action:'back-line', value: state.selectedLineKey}});
  }
  if (state.selectedLineKey && state.selectedStationGroupCode) {
    const transfers = getTransfers(state.selectedLineKey, state.selectedStationGroupCode);
    transfers.forEach((line) => rowsTransfer.push({
      level:1, label: line.displayName, variant:'transfer-line', onClick:{action:'transfer-line', value: line.lineKey, extra: line.prefectureCodes.join(','), targetStation: line.targetStationGroupCode || state.selectedStationGroupCode}
    }));
    const nearbyTransfers = getNearbyTransfers(state.selectedLineKey, state.selectedStationGroupCode);
    nearbyTransfers.forEach((line) => rowsNearby.push({
      level:1, label: line.displayText, variant:'nearby-transfer-line', onClick:{action:'transfer-line', value: line.lineKey, extra: line.prefectureCodes.join(','), targetStation: line.stationGroupCode || ''}
    }));
    const station = getCurrentStation(state.selectedLineKey, state.selectedStationGroupCode);
    if (station) {
      stationRow = { level:2, label: station.stationName, variant:'selected-station', onClick:{action:'station', value: state.selectedStationGroupCode}, focusId:`station:${state.selectedStationGroupCode}` };
    }
  }
  renderFixedTree(rowsStatic, rowsTransfer, rowsNearby, stationRow);
}

function renderListRows() {
  const rows = [];
  if (!state.data) {
    rows.push({ level:0, label:'データを読み込めませんでした', variant:'empty' });
    renderSection(els.list, rows); return;
  }
  if (state.loading) {
    rows.push({ level:0, label:'読み込み中…', variant:'loading' });
    renderSection(els.list, rows); return;
  }
  if (!state.selectedPrefCode) {
    getPrefectures().forEach((pref)=>rows.push({ level:0,label:pref.prefectureName,meta:`${pref.lineCount}路線`,onClick:{action:'pref',value:pref.prefectureCode}}));
    renderSection(els.list, rows); return;
  }
  if (!state.selectedLineKey) {
    getLines(state.selectedPrefCode).forEach((line)=>rows.push({ level:1,label:line.displayName,onClick:{action:'line',value:line.lineKey} }));
    renderSection(els.list, rows); return;
  }
  if (!state.selectedStationGroupCode) {
    getStations(state.selectedLineKey).forEach((station)=>{
      const directTransfers = getTransfers(state.selectedLineKey, station.stationGroupCode);
      const nearbyTransfers = getNearbyTransfers(state.selectedLineKey, station.stationGroupCode);
      const hasTransfer = directTransfers.length > 0 || nearbyTransfers.length > 0;
      rows.push({ level:2,label:station.stationName,badge:hasTransfer?'⇄':'',badgeClass:hasTransfer?'has-transfer':'',onClick:{action:'station',value:station.stationGroupCode},focusId:`station:${station.stationGroupCode}` });
    });
    renderSection(els.list, rows); return;
  }
  renderSection(els.list, []);
}

function render() { renderFixedRows(); renderListRows(); applyPendingFocus(); }

async function withLoading(fn) {
  state.loading = true; render(); await Promise.resolve();
  try { fn(); } finally { state.loading = false; render(); }
}
async function selectPref(prefCode) {
  await withLoading(()=>{ state.selectedPrefCode=prefCode; state.selectedLineKey=''; state.selectedStationGroupCode=''; state.pendingFocus=null; const pref=getPrefectures().find(i=>i.prefectureCode===prefCode); els.footer.textContent=pref?`${pref.prefectureName} の路線一覧`:'路線一覧'; els.list.scrollTop=0; });
}
async function selectLine(lineKey) {
  await withLoading(()=>{ state.selectedLineKey=lineKey; state.selectedStationGroupCode=''; state.pendingFocus=null; const line=getLineMeta(lineKey); els.footer.textContent=line?`${line.displayName} の駅一覧`:'駅一覧'; els.list.scrollTop=0; });
}
async function selectStation(stationGroupCode) {
  await withLoading(()=>{ state.selectedStationGroupCode=stationGroupCode; state.pendingFocus=`station:${stationGroupCode}`; const station=getCurrentStation(state.selectedLineKey, stationGroupCode); els.footer.textContent=station?`${station.stationName} の乗換・近接路線`:'乗換・近接路線'; els.list.scrollTop=0; });
}
async function goToTransferLine(lineKey, prefCodesText, targetStationGroupCode) {
  await withLoading(()=>{ const currentPrefCode=state.selectedPrefCode; const allowed=prefCodesText?prefCodesText.split(',').filter(Boolean):[]; const targetPrefCode=allowed.includes(currentPrefCode)?currentPrefCode:(allowed[0]||currentPrefCode); state.selectedPrefCode=targetPrefCode; state.selectedLineKey=lineKey; state.selectedStationGroupCode=''; state.pendingFocus=targetStationGroupCode?`station:${targetStationGroupCode}`:null; const line=getLineMeta(lineKey); if (targetStationGroupCode) { const station=getCurrentStation(lineKey, targetStationGroupCode); els.footer.textContent=station?`${line?line.displayName:'路線'} の駅一覧（${station.stationName} にフォーカス）`:`${line?line.displayName:'路線'} の駅一覧`; } else { els.footer.textContent=line?`${line.displayName} の駅一覧`:'駅一覧'; } els.list.scrollTop=0; });
}
function resetToPrefList() { state.selectedPrefCode=''; state.selectedLineKey=''; state.selectedStationGroupCode=''; state.loading=false; state.pendingFocus=null; els.footer.textContent='都道府県一覧'; els.list.scrollTop=0; render(); }
els.title.addEventListener('click', resetToPrefList);
document.body.addEventListener('click', async (event) => {
  const btn = event.target.closest('[data-action]'); if (!btn) return;
  const action=btn.dataset.action, value=btn.dataset.value||'', extra=btn.dataset.extra||'', targetStation=btn.dataset.targetStation||'';
  if (action==='pref') return selectPref(value);
  if (action==='line') return selectLine(value);
  if (action==='station') return selectStation(value);
  if (action==='back-pref') { state.selectedLineKey=''; state.selectedStationGroupCode=''; state.pendingFocus=null; els.footer.textContent='路線一覧'; els.list.scrollTop=0; return render(); }
  if (action==='back-line') { state.selectedStationGroupCode=''; state.pendingFocus=null; els.footer.textContent='駅一覧'; els.list.scrollTop=0; return render(); }
  if (action==='transfer-line') return goToTransferLine(value, extra, targetStation);
});
render();
