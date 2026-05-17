# faiseltajiran.com

Personal site for Faisel Tajiran — founder of [Frequentor](https://frequentor.com), Houston, TX.

Static HTML/CSS/JS. No build step. Deployed via GitHub Pages with a custom domain.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

GitHub Pages serves the contents of `main` directly. The `CNAME` file maps the apex `faiseltajiran.com` and `.nojekyll` disables Jekyll processing.

DNS at the registrar should point `faiseltajiran.com` (apex) to GitHub Pages IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) and `www` to `faisetaj.github.io` via CNAME.

## Edit

- `index.html` — content + structure
- `styles.css` — tokens at the top of the file
- `main.js` — nav + reveal-on-scroll only
