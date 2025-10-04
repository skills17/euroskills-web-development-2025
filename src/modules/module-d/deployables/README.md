# 3d-turbine

This builds a distributable browser bundle for the 3D Turbine that competitors have to include.

## Build

```bash
npm install
npm run build
```

Will create the browser-ready `dist/3d-turbine.js` file that can be provided over a static file server to competitors.

## Development

For local development, a demo HTML page is provided that renders two turbines with different settings.

```bash
npm install
npm run dev
```

Then open http://localhost:5173/ to access the demo page.

## Docker

```bash
# build
docker build -t static-js .
# run
docker run -p 8080:80 static-js
```
