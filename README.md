# 🚀 Neu — Deterministic SPA Engine (Vanilla JS + Capacitor)

**Neu** is a **deterministic runtime-driven SPA engine** designed for building high-performance Android/iOS applications using **Vanilla JavaScript**.

Unlike traditional frameworks, Neu gives you **full control over the runtime lifecycle**, not just the UI.

> No virtual DOM
> No reactive overhead
> No unpredictable lifecycle

---

## 🧠 Core Concept

Neu treats the DOM as a **render target**, not as the source of truth.

Every page transition is fully controlled by the engine:

```
[Old Page]
   ↓ transition out
[Cleanup]
   ↓
[New Page (pre-injected, hidden)]
   ↓
[Transition In]
```

This ensures:

* Clean DOM (no memory leaks)
* Smooth transitions
* Predictable execution flow
* Stable performance (60 FPS)

---

## ⚡ Why Neu?

Most modern frameworks rely on abstraction layers:

| Framework | Approach                 |
| :-------- | :----------------------- |
| React     | Virtual DOM diffing      |
| Vue       | Reactive watchers        |
| Angular   | Complex lifecycle system |

Neu takes a different path:

* Direct runtime control
* Deterministic execution
* Manual lifecycle management

👉 Built for developers who want **precision, control, and performance**

---

## 🛠️ Tech Stack (Pinned for Stability)

| Component  | Version | Note                 |
| :--------- | :------ | :------------------- |
| Node.js    | v20.x   | LTS recommended      |
| Java (JDK) | 17      | Required for Android |
| Vite       | 7.2.4   | Fast bundler         |
| Capacitor  | 7.4.5   | Native bridge        |
| Gradle     | 8.10.2  | Locked via wrapper   |

---

## ⚡ Quick Start

### 1. Prerequisites

Make sure you have:

* Node.js v20+
* Java JDK 17
* Android Studio

---

### 2. Neu Installer

1. Download Neu Installer (.exe) from Releases
2. Run inside your project folder
3. Follow setup instructions

The installer will:

* Generate project structure
* Lock dependency versions
* Configure path aliases (`@app`, `@pages`)
* Setup Android environment

---

## 📂 Project Structure

```
src/
├── app/
│   ├── modules/     # Business logic
│   └── style/       # Global styling
├── pages/           # Page controllers & views
├── plugins/         # Capacitor integrations
├── slots/           # Reusable UI components
└── main.js          # Entry point
```

---

## 🚀 Development Workflow

| Command         | Description                 |
| :-------------- | :-------------------------- |
| npm run dev     | Run web development server  |
| npm run neu     | Sync to Android             |
| npm run sdk     | Build + open Android Studio |
| npm run preview | Preview production build    |

---

## 🧩 Core Usage

### Inject Page

```js
engine.inject("home")
```

What happens internally:

1. Current page runs transition out
2. Engine cleans DOM safely
3. New page is injected (hidden)
4. Transition in begins

---

### Page Lifecycle (Conceptual)

Each page follows a controlled lifecycle:

```
init → mount → active → destroy
```

No hidden lifecycle. Everything is predictable.

---

### Slot System

Neu provides a **slot system** for persistent or reusable logic:

Types of slots:

* `normal` → standard lifecycle
* `keep` → persistent across pages
* `once` → run once
* `destroy` → auto cleanup

Use slots for:

* background tasks
* global UI (navbar, overlay)
* timers / services

---

### Runtime Loop

Neu runs on a **deterministic engine loop**:

* Synced execution
* Stable timing
* No random async chaos

Example concept:

```js
engine.onTick((dt) => {
  // your logic here
})
```

---

## ✨ Key Features

* 🔥 Deterministic Runtime Engine
* ⚡ 60 FPS Stable Execution
* 🧼 Clean DOM Injection System
* 🧠 Full Lifecycle Control
* 🧩 Slot-based Architecture
* 🚫 No Virtual DOM / Reactivity Overhead
* 📦 Ultra Lightweight Output
* 📱 Native-ready (via Capacitor)

---

## 🧪 Performance Philosophy

Neu is designed to:

* Minimize CPU spikes
* Keep memory stable
* Avoid hidden re-renders
* Eliminate DOM leaks

👉 Result: predictable, smooth applications even on low-end devices

---

## 🧠 Philosophy

Neu is **not trying to replace React or Vue**.

It exists for developers who want:

> Full control over runtime behavior
> Deterministic execution
> Minimal abstraction

---

## 📌 When to Use Neu

Use Neu if you need:

* High-performance mobile apps
* Full lifecycle control
* Custom rendering logic
* Lightweight architecture

Avoid Neu if you want:

* Plug-and-play ecosystem
* Large community libraries
* High-level abstractions

---

## 🤝 Contribution

Contributions are welcome!

* Open issues for bugs or ideas
* Submit pull requests
* Share feedback

---

## 👤 Author

**Neu by Ulywae**
*A handcrafted deterministic runtime engine.*

---

## ⭐ Final Note

Neu is built with a simple principle:

> Control the runtime, and everything becomes predictable.
