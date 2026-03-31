export const debugConsole = (() => {
  let consoleEl, toggleBtn, clearBtn, closeBtn, resizeHandle, debug;
  let isVisible = true;
  let defaultWidth = "300px";
  let defaultHeight = "200px";

  // fungsi listener
  let dragStart, dragMove, dragEnd;
  let dragTouchStart, dragTouchMove, dragTouchEnd;
  let resizeStart, resizeMove, resizeEnd;
  let resizeTouchStart, resizeTouchMove, resizeTouchEnd;
  let toggleHandler, clearHandler, closeHandler;
  let cpuInterval; // simpan interval global

  function init(ifDebug = false) {
    debug = ifDebug;

    if (!consoleEl) {
      // console utama
      consoleEl = document.createElement("div");
      consoleEl.id = "debugConsole";
      consoleEl.style.width = defaultWidth;
      consoleEl.style.height = defaultHeight;

      // toolbar
      const toolbar = document.createElement("div");
      toolbar.className = "debug-toolbar";

      toggleBtn = document.createElement("button");
      toggleBtn.textContent = "Toggle";
      toggleBtn.className = "debug-toggle";

      clearBtn = document.createElement("button");
      clearBtn.textContent = "Clear";
      clearBtn.className = "debug-clear";

      closeBtn = document.createElement("button");
      closeBtn.textContent = "X";
      closeBtn.className = "debug-close";

      // CPU Usage Label
      const cpuLabel = document.createElement("span");
      cpuLabel.textContent = "CPU: 0%";
      cpuLabel.className = "debug-cpu";

      toolbar.appendChild(toggleBtn);
      toolbar.appendChild(clearBtn);
      toolbar.appendChild(cpuLabel);
      toolbar.appendChild(closeBtn);
      consoleEl.appendChild(toolbar);

      // Simulasi CPU
      cpuInterval = setInterval(() => {
        const cpu = Math.floor(Math.random() * 100); //ganti pakai data asli
        cpuLabel.textContent = `CPU: ${cpu}%`;
      }, 500);

      // log container
      const logContainer = document.createElement("div");
      logContainer.className = "debug-log";
      consoleEl.appendChild(logContainer);

      // resize handle
      resizeHandle = document.createElement("div");
      resizeHandle.className = "debug-resize-handle";
      consoleEl.appendChild(resizeHandle);

      document.body.appendChild(consoleEl);

      // ---------- DRAG LISTENERS ----------
      let isDragging = false,
        offsetX,
        offsetY;

      dragStart = (e) => {
        isDragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
      };
      dragMove = (e) => {
        if (!isDragging) return;
        consoleEl.style.right = "auto";
        consoleEl.style.bottom = "auto";
        consoleEl.style.left = `${e.clientX - offsetX}px`;
        consoleEl.style.top = `${e.clientY - offsetY}px`;
      };
      dragEnd = () => {
        isDragging = false;
      };

      dragTouchStart = (e) => {
        const t = e.touches[0];
        isDragging = true;
        offsetX = t.clientX - consoleEl.offsetLeft;
        offsetY = t.clientY - consoleEl.offsetTop;
      };
      dragTouchMove = (e) => {
        if (!isDragging) return;
        const t = e.touches[0];
        consoleEl.style.right = "auto";
        consoleEl.style.bottom = "auto";
        consoleEl.style.left = `${t.clientX - offsetX}px`;
        consoleEl.style.top = `${t.clientY - offsetY}px`;
      };
      dragTouchEnd = () => {
        isDragging = false;
      };

      toolbar.addEventListener("mousedown", dragStart);
      document.addEventListener("mousemove", dragMove);
      document.addEventListener("mouseup", dragEnd);

      toolbar.addEventListener("touchstart", dragTouchStart);
      document.addEventListener("touchmove", dragTouchMove);
      document.addEventListener("touchend", dragTouchEnd);

      // ---------- RESIZE LISTENERS ----------
      let isResizing = false,
        startWidth,
        startHeight,
        startX,
        startY;

      resizeStart = (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = consoleEl.offsetWidth;
        startHeight = consoleEl.offsetHeight;
        e.preventDefault();
      };
      resizeMove = (e) => {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        consoleEl.style.width = `${startWidth + dx}px`;
        consoleEl.style.height = `${startHeight + dy}px`;
      };
      resizeEnd = () => {
        isResizing = false;
      };

      resizeTouchStart = (e) => {
        const t = e.touches[0];
        isResizing = true;
        startX = t.clientX;
        startY = t.clientY;
        startWidth = consoleEl.offsetWidth;
        startHeight = consoleEl.offsetHeight;
      };
      resizeTouchMove = (e) => {
        if (!isResizing) return;
        const t = e.touches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        consoleEl.style.width = `${startWidth + dx}px`;
        consoleEl.style.height = `${startHeight + dy}px`;
      };
      resizeTouchEnd = () => {
        isResizing = false;
      };

      resizeHandle.addEventListener("mousedown", resizeStart);
      document.addEventListener("mousemove", resizeMove);
      document.addEventListener("mouseup", resizeEnd);

      resizeHandle.addEventListener("touchstart", resizeTouchStart);
      document.addEventListener("touchmove", resizeTouchMove);
      document.addEventListener("touchend", resizeTouchEnd);

      // ---------- TOOLBAR BUTTON HANDLERS ----------
      toggleHandler = () => {
        isVisible = !isVisible;
        const logContainer = consoleEl.querySelector(".debug-log");
        logContainer.style.display = isVisible ? "block" : "none";

        if (consoleEl.classList.contains("minimized")) {
          consoleEl.classList.remove("minimized");
          consoleEl.style.width = defaultWidth;
          consoleEl.style.height = defaultHeight;
        } else {
          consoleEl.classList.add("minimized");
          consoleEl.style.width = "300px";
          consoleEl.style.height = "40px";
        }
      };
      toggleBtn.addEventListener("click", toggleHandler);

      clearHandler = () => {
        const logContainer = consoleEl.querySelector(".debug-log");
        logContainer.innerHTML = "";
      };
      clearBtn.addEventListener("click", clearHandler);

      closeHandler = () => {
        consoleEl.style.display = "none";
        debug = false;
        removeListeners();
      };
      closeBtn.addEventListener("click", closeHandler);
    }

    // tampilkan atau sembunyikan berdasarkan flag
    consoleEl.style.display = debug ? "block" : "none";
  }

  function removeListeners() {
    if (!consoleEl) return;

    const toolbar = consoleEl.querySelector(".debug-toolbar");

    // drag
    toolbar.removeEventListener("mousedown", dragStart);
    document.removeEventListener("mousemove", dragMove);
    document.removeEventListener("mouseup", dragEnd);

    // touch drag
    toolbar.removeEventListener("touchstart", dragTouchStart);
    document.removeEventListener("touchmove", dragTouchMove);
    document.removeEventListener("touchend", dragTouchEnd);

    // resize
    resizeHandle.removeEventListener("mousedown", resizeStart);
    document.removeEventListener("mousemove", resizeMove);
    document.removeEventListener("mouseup", resizeEnd);

    // touch resize
    resizeHandle.removeEventListener("touchstart", resizeTouchStart);
    document.removeEventListener("touchmove", resizeTouchMove);
    document.removeEventListener("touchend", resizeTouchEnd);

    // tombol toolbar
    toggleBtn.removeEventListener("click", toggleHandler);
    clearBtn.removeEventListener("click", clearHandler);
    closeBtn.removeEventListener("click", closeHandler);

    // hapus interval CPU
    if (cpuInterval) {
      clearInterval(cpuInterval);
      cpuInterval = null;
    }
  }

  function formatArgs(type, args) {
    const msg = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      )
      .join(" ");
    return `[${type.toUpperCase()}] ${msg}`;
  }

  function append(msg, type = "log") {
    if (!consoleEl) return;
    const logContainer = consoleEl.querySelector(".debug-log");

    const oldSpacer = logContainer.querySelector(".debug-spacer");
    if (oldSpacer) logContainer.removeChild(oldSpacer);

    const p = document.createElement("p");
    p.textContent = msg;
    p.className = `debug-${type}`;
    logContainer.appendChild(p);

    const spacer = document.createElement("div");
    spacer.className = "debug-spacer";
    spacer.style.height = "30px";
    logContainer.appendChild(spacer);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        logContainer.scrollTo({
          top: logContainer.scrollHeight,
          behavior: "smooth",
        });
      });
    });
  }

  return {
    init,
    log: (...args) => {
      if (debug) append(formatArgs("log", args), "log");
    },
    info: (...args) => {
      if (debug) append(formatArgs("info", args), "info");
    },
    warn: (...args) => {
      if (debug) append(formatArgs("warn", args), "warn");
    },
    error: (...args) => {
      if (debug) append(formatArgs("error", args), "error");
    },
    get debug() {
      return debug;
    },
    set debug(value) {
      debug = Boolean(value);
      if (debug) init(true);
      else {
        consoleEl.style.display = "none";
        removeListeners();
      }
    },
  };
})();
