// src/app/domHelper.js
export function DOMHelper($$, app) {
  // ===================================================
  // BASIC GETTERS
  // ===================================================
  function getE(selector, { page = "$" } = {}) {
    let el;
    switch (page) {
      case "$":
        el = $$.get(selector.replace(/^#/, ""));
        break;
      case "global":
        el = document.querySelector(
          selector.startsWith("#") ? selector : `#${selector}`
        );
        break;
      case "outScope":
        el = $$.globalOutsideScope(selector).get();
        break;
    }
    return $$.wrap(el ? [el] : []);
  }

  function getQ(selector, { page = "$" } = {}) {
    let nodes;
    switch (page) {
      case "$":
        // pakai scope page aktif
        nodes = $$.all(selector).all();
        break;
      case "global":
        nodes = document.querySelectorAll(selector);
        break;
      case "outScope":
        return $$.globalOutsideScope(selector); // ini sudah wrap
      default:
        nodes = [];
    }

    return $$.wrap(nodes);
  }

  // ===================================================
  // CLASS MANIPULATION
  // ===================================================
  function toggleActive(elementId) {
    const el = getE(elementId);
    if (!el) return debugNotFound(elementId);
    el.classList.toggle("active");
    debugLog(`Toggled class "active" on #${elementId}`);
  }

  function addClass(elementId, className) {
    const el = getE(elementId);
    if (!el) return debugNotFound(elementId);
    if (!className) return debugError("className harus berupa string.");
    if (!el.classList.contains(className)) {
      el.classList.add(className);
      debugLog(`Added class "${className}" to #${elementId}`);
    } else debugWarn(`Class "${className}" already exists on #${elementId}`);
  }

  function addClasses(elementId, classList) {
    if (!Array.isArray(classList)) return debugError("classList harus array.");
    classList.forEach((cls) => addClass(elementId, cls));
  }

  function removeClass(elementId, className) {
    const el = getE(elementId);
    if (!el) return debugNotFound(elementId);
    if (!className) return debugError("className harus string.");
    if (el.classList.contains(className)) {
      el.classList.remove(className);
      debugLog(`Removed class "${className}" from #${elementId}`);
    } else debugWarn(`Class "${className}" not found on #${elementId}`);
  }

  function removeClasses(elementId, classList) {
    if (!Array.isArray(classList)) return debugError("classList harus array.");
    classList.forEach((cls) => removeClass(elementId, cls));
  }

  function hasClass(elementId, className) {
    const el = getE(elementId);
    return el ? el.classList.contains(className) : false;
  }

  function addRemoveClass(elementId, className, action = "remove") {
    const el = getE(elementId);
    if (!el) return debugNotFound(elementId);
    if (action === "add") el.classList.add(className);
    else el.classList.remove(className);
    debugLog(`Class "${className}" ${action}ed on #${elementId}`);
  }

  // ===================================================
  // CONTENT & ATTRIBUTE MANIPULATION
  // ===================================================
  function addInnerHtml(elementId, html) {
    const el = getE(elementId);
    if (!el) return debugNotFound(elementId);
    el.innerHTML = html;
    debugLog(`Set innerHTML on #${elementId}`);
  }

  function appendHtml(elementId, html) {
    const el = getE(elementId);
    if (!el) return debugNotFound(elementId);
    el.insertAdjacentHTML("beforeend", html);
    debugLog(`Appended HTML to #${elementId}`);
  }

  function prependHtml(elementId, html) {
    const el = getE(elementId);
    if (!el) return debugNotFound(elementId);
    el.insertAdjacentHTML("afterbegin", html);
    debugLog(`Prepended HTML to #${elementId}`);
  }

  function setAttr(elementId, attr, value) {
    const el = getE(elementId);
    if (!el) return debugNotFound(elementId);
    el.setAttribute(attr, value);
    debugLog(`Set attribute "${attr}" = "${value}" on #${elementId}`);
  }

  function getAttr(elementId, attr) {
    const el = getE(elementId);
    return el ? el.getAttribute(attr) : null;
  }

  function removeAttr(elementId, attr) {
    const el = getE(elementId);
    if (!el) return debugNotFound(elementId);
    el.removeAttribute(attr);
    debugLog(`Removed attribute "${attr}" from #${elementId}`);
  }

  // ===================================================
  // DISPLAY HELPERS
  // ===================================================
  function show(elementId) {
    const el = getE(elementId);
    if (!el) return debugNotFound(elementId);
    el.style.display = "";
  }

  function hide(elementId) {
    const el = getE(elementId);
    if (!el) return debugNotFound(elementId);
    el.style.display = "none";
  }

  // ===================================================
  // EVENT HANDLERS
  // ===================================================
  function on(elementId, event, handler) {
    const el = getE(elementId);
    if (!el) return debugNotFound(elementId);
    el.addEventListener(event, handler);
    debugLog(`Bound event "${event}" on #${elementId}`);
  }

  function off(elementId, event, handler) {
    const el = getE(elementId);
    if (!el) return debugNotFound(elementId);
    el.removeEventListener(event, handler);
    debugLog(`Removed event "${event}" on #${elementId}`);
  }

  // ===================================================
  // DEBUG UTILITIES
  // ===================================================
  function debugLog(msg) {
    app.log(`[DOM ${scope}] ${msg}`);
  }
  function debugWarn(msg) {
    app.warn(`[DOM ${scope}] ${msg}`);
  }
  function debugError(msg) {
    app.error(`[DOM ${scope}] ${msg}`);
  }
  function debugNotFound(id) {
    if (app?.debug)
      app.error(`[DOM ${scope}] Element with ID "${id}" not found.`);
  }

  // ===================================================
  // EXPORT
  // ===================================================
  return {
    getE,
    getQ,
    addClass,
    addClasses,
    removeClass,
    removeClasses,
    toggleActive,
    addRemoveClass,
    hasClass,
    addInnerHtml,
    appendHtml,
    prependHtml,
    setAttr,
    getAttr,
    removeAttr,
    show,
    hide,
    on,
    off,
  };
}
