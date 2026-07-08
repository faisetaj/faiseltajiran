/* ==========================================================================
   faiseltajiran.com — motion engine
   GSAP 3.13 (ScrollTrigger · SplitText · ScrambleText) + Lenis 1.3
   ========================================================================== */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const page = document.body.dataset.page || 'home';

  /* ---------- Always-on basics (clock, year, accordion) ---------- */
  const tick = () => {
    const t = new Date().toLocaleTimeString('en-US', {
      timeZone: 'America/Chicago', hour12: false,
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    document.querySelectorAll('[data-clock]').forEach(el => { el.textContent = `HOU ${t}`; });
  };
  tick(); setInterval(tick, 1000);
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Theme toggle (dark default; persisted)
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('ft-theme', next); } catch (e) {}
    });
  });

  // Per-project hue on work rows
  document.querySelectorAll('.work__row[data-hue]').forEach(row => {
    row.style.setProperty('--row-hue', row.dataset.hue);
  });

  if (reduceMotion || typeof gsap === 'undefined') {
    document.documentElement.classList.add('no-motion');
    const pre = document.querySelector('.preloader');
    if (pre) pre.remove();
    return; // static but fully readable
  }

  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

  /* ---------- Lenis smooth scroll ---------- */
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links through Lenis
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -20, duration: 1.4 });
    });
  });

  /* ---------- Cursor ---------- */
  if (!isTouch) {
    const cursor = document.querySelector('.cursor');
    if (cursor) {
      const dot = cursor.querySelector('.cursor__dot');
      const ring = cursor.querySelector('.cursor__ring');
      const label = cursor.querySelector('.cursor__label');
      const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' });
      const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' });
      const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
      const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });
      const lx = gsap.quickTo(label, 'x', { duration: 0.3, ease: 'power3.out' });
      const ly = gsap.quickTo(label, 'y', { duration: 0.3, ease: 'power3.out' });
      window.addEventListener('mousemove', e => {
        document.body.classList.add('cursor-on');
        dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); lx(e.clientX); ly(e.clientY);
      }, { passive: true });

      document.querySelectorAll('[data-cursor]').forEach(el => {
        el.addEventListener('mouseenter', () => {
          const kind = el.dataset.cursor;
          label.textContent = kind === 'mail' ? 'SAY HI' : kind === 'plus' ? 'OPEN' : 'VIEW';
          document.body.classList.add('cursor-view');
        });
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-view'));
      });
      document.querySelectorAll('a:not([data-cursor]), button, summary').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-link'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-link'));
      });
    }
  }

  /* ---------- Magnetic elements ---------- */
  if (!isTouch) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.25);
      });
      el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Scramble hovers ---------- */
  document.querySelectorAll('[data-scramble]').forEach(el => {
    const original = el.textContent;
    el.addEventListener('mouseenter', () => {
      gsap.to(el, {
        duration: 0.7,
        scrambleText: { text: original, chars: '▮▯/\\_—<>10', speed: 1.2 },
        overwrite: 'auto',
      });
    });
  });

  /* ---------- Page transitions ---------- */
  const transition = document.querySelector('.transition');
  const panel = transition?.querySelector('.transition__panel');
  const tLabel = transition?.querySelector('.transition__label');
  const navigateWith = (href, name) => {
    transition.classList.add('is-active');
    if (tLabel) tLabel.textContent = (name || '').toUpperCase();
    gsap.timeline({ onComplete: () => { window.location.href = href; } })
      .to(panel, { y: 0, duration: 0.6, ease: 'expo.inOut' })
      .to(tLabel, { opacity: 1, duration: 0.25 }, '-=0.2');
    sessionStorage.setItem('ft-transitioned', '1');
  };
  document.querySelectorAll('a[data-transition]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      navigateWith(href, a.querySelector('.work__title')?.textContent || a.dataset.tag || '');
    });
  });

  /* ---------- Entrance: preloader (home, once per session) or slide-in ---------- */
  const preloader = document.querySelector('.preloader');
  const cameFromTransition = sessionStorage.getItem('ft-transitioned') === '1';
  sessionStorage.removeItem('ft-transitioned');
  const seenPreloader = sessionStorage.getItem('ft-seen') === '1';

  const heroIntro = () => {
    const heroLines = document.querySelectorAll('.hero__line, .case-hero__title');
    document.fonts.ready.then(() => {
      heroLines.forEach((line, i) => {
        const split = new SplitText(line, { type: 'chars', mask: 'chars' });
        gsap.from(split.chars, {
          yPercent: 110, rotate: 4, duration: 1.1, ease: 'expo.out',
          stagger: 0.028, delay: 0.05 + i * 0.12,
        });
      });
      gsap.utils.toArray('.hero__eyebrow, .hero__sub, .hero__stats li, .case-hero__crumb, .case-hero__nr, .case-hero__tagline, .case-meta > div').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.45 + i * 0.06, overwrite: 'auto' });
        el.removeAttribute('data-reveal');
      });
    });
  };

  if (preloader && page === 'home' && !seenPreloader && !cameFromTransition) {
    sessionStorage.setItem('ft-seen', '1');
    const count = preloader.querySelector('.preloader__count');
    const bar = preloader.querySelector('.preloader__bar span');
    const name = preloader.querySelector('.preloader__name');
    const state = { p: 0 };
    lenis.stop();
    gsap.timeline({
      onComplete: () => { preloader.remove(); lenis.start(); heroIntro(); },
    })
      .from(name, { yPercent: 110, duration: 0.9, ease: 'expo.out' })
      .to(state, {
        p: 100, duration: 1.5, ease: 'power2.inOut',
        onUpdate: () => {
          const v = Math.round(state.p);
          count.textContent = String(v).padStart(3, '0');
          bar.style.width = v + '%';
        },
      }, '-=0.5')
      .to(preloader.querySelector('.preloader__inner'), { yPercent: -12, opacity: 0, duration: 0.45, ease: 'power2.in' })
      .to(preloader, { yPercent: -100, duration: 0.75, ease: 'expo.inOut' }, '-=0.15');
  } else {
    if (preloader) preloader.remove();
    if (cameFromTransition && panel) {
      transition.classList.add('is-active');
      gsap.set(panel, { y: 0 });
      gsap.to(panel, {
        y: '-101%', duration: 0.7, ease: 'expo.inOut', delay: 0.1,
        onComplete: () => { transition.classList.remove('is-active'); gsap.set(panel, { y: '101%' }); },
      });
      if (tLabel) gsap.to(tLabel, { opacity: 0, duration: 0.2 });
    }
    heroIntro();
  }

  /* ---------- Scroll reveals ---------- */
  document.fonts.ready.then(() => {
    // Split-line titles
    gsap.utils.toArray('[data-split]').forEach(el => {
      if (el.closest('.hero') || el.closest('.case-hero')) return;
      const split = new SplitText(el, { type: 'lines', mask: 'lines' });
      gsap.from(split.lines, {
        yPercent: 110, duration: 1.05, ease: 'expo.out', stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 86%' },
      });
    });

    // Generic reveals
    gsap.utils.toArray('[data-reveal]').forEach(el => {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.95, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    // About statement word scrub
    gsap.utils.toArray('[data-words]').forEach(el => {
      const split = new SplitText(el, { type: 'words' });
      split.words.forEach(w => w.classList.add('w'));
      gsap.to(split.words, {
        opacity: 1, stagger: 0.06, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: true },
      });
    });

    ScrollTrigger.refresh();
  });

  /* ---------- Counters ---------- */
  gsap.utils.toArray('[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 1.6, ease: 'power2.out', delay: 0.6,
      scrollTrigger: { trigger: el, start: 'top bottom' },
      onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
    });
  });

  /* ---------- Marquee (velocity-reactive) ---------- */
  document.querySelectorAll('[data-marquee]').forEach(track => {
    const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 24, repeat: -1 });
    ScrollTrigger.create({
      onUpdate: self => {
        const v = gsap.utils.clamp(-4, 4, self.getVelocity() / 260);
        gsap.to(loop, { timeScale: 1 + Math.abs(v), duration: 0.4, overwrite: true });
      },
    });
  });

  /* ---------- Work list: cursor-following preview ---------- */
  const peek = document.querySelector('.peek');
  if (peek && !isTouch) {
    const peekUse = peek.querySelector('use');
    const peekTag = peek.querySelector('.peek__tag');
    const px = gsap.quickTo(peek, 'x', { duration: 0.5, ease: 'power3.out' });
    const py = gsap.quickTo(peek, 'y', { duration: 0.5, ease: 'power3.out' });
    let active = false;
    window.addEventListener('mousemove', e => {
      if (!active) { gsap.set(peek, { x: e.clientX + 28, y: e.clientY - 120 }); return; }
      px(e.clientX + 28); py(e.clientY - 120);
    }, { passive: true });
    document.querySelectorAll('.work__row').forEach(row => {
      row.addEventListener('mouseenter', () => {
        active = true;
        peek.style.setProperty('--peek-hue', row.dataset.hue);
        peekUse.setAttribute('href', '#m-' + row.dataset.motif);
        peekTag.textContent = row.dataset.tag;
        gsap.to(peek, { opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
      });
      row.addEventListener('mouseleave', () => {
        active = false;
        gsap.to(peek, { opacity: 0, scale: 0.92, duration: 0.3, ease: 'power3.in' });
      });
    });
  }

  /* ---------- Patents: pinned horizontal scroll ---------- */
  const pTrack = document.querySelector('.patents__track');
  if (pTrack) {
    const pin = document.querySelector('.patents__pin');
    const distance = () => pTrack.scrollWidth - window.innerWidth + 64;
    gsap.to(pTrack, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: pin, start: 'top 12%', pin: true,
        end: () => '+=' + distance(), scrub: 1, invalidateOnRefresh: true,
      },
    });
  }

  /* ---------- Accordion (animated details) ---------- */
  document.querySelectorAll('.acc__item').forEach(item => {
    const summary = item.querySelector('summary');
    const body = item.querySelector('.acc__body');
    if (!summary || !body) return;
    summary.addEventListener('click', e => {
      e.preventDefault();
      if (item.open) {
        gsap.to(body, {
          height: 0, opacity: 0, duration: 0.45, ease: 'power3.inOut',
          onComplete: () => { item.open = false; gsap.set(body, { clearProps: 'all' }); ScrollTrigger.refresh(); },
        });
      } else {
        item.open = true;
        gsap.fromTo(body, { height: 0, opacity: 0 }, {
          height: 'auto', opacity: 1, duration: 0.55, ease: 'power3.out',
          onComplete: () => { gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); },
        });
      }
    });
  });

  /* ---------- Radar canvas (hero) ---------- */
  const canvas = document.getElementById('radar');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, cx = 0, cy = 0, maxR = 0;
    let visible = true, raf = null;
    const N = isTouch ? 40 : 90;
    const dots = [];

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * DPR; canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = w * 0.72; cy = h * 0.34; maxR = Math.max(w, h) * 0.52;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < N; i++) {
      dots.push({
        x: Math.random(), y: Math.random(),
        vx: (Math.random() - 0.5) * 0.00022, vy: (Math.random() - 0.5) * 0.00022,
        r: Math.random() * 1.6 + 0.6,
      });
    }

    const PALETTES = {
      dark:  { base: '236,233,226', baseRing: 0.07, baseCross: 0.045, dot: 0.28, linkMax: 0.055 },
      light: { base: '10,10,10',    baseRing: 0.09, baseCross: 0.06,  dot: 0.32, linkMax: 0.07 },
    };
    const ACCENT = '0,217,142';

    let angle = 0;
    const draw = () => {
      if (!visible) { raf = null; return; }
      const P = PALETTES[document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'];
      ctx.clearRect(0, 0, w, h);
      angle += 0.0038;

      // rings
      ctx.strokeStyle = `rgba(${P.base},${P.baseRing})`;
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, (maxR / 4) * i, 0, Math.PI * 2); ctx.stroke();
      }
      // crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR);
      ctx.strokeStyle = `rgba(${P.base},${P.baseCross})`; ctx.stroke();

      // sweep
      const grad = ctx.createConicGradient ? ctx.createConicGradient(angle, cx, cy) : null;
      if (grad) {
        grad.addColorStop(0, `rgba(${ACCENT},0.13)`);
        grad.addColorStop(0.12, `rgba(${ACCENT},0)`);
        grad.addColorStop(1, `rgba(${ACCENT},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, maxR, 0, Math.PI * 2); ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.strokeStyle = `rgba(${ACCENT},0.35)`; ctx.stroke();

      // particles + links
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > 1) d.vx *= -1;
        if (d.y < 0 || d.y > 1) d.vy *= -1;
      }
      ctx.lineWidth = 0.6;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const ddx = (a.x - b.x) * w, ddy = (a.y - b.y) * h;
          const dist = ddx * ddx + ddy * ddy;
          if (dist < 12000) {
            ctx.strokeStyle = `rgba(${P.base},${P.linkMax * (1 - dist / 12000)})`;
            ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.stroke();
          }
        }
      }
      for (const d of dots) {
        const px = d.x * w, py = d.y * h;
        const dAngle = ((Math.atan2(py - cy, px - cx) - angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const glow = dAngle < 0.5 ? (0.5 - dAngle) * 2 : 0;
        ctx.fillStyle = glow > 0.05
          ? `rgba(${ACCENT},${0.35 + glow * 0.65})`
          : `rgba(${P.base},${P.dot})`;
        ctx.beginPath(); ctx.arc(px, py, d.r + glow * 1.4, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);
    document.addEventListener('visibilitychange', () => {
      visible = !document.hidden && visible;
      if (!document.hidden && !raf) { visible = true; raf = requestAnimationFrame(draw); }
    });
    raf = requestAnimationFrame(draw);
  }
})();
