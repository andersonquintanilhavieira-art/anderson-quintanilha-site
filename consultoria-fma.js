/* =====================================================
   ANDERSON QUINTANILHA — CONSULTORIA FMA
   Módulos: Autenticação · Partículas · Reveal · UX
   ===================================================== */

'use strict';

// ─── Constantes ───────────────────────────────────────
const CORRECT_PASSWORD = 'assistencia24h';
const SESSION_KEY = 'aq_fma_auth';

// ─── Elementos principais ─────────────────────────────
const lockScreen  = document.getElementById('lock-screen');
const contentPage = document.getElementById('content-page');
const lockForm    = document.getElementById('lock-form');
const passInput   = document.getElementById('password-input');
const lockError   = document.getElementById('lock-error');
const inputWrapper= document.getElementById('input-wrapper');
const toggleBtn   = document.getElementById('toggle-visibility');
const eyeIcon     = document.getElementById('eye-icon');

// ─── Verificação de sessão ────────────────────────────
(function checkSession() {
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    showContent(false);
  }
})();

// ─── Formulário de acesso ─────────────────────────────
lockForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const value = passInput.value.trim();

  if (value === CORRECT_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, '1');
    showContent(true);
  } else {
    showError('Código incorreto. Tente novamente.');
    shakeInput();
    passInput.select();
  }
});

function showContent(animate) {
  lockScreen.style.transition = animate ? 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)' : '';
  lockScreen.style.opacity = '0';
  lockScreen.style.transform = 'scale(0.96)';

  setTimeout(() => {
    lockScreen.style.display = 'none';
    lockScreen.setAttribute('aria-hidden', 'true');
    contentPage.style.display = 'flex';
    contentPage.removeAttribute('aria-hidden');
    document.getElementById('current-year-doc').textContent = new Date().getFullYear();

    if (animate) {
      contentPage.style.opacity = '0';
      requestAnimationFrame(() => {
        contentPage.style.transition = 'opacity 0.5s ease';
        contentPage.style.opacity = '1';
      });
    }

    initReveal();
    initCardAnimations();
  }, animate ? 480 : 0);
}

function showError(msg) {
  lockError.textContent = msg;
  lockError.classList.add('visible');
  setTimeout(() => lockError.classList.remove('visible'), 3000);
}

function shakeInput() {
  inputWrapper.classList.remove('input-error');
  void inputWrapper.offsetWidth; // reflow para reiniciar a animação
  inputWrapper.classList.add('input-error');
  setTimeout(() => inputWrapper.classList.remove('input-error'), 450);
}

// ─── Toggle visibilidade da senha ─────────────────────
toggleBtn.addEventListener('click', function () {
  const isPassword = passInput.type === 'password';
  passInput.type = isPassword ? 'text' : 'password';

  eyeIcon.innerHTML = isPassword
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;

  passInput.focus();
});

// ─── Sistema de Partículas ───────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const GOLD = { r: 230, g: 172, b: 0 };
  const MAX_PARTICLES = 50;
  const CONNECTION_DIST = 120;

  let W, H, particles = [], mouse = { x: -9999, y: -9999 };
  let rafId;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticle() {
    return {
      x: rand(0, W),
      y: rand(0, H),
      vx: rand(-0.15, 0.15),
      vy: rand(-0.15, 0.15),
      r: rand(0.6, 1.8),
      alpha: rand(0.1, 0.4),
      alphaSpeed: rand(0.002, 0.005),
      alphaDir: Math.random() > 0.5 ? 1 : -1,
    };
  }

  function initArr() {
    particles = [];
    const count = isReduced ? 0 : MAX_PARTICLES;
    for (let i = 0; i < count; i++) particles.push(createParticle());
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${GOLD.r}, ${GOLD.g}, ${GOLD.b}, ${p.alpha})`;
    ctx.fill();
  }

  function drawConnection(a, b, alpha) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(${GOLD.r}, ${GOLD.g}, ${GOLD.b}, ${alpha * 0.25})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  function updateParticle(p) {
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 160) {
      const force = (160 - dist) / 160 * 0.001;
      p.vx += dx * force;
      p.vy += dy * force;
    }

    const speed = Math.hypot(p.vx, p.vy);
    if (speed > 0.35) {
      p.vx = (p.vx / speed) * 0.35;
      p.vy = (p.vy / speed) * 0.35;
    }

    p.x += p.vx;
    p.y += p.vy;

    p.alpha += p.alphaSpeed * p.alphaDir;
    if (p.alpha >= 0.4 || p.alpha <= 0.08) p.alphaDir *= -1;

    if (p.x < -10) p.x = W + 10;
    if (p.x > W + 10) p.x = -10;
    if (p.y < -10) p.y = H + 10;
    if (p.y > H + 10) p.y = -10;
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (d < CONNECTION_DIST) {
          drawConnection(particles[i], particles[j], 1 - d / CONNECTION_DIST);
        }
      }
    }

    for (const p of particles) {
      updateParticle(p);
      drawParticle(p);
    }

    rafId = requestAnimationFrame(render);
  }

  function start() {
    resize();
    initArr();
    if (!isReduced) render();
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(rafId);
    resize();
    initArr();
    if (!isReduced) render();
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  start();
})();


// ─── Reveal com IntersectionObserver ─────────────────
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    // fallback: mostrar tudo
    document.querySelectorAll('.reveal-el').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-el').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal-el').forEach(el => obs.observe(el));
}

// ─── Animações de entrada para activity items ─────────
function initCardAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = document.querySelectorAll('.activity-item, .deliverable-item');
  items.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(12px)';
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = (idx % 6) * 50;
        setTimeout(() => {
          el.style.transition = `opacity 0.5s var(--ease-smooth), transform 0.5s var(--ease-smooth)`;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.05 });

  items.forEach(item => obs.observe(item));
}

// ─── Smooth progress indicator na leitura ────────────
(function initReadingProgress() {
  const bar = document.createElement('div');
  Object.assign(bar.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0%',
    height: '2px',
    background: 'linear-gradient(90deg, #e6ac00, #f5c518)',
    zIndex: '1000',
    transition: 'width 0.1s linear',
    pointerEvents: 'none',
    boxShadow: '0 0 8px rgba(230,172,0,0.5)',
  });
  document.body.appendChild(bar);

  function updateBar() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const progress = (window.scrollY / docHeight) * 100;
    bar.style.width = `${Math.min(progress, 100)}%`;
  }

  // Só ativa quando o conteúdo está visível
  const observer = new MutationObserver(() => {
    if (contentPage && contentPage.style.display !== 'none') {
      window.addEventListener('scroll', updateBar, { passive: true });
      updateBar();
    }
  });

  if (contentPage) {
    observer.observe(contentPage, { attributes: true, attributeFilter: ['style'] });
  }
})();

// ─── Back to top ─────────────────────────────────────
(function initBackToTop() {
  const btn = document.createElement('button');
  btn.setAttribute('aria-label', 'Voltar ao topo');
  btn.id = 'back-to-top';
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    width: '44px',
    height: '44px',
    background: 'rgba(230, 172, 0, 0.12)',
    border: '1px solid rgba(230, 172, 0, 0.25)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: '99',
    opacity: '0',
    transform: 'translateY(8px) scale(0.9)',
    transition: 'opacity 0.3s ease, transform 0.3s ease, background 0.2s ease, box-shadow 0.2s ease',
    pointerEvents: 'none',
    color: '#e6ac00',
  });

  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 15l-6-6-6 6"/></svg>`;

  btn.addEventListener('mouseenter', () => {
    btn.style.background = 'rgba(230, 172, 0, 0.2)';
    btn.style.boxShadow = '0 0 20px rgba(230,172,0,0.25)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'rgba(230, 172, 0, 0.12)';
    btn.style.boxShadow = '';
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    const visible = window.scrollY > 400 && contentPage && contentPage.style.display !== 'none';
    btn.style.opacity = visible ? '1' : '0';
    btn.style.transform = visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.9)';
    btn.style.pointerEvents = visible ? 'auto' : 'none';
  }, { passive: true });
})();
