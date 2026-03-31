// src/app/eventBus.js
// ===============================
// NeuSPA EventBus System (final integrated version)
// ===============================
export function createEventBus(app) {
  const registry = new Map(); // key: eventName, value: array of { handler, page, scope, once }
  const oncePerPageMap = new Map(); // key: `${event}:${page}`
  let activePage = null;

  // ===============================
  // Active Page Setter
  // ===============================
  function setActivePage(input) {
    if (input && typeof input === "object") {
      if ("name" in input && typeof input.name === "string")
        activePage = input.name;
      else activePage = null;
    } else if (typeof input === "string") activePage = input;
    else activePage = null;
    // console.log(`[NeuSPA EventBus] Active page: '${activePage}'`);
  }

  // ===============================
  // Register Event Handlers
  // ===============================
  function on(eventName, handler, { page, once = false } = {}) {
    if (typeof eventName !== "string" || typeof handler !== "function") {
      console.error("[NeuSPA EventBus] Invalid arguments for 'on'");
      return;
    }

    if (!registry.has(eventName)) registry.set(eventName, []);
    const targetPage = page || app.getActivePage?.() || activePage || "global";
    registry.get(eventName).push({ handler, page: targetPage, once });
  }

  function once(eventName, handler, options = {}) {
    on(eventName, handler, { ...options, once: true });
  }

  // ===============================
  // Unregister Handlers
  // ===============================
  function off(eventName, handler) {
    const list = registry.get(eventName);
    if (!list) return;

    registry.set(
      eventName,
      list.filter((entry) => entry.handler !== handler)
    );
  }

  // ===============================
  // Emit Events
  // ===============================
  function emit(eventName, payload = {}) {
    if (typeof eventName !== "string") {
      console.error("[NeuSPA EventBus] Invalid eventName in 'emit'");
      return;
    }

    const list = registry.get(eventName);
    if (!list || !list.length) return;

    const current = app.getActivePage?.() || activePage || "global";

    for (const entry of [...list]) {
      const { handler, page, once } = entry;
      // Global tetap hidup, local hanya aktif di page yang sedang aktif
      if (page === current || page === "global") {
        const onceKey = `${eventName}:${page}`;
        if (once && oncePerPageMap.has(onceKey)) continue;

        try {
          handler(payload);
        } catch (err) {
          console.warn(`[NeuSPA EventBus] Error in '${eventName}':`, err);
        }

        if (once) {
          oncePerPageMap.set(onceKey, true);
          off(eventName, handler);
        }
      }
    }
  }

  // ===============================
  // Clear Listeners Per Page
  // ===============================
  function clearPageListeners(pageName) {
    for (const [event, list] of registry.entries()) {
      registry.set(
        event,
        list.filter((entry) => entry.page !== pageName)
      );
    }

    for (const key of oncePerPageMap.keys()) {
      if (key.endsWith(`:${pageName}`)) oncePerPageMap.delete(key);
    }

    // console.log(`[NeuSPA EventBus] Cleared all listeners for '${pageName}'`);
  }

  // ===============================
  // Debug Utility
  // ===============================
  function debugDump() {
    console.table(
      [...registry.entries()].flatMap(([event, handlers]) =>
        handlers.map((h) => ({
          event,
          page: h.page,
          once: h.once,
        }))
      )
    );
  }

  // ===============================
  // Binding ke app (langsung bisa dipakai di seluruh sistem)
  // ===============================
  app.on = on;
  app.once = once;
  app.off = off;
  app.emit = emit;
  app.setEventPage = setActivePage;
  app.clearPageListeners = clearPageListeners;
  app.debugEventBus = debugDump;

  // console.log("[NeuSPA EventBus] Integrated with app successfully ✅");

  return {
    on,
    once,
    off,
    emit,
    setActivePage,
    clearPageListeners,
    debugDump,
  };
}
