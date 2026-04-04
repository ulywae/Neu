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

## Smart Memory Management (LRU + Whitelist)

Neu provides fine-grained control over page memory using an intelligent **Smart LRU (Least Recently Used)** system. It automatically manages your app's footprint, ensuring a buttery-smooth experience even on low-end devices (Capacitor v7 ready).

### 1. How It Works
The engine tracks your navigation history. When the memory pool reaches its limit, the **oldest unused page** is automatically destroyed to free up RAM—unless it is an "Early Bird" (**Whitelisted**).

### 2. Page Whitelisting (The "VIP" Pages)
Whitelisted pages are **immune** to the auto-destroy sequence. They stay in memory to provide a **0ms Instant-Back** experience, perfect for Dashboards or complex Forms with heavy state.

```js
// Register "VIP" pages that should never be destroyed by the LRU
neu.setWhitelist(["dashboard", "checkout", "profile-editor"]);
```

### 3. Manual Cache Control
You can dynamically adjust the engine's limits or clear the memory pool manually at runtime.

```js
// Adjust max cached pages (Default: 10)
neu.setMaxCache(20); 

// Clear all page memory manually
neu.clearCache();
```
> You can limit how many pages are kept in memory

### 4. Hybrid Caching Strategy
Neu supports both Centralized (Router-driven) and Distributed (Page-driven) caching declarations.

```js
const routerConfig = {
  root: "welcome",
  cachePages: ["about", "gallery"], // List of cacheable pages
  maxCache: 5, 
};
```

---

### Features

* Select which pages should be cached
* Page Whitelist
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

```js
export default function OrderPage() {
  const el = neu.dom.getE("div");
  
  // Enable caching on-the-fly for this specific page instance
  el.setAttribute("data-cache", "true");
  
  return { name: "order", el, onInit() { ... } };
}
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

## Zero-Config Pages (Auto-Discovery)

Forget manual routing tables. In Neu, creating a new page is as simple as adding a file to your pages folder. No boilerplate, no complex imports.

### 1. Create your UI (welcome.html)

Design your page using pure, standard HTML.

```html
<div class="page">
    <h1>Welcome to Neu</h1>
    <p>This is the start of your high-performance digital engine.</p>
    <!-- Just add data-router to any link! -->
    <a href="/home" data-router>Enter Dashboard</a>
</div>
```

### 2. Create the Controller (welcome.js)

Import your HTML and export the function. Neu will automatically recognize it based on the folder structure!

```js
import welcomeHTML from "./welcome.html?raw";

export default function WelcomePage() {
  const el = document.createElement("div");
  el.setAttribute("data-page", "welcome");
  el.innerHTML = welcomeHTML;

  return {
    name: "welcome",
    el,
    onInit() {
      // Logic goes here
    },
    onDestroy() {
      // Cleanup is automatic!
    }
  };
}
```

* No Router Config: If it's in the folder, Neu finds it. Set and Forget.
* Separation of Concerns: Keep your Logic in .js and your Design in .html.
* Vite Integration: Uses the power of Vite ?raw to keep your bundle lightning-fast.
* Implicit Routing: The data-router attribute tells Neu to handle navigation automatically—no manual click listeners needed for links!

> Design in HTML, Logic in JS, Routing in Folders.

---

## Neu Magic Cheat Sheet

Control the entire engine directly from your HTML elements. Neu translates these simple attributes into powerful engine instructions—no complex JavaScript configuration required!

### Data Attributes Reference


| Attribute | Value | Description |
| :--- | :--- | :--- |
| `data-page` | `string` | **Identity.** Unique ID for the page (Required). |
| `data-router` | *(none)* | **Navigation.** Add to any `<a>` tag to enable automatic SPA routing. |
| `data-transition` | `string` | **Animation.** Set the effect (e.g., `fade`, `slide-up`, `zoom-in`). |
| `data-cache` | `true/false` | **Memory.** Enable Smart LRU caching to preserve DOM & State (Instant Back). |
| `data-slot-id` | `string` | **Components.** Define a placeholder to be filled by a Slot/Component. |
| `data-leave` | `destroy/keep` | **Cleanup.** Choose whether a slot is destroyed or kept in memory on leave. |

### The Power Combo Example
Combine these attributes to create a high-performance, animated, and cached page in a single line of HTML:

```html
<!-- Inside your welcome.html or any page -->
<div class="page" 
     data-page="dashboard" 
     data-transition="slide-left" 
     data-cache="true">
    
    <h1>Executive Dashboard</h1>
    
    <!-- Automatic SPA Link -->
    <a href="/settings" data-router>Go to Settings</a>
    
    <!-- Persistent Dynamic Component Slot -->
    <div data-slot-id="UserProfile" data-leave="keep"></div>
</div>
```

###  Pro Tips for Performance:

* Auto-Magic Transitions: If you don't set a specific data-transition, Neu can randomly pick an effect from your transitions.css (if enabled).
* Instant-Back Experience: Always use data-cache="true" on heavy forms or data lists to ensure users never lose their position or input when navigating back.
* Automatic Janitor: Always use neu.dom.on(el, event, cb, "page"). Neu acts as your automatic nanny, sweeping up all event listeners when the page is destroyed

---

## Advanced Router Controls 

The Neu Router isn't just about changing URLs; it's a lifecycle manager. It handles persistent UI layers, automated stress testing, and deep system restarts.

### 1. Persistent UI Shell (`ensureLayers`)

Inject global components (Sidebars, Navbars, or Backgrounds) that stay alive throughout the entire session. These layers are never destroyed by the page router.

```javascript
import { sidebar, navbar } from "./modules/ui.js";

// Inject the App Shell once during boot
await neu.injectPage({
  ensureLayers: [sidebar, navbar], // The "Immortal" layers
  biosStyle: true,                 // Enable BIOS boot sequence
  loaderStyle: 1                   // Choose your loader type
});
```

### 2. Burn Test: switcherRandomPage

Prove that your app is "Muscular" and anti-crash. This tool automatically navigates through all your routes at high speed to detect memory leaks or race conditions.

```javascript
// Start navigating every 400ms automatically
const test = neu.switcherRandomPage(400);

// Stop the test anytime
setTimeout(() => test.stop(), 10000); 
```

### 3. System Lifecycle Management

Neu provides full control over the engine's state, allowing for deep refreshes or full system re-injections.

| Method | Type | Description |
| :--- | :--- | :--- |
| `neu.reloadCurrent()` | *Hot Refresh* | Re-triggers onInit without re-creating DOM. |
| `neu.routerRestart()` | *Full Reset* | Destroys the engine, re-injects layers, and restarts from root. |
| `neu.defaultRoute()` | *Home* |	Shortcut to navigate back to the / root path. |

### 4. Router Configuration API

Customize the engine behavior directly through configRouter.

```javascript
neu.configRouter({
  root: "welcome",        // Default landing page ID
  maxCache: 10,           // Smart LRU capacity
  disableBack: true,      // Trap the browser back button
  injectTimeout: 5000,    // Max time allowed for page injection
  bgClass: "bg-blue"      // Visual backdrop during transitions
});
```

### Technical Highlights:

* Auto-Import Engine: Automatically scans src/pages and src/slots using Vite's import.meta.glob.
* Parallel Slot Injection: Slots are mounted concurrently using Promise.all for maximum speed.
* Context Safety: Navigation is wrapped in try/catch and communicates via the global EventBus.

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

```javascript
const el = $$.create("div", { class: "alert-box" });
el.text("Ready!");
dom.appendHtml("target", el.el[0].outerHTML);
```

---

## Neu DOM & Helper Cheat Sheet

Neu provides two powerful ways for DOM manipulation: neu.$$ (Wrapped Engine) for chainable actions, and neu.dom (Helper) for fast, ID-based operations.

### 1. Scoped Selector neu.$$ (Wrapped)

Use this for bulk manipulation with an elegant chaining style.

| Feature | Code Example | Description |
|---|---|---|
| Select | neu.$$(".box") | Select all .box elements within the active page. |
| Chaining | neu.$$(".item").addClass("v-in").css("color", "red") | Add class and style simultaneously. |
| Events | neu.$$(".btn").on("click", (e) => { ... }) | Bind event to all selected elements. |
| Content | neu.$$(".title").html("<h1>New</h1>") | Modify innerHTML. |
| Attribute | neu.$$("img").attr("src", "new.png") | Change element attributes. |
| Traversal | neu.$$(".child").parent().addClass("parent-active") | Access the parent element. |

------------------------------
### 2. Fast Helper neu.dom

Use this for quick manipulation of specific elements based on their ID.

### Getters

```javascript
// Single element selectionconst
box = neu.dom.getE("myBox"); // Default page scope ($)
const nav = neu.dom.getE("navbar", { page: "global" }); // Search outside page scope

// Multiple elements (Query Selector)
const items = neu.dom.getQ(".items");
```

### Class & Style

```javascript
neu.dom.addClass("box", "active");      // Add a single class
neu.dom.addClasses("box", ["a", "b"]);  // Add multiple classes
neu.dom.toggleActive("button");         // Toggle "active" class (Shorthand)
neu.dom.hasClass("box", "active");      // Check if class exists
```

### Content & Attr

```javascript
neu.dom.addInnerHtml("status", "<p>Ready</p>"); // Set HTML content
neu.dom.appendHtml("list", "<li>Item 1</li>");  // Append at the end
neu.dom.setAttr("logo", "alt", "Neu Logo");     // Set attribute
```

### Visibility & Events

```javascript
neu.dom.show("loading");   // Show element (display: "")
neu.dom.hide("loading");   // Hide element (display: "none")

neu.dom.on("btn", "click", () => { ... }); // Bind event
neu.dom.off("btn", "click", handler);      // Remove event
```

------------------------------

### Performance Tips

* ID Caching: neu.dom.getE automatically stores ID elements in memory. Subsequent lookups are instant (O(1)).
* GPU Animation: Use neu.$$(".box").css("transform", "translateX(10px)") for smoother animations on Capacitor.
* Automatic Cleanup: All events bound within a page are automatically removed by Neu during route changes (unless whitelisted).

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

### Persistent Global Layers

You can inject global UI elements (Sidebars, Bottom Navs, or Overlays) that persist across all page transitions. These layers are injected once and are never destroyed by the router.

```javascript
export function sidebar() {
  return {
    id: "sidebar",
    class: "sidebar",
    content: `<ul><li>Home 1</li><li>Home 2</li></ul>`,
  };
}
```

How to use:

```javascript
import { sidebar, navbar } from "./modules/sidebars.js";

const layers = [sidebarContent, navbar];

// Inject once during initial boot
await neu.injectPage({
  ensureLayers: layers,
  biosStyle: true,
  loaderStyle: 1
});
```
* Shell Persistence: The sidebar stays in the DOM regardless of page switches.
* Native Feel: Zero flickering on global UI elements during navigation.
* Independent Lifecycle: Global layers can have their own event listeners that live for the entire app session.
  
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

### Custom Animations (Zero-Config)

Neu Engine features Auto-Discovery Transitions. You don't need to register your animations in JavaScript. Just write your CSS, and the engine will automatically recognize and use them via data-transition.

1. Create Your Animation in CSS
Open your transitions.css and follow this naming convention: .page-[mode]-[name].

```css
/* Example: Custom "Slide-Up" Animation */

/* Enter state */
.page-enter-slide-up {
  transform: translateY(100%);
  opacity: 0;
}
.page-enter-slide-up-active {
  transform: translateY(0);
  opacity: 1;
}

/* Leave state */
.page-leave-slide-up {
  transform: translateY(0);
  opacity: 1;
}
.page-leave-slide-up-active {
  transform: translateY(-100%);
  opacity: 0;
}
```

2. Use It Anywhere
Simply add the data-transition attribute to your page element using the name you defined in CSS (e.g., slide-up).

```js
export default function SecretPage() {
  const el = neu.dom.getE("div");
  
  // Neu automatically detects "slide-up" from your CSS!
  el.setAttribute("data-transition", "slide-up");
  
  return { name: "secret", el, onInit() { ... } };
}
```

## How it Works (The Magic)

Neu uses CSS Reflection. It scans your document stylesheets on boot to find classes starting with .page-enter-. This means:

* Zero Hardcoding: No need to update JS arrays for new effects.
* Dynamic Timing: Neu automatically calculates the animation duration from your CSS transition-duration or animation-duration.
* Designer Friendly: Add as many effects as you want just by typing CSS.
* Decoupled Design: Visuals stay in CSS, Logic stays in JS.
* Infinite Effects: Want a bounce, rotate, or zoom? Just write the CSS and Neu handles the heavy lifting.
* No Overhead: No extra JS logic needed to "register" your creative work.

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

> It stays simple on the surface,  
> while remaining powerful underneath.
