(() => {
  'use strict';

  /* ------------------- */
  /*       HELPERS       */
  /* ------------------- */
  const normalize = (s) =>
    (s || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const debounce = (fn, ms = 150) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // Crea (si no existe) y devuelve un nodo de “sin resultados”.
  const ensureEmptyState = (container) => {
    const ID = 'nua-empty-state';
    let node = container.querySelector(`#${ID}`);
    if (!node) {
      node = document.createElement('div');
      node.id = ID;
      node.className = 'text-center py-4';
      node.style.display = 'none';
      node.innerHTML = `
        <p class="mb-1 fw-semibold">No encontramos resultados.</p>
        <p class="text-muted mb-0">Prueba con otras palabras clave.</p>
      `;
      container.appendChild(node);
    }
    return node;
  };


  /* ----------------------- */
  /* MARCA NAVEGACIÓN ACTIVA */
  /* ----------------------- */
  (() => {
    const navLinks = document.querySelectorAll('.site-header__nav a[href]');
    if (!navLinks.length) return;

    const current = location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href && current.endsWith(href)) a.classList.add('active');
      else a.classList.remove('active');
    });
  })();

  /* ---------------- */
  /* BÚSQUEDA EN VIVO */
  /* ---------------- */
  (() => {
    const searchInput = document.querySelector('.search-bar input[type="search"]');
    const cards = Array.from(document.querySelectorAll('.article-card'));
    const section = document.querySelector('.articles-section');

    if (!searchInput || !cards.length || !section) return;

    const emptyState = ensureEmptyState(section);
    const COL_SELECTOR = '.col-lg-6, .col-md-6, .col-sm-12';

    // Persistencia ligera de búsqueda.
    const STORE_KEY = 'nua:library:search';
    const saved = localStorage.getItem(STORE_KEY) || '';
    if (saved) {
      searchInput.value = saved;
      setTimeout(() => applyFilter(saved), 0);
    }

    searchInput.addEventListener(
      'input',
      debounce((e) => {
        const q = e.target.value || '';
        localStorage.setItem(STORE_KEY, q);
        applyFilter(q);
      }, 120)
    );

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        localStorage.removeItem(STORE_KEY);
        applyFilter('');
        searchInput.blur();
      }
    });

    const mic = document.querySelector('.search-bar .input-group-text:last-child');
    mic?.addEventListener('click', () => searchInput.focus());

    // Core del filtrado (título + descripción + autor).
    function applyFilter(rawQuery) {
      const query = normalize(rawQuery);
      let visible = 0;

      cards.forEach((card) => {
        const title = card.querySelector('.article-card__title')?.textContent || '';
        const desc = card.querySelector('.article-card__description')?.textContent || '';
        const author = card.querySelector('.article-card__author')?.textContent || '';
        const hay = normalize(`${title} ${desc} ${author}`).includes(query);

        // Oculta/muestra la columna contenedora para mantener grilla.
        const col = card.closest(COL_SELECTOR) || card;
        col.style.display = hay ? '' : 'none';
        if (hay) visible++;
      });

      // Estado vacío: solo se muestra cuando no hay ningún match.
      emptyState.style.display = visible ? 'none' : '';
    }
  })();

  (() => {
    const input = document.querySelector('.search-bar input[type="search"]');
    if (!input) return;
    const labels = document.querySelectorAll('label[for="' + (input.id || '') + '"]');
    labels.forEach((lbl) =>
      lbl.addEventListener('click', () => setTimeout(() => input.focus(), 50))
    );
  })();
})();