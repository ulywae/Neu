// src/app/engine.js
// ---------------------------------------------------------
// ENGINE DEFINITION
// ---------------------------------------------------------
export function createEngine(app) {
  const engine = {};
  let running = false;
  let startTime = 0;
  let lastTime = 0;

  const groups = new Map(); // fixed-fps jobs
  const modules = new Map(); // runtime modules
  const moduleBus = new Map(); // event bus per module
  const tasks = new Map(); // scheduler tasks

  // --- internal: module event bus helpers ---
  function ensureBus(name) {
    if (!moduleBus.has(name)) moduleBus.set(name, new Map());
    return moduleBus.get(name);
  }
  function moduleOn(name, event, cb) {
    const bus = ensureBus(name);
    if (!bus.has(event)) bus.set(event, new Set());
    bus.get(event).add(cb);
    return () => bus.get(event)?.delete(cb);
  }
  function moduleEmit(name, event, ...args) {
    const bus = moduleBus.get(name);
    if (!bus) return;
    const handlers = bus.get(event);
    if (!handlers) return;
    for (const h of handlers) {
      try {
        h(...args);
      } catch (e) {
        app.warn?.(`[ModuleBus:${name}] handler error`, e);
      }
    }
  }

  // --- scheduler tick ---
  function tickScheduler(now) {
    for (const [name, t] of tasks) {
      if (now >= t.nextAt) {
        try {
          t.callback();
        } catch (e) {
          app.warn?.(`[Scheduler:${name}] error`, e);
        }
        if (t.repeat) {
          t.nextAt = now + t.delay;
        } else {
          tasks.delete(name);
        }
      }
    }
  }

  // --- main loop ---
  function loopFrame(now) {
    if (!running) return;
    let delta = now - lastTime;
    if (delta > 100) delta = 16;
    
    lastTime = now;

    // 1) modules
    for (const [name, mod] of modules) {
      try {
        if (!mod.paused && typeof mod.update === "function")
          mod.update(delta, { emit: (e, ...a) => moduleEmit(name, e, ...a) });
      } catch (err) {
        app.warn?.(`[Runtime:${name}] error in update():`, err);
      }
    }

    // 2) groups
    for (const [_, g] of groups) {
      g.accum += delta;
      if (g.accum >= g.interval) {
        try {
          g.callback(g.accum);
        } catch (e) {
          app.warn?.("[LoopGroup] callback error", e);
        }
        g.accum = 0;
      }
    }

    // 3) scheduler
    tickScheduler(now);

    app.emit("tick", delta);
    requestAnimationFrame(loopFrame);
  }

  // --- loop API ---
  engine.loop = {
    start() {
      if (running) return;
      running = true;
      startTime = performance.now();
      lastTime = startTime;

      for (const [_, mod] of modules) {
        try {
          if (typeof mod.start === "function") mod.start();
        } catch (e) {
          app.warn?.("[Runtime] module.start error", e);
        }
      }

      requestAnimationFrame(loopFrame);
      app.emit("engine:start");
      app.info?.("[Loop] Started");
    },
    stop() {
      if (!running) return;
      running = false;
      for (const [_, mod] of modules) {
        try {
          if (typeof mod.stop === "function") mod.stop();
        } catch (e) {
          app.warn?.("[Runtime] module.stop error", e);
        }
      }
      app.emit("engine:stop");
      app.info?.("[Loop] Stopped");
    },

    // fungsi millis
    millis() {
      if (!running) return 0;
      return Math.round(performance.now() - startTime);
    },
    micros() {
      if (!running) return 0;
      return Math.round((performance.now() - startTime) * 1000);
    },
    addGroup(name, callback, fps = 60) {
      const interval = 1000 / fps;
      groups.set(name, { callback, interval, accum: 0 });
      app.info?.(`[Loop] Group added: ${name} @${fps}fps`);
    },
    removeGroup(name) {
      groups.delete(name);
    },
    clearGroups() {
      groups.clear();
    },

    // --- scheduler API ---
    schedule(name, callback, delayMs, repeat = false) {
      tasks.set(name, {
        callback,
        delay: delayMs,
        repeat,
        nextAt: performance.now() + delayMs,
      });
      app.info?.(
        `[Scheduler] Task scheduled: ${name} in ${delayMs}ms repeat=${repeat}`
      );
    },
    cancelSchedule(name) {
      tasks.delete(name);
    },
    clearSchedules() {
      tasks.clear();
    },
  };

  // --- runtime API ---
  engine.runtime = {
    use(name, moduleObject, opts = {}) {
      moduleObject.priority = opts.priority ?? 0;
      moduleObject.paused = false;
      moduleObject.autoPause = !!opts.autoPause;
      modules.set(name, moduleObject);
      const sorted = [...modules.entries()].sort(
        (a, b) => (b[1].priority || 0) - (a[1].priority || 0)
      );
      modules.clear();
      for (const [k, v] of sorted) modules.set(k, v);
      ensureBus(name);
      moduleObject._bus = {
        on: (evt, cb) => moduleOn(name, evt, cb),
        emit: (evt, ...args) => moduleEmit(name, evt, ...args),
      };
      if (running && typeof moduleObject.start === "function") {
        try {
          moduleObject.start();
        } catch (e) {
          app.warn?.(`[Runtime:${name}] start() error`, e);
        }
      }
      app.info?.(
        `[Runtime] Module registered: ${name} (prio:${moduleObject.priority})`
      );
    },
    pause(name) {
      const mod = modules.get(name);
      if (mod) mod.paused = true;
    },
    resume(name) {
      const mod = modules.get(name);
      if (mod) mod.paused = false;
    },
    remove(name) {
      modules.delete(name);
      moduleBus.delete(name);
    },
    clear() {
      modules.clear();
      moduleBus.clear();
    },
  };

  return engine;
}
