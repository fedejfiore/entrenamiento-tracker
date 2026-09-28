// Secciones plegables (acordeón): el título pasa a ser un botón que abre o cierra la
// sección, con una línea que resume qué hay adentro (data-hint). Se usa en Ajustes para
// que la pantalla no sea una lista larga: se abre solo lo que se necesita.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

function initCollapsibleSections(root) {
    if (!root) return;
    root.querySelectorAll(':scope > .section:not([data-collapsible="no"])').forEach((section, i) => {
        if (section.classList.contains('collapsible')) return;
        const h2 = section.querySelector(':scope > h2');
        if (!h2) return;
        const bodyId = section.id ? `${section.id}-body` : `collapsible-${root.dataset.screen || 'x'}-${i}`;
        const body = document.createElement('div');
        body.className = 'section-body';
        body.id = bodyId;
        body.hidden = true;
        while (h2.nextSibling) body.appendChild(h2.nextSibling);
        section.appendChild(body);

        const title = h2.innerHTML;
        const hint = section.dataset.hint ? `<small class="section-hint">${escapeHtml(section.dataset.hint)}</small>` : '';
        h2.innerHTML = `<button type="button" class="section-toggle" aria-expanded="false" aria-controls="${bodyId}">
                <span class="section-toggle-text"><span class="section-title">${title}</span>${hint}</span>
                <span class="section-chevron" aria-hidden="true">▸</span>
            </button>`;
        section.classList.add('collapsible');
        h2.querySelector('.section-toggle').addEventListener('click', () => setSectionOpen(section, body.hidden));
    });
}

function setSectionOpen(section, open) {
    const body = section.querySelector(':scope > .section-body');
    const btn = section.querySelector('.section-toggle');
    if (!body || !btn) return;
    body.hidden = !open;
    section.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.querySelector('.section-chevron').textContent = open ? '▾' : '▸';
    if (open) section.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
