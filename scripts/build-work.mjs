/* Renders work/<slug>/index.html from projects-data.mjs + refreshes sitemap.xml.
   Run: node scripts/build-work.mjs  (from repo root) */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects as rawProjects } from './projects-data.mjs';
const projects = [...rawProjects].sort((a, b) => a.nr.localeCompare(b.nr));

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Reuse the motif symbol library straight from index.html so it can't drift.
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const defs = indexHtml.match(/<svg class="defs"[\s\S]*?<\/svg>/)?.[0];
if (!defs) throw new Error('Could not find motif defs in index.html');

const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const page = (p, next) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0a0a0a" />
  <title>${p.title.replace(/&nbsp;/g, ' ')} — Case Study — Faisel Tajiran</title>
  <meta name="description" content="${p.description}" />
  <meta name="author" content="Faisel Tajiran" />
  <link rel="canonical" href="https://faiseltajiran.com/work/${p.slug}/" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://faiseltajiran.com/work/${p.slug}/" />
  <meta property="og:title" content="${p.title.replace(/&nbsp;/g, ' ')} — Case Study — Faisel Tajiran" />
  <meta property="og:description" content="${p.description}" />
  <meta property="og:image" content="https://faiseltajiran.com/og.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='${encodeURIComponent(p.hue)}'/%3E%3Ctext x='50%25' y='56%25' dominant-baseline='middle' text-anchor='middle' font-family='ui-sans-serif,system-ui' font-weight='800' font-size='17' fill='%230a0a0a'%3EFT%3C/text%3E%3C/svg%3E" />
  <link rel="preload" href="/assets/fonts/archivo-var.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/assets/fonts/instrument-serif-italic.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/assets/fonts/jetbrains-mono-var.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/styles.css" />
</head>
<body data-page="case" style="--case-hue:${p.hue}">

  <div class="grain" aria-hidden="true"></div>
  <div class="transition" aria-hidden="true"><div class="transition__panel"></div><div class="transition__label mono"></div></div>
  <div class="cursor" aria-hidden="true"><div class="cursor__dot"></div><div class="cursor__ring"></div><div class="cursor__label mono">VIEW</div></div>

  <header class="nav">
    <a class="nav__brand mono" href="/" data-transition>FT<sup>®</sup></a>
    <nav class="nav__links" aria-label="Primary">
      <a href="/#work" data-scramble>Work</a>
      <a href="/#about" data-scramble>About</a>
      <a href="/#capabilities" data-scramble>Capabilities</a>
      <a href="/#patents" data-scramble>Patents</a>
      <a href="/#contact" data-scramble>Contact</a>
    </nav>
    <div class="nav__aux mono">
      <span class="nav__status"><span class="dot dot--live"></span>OPEN TO CONVERSATIONS</span>
      <span class="nav__clock" data-clock>HOU&nbsp;--:--:--</span>
    </div>
  </header>

  <main>
    <section class="case-hero">
      <div class="case-hero__motif" aria-hidden="true"><svg><use href="#m-${p.motif}"/></svg></div>
      <div class="container">
        <p class="case-hero__crumb mono"><a href="/#work" data-transition>← INDEX</a><span>/</span><span>WORK</span><span>/</span><span>${p.slug.toUpperCase()}</span></p>
        <p class="case-hero__nr mono">№ ${p.nr} — ${p.category.toUpperCase()}</p>
        <h1 class="case-hero__title">${p.title}</h1>
        <p class="case-hero__tagline">${p.tagline}</p>
        <div class="case-meta">
          <div><span class="mono">TYPE</span><strong>${p.group}</strong></div>
          <div><span class="mono">YEAR</span><strong>${p.year}</strong></div>
          <div><span class="mono">ROLE</span><strong>${p.role}</strong></div>
          <div><span class="mono">STATUS</span><strong>${p.status}</strong></div>
          <div><span class="mono">SCOPE</span><strong>${p.scope}</strong></div>
          ${p.link ? `<div><span class="mono">LIVE</span><strong><a class="u-link" href="${p.link.href}" rel="noopener">${p.link.label} ↗</a></strong></div>` : ''}
        </div>
      </div>
    </section>

    <section class="case-section">
      <div class="container">
        <p class="mono case-section__label" data-reveal>THESIS</p>
        <h2 class="case-section__title" data-split>Why this exists</h2>
        <div class="case-prose">
          ${p.thesis.map(t => `<p data-reveal>${t}</p>`).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="case-section">
      <div class="container">
        <p class="mono case-section__label" data-reveal>THE BUILD</p>
        <h2 class="case-section__title" data-split>What I engineered</h2>
        <div class="case-grid">
          ${p.build.map(b => `<article class="case-card" data-reveal><span class="mono">${b.label}</span><h3>${b.title}</h3><p>${b.body}</p></article>`).join('\n          ')}
        </div>
      </div>
    </section>
${p.signals ? `
    <section class="case-section">
      <div class="container">
        <p class="mono case-section__label" data-reveal>SIGNALS</p>
        <div class="case-signals">
          ${p.signals.map(s => `<div class="case-signal" data-reveal><strong>${s.value}</strong><span class="mono">${s.label}</span></div>`).join('\n          ')}
        </div>
      </div>
    </section>` : ''}

${p.backers ? `
    <section class="case-section">
      <div class="container">
        <p class="mono case-section__label" data-reveal>GRANTS &amp; PROGRAMS</p>
        <h2 class="case-section__title" data-split>Backed by</h2>
        <div class="case-backers">
          ${p.backers.map(b => `<div class="backer" data-reveal><svg class="backer__icon" aria-hidden="true"><use href="#b-${b.icon}"/></svg><span class="mono">${b.name}<br /><b>${b.program}</b></span></div>`).join('\n          ')}
        </div>
      </div>
    </section>` : ''}

    <section class="case-section">
      <div class="container">
        <p class="mono case-section__label" data-reveal>STACK</p>
        <div class="case-stack">
          ${p.stack.map(s => `<span>${s}</span>`).join('')}
        </div>
      </div>
    </section>

    <section class="case-section">
      <div class="container">
        <p class="mono case-section__label" data-reveal>WHAT IT PROVES</p>
        <div class="case-prose">
          ${p.proves.map(t => `<p data-reveal>${t}</p>`).join('\n          ')}
        </div>
      </div>
    </section>

    <div class="case-next" style="--next-hue:${next.hue}">
      <div class="container">
        <a href="/work/${next.slug}/" data-transition data-cursor="view">
          <span class="mono">NEXT — № ${next.nr}</span>
          <span class="case-next__title">${next.title}</span>
        </a>
      </div>
    </div>
  </main>

  <footer class="footer">
    <div class="container footer__inner mono">
      <span>©&nbsp;<span data-year></span>&nbsp;FAISEL&nbsp;TAJIRAN&nbsp;—&nbsp;HOUSTON,&nbsp;TX</span>
      <span data-clock>HOU&nbsp;--:--:--</span>
      <span><a href="/#work" data-transition>ALL&nbsp;WORK</a>&nbsp;·&nbsp;<a href="/Faisel-Tajiran-Resume-2026.pdf" download>RÉSUMÉ</a></span>
    </div>
  </footer>

  ${defs}

  <script src="/assets/vendor/gsap.min.js"></script>
  <script src="/assets/vendor/ScrollTrigger.min.js"></script>
  <script src="/assets/vendor/SplitText.min.js"></script>
  <script src="/assets/vendor/ScrambleTextPlugin.min.js"></script>
  <script src="/assets/vendor/lenis.min.js"></script>
  <script src="/assets/js/app.js" defer></script>
</body>
</html>
`;

projects.forEach((p, i) => {
  const next = projects[(i + 1) % projects.length];
  const dir = join(root, 'work', p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), page(p, next));
  console.log(`✓ work/${p.slug}/index.html (${strip(p.title)})`);
});

// sitemap
const today = new Date().toISOString().slice(0, 10);
const urls = ['https://faiseltajiran.com/', ...projects.map(p => `https://faiseltajiran.com/work/${p.slug}/`)];
writeFileSync(join(root, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
console.log(`✓ sitemap.xml (${urls.length} urls)`);
