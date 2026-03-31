// neu.js — Public API for Neu Runtime (FINAL)
import { createApp as _createApp } from "./core.js";
import { createNeuRouter as _createRouter } from "./neuRouter.js";

const appInstance = _createApp();
const routerInstance = _createRouter(appInstance);

const apiDescriptions = {
  version: "Versi runtime Neu",
  build: "Timestamp build saat ini",

  // Page System
  switchPage: "Ganti halaman aktif",
  coldRefreshPage: "Refresh halaman dengan destroy + re-init",
  hotRefreshPage: "Refresh halaman tanpa destroy",
  normalizeName: "Normalisasi nama halaman",
  setRootName: "Set nama root page",
  getActivePage: "Ambil halaman aktif",
  getCurrentPage: "Ambil halaman saat ini",
  getRootName: "Ambil nama root page",

  // Slot System
  importSlots: "Import slot DOM (auto handled)",

  // Engine & Loop
  engine: "Engine utama runtime",
  loop: "Loop utama runtime",
  runtime: "Objek runtime",
  millis: "Ambil waktu loop dalam millis",
  micros: "Ambil waktu loop dalam micros",

  // Events
  on: "Daftarkan event listener",
  off: "Hapus event listener",
  emit: "Emit event",
  once: "Event listener sekali pakai",
  setEventPage: "Set event scope ke page",
  clearPageListeners: "Hapus semua listener page",
  state: "State global runtime",
  setWhitelist: "Whitelist page agar tidak didestroy",

  // Router Utilities
  configRouter: "Konfigurasi router",
  injectPage: "Inject page ke router",
  routerRestart: "Restart router",
  routerStart: "Start router",
  navigate: "Navigasi ke halaman",
  locationReload: "Reload halaman saat ini",
  getRouterConfig: "Ambil konfigurasi router",
  middleware: "Tambahkan middleware router",
  switcherRandomPage: "Switch ke halaman random",

  // Cache / Page Memory
  injectWithQueue: "Inject page dengan queue",
  clearCache: "Bersihkan cache",
  setCachePage: "Set daftar page cacheable",
  setMaxCache: "Atur kapasitas cache maksimum",

  // DOM Utilities
  dom: "Helper DOM scoped",
  $$: "Helper DOM global",

  // Debug & Logger
  debug: "Objek debug (get/set)",
  log: "Log biasa",
  info: "Log info",
  warn: "Log warning",
  error: "Log error",

  // Plugin System
  use: "Pasang plugin",

  // Lifecycle
  ready: "Callback saat runtime siap",
};

// ========================================
// PUBLIC API
// ========================================
const neu = {
  version: "Neu v1.0.0",
  build: new Date().toISOString(),

  // ----------------------------------------
  // Page System
  // ----------------------------------------
  switchPage: appInstance.switchPage,
  coldRefreshPage: appInstance.coldRefreshPage,
  hotRefreshPage: appInstance.hotRefreshPage,
  normalizeName: appInstance.normalizeName,
  setRootName: appInstance.setRootName,
  getActivePage: appInstance.getActivePage,
  getCurrentPage: appInstance.getCurrentPage,
  getRootName: appInstance.getRootName,

  // ----------------------------------------
  // Slot System (Auto-handled by runtime)
  // ----------------------------------------
  importSlots: appInstance.importSlots,

  // ----------------------------------------
  // Engine & Loop
  // ----------------------------------------
  engine: appInstance.engine,
  loop: appInstance.loop,
  runtime: appInstance.runtime,
  millis: () => appInstance.engine.loop.millis(),
  micros: () => appInstance.engine.loop.micros(),

  // ----------------------------------------
  // Events
  // ----------------------------------------
  on: appInstance.on,
  off: appInstance.off,
  emit: appInstance.emit,
  once: appInstance.once,
  setEventPage: appInstance.setEventPage,
  clearPageListeners: appInstance.clearPageListeners,
  state: appInstance.state,
  setWhitelist: appInstance.setWhitelist,

  // ----------------------------------------
  // Router Utilities
  // ----------------------------------------
  configRouter: routerInstance.configRouter,
  injectPage: routerInstance.inject,
  routerRestart: routerInstance.restart,
  routerStart: routerInstance.start,
  navigate: routerInstance.navigateTo,
  locationReload: routerInstance.reloadCurrent,
  getRouterConfig: routerInstance.getConfig,
  middleware: routerInstance.use,
  switcherRandomPage: routerInstance.switcherRandomPage,

  // ----------------------------------------
  // Cache / Page Memory
  // ----------------------------------------
  injectWithQueue: appInstance.injectWithQueue,
  clearCache: appInstance.clearCache,
  setCachePage: appInstance.setCachePage,
  setMaxCache: appInstance.setMaxCache,

  // ----------------------------------------
  // DOM Utilities (scoped & global)
  // ----------------------------------------
  dom: appInstance.DOM, // helper
  $$: appInstance.$$,

  // ----------------------------------------
  // Debug & Logger
  // ----------------------------------------
  debug: {
    get: () => appInstance.debug,
    set: (v) => (appInstance.debug = v),
    log: appInstance.log,
    info: appInstance.info,
    warn: appInstance.warn,
    error: appInstance.error,
  },

  // ----------------------------------------
  // Plugin System
  // ----------------------------------------
  use: appInstance.use,

  // ----------------------------------------
  // Lifecycle
  // ----------------------------------------
  ready: appInstance.ready,

  help: () => {
    if (neu.debug.get()) {
      neu.debug.log("=== Neu Runtime Public API ===");
      Object.entries(apiDescriptions).forEach(([name, desc]) => {
        neu.debug.log(`${name} - ${desc}`);
      });
      neu.debug.log("==============================");
    } else {
      console.log("=== Neu Runtime Public API ===");
      Object.entries(apiDescriptions).forEach(([name, desc]) => {
        console.log(`${name} - ${desc}`);
      });
      console.log("==============================");
    }
  },
};

export const dom = appInstance.DOM;
export const $$ = appInstance.$$;
export const router = routerInstance;
export const app = appInstance;
export default neu;
