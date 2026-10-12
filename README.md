# nixxane bot website

[Visit the website](https://nixxane.github.io/opensro-bot-lean-site/)

A standalone static website for [nixxane bot](https://github.com/nixxane/opensro-bot-lean). This repository contains only the website; the bot stays in its own repository.

Edit `index.html`, `guide.html`, `style.css` and `site.js`. The setup guide (`guide.html`) uses the screenshots in `guide/`; regenerate them from the bot repository with `node guide-screenshots.cjs <playwright folder> <this repo>/guide` after a UI change (`01-panel.png` doubles as the Skills tab picture). GitHub Pages publishes the root of `main` automatically. The version label reads the bot's public metadata. Keep the short patch notes in `index.html` updated for each release, newest first; reporting-service fixes do not change the bot version.

Local preview: `python -m http.server 4173 --bind 127.0.0.1`, then open http://127.0.0.1:4173.
