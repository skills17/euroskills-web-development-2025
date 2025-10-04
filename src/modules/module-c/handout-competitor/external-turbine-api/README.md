# Offshore Wind-Farm External Turbine API — Mock

Small Express.js mock of the **Offshore Wind-Farm External Turbine API**.  
Includes a web control panel to flip scenarios, a static bearer token, Jest tests, and an IntelliJ `test.http`.

## Quick start

```bash
npm i
npm start
# -> http://TODO/control (control panel)
```

- Default bearer token: Bearer `SECRET_TOKEN_123`. Override via env: BEARER=MyToken npm start
- Port: `PORT=TODO` by default.

## Control panel

Open: http://TODO/control

## Docker

Build:

```bash
docker build -t turbine-api-mock:latest .
```

Run:

```bash
docker run --rm -p TODO:TODO \
  -e BEARER=SECRET_TOKEN_123 \
  -e PORT=TODO \
  turbine-api-mock:latest
# open http://localhost:4000/control
```

Quick test (container):

```bash
curl -H "Authorization: Bearer SECRET_TOKEN_123" http://TODO/turbines
```
