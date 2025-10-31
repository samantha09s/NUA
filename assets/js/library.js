// Biblioteca
(() => {
  'use strict';

  // Normaliza texto para búsqueda
  const normalize = (str) =>
    (str || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  // Debounce para optimizar búsqueda
  const debounce = (fn, ms = 150) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  };

  // Filtros por categoría
  const initFilters = () => {
    const filterButtons = document.querySelectorAll('.filter-tag');
    const allCards = document.querySelectorAll('.content-card[data-category]');

    if (!filterButtons.length || !allCards.length) return;

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        allCards.forEach(card => {
          const cardCategory = card.dataset.category;
          const isVisible = btn.dataset.category === 'all' || cardCategory === btn.dataset.category;
          card.style.display = isVisible ? '' : 'none';
        });

        // Oculta secciones sin contenido
        document.querySelectorAll('.content-section').forEach(section => {
          const visibleCards = section.querySelectorAll('.content-card:not([style*="display: none"])');
          section.style.display = visibleCards.length > 0 ? '' : 'none';
        });
      });
    });
  };

  // Búsqueda de contenido
  const initSearch = () => {
    const searchInput = document.querySelector('.search-bar input[type="search"]');
    const allCards = document.querySelectorAll('.content-card');

    if (!searchInput || !allCards.length) return;

    const storageKey = 'nua:library:search';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      searchInput.value = saved;
      setTimeout(() => applyFilter(saved), 0);
    }

    searchInput.addEventListener('input', debounce((e) => {
      const query = e.target.value || '';
      localStorage.setItem(storageKey, query);
      applyFilter(query);
    }, 120));

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        localStorage.removeItem(storageKey);
        applyFilter('');
        searchInput.blur();
      }
    });

    document.querySelector('.search-bar .input-group-text:last-child')
      ?.addEventListener('click', () => searchInput.focus());

    function applyFilter(query) {
      const normalized = normalize(query);
      
      allCards.forEach(card => {
        const title = card.querySelector('.content-card__title')?.textContent || '';
        const author = card.querySelector('.content-card__author')?.textContent || '';
        const matches = !query || normalize(`${title} ${author}`).includes(normalized);
        
        card.style.display = matches ? '' : 'none';
      });

      document.querySelectorAll('.content-section').forEach(section => {
        const visibleCards = section.querySelectorAll('.content-card:not([style*="display: none"])');
        section.style.display = visibleCards.length > 0 ? '' : 'none';
      });
    }
  };

  // Scroll horizontal con botones
  const initHorizontalScroll = () => {
    const scrollContainers = {
      articles: document.getElementById('articlesScroll'),
      guides: document.getElementById('guidesScroll'),
      videos: document.getElementById('videosScroll'),
      podcasts: document.getElementById('podcastsScroll')
    };

    const scrollAmount = 320;

    Object.keys(scrollContainers).forEach(key => {
      const container = scrollContainers[key];
      if (!container) return;

      const prevBtn = document.querySelector(`[data-scroll="${key}-prev"]`);
      const nextBtn = document.querySelector(`[data-scroll="${key}-next"]`);

      if (!prevBtn || !nextBtn) return;

      prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });

      const updateButtons = () => {
        const atStart = container.scrollLeft === 0;
        const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
        
        prevBtn.style.opacity = atStart ? '0.3' : '1';
        prevBtn.style.pointerEvents = atStart ? 'none' : 'auto';
        
        nextBtn.style.opacity = atEnd ? '0.3' : '1';
        nextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
      };

      container.addEventListener('scroll', updateButtons);
      updateButtons();
    });
  };

  // Interacciones visuales en tarjetas
  const initCardInteractions = () => {
    const allCards = document.querySelectorAll('.content-card');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    allCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (!prefersReduced) {
          const image = card.querySelector('.content-card__image img');
          if (image) image.style.filter = 'brightness(0.95)';
        }
      });

      card.addEventListener('mouseleave', () => {
        const image = card.querySelector('.content-card__image img');
        if (image) image.style.filter = 'brightness(1)';
      });
    });
  };

  // Formulario de sugerencias
  const initSuggestionsForm = () => {
    const form = document.getElementById('suggestionsForm');
    const successAlert = document.getElementById('suggestionsSuccess');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      
      const button = form.querySelector('button[type="submit"]');
      const originalText = button.textContent;
      button.disabled = true;
      button.innerHTML = '<i class="bi bi-check-lg me-2"></i>Enviando...';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        form.reset();
        form.classList.remove('was-validated');
        
        successAlert.style.display = 'block';
        setTimeout(() => {
          successAlert.style.display = 'none';
          const modal = bootstrap.Modal.getInstance(document.getElementById('suggestionsModal'));
          if (modal) modal.hide();
        }, 2000);
      }, 1200);
    });
  };

  // Inicializa todos los módulos
  initFilters();
  initSearch();
  initHorizontalScroll();
  initCardInteractions();
  initSuggestionsForm();

  console.log('✓ NUA Library initialized');
})();