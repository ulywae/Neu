# Neu — Deterministic UI Runtime Engine

**Neu** is a **deterministic, loop-driven SPA runtime engine** for building high-performance Android/iOS apps using **Vanilla JavaScript**.

> Not a framework.
> Not a virtual DOM.
> Not reactive magic.
>
> **Neu is a runtime.**

> Neu is closer to a *game engine* than a UI framework.

---

## Usage Styles

Neu supports multiple coding styles:

### 1. Runtime Style (Recommended)
Deterministic, loop-driven execution using `neu.on("tick")`.

### 2. Imperative Style
Direct DOM manipulation with full control.

### 3. Modern Style (Optional)
Structured UI patterns similar to React-style writing.

> All styles run on the same deterministic runtime.

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
> 
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
  neu.loop.schedule("repeatTask", async () => {}, 5000, true); // set true for enable repeat
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
```text
 Lifecycle: pageBeforeOut → pageMount → pageInit → pageUnmount → pageDestroy → pageAfterIn
```
```js
neu.on("pageInit", (pageName) => {
  console.log(`[App] pageInit -> ${pageName}`);
});

neu.on("pageUnmount", (pageName) => {
  neu.debug.log(`[App] pageUnmount -> ${pageName}`);
});
```

> Full lifecycle control. No hidden behavior.

---

## Flexible Page Cache

Neu allows fine-grained control over page caching.

```js
const routerConfig = {
  root: "welcome",
  cachePages: ["about", "gallery"],
  maxCache: 2, 
};
```

> You can limit how many pages are kept in memory

---

### Features

* Select which pages should be cached
* Limit total cached pages
* Preserve DOM and state automatically

---

### Behavior

Cached pages:

* are not destroyed on leave
* remain in memory
* are instantly restored when revisited

Non-cached pages:

* are fully destroyed
* re-created on next visit

---

### Page-Level Cache Control

Pages can declare their own cache behavior using attributes:

```js id="l2xk3a"
el.setAttribute("data-cache", "true");
```

---

### Combined Strategy

Neu supports both:

* Router-level cache control
* Page-level cache declaration

This allows flexible strategies:

* centralized (router-driven)
* distributed (page-driven)

---

### Priority

Cache behavior is resolved by the runtime based on:

* router configuration
* page attributes
* runtime conditions

> Neu ensures consistent behavior without manual intervention.

---

### Key Concept

Cache is:

* controlled by the router
* integrated with lifecycle
* fully handled by the runtime

> No manual state handling required.

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

### 3. Global Outside Scope (`outScope`)

Global elements excluding active page.

```js
dom.addClass("global-sidebar", "open", { page: "outScope" });
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

Slots are **independent runtime units** managed by Neu.

They are automatically resolved, mounted, and controlled by the runtime —
no manual import or registration is required.

---

## Basic Example

### Slot Definition

```js
// src/slot/player.js
export default function player() {
  return {
    vNode: {
      type: "div",
      props: { class: "player" },
      children: ["Player active"],
    },
    onInit() {
      // lifecycle hook
    },
  };
}
```

---

### Usage in Page

```html
<div data-slot-id="player" data-leave="keep"></div>
```

---

### Behavior

* `data-slot-id` → maps to slot module (`src/slot/player.js`)
* `data-leave="keep"` → keeps slot alive across pages
* `data-leave="destroy"` → removes slot on page leave

> Slots are resolved automatically by the runtime.

---

## Cross-Page Persistence

Slots can persist across page transitions depending on their type.

```html
<!-- destroyed when leaving page -->
<div data-slot-id="chat" data-leave="destroy"></div>

<!-- persists across pages -->
<div data-slot-id="player" data-leave="keep"></div>
```

### Use Cases

* background services
* global UI (player, navbar, overlay)
* schedulers
* shared logic across pages

> Slots are not tied to a single page lifecycle.

---

## Slot Definition Variants

Neu supports multiple slot definition styles.

### 1. Direct Object (vNode)

```js
export default function slot() {
  return {
    vNode: {
      type: "div",
      children: ["Hello"],
    },
  };
}
```

---

### 2. DOM Element

```js
export default function slot() {
  return {
    el: Object.assign(document.createElement("div"), {
      textContent: "Hello DOM",
    }),
  };
}
```

---

### 3. Factory Function

```js
export default function slot() {
  return () => ({
    el: document.createElement("div"),
  });
}
```

---

### 4. Async Factory

```js
export default async function slot() {
  return () => ({
    el: document.createElement("div"),
  });
}
```

> All slot types are normalized and executed by the runtime.

---

## Lifecycle

Slots support lifecycle hooks:

```js
export default function slot() {
  return {
    onInit() {
      // called when slot is initialized
    },
  };
}
```

---

## Key Concept

* Slots are **runtime-controlled units**
* They can **persist across pages**
* They are **automatically resolved**
* They run inside a **deterministic execution model**

> Pages are transient.
> Slots can be persistent.

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
> Designed to stay simple on the surface, but powerful underneath.
