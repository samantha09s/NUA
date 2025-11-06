// Formulario de contacto
(() => {
  'use strict';

  const initContactForm = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      // Simular envío
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Enviando...';
      btn.disabled = true;

      setTimeout(() => {
        form.style.display = 'none';
        document.getElementById('contactSuccess').style.display = 'block';
        form.classList.remove('was-validated');
        form.reset();
      }, 1500);
    });
  };

  initContactForm();
  
  console.log('✓ Contact page initialized');
})();