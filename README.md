# Yanrui Li · 李沿睿 — Portfolio

Apple-style minimalism × magazine collage: white base, colored folders, polaroids, post-its, paper clips and stickers. Section order follows the résumé. Chinese / English toggle in the top-right corner.

## Live site

https://ar1062515080-pixel.github.io/VIBCODING-CV-2.0/

Deployed with GitHub Pages (static files, no build step):

1. Merge this branch into `main`.
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` / `(root)`, then **Save**.
3. After 1–2 minutes the site is live at the URL above. Every later push to `main` redeploys automatically.

`.nojekyll` makes Pages serve the files as-is.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Sections

1. **封面 Hero** — folder collage with topic photo tiles (PR, IMC, KOL, SEO, 小红书, AI) and a phone-grid of life photos
2. **教育背景 Education** — profile ID folder (contact, languages, PDF résumé download) and two lined-paper cards with GPA post-it and course stickers
3. **工作经历 Work** — Kingway, FleishmanHillard (with two Guerlain writing samples), Kada as click-to-open folders
4. **代表项目 Projects** — Chi Bodycare, Adelaide Park Lands, Guerlain Winners Party, each with a tabbed project book and full PDFs
5. **传播能力与工具 Skills** — divider drawer: content, collaboration, tools & language, AI workflow
6. **关于我 About** — ENTJ personality card, trait post-its and five hobby photo frames
7. **联系方式 Contact** — open-to-work spread with one-click copy for phone, email and WeChat

## Files

| File | Purpose |
| --- | --- |
| `index.html` | All content and markup (Chinese source text) |
| `css/style.css` | Visual system, collage parts, responsive rules |
| `js/main.js` | Nav, reveals, folders, drawer, counters, parallax, copy, language toggle |
| `js/i18n.js` · `js/i18n-en.js` | Chinese → English swap and the English strings |
| `assets/resume-yanrui-li.pdf` · `assets/resume-yanrui-li-en.pdf` | Résumé, chosen by current language |
| `assets/hero/` · `assets/about/` | Hero tiles, phone grid, ENTJ image and hobby photos |
| `assets/samples/` · `assets/projects/` | Writing samples and project PDFs |

