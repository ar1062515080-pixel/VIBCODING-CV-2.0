# Yanrui Li · 李沿睿 — Interactive Résumé Site

A bilingual (中文 / English), highly interactive personal site built from the résumé. Pure HTML / CSS / vanilla JS — no build step.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Page skeleton (hero, about, experience, projects, skills, contact) |
| `js/data.js` | All content, bilingual `{ zh, en }` — edit this to update the site |
| `js/main.js` | Rendering and interactions |
| `css/style.css` | Design tokens, light/dark themes, layout, motion |
| `assets/resume-yanrui-li.pdf` | Downloadable résumé |

## Interactions

- 中 / EN language toggle and light / dark theme (both remembered)
- Hero: rotating focus words, mouse spotlight, 3D-tilt ID card with counting stats
- Experience: filter by capability, expandable timeline cards
- Projects: filterable cards, modal case studies with prev/next, arrow keys, deep links (`#project/<id>`)
- Skill map: pick a skill to see the experiences and projects that prove it, then jump straight there
- Contact: one-click copy, vCard download, résumé download, and a form that drafts an email
- Scroll progress bar, active-section nav, reveal-on-scroll, reduced-motion support
