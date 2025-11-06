// Core de la aplicación
(() => {
  'use strict';

  // Marca navegación activa según la página actual
  const setActiveNav = () => {
    const links = document.querySelectorAll('.site-header__nav a, .mobile-nav-link');
    if (!links.length) return;

    const current = location.pathname.split('/').pop() || 'index.html';
    
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const isActive = href.split('/').pop() === current;
      
      link.classList.toggle('active', isActive);
      isActive 
        ? link.setAttribute('aria-current', 'page')
        : link.removeAttribute('aria-current');
    });
  };

  // Inicializa y gestiona formularios de autenticación
  const initForms = () => {
    const forms = {
      login: document.getElementById('loginForm'),
      registro: document.getElementById('registroForm'),
      heroSignup: document.getElementById('heroSignupForm')
    };

    if (forms.login) {
      forms.login.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!forms.login.checkValidity()) {
          forms.login.classList.add('was-validated');
          return;
        }

        const success = document.getElementById('loginSuccess');
        success.style.display = 'block';
        forms.login.style.display = 'none';

        setTimeout(() => {
          bootstrap.Modal.getInstance(document.getElementById('loginModal'))?.hide();
          forms.login.style.display = 'block';
          success.style.display = 'none';
          forms.login.classList.remove('was-validated');
          forms.login.reset();
        }, 2000);
      });
    }

    if (forms.registro) {
      const pwd = document.getElementById('registroPassword');
      const pwdConfirm = document.getElementById('registroPasswordConfirm');

      const validateMatch = () => {
        if (pwd.value && pwdConfirm.value) {
          pwdConfirm.setCustomValidity(
            pwd.value !== pwdConfirm.value ? 'Las contraseñas no coinciden' : ''
          );
        }
      };

      pwd?.addEventListener('input', validateMatch);
      pwdConfirm?.addEventListener('input', validateMatch);

      forms.registro.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        validateMatch();

        if (!forms.registro.checkValidity()) {
          forms.registro.classList.add('was-validated');
          return;
        }

        const success = document.getElementById('registroSuccess');
        success.style.display = 'block';
        forms.registro.style.display = 'none';

        setTimeout(() => {
          bootstrap.Offcanvas.getInstance(document.getElementById('registroOffcanvas'))?.hide();
          forms.registro.style.display = 'block';
          success.style.display = 'none';
          forms.registro.classList.remove('was-validated');
          forms.registro.reset();
        }, 2000);
      });
    }

    if (forms.heroSignup) {
      forms.heroSignup.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = forms.heroSignup.querySelector('input[type="email"]');
        if (!emailInput?.value) return;

        const btn = forms.heroSignup.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        
        btn.textContent = '¡Gracias por unirte!';
        btn.disabled = true;
          
        setTimeout(() => {
          const registroEmail = document.getElementById('registroEmail');
          if (registroEmail) registroEmail.value = emailInput.value;
          
          new bootstrap.Offcanvas(document.getElementById('registroOffcanvas')).show();
          
          forms.heroSignup.reset();
          btn.textContent = originalText;
          btn.disabled = false;
        }, 2000);
      });
    }
  };

  // Enfoca primer input cuando se abre modal/offcanvas
  const initModalFocus = () => {
    const elements = {
      login: document.getElementById('loginModal'),
      registro: document.getElementById('registroOffcanvas')
    };

    if (elements.login) {
      elements.login.addEventListener('shown.bs.modal', () => {
        elements.login.querySelector('input:not([type="checkbox"])')?.focus();
      });
    }

    if (elements.registro) {
      elements.registro.addEventListener('shown.bs.offcanvas', () => {
        elements.registro.querySelector('input:not([type="checkbox"])')?.focus();
      });
    }
  };

  // Scroll suave a secciones
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]:not([href="#"]):not(.mobile-nav-link)').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
          e.preventDefault();
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.pageYOffset - 100,
            behavior: 'smooth'
          });
        }
      });
    });
  };

  // Cerrar offcanvas móvil al hacer clic en enlaces
  const initMobileNavClose = () => {
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const mobileNavOffcanvas = document.querySelector('#mobileNav');
    
    if (mobileNavLinks.length && mobileNavOffcanvas) {
      mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
          // Bootstrap 5 cierra automáticamente con data-bs-dismiss, pero aseguramos cierre
          const bsOffcanvas = bootstrap.Offcanvas.getInstance(mobileNavOffcanvas);
          if (bsOffcanvas) {
            bsOffcanvas.hide();
          }
        });
      });
    }
  };

  // Enlace para saltar contenido (accesibilidad)
  const initSkipLink = () => {
    const main = document.getElementById('main-content');
    if (!main || document.querySelector('.skip-link')) return;

    const link = document.createElement('a');
    link.href = '#main-content';
    link.className = 'skip-link visually-hidden-focusable position-absolute top-0 start-0 p-3 bg-primary text-white';
    link.textContent = 'Saltar al contenido principal';
    link.style.zIndex = '9999';
    
    document.body.insertBefore(link, document.body.firstChild);
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      main.setAttribute('tabindex', '-1');
      main.focus();
      main.removeAttribute('tabindex');
    });
  };

  // Gestiona suscripción a newsletter
  const initNewsletter = () => {
    const form = document.getElementById('footerNewsletterForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = form.querySelector('input[type="email"]');
      if (!email?.value) return;

      const btn = form.querySelector('.newsletter-btn');
      const originalHTML = btn.innerHTML;
      
      btn.innerHTML = '<i class="bi bi-check-lg" aria-hidden="true"></i>';
      btn.disabled = true;
      email.disabled = true;
      
      setTimeout(() => {
        form.reset();
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        email.disabled = false;
        
        const msg = document.createElement('p');
        msg.className = 'newsletter-success';
        msg.style.cssText = 'color: rgba(252,249,250,0.9); font-size: 0.875rem; margin-top: 0.5rem;';
        msg.textContent = '¡Gracias por suscribirte!';
        form.appendChild(msg);
        
        setTimeout(() => {
          msg.style.opacity = '0';
          msg.style.transition = 'opacity 0.3s ease-out';
          setTimeout(() => msg.remove(), 300);
        }, 3000);
      }, 1500);
    });
  };

  // Actualiza año en el footer
  const setCurrentYear = () => {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  };

  // Ejecuta inicializaciones
  setActiveNav();
  initForms();
  initModalFocus();
  initSmoothScroll();
  initSkipLink();
  initNewsletter();
  initMobileNavClose();
  setCurrentYear();

  console.log('✓ NUA initialized');
})();