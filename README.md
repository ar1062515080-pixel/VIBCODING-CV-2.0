# Yanrui Li · 李沿睿 — Portfolio

Apple-style minimalism × magazine collage: white base, colored folders, polaroids, post-its, paper clips and stickers. Section order follows the résumé.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Sections

1. **封面 Hero** — folder collage with mouse parallax
2. **教育背景 Education** — profile ID folder (contact, languages, PDF résumé download) and two lined-paper cards with GPA post-it and course stickers
3. **工作经历 Work** — Kingway, FleishmanHillard, Kada as click-to-open folders
4. **代表项目 Projects** — Chi Bodycare, Adelaide Park Lands, Guerlain Winners Party; click the main image or the buttons to open the project PDFs in `assets/projects/` or the event case page
5. **传播能力与工具 Skills** — divider drawer: content, collaboration, tools & language, AI workflow (with typed prompts)
6. **联系方式 Contact** — open-folder spread with one-click copy for phone, email and WeChat

## Files

| File | Purpose |
| --- | --- |
| `index.html` | All content and markup |
| `css/style.css` | Visual system, collage parts, responsive rules |
| `js/main.js` | Nav, reveals, folders, drawer, counters, parallax, copy |
| `assets/resume-yanrui-li.pdf` | Downloadable résumé |

Drop a photo at `assets/avatar.jpg` to replace the "YR" placeholder.
