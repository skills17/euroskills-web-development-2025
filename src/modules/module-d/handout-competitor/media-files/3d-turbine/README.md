# 3d-turbine

**3d-turbine** is a JavaScript library based on `three.js` that renders a 3D animated turbine in the browser.
It's designed to be easily embedded into any webpage, ideal for dashboards, simulators, and engineering visualizations.

## 🚀 Features

- Interactive 3D turbine rendering in the browser
- Everything pre-bundled
- Easy-to-use API for updating turbine pitch, yaw, and RPM
- Supports multiple concurrent instances

## 🛠 Installation

You must include `3d-turbine` via a `<script>` tag in your HTML:

```html
<script src="http://static.tp.es2025.skill17.com/js/3d-turbine.js"></script>
```

## 🌐 Usage

Once included, the `Turbine` class is available on the global `window` object.

### Basic Example

```html
<div id="turbine-container" style="width: 500px; height: 500px;"></div>

<script>
  const container = document.getElementById('turbine-container');
  const turbine = new Turbine(container, '#001f3f'); // target element and background color

  turbine.render();

  // Update the turbine dynamically
  turbine.updateTurbine(10, 45, 150); // pitch, yaw, rpm

  // Clean up when done
  // turbine.destroy();
</script>
```

## 📘 API

### new Turbine(targetElement: HTMLElement, backgroundColor: string)

Creates a new turbine instance.

- `targetElement`: The DOM element where the turbine will be rendered.
- `backgroundColor`: The background color of the canvas (e.g. `'#000000'`).

### render(): void

Renders the turbine in the provided DOM element and starts the animation loop.

### updateTurbine(pitch: number, yaw: number, rpm: number): void

Updates the turbine's orientation and speed.

- `pitch`: Vertical angle (in degrees).
- `yaw`: Horizontal angle (in degrees).
- `rpm`: Rotations per minute.

### destroy(): void

Destroys the turbine, stops the animation, and removes any DOM elements or event listeners it created.

## 📄 License

This project is licensed under the MIT License.
