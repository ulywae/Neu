// ========== Neu Engine Core (Loop, Slots, Runtime) ==========
/*
  Bagian ini biasanya berisi:
  - engine.loop (RAF)
  - engine.pause / resume
  - slot system (normal, keep, destroy, once)
  - eventBus internal
  - memory guard
  - fps monitor
  - lifecycle hooks global
*/

import {
  showLoader,
  updateLoaderText,
  updateProgressAnimated,
  hideLoader,
} from "./modules/loader.js";

import {
  initBootlog,
  logMessageTypewriter as logMessage,
  updateBootProgress,
  endBootlog,
} from "./modules/bootlog.js";

import NotFoundPage from "./modules/notfound.js";
import { debugConsole } from "./modules/debugConsole.js";
import { renderVDOM } from "./vdom.js";
import { createEventBus } from "./eventBus.js";
import { createDOM } from "./DOM.js";
import { DOMHelper } from "./domHelper.js";
import { createEngine } from "./engine.js";

import "./style/base.css";
import "./style/transitions.css";
import "./style/style.css";
import "./style/loader.css";

// ===========================
// Neu App
// ===========================
export function createApp() {
  const routeFactories = {};

  let slotRegistry = [];
  const slotMap = new Map();

  const pageCache = new Map();
  let cachePage = [];
  let whitelistPages = [];
  let MAX_CACHE = 10;

  let activePath = null;
  let isTransitioning = false;
  let _rootEl = null;
  let rootName = "root";
  let _rootSelector = "#app";
  const effects = parseTransitionEffects();

  document.body.addEventListener(
    "click",
    (e) => {
      if (isTransitioning) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true }
  ); // pakai capture supaya intercept lebih awal

  function normalizeName(path) {
    return path?.replace(/^\//, "") || rootName;
  }
  function normalize(comp) {
    if (!comp) return null;
    let obj;
    if (comp.el) {
      obj = {
        el: comp.el,
        name: comp.name || "unknown",
        onInit: comp.onInit || null,
        onDestroy: comp.onDestroy || null,
        mount: comp.mount || null,
        unmount: comp.unmount || null,
        mountOnce: comp.mountOnce || null,
        unmountOnce: comp.unmountOnce || null,
      };
      obj.el._nsp_pageData = obj;
    } else if (comp.vNode) {
      const el = renderVDOM(comp.vNode);
      obj = {
        ...comp,
        el,
        onInit: comp.onInit || null,
        onDestroy: comp.onDestroy || null,
        mount: comp.mount || null,
        unmount: comp.unmount || null,
        mountOnce: comp.mountOnce || null,
        unmountOnce: comp.unmountOnce || null,
      };
      obj.el._nsp_pageData = obj;
    } else {
      obj = comp;
    }
    return obj;
  }

  /**
   * getTransitionDurationMs
   * Mengambil durasi transisi/animasi maksimal (ms) dari element
   * @param {HTMLElement} el
   * @returns {number} durasi dalam milidetik
   */
  function getTransitionDurationMs(el) {
    if (!el) return 400; // default 400ms

    const cs = getComputedStyle(el);

    // Ambil semua durasi dan delay transisi
    const transitionDurations = cs.transitionDuration
      .split(",")
      .map((d) => parseFloat(d) * 1000);
    const transitionDelays = cs.transitionDelay
      .split(",")
      .map((d) => parseFloat(d) * 1000);
    const transitionTimes = transitionDurations.map(
      (d, i) => d + (transitionDelays[i] || 0)
    );

    // Ambil semua durasi dan delay animasi
    const animationDurations = cs.animationDuration
      .split(",")
      .map((d) => parseFloat(d) * 1000);
    const animationDelays = cs.animationDelay
      .split(",")
      .map((d) => parseFloat(d) * 1000);
    const animationTimes = animationDurations.map(
      (d, i) => d + (animationDelays[i] || 0)
    );

    // Ambil maksimal antara transition dan animation
    const allTimes = [...transitionTimes, ...animationTimes];
    const maxTime = allTimes.length ? Math.max(...allTimes) : 400;

    // Jika NaN atau 0, fallback ke 400ms
    return isNaN(maxTime) || maxTime === 0 ? 400 : maxTime;
  }

  async function applyTransition(el, type = "fade", mode = "enter") {
    if (!el) return Promise.resolve();
    const base = `page-${mode}-${type}`;
    const activeCls = `${base}-active`;

    // bersihkan kelas transisi lama
    el.classList.forEach((cls) => {
      if (/^page-(enter|leave)-/.test(cls)) el.classList.remove(cls);
    });

    // Atur pointerEvents & zIndex awal
    el.style.zIndex = "1";
    el.style.pointerEvents = "none";

    // Ambil durasi dari CSS
    const duration = getTransitionDurationMs(el);

    // lakukan animasi
    return new Promise((resolve) => {
      let finished = false;

      const cleanup = (ev) => {
        if (ev && ev.target && ev.target !== el) return;
        if (finished) return;
        finished = true;

        el.classList.remove(base, activeCls);
        el.removeEventListener("transitionend", cleanup);
        el.removeEventListener("animationend", cleanup);

        el.style.transition = "";
        if (mode === "enter") {
          el.style.pointerEvents = "auto";
          el.style.opacity = 1;
        } else {
          el.style.zIndex = "-9";
          el.style.pointerEvents = "none";
          el.style.opacity = 0;
        }

        resolve(duration);
      };

      requestAnimationFrame(() => {
        // Tambahkan class base
        el.classList.add(base);
        // Force reflow agar class active memicu transisi CSS
        void el.offsetWidth;

        requestAnimationFrame(() => {
          el.style.transition = `opacity ${duration}ms cubic-bezier(0.4,0,0.2,1), transform ${duration}ms cubic-bezier(0.4,0,0.2,1)`;
          el.style.opacity = mode === "enter" ? 1 : 0;
          // Tambahkan class active
          el.classList.add(activeCls);

          el.addEventListener("transitionend", cleanup);
          el.addEventListener("animationend", cleanup);

          // Backup timeout jika event tidak ter-trigger
          setTimeout(cleanup, duration + 100);
        });
      });
    });
  }

  // -----------------------
  // injectWithQueue
  // -----------------------
  async function injectWithQueue(rootSelector, routeMap, opts = {}) {
    const {
      ensureLayer = null,
      timeout = 3000,
      delay = 100,
      biosStyle = false,
      bgClass = "bg-dark-indigo",
      loaderMode = 0,
    } = opts;
    app.emit("onBeforeInject");
    const tDelay = delay < 20 ? 20 : delay;

    const root = document.querySelector(rootSelector);
    if (!root)
      return app.warn(
        `[Core] injectWithQueue: root not found: ${rootSelector}`
      );
    _rootSelector = rootSelector;
    _rootEl = root;
    root.innerHTML = "";

    const baseLayers = ["bg-guard", "bg-container", "loader"];
    baseLayers.forEach((id) => {
      if (!document.getElementById(id)) {
        const el = document.createElement("div");
        el.id = id;
        document.body.insertBefore(el, root);
      }
    });

    const bgContainer = document.getElementById("bg-container");
    if (bgContainer) bgContainer.classList.add(bgClass);

    if (ensureLayer) {
      if (typeof ensureLayer === "function") ensureLayer();
      else if (ensureLayer instanceof HTMLElement)
        document.body.appendChild(ensureLayer);
      else if (Array.isArray(ensureLayer))
        ensureLayer.forEach((cfg) => {
          if (!document.getElementById(cfg.id)) {
            const el = document.createElement("div");
            el.id = cfg.id;
            if (cfg.class) el.className = cfg.class;
            if (cfg.content) el.innerHTML = cfg.content;
            document.body.appendChild(el);
          }
        });
    }

    showLoader(loaderMode);
    if (biosStyle) initBootlog();
    updateLoaderText("Initializing NeuSPA core...");
    logMessage("NeuSPA BIOS v1.2.8 — Silent Boot Mode Enabled", "[ OK ]");
    logMessage("Allocating system resources...");
    logMessage("Preparing virtual DOM containers...");

    const paths = Object.keys(routeMap || {});
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      routeFactories[path] = routeMap[path];

      const percent = Math.round(((i + 1) / paths.length) * 100);
      logMessage(`Registering module: ${normalizeName(path)} ...`, "[ OK ]");
      updateLoaderText(`Registering ${normalizeName(path)}...`);
      updateBootProgress(percent, `Module ${i + 1}/${paths.length}`);
      await updateProgressAnimated(percent, tDelay);
    }

    routeFactories["/_notfound"] = () => NotFoundPage();
    updateLoaderText("Finalizing boot sequence...");
    logMessage("All modules successfully registered.", "[ OK ]");
    await updateProgressAnimated(100, tDelay);
    updateBootProgress(100, "System Ready.");
    await new Promise((r) => setTimeout(r, timeout));
    endBootlog();
    hideLoader();
    app.emit("onAfterInject");
    app.log("[Core] Base layers injected + extra layers if any");
  }

  // -----------------------
  // switchPage
  // -----------------------
  async function switchPage(path) {
    if (isTransitioning)
      return app.info("[Core] Transition in progress, blocking new request");

    const targetPath = path;
    const factory = routeFactories[targetPath];

    if (!factory) {
      if (routeFactories["/_notfound"]) return switchPage("/_notfound");
      return app.warn(`[Core] switchPage: route not found: ${targetPath}`);
    }
    if (activePath === targetPath)
      return app.info(`[Core] Already on ${targetPath}`);

    isTransitioning = true;
    document.body.classList.add("lock-scroll");

    app.emit("pageBeforeOut", normalizeName(activePath));

    const root =
      _rootEl || document.querySelector(_rootSelector) || document.body;

    let nextComp,
      isFromCache = false;

    try {
      // get component (support sync or async factories, catch errors)
      if (pageCache.has(targetPath)) {
        nextComp = pageCache.get(targetPath);
        isFromCache = true;
        touchCache(targetPath, nextComp);
      } else {
        let raw;

        try {
          raw = await Promise.resolve(factory());
        } catch (err) {
          app.error("[Core] factory() threw for", targetPath, err);
          // fallback to notfound if factory failed
          if (routeFactories["/_notfound"]) {
            await switchPage("/_notfound");
            return;
          } else {
            throw err;
          }
        }

        nextComp = normalize(raw);
        // ensure data-page is set immediately
        nextComp.el.dataset.page = normalizeName(targetPath);

        if (isPageCacheable(targetPath, nextComp))
          touchCache(targetPath, nextComp);
      }

      // ensure dataset.page present for cached too
      if (isFromCache && !nextComp.el.dataset.page) {
        nextComp.el.dataset.page = normalizeName(targetPath);
      }

      // style init
      Object.assign(nextComp.el.style, {
        display: "block",
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        opacity: "0",
        zIndex: "-9",
        pointerEvents: "none",
        transition: "opacity .4s ease",
      });

      if (!isFromCache || !root.contains(nextComp.el)) {
        root.appendChild(nextComp.el);
      }

      await mountSlots(nextComp);
      app.setEventPage(nextComp);
      app.$$.setScopePage(nextComp);

      if (typeof nextComp.mount === "function") nextComp.mount();
      app.emit("pageMount", normalizeName(targetPath));

      if (!isFromCache) {
        app.emit("pageInit", normalizeName(targetPath));
        if (typeof nextComp.onInit === "function") nextComp.onInit();
      }

      const currentEl = activePath
        ? document.querySelector(`[data-page='${normalizeName(activePath)}']`)
        : null;
      const currentComp =
        currentEl?._nsp_pageData || pageCache.get(activePath) || {};

      // transition out old
      if (currentEl && activePath !== targetPath) {
        try {
          const transitionType =
            nextComp.el.dataset.transition || pickRandomTransition(nextComp.el);
          const duration = await applyTransition(
            currentEl,
            transitionType,
            "leave"
          );
          app.emit("pageUnmount", normalizeName(activePath));
          if (typeof currentComp.unmount === "function") currentComp.unmount();
          app.emit("pageDestroy", normalizeName(activePath));
          const isCacheable = isPageCacheable(activePath, currentComp);
          if (!isCacheable) {
            if (typeof currentComp.onDestroy === "function")
              currentComp.onDestroy();
            currentEl.remove();
            app.clearPageListeners(normalizeName(activePath));
          } else {
            await unmountSlots(currentComp);
            Object.assign(currentEl.style, {
              opacity: "0",
              zIndex: "-9",
              pointerEvents: "none",
            });
            setTimeout(
              () => (currentEl.style.display = "none"),
              Math.max(0, duration - 50)
            );
          }
        } catch (err) {
          app.warn("[Core] Transition out error:", err);
        }
      }

      // transition in new
      try {
        const transitionTypeIn =
          nextComp.el.dataset.transition || pickRandomTransition(nextComp.el);
        nextComp.el.style.zIndex = "1";
        await applyTransition(nextComp.el, transitionTypeIn, "enter");
        Object.assign(nextComp.el.style, {
          opacity: "1",
          pointerEvents: "auto",
          position: "absolute",
          inset: "0",
        });
        activePath = targetPath;
        app.emit("pageAfterIn", normalizeName(activePath));
        app.info(`[Core] Entered page: ${activePath}`);
      } catch (err) {
        app.warn("[Core] Transition in error:", err);
      }
    } catch (err) {
      app.error("[Core] switchPage fatal error:", err);
      // fallback - ensure UI unlocked
    } finally {
      isTransitioning = false;
      document.body.classList.remove("lock-scroll");
    }
  }

  // -----------------------
  // coldRefreshPage / refresh penuh
  // -----------------------
  async function coldRefreshPage() {
    if (isTransitioning)
      return app.info("[Core] Refresh in progress, blocking new request");

    if (!activePath)
      return app.warn("[Core] coldRefreshPage: no active page to refresh");

    const targetPath = activePath;
    const factory = routeFactories[targetPath];

    if (!factory) {
      if (routeFactories["/_notfound"]) return switchPage("/_notfound");
      return app.warn(`[Core] coldRefreshPage: route not found: ${targetPath}`);
    }

    isTransitioning = true;
    document.body.classList.add("lock-scroll");
    app.emit("pageBeforeOut", normalizeName(activePath));

    const root =
      _rootEl || document.querySelector(_rootSelector) || document.body;

    // Ambil current element & component
    const currentEl = document.querySelector(
      `[data-page='${normalizeName(activePath)}']`
    );
    const currentComp =
      currentEl?._nsp_pageData || pageCache.get(activePath) || {};

    // Fade out + destroy (wajib)
    if (currentEl) {
      try {
        await applyTransition(currentEl, "fade", "leave");
        app.emit("pageUnmount", normalizeName(activePath));
        if (typeof currentComp.unmount === "function") currentComp.unmount();
        app.emit("pageDestroy", normalizeName(activePath));
        if (typeof currentComp.onDestroy === "function")
          currentComp.onDestroy();
        currentEl.remove();
        app.clearPageListeners(normalizeName(activePath));
      } catch (err) {
        app.warn("[Core] Refresh fade out error:", err);
      }
    }

    // Buat ulang komponen baru
    const raw = factory();
    const nextComp = normalize(raw);

    Object.assign(nextComp.el.style, {
      display: "block",
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      opacity: "0",
      zIndex: "1",
      pointerEvents: "none",
      transition: "opacity .4s ease",
    });

    // Inject identitas halaman agar switchPage bisa mengenali
    nextComp.el.dataset.page = normalizeName(targetPath);
    nextComp.el._nsp_pageData = nextComp;

    root.appendChild(nextComp.el);

    await mountSlots(nextComp);
    app.setEventPage(nextComp);
    app.$$.setScopePage(nextComp);

    if (typeof nextComp.mount === "function") nextComp.mount();
    app.emit("pageMount", normalizeName(targetPath));
    if (typeof nextComp.onInit === "function") nextComp.onInit();

    // Fade in
    try {
      await applyTransition(nextComp.el, "fade", "enter");
      Object.assign(nextComp.el.style, {
        opacity: "1",
        pointerEvents: "auto",
        position: "absolute",
        inset: "0",
      });
      activePath = targetPath;

      // Jika cache diaktifkan dan halaman cacheable, simpan
      if (isPageCacheable(targetPath, nextComp)) {
        touchCache(targetPath, nextComp);
      }

      app.emit("pageAfterIn", normalizeName(activePath));
      app.info(`[Core] Refreshed page: ${activePath}`);
    } catch (err) {
      app.warn("[Core] Refresh fade in error:", err);
    } finally {
      isTransitioning = false;
      document.body.classList.remove("lock-scroll");
    }
  }

  // -----------------------
  // hotRefreshPage / refresh ringan
  // -----------------------
  async function hotRefreshPage() {
    if (!activePath) return app.warn("[Core] hotRefreshPage: no active page");

    const currentEl = document.querySelector(
      `[data-page='${normalizeName(activePath)}']`
    );
    const currentComp = currentEl?._nsp_pageData;

    if (currentComp && typeof currentComp.onInit === "function") {
      await applyTransition(currentEl, "fade", "leave");
      currentComp.onInit(); // panggil ulang init
      await applyTransition(currentEl, "fade", "enter");
      app.info(`[Core] Hot refreshed page: ${activePath}`);
    }
  }

  // -----------------------
  // mountSlots
  // -----------------------
  async function mountSlots(pageComp) {
    const slots = Array.from(pageComp.el.querySelectorAll("[data-slot-id]"));
    const asyncTasks = [];

    for (const slot of slots) {
      const id = slot.dataset.slotId;
      const factory = slotMap.get(id);

      if (!factory) {
        app.warn(`[Slot] Tidak ditemukan factory untuk id: ${id}`);
        continue;
      }

      // --- sudah ada instance ---
      if (slot._slotInstance) {
        slot._slotInstance.style.display = "block";

        const pageData = slot._slotInstance._nsp_pageData;

        if (typeof pageData?.mount === "function") pageData.mount();

        if (
          !slot._slotInstance._mountedOnce &&
          typeof pageData?.mountOnce === "function"
        ) {
          pageData.mountOnce();
          slot._slotInstance._mountedOnce = true;
        }

        app.emit("mount", id);
        continue;
      }

      // --- deteksi async factory ---
      const isAsync = factory.constructor.name === "AsyncFunction";

      if (isAsync) {
        // kumpulkan ke daftar paralel
        asyncTasks.push(
          (async () => {
            try {
              const comp = await factory();
              const obj = normalize(comp);
              slot.appendChild(obj.el);
              slot._slotInstance = obj.el;

              if (typeof obj.mount === "function") obj.mount();
              if (typeof obj.onInit === "function") obj.onInit();

              if (typeof obj.mountOnce === "function") {
                obj.mountOnce();
                obj.el._mountedOnce = true;
              }

              app.emit("mount", id);
            } catch (err) {
              app.error(`[Slot] Gagal mount slot async "${id}" →`, err);
            }
          })()
        );
      } else {
        // sync langsung, jaga urutan DOM
        try {
          const comp = factory();
          const obj = normalize(comp);
          slot.appendChild(obj.el);
          slot._slotInstance = obj.el;

          if (typeof obj.mount === "function") obj.mount();
          if (typeof obj.onInit === "function") obj.onInit();

          if (typeof obj.mountOnce === "function") {
            obj.mountOnce();
            obj.el._mountedOnce = true;
          }

          app.emit("mount", id);
        } catch (err) {
          app.error(`[Slot] Gagal mount slot sync "${id}" →`, err);
        }
      }
    }

    // Jalankan semua async slot bersamaan
    if (asyncTasks.length > 0) await Promise.all(asyncTasks);
  }

  // -----------------------
  // unmountSlots
  // -----------------------
  async function unmountSlots(pageComp) {
    const slots = pageComp.el.querySelectorAll("[data-slot-id]");

    for (const slot of slots) {
      const leaveFlag = slot.dataset.leave || "destroy";
      const el = slot._slotInstance;
      if (!el) continue;

      const data = el._nsp_pageData;

      // Lifecycle unmount
      if (typeof data?.unmount === "function") {
        try {
          await data.unmount();
        } catch (err) {
          app.error(err);
        }
      }

      if (!el._unmountedOnce && typeof data?.unmountOnce === "function") {
        try {
          await data.unmountOnce();
        } catch (err) {
          app.error(err);
        }
        el._unmountedOnce = true;
      }

      // Action sesuai leaveFlag
      if (leaveFlag === "destroy") {
        el.remove();
        slot._slotInstance = null;
        if (typeof data?.onDestroy === "function") {
          try {
            await data.onDestroy();
          } catch (err) {
            app.error(err);
          }
        }
      } else if (leaveFlag === "keep") {
        el.style.display = "none";
      }

      app.emit("unmount", slot.dataset.slotId);
    }
  }

  // -----------------------
  // importSlot
  // -----------------------
  async function importSlots(...slots) {
    for (const slotFactory of slots) {
      const name = slotFactory.name;

      if (!name) {
        app.warn("[Slot] Slot factory harus punya nama:", slotFactory);
        continue;
      }

      let factory = slotFactory;

      // jika async (dynamic import)
      if (slotFactory.constructor.name === "AsyncFunction") {
        const imported = await slotFactory();
        if (!imported || typeof imported !== "function") {
          app.warn(`[Slot] Async slot "${name}" tidak mengembalikan factory`);
          continue;
        }
        factory = imported;
      }

      // replace di Map
      slotMap.set(name, factory);

      // replace / push di array registry
      const index = slotRegistry.findIndex((entry) => entry.name === name);
      if (index >= 0) {
        slotRegistry[index].factory = factory;
      } else {
        slotRegistry.push({ name, factory });
      }

      app.log(`[Slot] "${name}" berhasil di-import`);
    }
  }

  // -----------------------
  // util & cache
  // -----------------------
  function isPageCacheable(path, comp) {
    const name = normalizeName(path);
    const byList = cachePage.includes(name);
    const byAttr = comp?.el?.dataset?.cache?.toLowerCase?.() === "true";
    return byList || byAttr;
  }

  function clearCache() {
    pageCache.clear();
  }

  function setCachePage(pages) {
    cachePage = pages;
    pageCache.clear();
    pages.forEach((name) => {
      const factory = routeFactories["/" + name];
      if (factory) {
        const comp = normalize(factory());
        comp.el.setAttribute("data-page", name);
        pageCache.set("/" + name, comp);
      }
    });
  }

  function setWhitelist(pages) {
    if (!Array.isArray(pages)) {
      pages = [pages]; // bungkus jadi array kalau bukan array
    }
    whitelistPages = pages.map(normalizeName);
  }

  function touchCache(path, comp) {
    if (pageCache.has(path)) pageCache.delete(path);

    // cek kapasitas cache
    if (pageCache.size >= MAX_CACHE) {
      const oldestKey = pageCache.keys().next().value;
      const oldestName = normalizeName(oldestKey);

      // kalau bukan whitelist, baru dihapus
      if (!whitelistPages.includes(oldestName)) {
        const oldestComp = pageCache.get(oldestKey);
        if (oldestComp?.onDestroy) oldestComp.onDestroy();
        if (oldestComp?.el?.parentNode) oldestComp.el.remove();
        pageCache.delete(oldestKey);
        app.clearPageListeners(oldestName);
      }
    }

    pageCache.set(path, comp);
  }

  function setMaxCache(max) {
    MAX_CACHE = max;
  }

  function parseTransitionEffects() {
    const styles = Array.from(document.styleSheets);
    const effectSet = new Set();

    styles.forEach((sheet) => {
      let rules;
      try {
        rules = sheet.cssRules || sheet.rules;
      } catch (e) {
        // stylesheet eksternal / CORS tidak bisa diakses
        return;
      }

      if (!rules) return;

      for (const rule of rules) {
        if (!rule.selectorText) continue;
        // cari selector class .page-enter-xxx
        const matches = rule.selectorText.match(/\.page-enter-([a-z0-9-]+)/i);
        if (matches) {
          effectSet.add(matches[1]);
        }
      }
    });

    return Array.from(effectSet);
  }

  function pickRandomTransition(el) {
    return (
      el?.dataset.transition ||
      effects[Math.floor(Math.random() * effects.length)]
    );
  }

  // ---------------------------------------------------------
  // INIT ENGINE & DOM
  // ---------------------------------------------------------
  const app = {};
  const engine = createEngine(app);
  const $$ = createDOM();
  const DOM = DOMHelper($$, app);
  const eventBus = createEventBus(app);

  // -----------------------
  // public API
  // -----------------------
  Object.assign(app, {
    engine,
    DOM,
    $$,
    loop: engine.loop,
    runtime: engine.runtime,

    on: (...args) => eventBus.on(...args),
    off: (...args) => eventBus.off(...args),
    emit: (...args) => eventBus.emit(...args),
    once: (...args) => eventBus.once(...args),
    setEventPage: (...args) => eventBus.setActivePage(...args),
    clearPageListeners: (...args) => eventBus.clearPageListeners(...args),

    switchPage,
    coldRefreshPage,
    hotRefreshPage,
    injectWithQueue,
    importSlots,
    clearCache,
    setCachePage,
    setWhitelist,
    setMaxCache,
    getActivePage: () => activePath,
    getCurrentPage: () => normalizeName(activePath),
    setRootName: (name) => (rootName = name),
    getRootName: () => rootName,
    normalizeName,

    _routeFactories: routeFactories,
    debug: debugConsole,
    log: (...args) => debugConsole.log(...args),
    info: (...args) => debugConsole.info(...args),
    warn: (...args) => debugConsole.warn(...args),
    error: (...args) => debugConsole.error(...args),

    use(plugin, options = {}) {
      if (typeof plugin === "function") {
        plugin(app, options);
      }
    },
  });

  Object.defineProperty(app, "debug", {
    get() {
      return debugConsole.debug;
    },
    set(v) {
      debugConsole.debug = v;
    },
  });

  // -----------------------
  // App runtime helpers
  // -----------------------
  app.state = {
    get running() {
      return engine.loop && engine.loop.start ? true : false;
    },
    get modules() {
      return engine.runtime
        ? [...(engine.runtime._modules?.keys?.() ?? [])]
        : [];
    },
    get groups() {
      return engine.loop ? [...(engine.loop?.groups?.keys?.() ?? [])] : [];
    },
  };

  app.ready = (callback) => {
    if (typeof callback !== "function") return;
    if (document.readyState === "complete") callback(app);
    else window.addEventListener("load", () => callback(app), { once: true });
  };

  app.use = (plugin, options = {}) => {
    if (typeof plugin === "function") {
      plugin(app, options);
    }
  };

  return app;
}

export const app = createApp();
