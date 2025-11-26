# 💧 Liquid Glass

[![npm version](https://img.shields.io/npm/v/@real-human/liquid-glass.svg?style=flat-square)](https://www.npmjs.com/package/@real-human/liquid-glass)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](./LICENSE)
[![Size](https://img.shields.io/bundlephobia/minzip/@real-human/liquid-glass?style=flat-square)](https://bundlephobia.com/package/@real-human/liquid-glass)

> **A lightweight, Vanilla JavaScript Web Component for liquid glass distortion effects.**

Bring your UI to life with real-time SVG displacement filters. This component simulates physical glass refraction, chromatic aberration, and depth. It works in **any** framework (React, Vue, Svelte, Angular) or plain HTML.

---

## ✨ Features

- 💧 **Real-time Liquid Distortion** – Uses advanced SVG filters to bend light.
- 🌈 **Chromatic Aberration** – Prism-like color splitting effect.
- 🖱️ **Interactive** – Reacts to clicks and presses naturally.
- 📱 **Responsive & Auto-sizing** – Fits your content perfectly.
- 📦 **Zero Dependencies** – Pure Vanilla JS. < 5kb gzipped.
- 🛡️ **Graceful Degradation** – Falls back to standard blur on unsupported browsers (Firefox/Safari).

---

## 🚀 Installation

### Option A: NPM (Recommended)
Best for modern build setups (Vite, Webpack, Next.js, etc.)

```bash
npm install @real-human/liquid-glass
```

### Option B: CDN (No Build)

Best for static HTML or prototyping.

```html
<script type="module" src="https://unpkg.com/@real-human/liquid-glass/dist/liquid-glass.es.js"></script>
```

---

## 💻 Usage

### 1. In JavaScript Frameworks

Import it once in your main entry file (e.g., `main.js`, `App.js`, or `index.js`).

```javascript
import '@real-human/liquid-glass';

// The component <glass-element> is now available globally!
```

### 2. In HTML

Use the tag directly. The `auto-size` attribute is the magic wand that makes it fit your content.

```html
<glass-element
    auto-size
    depth="10"
    blur="2"
    strength="50"
    radius="25"
    chromatic-aberration="3"
>
    <!-- Put anything you want inside -->
    <div style="padding: 2rem; color: white;">
        <h1>Liquid Card</h1>
        <p>Click me to see the effect!</p>
    </div>
</glass-element>
```

---

## 🎛️ Configuration

You can customize the physics of the glass using these attributes:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `auto-size` | `boolean` | `false` | **Highly Recommended.** Adapts the glass size to its content. |
| `strength` | `number` | `100` | The intensity of the liquid distortion. |
| `radius` | `number` | `50` | Border radius in pixels. |
| `depth` | `number` | `10` | The simulated thickness of the glass edges. |
| `chromatic-aberration` | `number` | `0` | Splits RGB channels (prism effect). Values 2-5 look best. |
| `blur` | `number` | `2` | The background blur amount (backdrop-filter). |
| `background-color` | `color` | `rgba(255,255,255,0.4)` | The tint of the glass surface. |
| `width` | `number` | `200` | Fixed width (Ignored if `auto-size` is on). |
| `height` | `number` | `200` | Fixed height (Ignored if `auto-size` is on). |
| `debug` | `boolean` | `false` | Shows the raw displacement map for debugging gradients. |

---

## 🌍 Browser Support

This component relies on **SVG Filters inside Backdrop Filter**, a cutting-edge CSS feature.

| Browser | Status | Experience |
| :--- | :--- | :--- |
| **Chrome / Edge / Arc** | ✅ Supported | Full liquid distortion & chromatic aberration. |
| **Brave / Opera** | ✅ Supported | Full liquid distortion & chromatic aberration. |
| **Firefox / Safari** | ⚠️ Fallback | Displays a standard "Frosted Glass" (blur) effect. |

> **Note:** The component detects browser support automatically. If liquid effects aren't supported, it gracefully degrades to a standard `backdrop-filter: blur()`, ensuring your UI never looks broken.

---

## ⚖️ License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.