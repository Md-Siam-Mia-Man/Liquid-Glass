# 📚 Integration Guide & Examples

This document details the three standard ways to implement **Liquid Glass** in your projects, ranging from simple static sites to complex dynamic applications.

---

## 1. The "No Build" Method (CDN) 🌐

**Best for:** Prototyping, CodePen, simple static sites, or drop-in usage.
You don't need `npm` or terminal commands. Just add the script tag.

**`index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liquid Glass Demo</title>
    <style>
        body {
            /* Glass needs a background to distort! */
            background: #222 url('https://picsum.photos/1920/1080') no-repeat center/cover;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: sans-serif;
            margin: 0;
        }

        h1 { margin: 0; color: #fff; font-size: 2rem; }
        p { color: rgba(255,255,255,0.9); }
    </style>
</head>
<body>

    <!-- Import directly from Unpkg -->
    <script type="module" src="https://unpkg.com/@real-human/liquid-glass/dist/liquid-glass.es.js"></script>

    <!-- The Component -->
    <glass-element 
        auto-size
        blur="5"
        strength="40"
        radius="20"
        saturate="1.3"
        background-color="rgba(255,255,255,0.1)"
    >
        <div style="padding: 2rem; text-align: center;">
            <h1>Liquid Glass</h1>
            <p>Vanilla JS Edition</p>
        </div>
    </glass-element>

</body>
</html>
```

---

## 2. The "Modern Bundle" Method 📦

*(Vite, Webpack, Next.js, Vue, React)*

**Best for:** Professional production apps.

**Step 1: Install**

```bash
npm install @real-human/liquid-glass
```

**Step 2: Import (JavaScript)**
In your `main.js`, `App.jsx`, or entry file:

```javascript
import '@real-human/liquid-glass';

// That's it. The browser now understands <glass-element> tags.
```

**Step 3: Usage (HTML/JSX)**

```html
<glass-element auto-size strength="30" blur="5">
    <button>Click Me</button>
</glass-element>
```

---

## 3. The "Programmatic" Method ⚡

*(Dynamic JavaScript)*

**Best for:** Generating UI elements on the fly based on user interaction or API data.

```javascript
import '@real-human/liquid-glass'; // Make sure it's imported once

// 1. Create the element
const card = document.createElement('glass-element');

// 2. Configure attributes
card.setAttribute('auto-size', ''); 
card.setAttribute('depth', '15');
card.setAttribute('blur', '3');
card.setAttribute('saturate', '1.5'); // Boost colors
card.setAttribute('background-color', 'rgba(255, 255, 255, 0.05)'); // Very transparent

// 3. Add Content
const title = document.createElement('h2');
title.textContent = "Dynamic Glass";
title.style.margin = "20px";
title.style.color = "white";
card.appendChild(title);

// 4. Inject into DOM
document.body.appendChild(card);
```

---

## 🧪 Configuration Cheat Sheet

Here are the attributes you can tweak directly in HTML.

| Attribute | Recommended Value | Effect |
| :--- | :--- | :--- |
| `auto-size` | (Just add it) | **Critical.** Makes the glass fit your content. |
| `blur` | `2` to `10` | Low values (2-5) show sharp liquid ripples. High values (10+) look frosty. |
| `background-color` | `rgba(255,255,255,0.05)` | Keep alpha low (0.05 - 0.2) to see the distortion clearly. |
| `strength` | `20` to `60` | How much the light bends/distorts. |
| `saturate` | `1.2` to `1.5` | Makes background colors behind the glass look more vibrant. |
| `chromatic-aberration` | `0` to `5` | Splits colors (RGB) like a prism. Cool effect. |

---

## ⚠️ Pro Tips

1. **Z-Index Matters:** Glass effects only work if there is something *behind* them. Make sure your `<body>` or container has a background image or colorful gradients.
2. **Chromium is King:** The full liquid effect uses SVG filters supported best in Chrome, Edge, and Arc. Firefox/Safari will fall back to a standard blurred box automatically.
3. **Click Interaction:** The component has a built-in "click" animation (it presses down physically). You don't need to write CSS for that.
