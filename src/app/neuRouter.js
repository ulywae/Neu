export function createNeuRouter(app, initialConfig = {}) {
  const routes = {};
  const isFile = location.protocol === "file:";
  let historyStack = [];
  const visited = new Set();

  // Nilai default
  let maxHistory = 5;
  let root = "root";
  let skipFolders = [];
  let skipFiles = [];
  let cachePages = [];
  let maxCache = 5;
  let disableBack = true;
  let loaderStyle = 1;
  let InjectTimeout = 3000;
  let InjectDelay = 100;
  let backGroundClass = "bg-blue";
  let useBiosLoader = false;

  const flags = {
    root: false,
    cachePages: false,
    maxCache: false,
  };

  // Middleware chain
  const middlewares = [];
  function use(mw) {
    middlewares.push(async (path) => {
      const normalized = path.startsWith("/") ? path.slice(1) : path;
      return await mw(normalized);
    });
  }

  async function runMiddlewares(path) {
    for (const mw of middlewares) {
      const result = await mw(path);
      if (result === false) return false;
    }
    return true;
  }

  // Function untuk mengupdate konfigurasi
  function configRouter(cfg = {}) {
    if ("root" in cfg) {
      root = cfg.root;
      app.setRootName(root);
      flags.root = true;
    }

    if ("cachePages" in cfg) {
      cachePages = cfg.cachePages;
      app.setCachePage(cachePages);
      flags.cachePages = true;
    }

    if ("maxCache" in cfg) {
      maxCache = cfg.maxCache < 2 ? 2 : cfg.maxCache;
      app.setMaxCache(maxCache);
      flags.maxCache = true;
    }

    skipFolders = cfg.skipFolders ?? skipFolders;
    skipFiles = cfg.skipFiles ?? skipFiles;
    disableBack = cfg.disableBack ?? disableBack;
    maxHistory = cfg.maxHistory ?? maxHistory;
    loaderStyle = cfg.loaderStyle ?? loaderStyle;
    InjectTimeout = cfg.injectTimeout ?? InjectTimeout;
    InjectDelay = cfg.injectDelay ?? InjectDelay;
    backGroundClass = cfg.bgClass ?? backGroundClass;
    useBiosLoader = cfg.biosStyle ?? useBiosLoader;
  }

  // Jika initialConfig diberikan, gunakan untuk set konfigurasi awal
  if (Object.keys(initialConfig).length > 0) {
    configRouter(initialConfig);
  }

  // Fungsi untuk menampilkan konfigurasi
  function getConfig() {
    if (app?.debug) {
      app.info("=== Router Config ===");
      app.info("maxHistory:", maxHistory);
      app.info("root:", root);
      app.info("skipFolders:", skipFolders);
      app.info("skipFiles:", skipFiles);
      app.info("cachePages:", cachePages);
      app.info("maxCache:", maxCache);
      app.info("disableBack:", disableBack);
      app.info("======================");
    } else {
      console.log("=== Router Config ===");
      console.log("maxHistory:", maxHistory);
      console.log("root:", root);
      console.log("skipFolders:", skipFolders);
      console.log("skipFiles:", skipFiles);
      console.log("cachePages:", cachePages);
      console.log("maxCache:", maxCache);
      console.log("disableBack:", disableBack);
      console.log("======================");
    }
  }

  // ============================================================
  // Auto-import Pages & Slots
  // ============================================================
  async function autoImportJS() {
    const modules = import.meta.glob(["../pages/**/*.js", "../page/**/*.js"], {
      eager: true,
    });

    for (const path in modules) {
      const mod = modules[path].default;
      const rel = path
        .replace(/^.*\/pages\//, "")
        .replace(/\.js$/, "")
        .toLowerCase();
      const folder = rel.includes("/") ? rel.split("/")[0] : null;
      if ((folder && skipFolders.includes(folder)) || skipFiles.includes(rel))
        continue;
      const route = rel === root ? "/" : `/${rel}`;
      if (typeof mod === "function") routes[route] = mod;
    }
  }

  async function autoImportSlots() {
    const modules = import.meta.glob(
      ["../slot/*.js", "../slots/*.js", "../Slot/*.js", "../Slots/*.js"],
      { eager: false } // false = lazy import (pakai await import)
    );

    const imported = [];

    for (const [path, loader] of Object.entries(modules)) {
      try {
        const mod = await loader();
        if (mod.default) imported.push(mod.default);
      } catch (err) {
        console.warn(`[SlotLoader] Gagal import ${path}:`, err);
      }
    }

    if (imported.length) {
      app.importSlots(...imported);
      console.log(`[SlotLoader] Imported ${imported.length} slot modules.`);
    } else {
      console.warn("[SlotLoader] Tidak ada slot ditemukan.");
    }
  }

  // ============================================================
  // History
  // ============================================================
  function resolve(raw) {
    return isFile ? raw.replace(/^#/, "") || "/" : raw || "/";
  }

  function normalize(p) {
    if (!p) return "/";
    return p.startsWith("/") ? p : `/${p}`;
  }

  function pushHistory(path) {
    if (!historyStack.includes(path)) historyStack.push(path);
    visited.add(path);
    if (historyStack.length >= maxHistory) historyStack.shift();
  }

  // Nested route matcher
  function matchRoute(path) {
    const exact = routes[path];
    if (exact) return exact;
    for (const [route, factory] of Object.entries(routes)) {
      const match = route.match(/:([a-zA-Z]+)/);
      if (match) {
        const base = route.split("/:")[0];
        if (path.startsWith(base)) {
          const param = path.replace(base + "/", "");
          return () => factory({ [match[1]]: param });
        }
      }
    }
    return null;
  }

  // ============================================================
  // Core Navigate
  // ============================================================
  async function navigateTo(path, { updateHistory = true } = {}) {
    const np = normalize(resolve(path));
    if (np === app.getActivePage()) return;

    app.emit("route:change:start", { from: app.getActivePage(), to: np });

    if (!(await runMiddlewares(np))) {
      app.emit("route:blocked", { to: np });
      return;
    }

    const valid = matchRoute(np);
    try {
      await app.switchPage(valid ? np : "_notfound");
      app.emit("route:change:end", { to: np });
    } catch (err) {
      app.emit("route:error", { to: np, error: err });
    }

    if (updateHistory && !isFile) {
      history.pushState({ page: np }, "", np);
      pushHistory(np);
    }
    if (isFile) location.hash = np;
  }

  // ============================================================
  // Popstate (Back)
  // ============================================================
  async function handlePop() {
    const raw = resolve(isFile ? location.hash : location.pathname);
    const np = normalize(raw);
    const valid = matchRoute(np);
    if (valid) {
      pushHistory(np);
      await navigateTo(np, { updateHistory: false });
      app.emit("route:pop", { to: np });
    } else {
      const fb = historyStack[historyStack.length - 2] || "/";
      await navigateTo(fb, { updateHistory: false });
      app.emit("route:pop:fallback", { to: fb });
    }
  }

  function initBackHandler() {
    window.addEventListener("popstate", async () => {
      if (disableBack) {
        history.pushState({}, "", location.href);
        app.emit("back:blocked", {});
      } else {
        await handlePop();
      }
    });
  }

  // ============================================================
  // Link Interceptor
  // ============================================================
  function interceptLinks() {
    document.body.addEventListener("click", async (e) => {
      const a = e.target.closest("a");
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href || /^(http|mailto|tel|#)/.test(href)) return;

      const mode = a.dataset.router;

      switch (mode) {
        case "ignore":
        case "external":
          return;
        case "reload":
          e.preventDefault();
          await navigateTo(href);
          return;
        case "back":
          e.preventDefault();
          history.back();
          return;
        default:
          e.preventDefault();
          await navigateTo(href);
      }
    });
  }

  // Navigasi normal (SPA)
  // <a href="/home">Home</a>

  // Abaikan intercept, biarkan browser handle
  // <a href="/docs" data-router="ignore">Docs (ignore)</a>

  // Link eksternal
  // <a href="https://example.com" data-router="external">External Site</a>

  // Reload halaman via engine
  // <a href="/dashboard" data-router="reload">Reload Dashboard</a>

  // Tombol back (History API)
  // <a href="#" data-router="back">Go Back</a>

  // ============================================================
  // Restart System (Cold Reload)
  // ============================================================
  async function restart() {
    await app.destroyEngine();
    await inject();
    await start();
  }

  async function reloadCurrent() {
    await app.coldRefreshPage();
  }

  // ============================================================
  // Inject (Initial App Injection)
  // ============================================================
  async function inject(opts = {}) {
    const {
      ensureLayers = null,
      timeout = InjectTimeout,
      delay = InjectDelay,
      biosStyle = useBiosLoader,
      bgClass = backGroundClass,
      loaderMode = loaderStyle,
    } = opts;

    await autoImportJS();

    let layers = [];
    if (ensureLayers) {
      if (typeof ensureLayers === "function") layers = [ensureLayers()];
      else if (Array.isArray(ensureLayers))
        layers = ensureLayers.map((x) => (typeof x === "function" ? x() : x));
      else layers = [ensureLayers];
    }

    await app.injectWithQueue("#app", routes, {
      timeout,
      delay,
      biosStyle,
      ensureLayer: layers,
      bgClass,
      loaderMode,
    });

    try {
      await autoImportSlots();
    } catch (err) {
      app.warn("[injectPage] Slot auto-import gagal:", err);
    }
  }

  // ============================================================
  // Start Router
  // ============================================================
  async function start() {
    if (!flags.root) app.setRootName(root);
    if (!flags.cachePages) app.setCachePage(cachePages);

    if (!flags.maxCache) {
      if (maxCache < 2) maxCache = 2;
      app.setMaxCache(maxCache);
    }

    interceptLinks();
    initBackHandler();

    if (!isFile) history.replaceState({}, "", "/");
    await handlePop();
  }

  // ============================================================
  // Burn Test
  // ============================================================
  function switcherRandomPage(interval = 400) {
    const paths = Object.keys(routes);
    let running = true;

    async function nextSwitch() {
      if (!running) return;
      const nextPage = paths[Math.floor(Math.random() * paths.length)];
      await navigateTo(nextPage, { updateHistory: false });
      app.log(`[StressTest] Switched to: ${nextPage}`);
      setTimeout(nextSwitch, interval);
    }

    nextSwitch();

    return {
      stop: () => {
        running = false;
        app.log("[StressTest] Stopped!");
      },
    };
  }

  return {
    configRouter,
    getConfig,
    inject,
    start,
    navigateTo,
    use,
    restart,
    reloadCurrent,
    defaultRoute: () => navigateTo("/"),
    switcherRandomPage,
  };
}
