# The Little Egg Timer

A lightweight, installable egg timer that works offline after its first visit.
It uses plain HTML, CSS, and JavaScript and does not require a build step or
third-party runtime dependencies.

## Run locally

Service workers require a secure context, so serve the project over localhost
instead of opening `index.html` directly:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. To check the install prompt and offline
behavior, use a browser that supports progressive web apps and visit once while
online.

## Project structure

- `index.html` — accessible app markup and metadata
- `src/styles.css` — responsive app styles
- `src/app.js` — timer, audio chime, and service-worker registration
- `manifest.webmanifest` — install name, display mode, colors, and icons
- `service-worker.js` — app-shell caching and offline navigation
- `icons/` — app and favicon artwork
