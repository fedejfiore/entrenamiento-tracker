// Medidas corporales y su gráfico.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

function saveBodyMetrics() {
    const body = BodyMeasurement.create({
        date: document.getElementById('bodyDate').value,
        weight: parseFloat(document.getElementById('bodyWeight').value),
        fat: parseFloat(document.getElementById('bodyFat').value),
        muscle: parseFloat(document.getElementById('bodyMuscle').value),
        water: parseFloat(document.getElementById('bodyWater').value),
        waist: parseFloat(document.getElementById('bodyWaist').value)
    });

    if (!body.weight || !body.date) {
        showToast('Completá fecha y peso', 'error');
        return;
    }

    try {
        repo.bodyMetrics.add(body);
    } catch (err) {
        showToast(`❌ No se pudo guardar la medida. ${err.message}`, 'error', 6000);
        return;
    }

    showToast('✅ Métricas guardadas');
    saveMeasurementPhoto(body.date);
    updateBodyChart();
}

let bodyChart;

// Guarda/recupera la escala manual del eje Y del gráfico corporal, para que no
// se pierda al recargar la página.
function saveBodyChartScale() {
    const min = document.getElementById('bodyChartYMin')?.value || '';
    const max = document.getElementById('bodyChartYMax')?.value || '';
    db.set('bodyChartScale', { min, max });
}

function loadBodyChartScale() {
    const saved = db.get('bodyChartScale');
    const minEl = document.getElementById('bodyChartYMin');
    const maxEl = document.getElementById('bodyChartYMax');
    if (minEl && saved.min !== undefined) minEl.value = saved.min;
    if (maxEl && saved.max !== undefined) maxEl.value = saved.max;
}

function updateBodyChart() {
    saveBodyChartScale();

    let metrics = repo.bodyMetrics.all();
    if (!Array.isArray(metrics) || metrics.length === 0) return;

    let labels = metrics.map(m => m?.date || '').filter(Boolean);
    let datasets = [];

    const colors = {
        weight: cssVar('--brand'),
        fat: cssVar('--danger'),
        muscle: cssVar('--success'),
        water: '#3498db',
        waist: '#8b5cf6'
    };

    const metricDefs = [
        { checkboxId: 'metric_weight', field: 'weight', label: 'Peso' },
        { checkboxId: 'metric_fat', field: 'fat', label: 'Grasa' },
        { checkboxId: 'metric_muscle', field: 'muscle', label: 'Músculo' },
        { checkboxId: 'metric_water', field: 'water', label: 'Agua' },
        { checkboxId: 'metric_waist', field: 'waist', label: 'Cintura' }
    ];

    metricDefs.forEach(def => {
        const checkbox = document.getElementById(def.checkboxId);
        if (!checkbox || !checkbox.checked) return;
        datasets.push({
            label: def.label,
            data: metrics.map(m => m?.[def.field] ?? null),
            borderColor: colors[def.field],
            backgroundColor: colors[def.field] + '20',
            tension: 0.3,
            pointRadius: 4,
            spanGaps: true
        });
    });

    const bodyChartCanvas = document.getElementById('bodyChart');
    if (!bodyChartCanvas) return;
    if (typeof Chart === 'undefined') {
        console.error('Chart.js no se cargó (¿sin conexión al CDN?)');
        return;
    }

    const yMinRaw = document.getElementById('bodyChartYMin')?.value;
    const yMaxRaw = document.getElementById('bodyChartYMax')?.value;
    const yScale = { grid: { color: cssVar('--border') }, ticks: { color: cssVar('--text-muted') } };
    if (yMinRaw !== '' && yMinRaw != null) yScale.min = parseFloat(yMinRaw);
    if (yMaxRaw !== '' && yMaxRaw != null) yScale.max = parseFloat(yMaxRaw);

    try {
        const ctx = bodyChartCanvas.getContext('2d');
        if (bodyChart) bodyChart.destroy();
        bodyChart = new Chart(ctx, {
            type: 'line',
            data: {labels, datasets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {legend: {labels: {color: cssVar('--text-muted')}}},
                scales: {
                    y: yScale,
                    x: { grid: { color: cssVar('--border') }, ticks: { color: cssVar('--text-muted') } }
                }
            }
        });
    } catch (err) {
        console.error('Error en updateBodyChart:', err);
    }
}

