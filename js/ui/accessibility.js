// Accesibilidad: tamaño de los controles, alto contraste y colores para daltonismo.
// Se aplican con atributos en <html> (data-size, data-contrast, data-vision) que el CSS usa para cambiar
// tamaños y colores sin tocar el diseño. js/boot.js los aplica antes de pintar.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const UI_SIZES = [
    ['normal', 'Normal'],
    ['large', 'Grandes'],
    ['xlarge', 'Muy grandes']
];

function applyUiSize(size) {
    if (size === 'large' || size === 'xlarge') document.documentElement.setAttribute('data-size', size);
    else document.documentElement.removeAttribute('data-size');
}

function applyColorVision(on) {
    if (on) document.documentElement.setAttribute('data-vision', 'cvd');
    else document.documentElement.removeAttribute('data-vision');
}

function applyContrast(on) {
    if (on) document.documentElement.setAttribute('data-contrast', 'high');
    else document.documentElement.removeAttribute('data-contrast');
}

function bindAccessibilitySettings() {
    const contrast = document.getElementById('contrastToggle');
    if (contrast) {
        contrast.checked = db.get('contrast') === 'high';
        contrast.addEventListener('change', () => {
            try { db.set('contrast', contrast.checked ? 'high' : ''); } catch (err) {}
            applyContrast(contrast.checked);
        });
    }
    const sizeBox = document.getElementById('uiSizeChoices');
    if (sizeBox) {
        const render = () => {
            const cur = UI_SIZES.some(([k]) => k === db.get('uiSize')) ? db.get('uiSize') : 'normal';
            sizeBox.innerHTML = UI_SIZES.map(([k, label]) =>
                `<button type="button" class="size-choice${k === cur ? ' on' : ''}" role="radio" aria-checked="${k === cur}" data-size="${k}">${label}</button>`).join('');
        };
        render();
        sizeBox.addEventListener('click', e => {
            const b = e.target.closest('[data-size]');
            if (!b) return;
            try { db.set('uiSize', b.dataset.size); } catch (err) {}
            applyUiSize(b.dataset.size);
            render();
        });
    }
    const cvd = document.getElementById('colorVisionToggle');
    if (cvd) {
        cvd.checked = db.get('colorVision') === 'cvd';
        cvd.addEventListener('change', () => {
            try { db.set('colorVision', cvd.checked ? 'cvd' : ''); } catch (err) {}
            applyColorVision(cvd.checked);
        });
    }
}
