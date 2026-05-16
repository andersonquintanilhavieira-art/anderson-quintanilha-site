/* =====================================================
   ANDERSON QUINTANILHA — JavaScript Premium
   Módulos: Partículas · Animações · Interatividade
   ===================================================== */

'use strict';

// ─── Ano dinâmico no footer ───────────────────────────
document.getElementById('current-year').textContent = new Date().getFullYear();

// ─── Sistema de Partículas ───────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const GOLD = { r: 230, g: 172, b: 0 };
  const MAX_PARTICLES = 55;
  const CONNECTION_DIST = 130;

  let W, H, particles = [], mouse = { x: -9999, y: -9999 };
  let rafId;
  let isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      vx: rand(-0.18, 0.18),
      vy: rand(-0.18, 0.18),
      r: rand(0.8, 2),
      alpha: rand(0.12, 0.45),
      alphaSpeed: rand(0.002, 0.006),
      alphaDir: Math.random() > 0.5 ? 1 : -1,
    };
  }

  function initParticlesArr() {
    particles = [];
    const count = isReduced ? 0 : MAX_PARTICLES;
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
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
    ctx.strokeStyle = `rgba(${GOLD.r}, ${GOLD.g}, ${GOLD.b}, ${alpha * 0.3})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  function updateParticle(p) {
    // mouse attraction leve
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 180) {
      const force = (180 - dist) / 180 * 0.0012;
      p.vx += dx * force;
      p.vy += dy * force;
    }

    // velocidade máxima
    const speed = Math.hypot(p.vx, p.vy);
    if (speed > 0.4) {
      p.vx = (p.vx / speed) * 0.4;
      p.vy = (p.vy / speed) * 0.4;
    }

    p.x += p.vx;
    p.y += p.vy;

    // pulsação de opacidade
    p.alpha += p.alphaSpeed * p.alphaDir;
    if (p.alpha >= 0.45 || p.alpha <= 0.08) {
      p.alphaDir *= -1;
    }

    // wrap nas bordas
    if (p.x < -10) p.x = W + 10;
    if (p.x > W + 10) p.x = -10;
    if (p.y < -10) p.y = H + 10;
    if (p.y > H + 10) p.y = -10;
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    // conexões
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.hypot(dx, dy);
        if (d < CONNECTION_DIST) {
          const alpha = 1 - d / CONNECTION_DIST;
          drawConnection(particles[i], particles[j], alpha);
        }
      }
    }

    // pontos
    for (const p of particles) {
      updateParticle(p);
      drawParticle(p);
    }

    rafId = requestAnimationFrame(render);
  }

  function start() {
    resize();
    initParticlesArr();
    if (!isReduced) render();
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(rafId);
    resize();
    initParticlesArr();
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


// ─── Animação de entrada dos cards ───────────────────
(function animateCards() {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cards = document.querySelectorAll('.link-card');
  const baseDelay = 1.05;
  const step = 0.1;

  cards.forEach((card, i) => {
    if (isReduced) {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    } else {
      card.style.transition = `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${baseDelay + i * step}s, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${baseDelay + i * step}s`;
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }
  });
})();


// ─── Efeito de tilt suave nos cards (desktop) ────────
(function initCardTilt() {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReduced) return;

  const cards = document.querySelectorAll('.link-card');
  const MAX_TILT = 3; // graus

  function onMove(e, card) {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const dx = (clientX - cx) / (rect.width / 2);
    const dy = (clientY - cy) / (rect.height / 2);

    const rotateX = -dy * MAX_TILT;
    const rotateY = dx * MAX_TILT;

    card.style.transform = `translateY(-2px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  function onLeave(card) {
    card.style.transform = '';
  }

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => onMove(e, card), { passive: true });
    card.addEventListener('mouseleave', () => onLeave(card));
  });
})();


// ─── Efeito de ripple ao clicar nos cards ────────────
(function initRipple() {
  const cards = document.querySelectorAll('.link-card');

  cards.forEach((card) => {
    card.addEventListener('click', function (e) {
      // não bloqueia navegação
      const ripple = document.createElement('span');
      const rect = card.getBoundingClientRect();

      const size = Math.max(rect.width, rect.height) * 1.8;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top  - size / 2;

      Object.assign(ripple.style, {
        position: 'absolute',
        width:  `${size}px`,
        height: `${size}px`,
        left:   `${x}px`,
        top:    `${y}px`,
        borderRadius: '50%',
        background: 'rgba(230, 172, 0, 0.08)',
        transform: 'scale(0)',
        pointerEvents: 'none',
        animation: 'ripple-anim 0.55s ease-out forwards',
        zIndex: 0,
      });

      card.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // Injeta keyframe se ainda não existe
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes ripple-anim {
        to { transform: scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
})();


// ─── Smooth reveal com IntersectionObserver ──────────
(function initReveal() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const els = document.querySelectorAll('.badge');
  let delay = 0;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0) scale(1)';
        }, delay);
        delay += 40;
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.1 });

  els.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px) scale(0.95)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    obs.observe(el);
  });
})();
