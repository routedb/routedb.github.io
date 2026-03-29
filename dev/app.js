
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
let stationNameRecordIndexCache = null;
let stationNameGraphIndexCache = null;
let stationComponentCodesCache = null;

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
          prefectureCode: station.prefectureCode,
        });
      });
    });
  });
  return stationGroupIndexCache;
}

function getStationNameRecordIndex() {
  if (stationNameRecordIndexCache) return stationNameRecordIndexCache;
  stationNameRecordIndexCache = {};
  const stationsByLine = state.data?.stationsByLine || {};
  Object.entries(stationsByLine).forEach(([lineKey, stations]) => {
    const lineMeta = getLineMeta(lineKey);
    stations.forEach((station) => {
      const key = `${station.prefectureCode}::${station.stationName}`;
      stationNameRecordIndexCache[key] ||= [];
      stationNameRecordIndexCache[key].push({
        lineKey,
        lineMeta,
        station,
        splitCodes: splitStationGroupCodes(station.stationGroupCode),
      });
    });
  });
  return stationNameRecordIndexCache;
}

function getStationNameGraphIndex() {
  if (stationNameGraphIndexCache) return stationNameGraphIndexCache;
  const recordIndex = getStationNameRecordIndex();
  stationNameGraphIndexCache = {};
  Object.entries(recordIndex).forEach(([key, records]) => {
    const graph = {};
    records.forEach((record) => {
      const codes = record.splitCodes;
      codes.forEach((code) => {
        graph[code] ||= new Set();
        graph[code].add(code);
      });
      for (let i = 0; i < codes.length; i += 1) {
        for (let j = i + 1; j < codes.length; j += 1) {
          graph[codes[i]] ||= new Set();
          graph[codes[j]] ||= new Set();
          graph[codes[i]].add(codes[j]);
          graph[codes[j]].add(codes[i]);
        }
      }
    });
    stationNameGraphIndexCache[key] = graph;
  });
  return stationNameGraphIndexCache;
}

function getStationComponentCodes(prefCode, stationName, seedGroupCode) {
  const cacheKey = `${prefCode}::${stationName}::${seedGroupCode}`;
  if (stationComponentCodesCache?.[cacheKey]) return stationComponentCodesCache[cacheKey];
  stationComponentCodesCache ||= {};
  const graph = getStationNameGraphIndex()[`${prefCode}::${stationName}`] || {};
  const seeds = splitStationGroupCodes(seedGroupCode);
  const visited = new Set();
  const queue = [...seeds];
  while (queue.length > 0) {
    const code = queue.shift();
    if (!code || visited.has(code)) continue;
    visited.add(code);
    const neighbors = graph[code] ? Array.from(graph[code]) : [];
    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor)) queue.push(neighbor);
    });
  }
  if (visited.size === 0) {
    seeds.forEach((code) => visited.add(code));
  }
  stationComponentCodesCache[cacheKey] = visited;
  return visited;
}

function getCurrentStation(lineKey, stationGroupCode) {
  return getStations(lineKey).find((item) => item.stationGroupCode === stationGroupCode) || null;
}

function getStationComponentRecords(lineKey, stationGroupCode) {
  const currentStation = getCurrentStation(lineKey, stationGroupCode);
  if (!currentStation) return { currentStation: null, componentCodes: new Set(), componentRecords: [] };
  const prefCode = currentStation.prefectureCode || state.selectedPrefCode || '';
  const stationName = currentStation.stationName || '';
  const componentCodes = getStationComponentCodes(prefCode, stationName, stationGroupCode);
  const allRecords = getStationNameRecordIndex()[`${prefCode}::${stationName}`] || [];
  const componentRecords = allRecords.filter((record) =>
    record.splitCodes.some((code) => componentCodes.has(code))
  );
  return { currentStation, componentCodes, componentRecords };
}

function chooseBetterDirect(previous, candidate, currentStationName) {
  if (!previous) return candidate;
  const previousSameName = previous.targetStationName === currentStationName ? 1 : 0;
  const candidateSameName = candidate.targetStationName === currentStationName ? 1 : 0;
  const previousComposite = splitStationGroupCodes(previous.targetStationGroupCode || '').length;
  const candidateComposite = splitStationGroupCodes(candidate.targetStationGroupCode || '').length;
  if (candidateSameName !== previousSameName) return candidateSameName > previousSameName ? candidate : previous;
  if (candidateComposite !== previousComposite) return candidateComposite < previousComposite ? candidate : previous;
  return candidate.displayName.localeCompare(previous.displayName, 'ja') < 0 ? candidate : previous;
}

function getTransfers(lineKey, stationGroupCode) {
  const { currentStation, componentRecords } = getStationComponentRecords(lineKey, stationGroupCode);
  if (!currentStation) return [];
  const currentStationName = currentStation.stationName || '';
  const resultMap = new Map();

  componentRecords.forEach((record) => {
    const meta = record.lineMeta || getLineMeta(record.lineKey);
    if (!meta || record.lineKey === lineKey) return;
    const candidate = {
      lineKey: record.lineKey,
      lineId: meta.lineId || null,
      lineName: meta.lineName || '',
      operatorName: meta.operatorName || '',
      displayName: meta.displayName || record.lineKey,
      prefectureCodes: meta.prefectureCodes || [],
      generalLineName: meta.generalLineName || meta.lineName || '',
      targetStationGroupCode: record.station.stationGroupCode,
      targetStationName: record.station.stationName,
    };
    const previous = resultMap.get(candidate.lineKey);
    resultMap.set(candidate.lineKey, chooseBetterDirect(previous, candidate, currentStationName));
  });

  return Array.from(resultMap.values()).sort((a, b) => a.displayName.localeCompare(b.displayName, 'ja'));
}

function chooseBetterNearby(previous, candidate) {
  if (!previous) return candidate;
  if ((candidate.distanceM || 999999) !== (previous.distanceM || 999999)) {
    return (candidate.distanceM || 999999) < (previous.distanceM || 999999) ? candidate : previous;
  }
  return candidate.displayName.localeCompare(previous.displayName, 'ja') < 0 ? candidate : previous;
}

function getNearbyTransfers(lineKey, stationGroupCode) {
  const { componentRecords } = getStationComponentRecords(lineKey, stationGroupCode);
  const directLineKeys = new Set(getTransfers(lineKey, stationGroupCode).map((item) => item.lineKey));
  const resultMap = new Map();

  componentRecords.forEach((record) => {
    const nearbyList = state.data?.nearbyTransfersByLineStation?.[`${record.lineKey}::${record.station.stationGroupCode}`] || [];
    nearbyList.forEach((item) => {
      if (item.lineKey === lineKey) return;
      if (directLineKeys.has(item.lineKey)) return;
      const previous = resultMap.get(item.lineKey);
      resultMap.set(item.lineKey, chooseBetterNearby(previous, item));
    });
  });

  return Array.from(resultMap.values()).sort((a, b) => {
    if ((a.distanceM || 999999) !== (b.distanceM || 999999)) {
      return (a.distanceM || 999999) - (b.distanceM || 999999);
    }
    return a.displayName.localeCompare(b.displayName, 'ja');
  });
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

function renderSection(element, rows) {
  element.innerHTML = rows.map(buildRowHtml).join('');
}

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
  if (!state.data || !state.selectedPrefCode) {
    els.fixed.innerHTML = '';
    return;
  }
  const pref = getPrefectures().find((item) => item.prefectureCode === state.selectedPrefCode);
  const rowsStatic = [{
    level: 0,
    label: pref ? pref.prefectureName : state.selectedPrefCode,
    onClick: { action: 'back-pref', value: state.selectedPrefCode }
  }];
  const rowsTransfer = [];
  const rowsNearby = [];
  let stationRow = null;

  if (state.selectedLineKey) {
    const lineMeta = getLineMeta(state.selectedLineKey);
    rowsStatic.push({
      level: 1,
      label: lineMeta ? lineMeta.displayName : state.selectedLineKey,
      variant: 'selected-line',
      onClick: { action: 'back-line', value: state.selectedLineKey }
    });
  }

  if (state.selectedLineKey && state.selectedStationGroupCode) {
    const transfers = getTransfers(state.selectedLineKey, state.selectedStationGroupCode);
    transfers.forEach((line) => rowsTransfer.push({
      level: 1,
      label: line.displayName,
      variant: 'transfer-line',
      onClick: {
        action: 'transfer-line',
        value: line.lineKey,
        extra: line.prefectureCodes.join(','),
        targetStation: line.targetStationGroupCode || state.selectedStationGroupCode
      }
    }));

    const nearbyTransfers = getNearbyTransfers(state.selectedLineKey, state.selectedStationGroupCode);
    nearbyTransfers.forEach((line) => rowsNearby.push({
      level: 1,
      label: line.displayText,
      variant: 'nearby-transfer-line',
      onClick: {
        action: 'transfer-line',
        value: line.lineKey,
        extra: line.prefectureCodes.join(','),
        targetStation: line.stationGroupCode || ''
      }
    }));

    const station = getCurrentStation(state.selectedLineKey, state.selectedStationGroupCode);
    if (station) {
      stationRow = {
        level: 2,
        label: station.stationName,
        variant: 'selected-station',
        onClick: { action: 'station', value: state.selectedStationGroupCode },
        focusId: `station:${state.selectedStationGroupCode}`
      };
    }
  }
  renderFixedTree(rowsStatic, rowsTransfer, rowsNearby, stationRow);
}

function renderListRows() {
  const rows = [];
  if (!state.data) {
    rows.push({ level: 0, label: 'データを読み込めませんでした', variant: 'empty' });
    renderSection(els.list, rows);
    return;
  }
  if (state.loading) {
    rows.push({ level: 0, label: '読み込み中…', variant: 'loading' });
    renderSection(els.list, rows);
    return;
  }
  if (!state.selectedPrefCode) {
    getPrefectures().forEach((pref) => rows.push({
      level: 0,
      label: pref.prefectureName,
      meta: `${pref.lineCount}路線`,
      onClick: { action: 'pref', value: pref.prefectureCode }
    }));
    renderSection(els.list, rows);
    return;
  }
  if (!state.selectedLineKey) {
    getLines(state.selectedPrefCode).forEach((line) => rows.push({
      level: 1,
      label: line.displayName,
      onClick: { action: 'line', value: line.lineKey }
    }));
    renderSection(els.list, rows);
    return;
  }
  if (!state.selectedStationGroupCode) {
    getStations(state.selectedLineKey).forEach((station) => {
      const directTransfers = getTransfers(state.selectedLineKey, station.stationGroupCode);
      const nearbyTransfers = getNearbyTransfers(state.selectedLineKey, station.stationGroupCode);
      const hasTransfer = directTransfers.length > 0 || nearbyTransfers.length > 0;
      rows.push({
        level: 2,
        label: station.stationName,
        badge: hasTransfer ? '⇄' : '',
        badgeClass: hasTransfer ? 'has-transfer' : '',
        onClick: { action: 'station', value: station.stationGroupCode },
        focusId: `station:${station.stationGroupCode}`
      });
    });
    renderSection(els.list, rows);
    return;
  }
  renderSection(els.list, []);
}

function render() {
  renderFixedRows();
  renderListRows();
  applyPendingFocus();
}

async function withLoading(fn) {
  state.loading = true;
  render();
  await Promise.resolve();
  try {
    fn();
  } finally {
    state.loading = false;
    render();
  }
}

async function selectPref(prefCode) {
  await withLoading(() => {
    state.selectedPrefCode = prefCode;
    state.selectedLineKey = '';
    state.selectedStationGroupCode = '';
    state.pendingFocus = null;
    stationComponentCodesCache = null;
    const pref = getPrefectures().find((i) => i.prefectureCode === prefCode);
    els.footer.textContent = pref ? `${pref.prefectureName} の路線一覧` : '路線一覧';
    els.list.scrollTop = 0;
  });
}

async function selectLine(lineKey) {
  await withLoading(() => {
    state.selectedLineKey = lineKey;
    state.selectedStationGroupCode = '';
    state.pendingFocus = null;
    const line = getLineMeta(lineKey);
    els.footer.textContent = line ? `${line.displayName} の駅一覧` : '駅一覧';
    els.list.scrollTop = 0;
  });
}

async function selectStation(stationGroupCode) {
  await withLoading(() => {
    state.selectedStationGroupCode = stationGroupCode;
    state.pendingFocus = `station:${stationGroupCode}`;
    const station = getCurrentStation(state.selectedLineKey, stationGroupCode);
    els.footer.textContent = station ? `${station.stationName} の乗換・近接路線` : '乗換・近接路線';
    els.list.scrollTop = 0;
  });
}

async function goToTransferLine(lineKey, prefCodesText, targetStationGroupCode) {
  await withLoading(() => {
    const currentPrefCode = state.selectedPrefCode;
    const allowed = prefCodesText ? prefCodesText.split(',').filter(Boolean) : [];
    const targetPrefCode = allowed.includes(currentPrefCode) ? currentPrefCode : (allowed[0] || currentPrefCode);
    state.selectedPrefCode = targetPrefCode;
    state.selectedLineKey = lineKey;
    state.selectedStationGroupCode = '';
    state.pendingFocus = targetStationGroupCode ? `station:${targetStationGroupCode}` : null;
    const line = getLineMeta(lineKey);
    if (targetStationGroupCode) {
      const station = getCurrentStation(lineKey, targetStationGroupCode);
      els.footer.textContent = station
        ? `${line ? line.displayName : '路線'} の駅一覧（${station.stationName} にフォーカス）`
        : `${line ? line.displayName : '路線'} の駅一覧`;
    } else {
      els.footer.textContent = line ? `${line.displayName} の駅一覧` : '駅一覧';
    }
    els.list.scrollTop = 0;
  });
}

function resetToPrefList() {
  state.selectedPrefCode = '';
  state.selectedLineKey = '';
  state.selectedStationGroupCode = '';
  state.loading = false;
  state.pendingFocus = null;
  stationComponentCodesCache = null;
  els.footer.textContent = '都道府県一覧';
  els.list.scrollTop = 0;
  render();
}

els.title.addEventListener('click', resetToPrefList);

document.body.addEventListener('click', async (event) => {
  const btn = event.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const value = btn.dataset.value || '';
  const extra = btn.dataset.extra || '';
  const targetStation = btn.dataset.targetStation || '';

  if (action === 'pref') return selectPref(value);
  if (action === 'line') return selectLine(value);
  if (action === 'station') return selectStation(value);
  if (action === 'back-pref') {
    state.selectedLineKey = '';
    state.selectedStationGroupCode = '';
    state.pendingFocus = null;
    els.footer.textContent = '路線一覧';
    els.list.scrollTop = 0;
    return render();
  }
  if (action === 'back-line') {
    state.selectedStationGroupCode = '';
    state.pendingFocus = null;
    els.footer.textContent = '駅一覧';
    els.list.scrollTop = 0;
    return render();
  }
  if (action === 'transfer-line') return goToTransferLine(value, extra, targetStation);
});

render();
