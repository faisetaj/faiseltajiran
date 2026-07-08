# faiseltajiran.com

Personal portfolio of Faisel Tajiran — founder, engineer, inventor. Houston, TX.

Hand-built static site, no frameworks, no build step for the main page:

- **Stack** — vanilla HTML/CSS/JS · GSAP 3.13 (ScrollTrigger, SplitText, ScrambleText) · Lenis smooth scroll · Canvas 2D radar hero. All libraries and fonts vendored locally (`assets/vendor`, `assets/fonts`) — zero external requests.
- **Type** — Archivo (variable weight + width), Instrument Serif (accent italics), JetBrains Mono (data labels).
- **Case studies** — `work/<slug>/` pages are generated from `scripts/projects-data.mjs` by `node scripts/build-work.mjs`. Edit the data file, re-run, commit.
- **Deploy** — GitHub Pages from the `main` branch root (CNAME → www.faiseltajiran.com). Push to deploy.

© Faisel Tajiran. Design + engineering by me.
