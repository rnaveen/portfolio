# Portfolio Site

Single-page portfolio for **Naveen Kumar Ramisetty** — Enterprise Integration & Data Analyst returning to tech building with AI.

## Quick start — open in browser

### Option 1: Finder (easiest)

1. Open Finder and go to `~/IT Projects/navapps/portfolio-site/`
2. Double-click `index.html`
3. It opens in your default browser (Safari, Chrome, etc.)

### Option 2: Terminal

```bash
cd ~/IT\ Projects/navapps/portfolio-site
open index.html
```

`open` is a macOS command that launches the file with its default app — for `.html`, that's your browser.

### Option 3: From Cursor

1. Right-click `index.html` in the file explorer sidebar
2. Choose **Reveal in Finder**, then double-click the file  
   — or use **Open with Live Server** if you have that extension installed

### Option 4: Local server (optional)

Use this if you add features that need a real URL (some browsers restrict local file access):

```bash
cd ~/IT\ Projects/navapps/portfolio-site
python3 -m http.server 8080
```

Then open **http://localhost:8080** in your browser. Press `Ctrl+C` in the terminal to stop the server.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure and content — all sections in one file |
| `style.css` | Visual design — colors, layout, spacing |
| `idea.md` | Audience, tone, and scope constraints |
| `plan.md` | Site map and content sources for each section |
| `README.md` | This file — how to run and what to do next |

## Sections (v1)

1. **Banner** — `assets/Banner.png` at top of page
2. **Hero** — short intro and CTA to projects
3. **About** — background from `my_plan/My-Setup.md`
4. **Skills** — Enterprise vs Current groupings
5. **Experience** — from `assets/Naveen Kumar Ramisetty Resume - 2026.docx`
6. **Projects** — table from `my_plan/my-plan.md`
7. **Contact** — email, phone, LinkedIn, GitHub (no form)

## Your next steps

1. Replace placeholder LinkedIn and GitHub links in `index.html`
2. Adjust project status tags as work progresses
3. Preview in browser and tweak copy to match your voice

## Decisions for you

- **Contact links** — only you know the real URLs
- **Experience bullets** — pull exact titles, dates, and achievements from your resume
- **Project descriptions** — refine as each app takes shape
- **Colors and fonts** — change CSS variables in `style.css` if you want a different look

## Out of scope (v1)

- Blog
- Contact form
- JavaScript / build tools

Keep it simple until you need more.
