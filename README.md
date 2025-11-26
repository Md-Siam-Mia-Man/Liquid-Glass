# Liquid Glass

[![npm version](https://img.shields.io/npm/v/liquid-glass.svg)](https://www.npmjs.com/package/liquid-glass)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, **Vanilla JavaScript Web Component** that simulates a **Liquid Glass** distortion effect.
It features depth, chromatic aberration, and auto-sizing. Works with any framework (React, Vue, Svelte) or just plain HTML.

## Features

- 💧 Real-time liquid distortion using SVG filters
- 🌈 Chromatic Aberration support
- 🖱️ Interactive (responds to clicks)
- 📱 Responsive & Auto-sizing
- 🛠️ Graceful fallback for Firefox/Safari (Standard Blur)
- 📦 Zero Dependencies

## Installation

### NPM

```bash
npm install liquid-glass
```

### CDN (Browser Direct)

```html
<script type="module" src="https://unpkg.com/liquid-glass/dist/liquid-glass.es.js"></script>
```

## Usage

### In JavaScript/Frameworks

Import it once in your main entry file (e.g., `main.js`, `App.js`):

```javascript
import 'liquid-glass';
```

### In HTML

Use the tag directly:

```html
<glass-element
    depth="5"
    blur="2"
    strength="40"
    chromatic-aberration="2"
    auto-size
>
    <h1>Liquid Content</h1>
</glass-element>
```

## API / Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | Number | 200 | Fixed width in px (ignored if auto-size is on) |
| `height` | Number | 200 | Fixed height in px (ignored if auto-size is on) |
| `radius` | Number | 50 | Border radius of the glass |
| `depth` | Number | 10 | Simulated depth of the glass edge |
| `blur` | Number | 2 | Amount of blur applied to the backdrop |
| `strength` | Number | 100 | Strength of the distortion |
| `chromatic-aberration` | Number | 0 | Color splitting effect |
| `auto-size` | Boolean | false | If present, fits the content size |
| `background-color` | Color | rgba(255,255,255,0.4) | Base glass color |
| `debug` | Boolean | false | Shows the raw displacement map |

## Browser Support

- **Chromium (Chrome, Edge, Arc):** Full Support (SVG Backdrop Filters)
- **Firefox / Safari:** Graceful Degradation (Standard Backdrop Blur)

## License

MIT