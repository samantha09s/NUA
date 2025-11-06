// Calendario
(() => {
  'use strict';

  // Estado global
  let appState = {
    cycle: {
      lastPeriodStart: null,
      cycleLength: 28
    },
    currentDate: new Date(),
    events: []
  };

  // Fases del ciclo menstrual
  const PHASES = {
    menstrual: {
      name: 'Fase Menstruación',
      range: [0, 4],
      tip: 'Estamos sangrando. El cansancio es real, no mental. Dale a tu cuerpo hierro (espinacas, lentejas, carne) y agua. Y descansa. No te disculpes por necesitarlo.',
      color: { dark: '#8B1538', light: '#F4C2D8' },
      classes: ['day-menstrual-1', 'day-menstrual-2', 'day-menstrual-3', 'day-menstrual-4', 'day-menstrual-5']
    },
    follicular: {
      name: 'Fase Folicular',
      range: [5, 13],
      tip: 'Tu energía vuelve y es hermoso. Aprovéchala: cardio, baile, cualquier cosa que te haga sentir fuerte. La proteína es tu aliada: huevo, pescado, legumbres.',
      color: { dark: '#0D5C3D', light: '#B8E5D2' },
      classes: ['day-follicular-early', 'day-follicular-mid', 'day-follicular-late']
    },
    ovulation: {
      name: 'Fase de Ovulación',
      range: [14, 16],
      tip: 'Te sientes magnética y no lo imaginas: estás ovulando. Tu comunicación está en su punto más claro. Di lo que necesitas decir. Muévete: yoga flow, danza, aeróbico. Este es tu pico.',
      color: { dark: '#C42063', light: '#FFDEE9' },
      classes: ['day-ovulation-fertile', 'day-ovulation-peak']
    },
    luteal: {
      name: 'Fase Lútea',
      range: [17, 28],
      tip: 'Te sientes rara y tiene nombre: fase lútea. La progesterona baja y todo se siente más pesado. No lo aguantes. Di "no" sin culpa. El magnesio te calma: chocolate, almendras, espinacas. Comida caliente también ayuda.',
      color: { dark: '#6B4D7C', light: '#E8D9F0' },
      classes: ['day-luteal-early', 'day-luteal-mid', 'day-luteal-late']
    }
  };

  // Colores por tipo de evento
  const EVENT_COLORS = {
    period: '#8B1538',
    appointment: '#3D8DE9',
    medication: '#FFD200'
  };

  // Calcula día actual del ciclo
  const getCycleDay = () => {
    if (!appState.cycle.lastPeriodStart) return null;
    const diff = appState.currentDate - appState.cycle.lastPeriodStart;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return (days % appState.cycle.cycleLength) + 1;
  };

  // Retorna fase actual
  const getCurrentPhase = () => {
    const day = getCycleDay();
    if (!day) return null;
    
    for (const [key, phase] of Object.entries(PHASES)) {
      const [start, end] = phase.range;
      if (day >= start && day <= end) {
        return { key, ...phase, cycleDay: day };
      }
    }
    return null;
  };

  // Calcula próximo período
  const getNextPeriodDate = () => {
    if (!appState.cycle.lastPeriodStart) return null;
    const next = new Date(appState.cycle.lastPeriodStart);
    next.setDate(next.getDate() + appState.cycle.cycleLength);
    return next;
  };

  // Persiste datos en localStorage
  const saveCycleData = () => {
    localStorage.setItem('nuaCycleData', JSON.stringify({
      lastPeriodStart: appState.cycle.lastPeriodStart?.toISOString(),
      cycleLength: appState.cycle.cycleLength,
      events: appState.events
    }));
  };

  // Carga datos desde localStorage
  const loadCycleData = () => {
    const saved = localStorage.getItem('nuaCycleData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        appState.cycle.lastPeriodStart = data.lastPeriodStart ? new Date(data.lastPeriodStart) : null;
        appState.cycle.cycleLength = data.cycleLength || 28;
        appState.events = data.events || [];
      } catch (e) {
        console.error('Error al cargar datos:', e);
      }
    }
  };

  // Renderiza tarjeta de fase actual
  const renderPhaseCard = () => {
    const phase = getCurrentPhase();
    const container = document.getElementById('phaseToday');
    
    if (!phase) {
      container.innerHTML = '<p>Configura tu ciclo para ver información</p>';
      return;
    }

    const badge = document.getElementById('phaseBadge');
    badge.style.background = `linear-gradient(135deg, ${phase.color.dark}, ${phase.color.light})`;

    document.getElementById('phaseName').textContent = phase.name.toUpperCase();
    document.getElementById('phaseTip').textContent = phase.tip;
    document.getElementById('phaseDay').textContent = `Día ${phase.cycleDay} de ${appState.cycle.cycleLength}`;
  };

  // Renderiza próximo período
  const renderNextPeriod = () => {
    const next = getNextPeriodDate();
    if (!next) return;

    const daysUntil = Math.ceil((next - appState.currentDate) / (1000 * 60 * 60 * 24));
    const formatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' });
    const dateStr = formatter.format(next).toUpperCase();

    document.getElementById('nextPeriodDate').textContent = dateStr;
    
    let text = '';
    if (daysUntil <= 0) {
      text = `Debería haber comenzado hace ${Math.abs(daysUntil)} días`;
    } else if (daysUntil === 1) {
      text = 'Esperado mañana';
    } else {
      text = `Esperado en ${daysUntil} días`;
    }
    document.getElementById('nextPeriodText').textContent = text;
  };

  // Renderiza barra de progreso
  const renderProgress = () => {
    const day = getCycleDay();
    if (!day) {
      document.getElementById('progressLabel').textContent = 'Día - de -';
      document.getElementById('progressBar').style.width = '0%';
      return;
    }

    const percent = (day / appState.cycle.cycleLength) * 100;
    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('progressLabel').textContent = `Día ${day} de ${appState.cycle.cycleLength}`;
  };

  // Renderiza calendario
  const renderCalendar = () => {
    const year = appState.currentDate.getFullYear();
    const month = appState.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Título del mes
    const formatter = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' });
    const formatted = formatter.format(appState.currentDate);
    const monthYear = formatted.replace(' de ', ' ').charAt(0).toUpperCase() + formatted.replace(' de ', ' ').slice(1);
    document.getElementById('calendarMonth').textContent = monthYear;

    let html = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!appState.cycle.lastPeriodStart) {
      document.getElementById('calendarDays').innerHTML = '';
      return;
    }

    // Días del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      html += `<div class="day-cell other-month"><span class="day-number">${day}</span></div>`;
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0, 0, 0, 0);

      let classes = 'day-cell';
      let phaseClass = '';

      // Determina fase del ciclo
      const timeDiff = currentDate - appState.cycle.lastPeriodStart;
      const dayOfCycle = (Math.floor(timeDiff / (1000 * 60 * 60 * 24)) % appState.cycle.cycleLength) + 1;

      for (const [key, phase] of Object.entries(PHASES)) {
        const [start, end] = phase.range;
        if (dayOfCycle >= start && dayOfCycle <= end) {
          const idx = dayOfCycle - start;
          phaseClass = phase.classes[Math.min(idx, phase.classes.length - 1)];
          break;
        }
      }

      if (phaseClass) classes += ` ${phaseClass}`;
      if (currentDate.getTime() === today.getTime()) classes += ' day-today';

      // Indicador de evento
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayEvents = appState.events.filter(e => e.date === dateStr);
      let eventDot = '';

      if (dayEvents.length > 0) {
        const eventType = dayEvents[0].type;
        const dotColor = EVENT_COLORS[eventType] || '#C42063';
        eventDot = `<div class="day-event-dot" style="background: ${dotColor};"></div>`;
      }

      html += `<div class="${classes}" title="${day}"><span class="day-number">${day}</span>${eventDot}</div>`;
    }

    // Días del mes siguiente
    const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;
    const nextMonthDays = totalCells - (daysInMonth + firstDay);
    for (let day = 1; day <= nextMonthDays; day++) {
      html += `<div class="day-cell other-month"><span class="day-number">${day}</span></div>`;
    }

    document.getElementById('calendarDays').innerHTML = html;
  };

  // Renderiza próximos eventos
  const renderUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = appState.events
      .filter(e => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    const container = document.getElementById('eventsList');

    if (upcoming.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-calendar-check" aria-hidden="true"></i>
          <p>Sin registros próximos</p>
        </div>
      `;
      return;
    }

    container.innerHTML = upcoming.map(event => {
      const date = new Date(event.date);
      const formatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' });
      const dateStr = formatter.format(date);

      return `
        <div class="event-item event-${event.type}">
          <div class="event-date">
            <strong>${dateStr.split(' ')[0]}</strong>
            <small>${dateStr.split(' ')[1]}</small>
          </div>
          <div class="event-content">
            <p class="event-title">${event.title}</p>
            ${event.description ? `<p class="event-desc">${event.description}</p>` : ''}
          </div>
          <button class="btn-delete-event" data-id="${event.id}" aria-label="Eliminar">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-delete-event').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        appState.events = appState.events.filter(ev => ev.id !== id);
        saveCycleData();
        renderUpcomingEvents();
        renderCalendar();
      });
    });
  };

  // Procesa formulario de ciclo
  const handleCycleForm = (e) => {
    e.preventDefault();

    const form = document.getElementById('cycleForm');
    const lastPeriodDate = document.getElementById('lastPeriodDate').value.trim();
    const cycleLengthInput = document.getElementById('cycleLength').value.trim();
    const cycleLength = parseInt(cycleLengthInput, 10);

    if (!lastPeriodDate || isNaN(cycleLength) || cycleLength < 21 || cycleLength > 35) {
      alert('Verifica que la fecha sea válida y el ciclo esté entre 21 y 35 días.');
      return;
    }

    appState.cycle.lastPeriodStart = new Date(lastPeriodDate + 'T00:00:00');
    appState.cycle.cycleLength = cycleLength;

    saveCycleData();

    renderPhaseCard();
    renderNextPeriod();
    renderProgress();
    renderCalendar();

    const successEl = document.getElementById('cycleSuccess');
    successEl.style.display = 'block';
    
    setTimeout(() => {
      try {
        bootstrap.Modal.getInstance(document.getElementById('cycleModal')).hide();
      } catch (err) {
        // Modal cerrado
      }
      successEl.style.display = 'none';
      form.reset();
    }, 1500);
  };

  // Procesa formulario de eventos
  const handleEventForm = (e) => {
    e.preventDefault();

    const event = {
      id: Date.now().toString(),
      type: document.getElementById('eventType').value,
      date: document.getElementById('eventDate').value,
      title: document.getElementById('eventTitle').value,
      description: document.getElementById('eventDescription').value || ''
    };

    appState.events.push(event);
    saveCycleData();

    renderCalendar();
    renderUpcomingEvents();

    const successEl = document.getElementById('eventSuccess');
    successEl.style.display = 'block';
    setTimeout(() => {
      bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
      document.getElementById('eventForm').reset();
      successEl.style.display = 'none';
    }, 1500);
  };

  // Configura navegación del calendario
  const setupCalendarNav = () => {
    document.getElementById('prevMonth').addEventListener('click', () => {
      appState.currentDate.setMonth(appState.currentDate.getMonth() - 1);
      renderCalendar();
      renderPhaseCard();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
      appState.currentDate.setMonth(appState.currentDate.getMonth() + 1);
      renderCalendar();
      renderPhaseCard();
    });
  };

  // Configura botón de configuración
  const setupConfigButton = () => {
    const btn = document.getElementById('btnConfig');
    btn.addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('cycleModal'));
      modal.show();
    });

    btn.addEventListener('mousedown', () => {
      btn.style.backgroundColor = '#A01649';
    });

    btn.addEventListener('mouseup', () => {
      btn.style.backgroundColor = '';
    });
  };

  // Inicializa aplicación
  document.addEventListener('DOMContentLoaded', () => {
    loadCycleData();

    if (!appState.cycle.lastPeriodStart) {
      const modal = new bootstrap.Modal(document.getElementById('cycleModal'), { backdrop: 'static' });
      modal.show();
    } else {
      renderPhaseCard();
      renderNextPeriod();
      renderProgress();
      renderCalendar();
      renderUpcomingEvents();
    }

    document.getElementById('cycleForm').addEventListener('submit', handleCycleForm);
    document.getElementById('eventForm').addEventListener('submit', handleEventForm);
    setupCalendarNav();
    setupConfigButton();

    console.log('✓ NUA Calendar initialized');
  });
})();