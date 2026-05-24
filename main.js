// =========================
// Footer year
// =========================
document.getElementById('year').textContent = new Date().getFullYear();

// =========================
// Nav scroll state
// =========================
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// =========================
// Reveal-on-scroll
// =========================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const targets = document.querySelectorAll(
  '.section, .tile, .case, .patent, .contact__card, .hero__stats li, .timeline__item'
);
targets.forEach(el => el.classList.add('reveal'));

if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  targets.forEach(el => io.observe(el));
} else {
  targets.forEach(el => el.classList.add('is-in'));
}

// =========================
// Hero canvas: constellation
// =========================
(function heroConstellation() {
  if (reduceMotion) return;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const hero = canvas.parentElement;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  let nodes = [];
  let width = 0, height = 0;
  let rafId = null;
  let running = true;
  let mouse = { x: -1e6, y: -1e6 };

  const NODE_DENSITY = 0.00009; // nodes per pixel
  const MAX_NODES = 110;
  const LINK_DIST = 130;
  const COLOR_NODE = 'rgba(255, 122, 61, 0.85)';
  const COLOR_LINK = 'rgba(139, 124, 255, ';

  function size() {
    const rect = hero.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(320, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const count = Math.min(MAX_NODES, Math.max(36, Math.floor(width * height * NODE_DENSITY)));
    nodes = new Array(count).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.6
    }));
  }

  function step() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    // links first
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.35;
          ctx.strokeStyle = COLOR_LINK + alpha.toFixed(3) + ')';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // mouse-to-node line (cursor as a "node")
      const mdx = a.x - mouse.x;
      const mdy = a.y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < LINK_DIST * 1.4) {
        const alpha = (1 - mdist / (LINK_DIST * 1.4)) * 0.5;
        ctx.strokeStyle = 'rgba(255, 122, 61, ' + alpha.toFixed(3) + ')';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    // nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -10) n.x = width + 10;
      if (n.x > width + 10) n.x = -10;
      if (n.y < -10) n.y = height + 10;
      if (n.y > height + 10) n.y = -10;

      ctx.fillStyle = COLOR_NODE;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(step);
  }

  function onMouseMove(e) {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }
  function onMouseLeave() {
    mouse.x = -1e6; mouse.y = -1e6;
  }

  // Pause when hero is off-screen
  const visIo = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !running) {
        running = true;
        step();
      } else if (!e.isIntersecting && running) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      }
    }
  }, { threshold: 0.01 }) : null;
  if (visIo) visIo.observe(hero);

  let resizeT = null;
  window.addEventListener('resize', () => {
    if (resizeT) clearTimeout(resizeT);
    resizeT = setTimeout(size, 120);
  }, { passive: true });

  hero.addEventListener('mousemove', onMouseMove, { passive: true });
  hero.addEventListener('mouseleave', onMouseLeave, { passive: true });

  size();
  step();
})();
