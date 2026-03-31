# Neu — Deterministic UI Runtime Engine

**Neu** is a **deterministic, loop-driven SPA runtime engine** for building high-performance Android/iOS apps using **Vanilla JavaScript**.

> Not a framework.
> Not a virtual DOM.
> Not reactive magic.
>
> **Neu is a runtime.**

> Neu is closer to a *game engine* than a UI framework.

---

## Router (Auto Import)

Neu router is automatically initialized by the runtime.

No manual import or setup is required.

```js
neu.configRouter({
  root: "welcome"
});
```

> Just configure and start. The router is already available.
> Router is part of the runtime, not an external dependency.

---

## 10-Second Example

```js
import neu from "./app/neu.js";

neu.ready(async () => {
  await neu.injectPage();
  await neu.routerStart();

  neu.loop.start();

  // deterministic loop
  neu.on("tick", (dt) => {
    console.log("running", dt);
  });
});
```

> No reactivity. No virtual DOM. Just a controlled runtime.

---

## Core Idea

Neu treats the DOM as a **render target**, not the source of truth.

```text
Control flows downward:

Engine → Runtime → Pages / Slots → DOM
```

> The runtime controls everything.
> The DOM only reflects it.

---

## What Makes Neu Different

* Loop-driven instead of event-driven
* Deterministic execution (predictable timing)
* No virtual DOM overhead
* No hidden lifecycle
* Full control over rendering and behavior

---

## Architecture

```text
          ┌──────────────────────┐
          │     Engine Loop      │
          │   (deterministic)    │
          └─────────┬────────────┘
                    │
        ┌───────────▼───────────┐
        │     Runtime Core      │
        │  (lifecycle control)  │
        └───────┬─────┬─────────┘
                │     │
        ┌───────▼─┐ ┌─▼────────┐
        │  Pages  │ │  Slots   │
        │ (inject)│ │(persistent)
        └───────┬─┘ └────┬─────┘
                │         │
                └────┬────┘
                     ▼
        ┌─────────────────────────┐
        │        DOM Layer        │
        │                         │
        │  [ globalOutScope ]     │
        │  [    global      ]     │
        │  [     scope      ]     │
        │                         │
        └─────────────────────────┘
```

---

## Philosophy

* No virtual DOM
* No reactive overhead
* No hidden lifecycle
* No unpredictable async

> Control the runtime, and everything becomes predictable.

---

## Quick Start

```bash
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

---

## Minimal App Example

```js
import neu from "./app/neu.js";

neu.ready(async () => {
  neu.configRouter({
    root: "welcome",
    biosStyle: true,
    loaderStyle: 1
  });

  await neu.injectPage();
  await neu.routerStart();

  neu.loop.start();

  neu.debug.set(true);
  neu.debug.log("System Started!");

  // Deterministic loop
  neu.on("tick", (dt) => {}, { page: "global" });

  // Scheduled task
  neu.loop.schedule("repeatTask", async () => {}, 5000);
});
```

---

## Lifecycle Model

```text
[Old Page]
  ↓ pageBeforeOut
  ↓ pageUnmount
  ↓ pageDestroy

[New Page]
  ↓ pageMount
  ↓ pageInit
  ↓ pageAfterIn
```

> Full lifecycle control. No hidden behavior.

---

## DOM Access Layers

### 1. Scoped DOM (`dom`)

Access only inside active page/slot.

```js
dom.on("btn", "click", () => {});
dom.addClass("status", "active");
```

---

### 2. Global DOM (`$$.global`)

Persistent UI layer (navbar, overlay, layout).

```js
$$.global(".nav-item").on("click", (e) => {
  neu.navigate(e.target.dataset.target);
});
```

---

### 3. Global Outside Scope (`$$.globalOutsideScope`)

Global elements excluding active page.

```js
$$.globalOutsideScope("div").css("opacity", "0.5");
```

---

### 4. Dynamic Creation

```js
const el = $$.create("div", { class: "alert-box" });
el.text("Ready!");
dom.appendHtml("target", el.el[0].outerHTML);
```

---

## Slot System

Neu provides flexible runtime slots:

| Type    | Behavior                |
| ------- | ----------------------- |
| normal  | standard lifecycle      |
| keep    | persistent across pages |
| once    | run once                |
| destroy | auto cleanup            |

### Use Cases

* background services
* global UI
* schedulers
* overlays

---

## Runtime Engine

Neu runs on a deterministic loop:

```js
neu.on("tick", (dt) => {
  // synchronized updates
});
```

* stable timing
* no random async
* predictable execution

---

## BIOS Style Mode

```js
neu.configRouter({
  biosStyle: true
});
```

### Effects

* step-based rendering
* controlled transitions
* system-like UI flow

> Not a theme — a different execution style.

---

## Debug Console

Neu includes a built-in floating debug console.

```js
neu.debug.set(true);
neu.debug.log("Hello Neu");
```

### Features

* draggable overlay
* real-time logs
* mobile support

> Debug your app where it actually runs.

---

## Key Features

* Deterministic runtime engine
* Stable 60 FPS loop
* Full lifecycle control
* Slot-based architecture
* Clean DOM management
* BIOS-style rendering
* Loader modes
* Built-in debug console
* Native-ready (Capacitor)

---

## Tech Stack

| Component | Version |
| --------- | ------- |
| Node.js   | v20.x   |
| Vite      | 7.x     |
| Capacitor | 7.x     |
| Java      | 17      |

---

## When to Use Neu

Use Neu if you need:

* high-performance apps
* deterministic behavior
* full runtime control
* minimal abstraction

---

## Contribution

* open issues
* submit PRs
* share feedback

---

## Author

**Neu by Ulywae**
*A handcrafted deterministic runtime engine.*

---

## Final Note

> Neu runs like a system — not just an app.
