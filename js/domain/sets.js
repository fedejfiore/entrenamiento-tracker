// Series: textos, etiquetas (calentamiento) y normalización para guardar.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

function formatSetValue(set, type) {
    const v = f => String(set?.[f] || '').trim();
    const num = f => { const n = parseDecimal(v(f)); return n == null ? '' : formatNumber(n); };
    const dur = formatDurationHuman(parseTimeSeconds(v('time')));
    if (type === 'kg') return v('kg') ? `${v('reps') || '?'}×${num('kg')}kg` : v('reps');
    if (type === 'bw') return v('reps') ? `${v('reps')} reps` : '';
    if (type === 'time' || type === 'min') return dur;
    if (type === 'km') {
        // Bici / correr: duración · km · km/h
        return [dur, v('km') ? `${num('km')}km` : '', formatSpeed(computeSpeed(parseTimeSeconds(v('time')), parseDecimal(v('km'))))].filter(Boolean).join(' · ');
    }
    return '';
}

// Resumen de las series efectivas; las de calentamiento solo se cuentan al final.
function formatSetsSummary(sets, type) {
    const list = sets || [];
    const work = list.filter(s => !s.warmup).map(s => formatSetValue(s, type)).filter(Boolean).join(' · ');
    const warmups = list.filter(s => s.warmup).length;
    if (!work) return '';
    return warmups ? `${work} (+${warmups} calent.)` : work;
}

function formatEffort(effort, type) {
    if (!effort) return '';
    const scale = EFFORT_SCALES[(EXERCISE_TYPES[type] || EXERCISE_TYPES.kg).effort];
    if (scale === EFFORT_SCALES.rir) return effort === '0' ? 'al fallo' : `RIR ${effort === '4' ? '4+' : effort}`;
    const opt = scale.options.find(([v]) => v === effort);
    return opt ? `esfuerzo ${opt[1].toLowerCase()}` : effort;
}

// Las de calentamiento se muestran como "C" y no consumen número: C, C, 1, 2, 3.
function setLabels(sets) {
    let k = 0;
    return sets.map(s => (s && s.warmup) ? WARMUP_LABEL : String(++k));
}

// "Tiene datos": algo escrito o tildado (ser de calentamiento solo, no cuenta).
function setHasAnyData(set) {
    return Object.keys(set).some(k => k !== 'warmup');
}

function setHasMetric(set, type) {
    return (EXERCISE_TYPES[type] || EXERCISE_TYPES.kg).cols.some(f => set[f]);
}

// Normaliza una serie para guardarla: solo los campos del tipo, coma decimal -> punto.
function cleanSetForSave(set, type) {
    const clean = {};
    (EXERCISE_TYPES[type] || EXERCISE_TYPES.kg).cols.forEach(f => {
        if (!set[f]) return;
        const v = f === 'time' ? formatTimeValue(set[f]) : f === 'reps' ? set[f].replace(/\D/g, '') : normalizeDecimalString(set[f]);
        if (v) clean[f] = v;
    });
    ['rest', 'effort', 'note'].forEach(f => { if (set[f]) clean[f] = set[f]; });
    if (set.warmup) clean.warmup = true;
    if (set.done) clean.done = true;
    return clean;
}

