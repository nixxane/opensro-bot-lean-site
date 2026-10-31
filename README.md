# nixxane bot website

[Visit the website](https://nixxane.github.io/opensro-bot-lean-site/)

A standalone static website for [nixxane bot](https://github.com/nixxane/opensro-bot-lean). This repository contains only the website; the bot stays in its own repository.

Pages: `index.html`, `guide.html`, `notes.html` (all patch notes) and one `style.css`. No JavaScript, no build step. The setup guide (`guide.html`) uses the screenshots in `guide/`; regenerate them from the bot repository with `node guide-screenshots.cjs <playwright folder> <this repo>/guide` after a UI change (`01-panel.png` doubles as the Skills tab picture). GitHub Pages publishes the root of `main` automatically. Add each release to `notes.html` (newest first, one `<article class="release">`) for each release, newest first; reporting-service fixes do not change the bot version.

Local preview: `python -m http.server 4173 --bind 127.0.0.1`, then open http://127.0.0.1:4173.
