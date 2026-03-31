# 🚀 Neu — Deterministic SPA Engine (Vanilla JS + Capacitor)

**Neu** is a **deterministic runtime-driven SPA engine** for building high-performance Android/iOS applications using **Vanilla JavaScript**.

Unlike traditional frameworks, Neu gives you **full control over runtime behavior**, not just UI rendering.

You can write in a modern style (React/Vue-like patterns),
but the execution remains **deterministic and fully controlled**.

> No virtual DOM  
> No reactive overhead  
> Predictable lifecycle
> No magic
> Just control

---

## 🧠 Core Concept

Neu treats the DOM as a **render target**, not the source of truth.

Every page transition is fully controlled:

```text
[Old Page]
   ↓ transition out
[Cleanup]
   ↓
[New Page (pre-injected, hidden)]
   ↓
[Transition In]
```

This ensures:

* Clean DOM (no leaks)
* Smooth transitions
* Predictable execution
* Stable performance (60 FPS)

---

### 🧩 DOM Layering

Neu organizes the DOM into multiple controlled layers:

- `scope` → active page content
- `global` → persistent UI (shared across pages)
- `globalOutScope` → top-level system layer

This allows:
- clean page transitions
- persistent UI without re-render
- full separation of concerns

Neu provides multiple DOM access layers for precise control.

### 1. Scoped DOM (`dom`)
Access elements only inside the active page or slot.

```js
dom.on("btn-start", "click", () => {});
dom.addClass("status", "active");

const $items = dom.getQ(".item");
$items.css("color", "red");
```

> Safe, isolated, no cross-page leakage

### 2. Global DOM ($$.global)
Access persistent UI elements outside page scope.

```js
$$.global(".nav-item").on("click", (e) => {
  neu.navigate(e.target.dataset.target);
});

$$.global("body").css("overflow", "hidden");
```

> Perfect for navbar, overlays, layout

### 3. Global Outside Scope ($$.globalOutsideScope)
Access global elements excluding the active page

```js
const $el = $$.globalOutsideScope("div");
$el.css("opacity", "0.5");
```

> Useful for background effects, dimming, isolation


### 4. Dynamic Creation

```js
const $el = $$.create("div", {
  class: "alert-box",
  style: { color: "yellow" }
});

$el.text("Ready!");
dom.appendHtml("target", $el.el[0].outerHTML);
```

> Controlled DOM creation via Neu API

---

## ⚡ Quick Start

```bash
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

👉 Click between pages to see Neu in action.

---

## 🎬 Built-in Demo

Neu already includes a working sample inside the project.

### Try this:

* Navigate between pages
* Observe smooth transitions
* Inspect DOM (no leftover elements)

### Demo source:

```
src/pages/
```

---

## 🧩 Basic Usage

### Inject Page

Neu automatically resolves pages from the `src/pages/` or `src/page/` directory.

```js
engine.inject("welcome")
```

Neu will automatically:

- Resolve the page from `src/pages/`
- Initialize lifecycle
- Handle transitions
- Clean previous DOM

👉 No manual routing. No configuration.

> This is not a router — it's a controlled runtime injection system.

---

## 📄 Minimal Page Example

```js
import welcomeHTML from "./welcome.html?raw";

export default function WelcomePage() {
  const el = document.createElement("div");
  el.setAttribute("data-page", "welcome");
  el.innerHTML = welcomeHTML;

  function bindEvents() {
    const btn = el.querySelector("#go");

    if (btn) {
      btn.onclick = () => {
        engine.inject("home");
      };
    }
  }

  return {
    name: "welcome",
    el,

    onInit() {
      bindEvents();
    },

    onDestroy() {
      // cleanup logic here if needed
    }
  };
}
```

---

## 🧩 Lifecycle Model

Each page follows a controlled lifecycle:

```
init → mount → active → destroy
```

No hidden behavior. Everything is explicit.

---

## 🧩 Slot System

Neu provides a flexible slot system:

* `normal` → standard lifecycle
* `keep` → persistent across pages
* `once` → run once
* `destroy` → auto cleanup

Use cases:

* background services
* global UI (navbar, overlay)
* timers / schedulers

---

## ⚙️ Runtime Engine

Neu runs on a deterministic loop:

```js
engine.onTick((dt) => {
  // synchronized logic
})
```

* Stable timing
* No random async behavior
* Predictable updates

---

## ✨ Key Features

- Deterministic runtime engine
- Stable 60 FPS execution
- Clean DOM lifecycle
- Full lifecycle control
- Slot-based architecture
- No virtual DOM / reactivity
- Lightweight output
- Native-ready (Capacitor)

---

## 🛠️ Tech Stack (Pinned)

| Component  | Version |
| :--------- | :------ |
| Node.js    | v20.x   |
| Java (JDK) | 17      |
| Vite       | 7.2.4   |
| Capacitor  | 7.4.5   |
| Gradle     | 8.10.2  |

---

## 🚀 Development Commands

| Command         | Description                 |
| :-------------- | :-------------------------- |
| npm run dev     | Web development             |
| npm run neu     | Sync to Android             |
| npm run sdk     | Build + open Android Studio |
| npm run preview | Preview production          |

---

## 🧪 Philosophy

Neu is not trying to replace React or Vue.

It is designed for developers who want:

* Full runtime control
* Deterministic behavior
* Minimal abstraction

---

## 📌 When to Use Neu

Use Neu if you need:

* High-performance apps
* Full lifecycle control
* Lightweight architecture

Avoid Neu if you prefer:

* heavy abstraction
* large plugin ecosystems

---

## 🤝 Contribution

Contributions are welcome:

* Open issues
* Submit pull requests
* Share feedback

---

## 👤 Author

**Neu by Ulywae**
*A handcrafted deterministic runtime engine.*

---

## ⭐ Final Note

> Control the runtime, and everything becomes predictable.
