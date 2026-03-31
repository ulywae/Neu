// src/app/DOM.js
export function createDOM() {
  let currentPageEl = null;
  const cache = new Map();

  // ----------------------
  // Helper untuk wrap elemen jadi chainable
  // ----------------------
  function wrap(elements) {
    elements = Array.from(elements).filter(Boolean);
    return {
      el: elements,

      // Event binding
      on(event, handler, opts) {
        this.el.forEach((e) => e.addEventListener(event, handler, opts));
        return this;
      },
      off(event, handler, opts) {
        this.el.forEach((e) => e.removeEventListener(event, handler, opts));
        return this;
      },

      // Content
      html(content) {
        if (content === undefined) return this.el[0]?.innerHTML;
        this.el.forEach((e) => (e.innerHTML = content));
        return this;
      },
      text(content) {
        if (content === undefined) return this.el[0]?.textContent;
        this.el.forEach((e) => (e.textContent = content));
        return this;
      },
      val(value) {
        if (value === undefined) return this.el[0]?.value;
        this.el.forEach((e) => (e.value = value));
        return this;
      },

      // Style & class
      css(prop, value) {
        this.el.forEach((e) => {
          if (typeof prop === "object") Object.assign(e.style, prop);
          else e.style[prop] = value;
        });
        return this;
      },
      addClass(cls) {
        this.el.forEach((e) => e.classList.add(cls));
        return this;
      },
      removeClass(cls) {
        this.el.forEach((e) => e.classList.remove(cls));
        return this;
      },
      toggleClass(cls) {
        this.el.forEach((e) => e.classList.toggle(cls));
        return this;
      },

      // Attribute & property
      attr(name, value) {
        if (value === undefined) return this.el[0]?.getAttribute(name);
        this.el.forEach((e) => e.setAttribute(name, value));
        return this;
      },
      removeAttr(name) {
        this.el.forEach((e) => e.removeAttribute(name));
        return this;
      },
      prop(name, value) {
        if (value === undefined) return this.el[0]?.[name];
        this.el.forEach((e) => (e[name] = value));
        return this;
      },
      data(key, value) {
        if (value === undefined) return this.el[0]?.dataset[key];
        this.el.forEach((e) => (e.dataset[key] = value));
        return this;
      },

      // DOM ops
      remove() {
        this.el.forEach((e) => e.remove());
        return this;
      },
      empty() {
        this.el.forEach((e) => (e.innerHTML = ""));
        return this;
      },
      append(child) {
        this.el.forEach((e) => {
          const node = child instanceof Node ? child : child?.el?.[0];
          if (node) e.appendChild(node);
        });
        return this;
      },
      prepend(child) {
        this.el.forEach((e) => {
          const node = child instanceof Node ? child : child?.el?.[0];
          if (node) e.insertBefore(node, e.firstChild);
        });
        return this;
      },
      clone() {
        return wrap(this.el.map((e) => e.cloneNode(true)));
      },

      // Traversal
      closest(sel) {
        return wrap([this.el[0]?.closest(sel)]);
      },
      matches(sel) {
        return this.el[0]?.matches(sel);
      },
      parent() {
        return wrap([this.el[0]?.parentNode]);
      },
      children() {
        return wrap(this.el[0]?.children || []);
      },
      find(sel) {
        return wrap(this.el[0]?.querySelectorAll(sel) || []);
      },
      siblings() {
        if (!this.el[0]?.parentNode) return wrap([]);
        return wrap(
          Array.from(this.el[0].parentNode.children).filter(
            (c) => c !== this.el[0]
          )
        );
      },
      next() {
        return wrap([this.el[0]?.nextElementSibling]);
      },
      prev() {
        return wrap([this.el[0]?.previousElementSibling]);
      },

      // Access
      get(i = 0) {
        return this.el[i];
      },
      all() {
        return this.el;
      },
    };
  }

  // ----------------------
  // Scoped selector $
  // ----------------------
  function $(selector) {
    if (!currentPageEl) throw new Error("[ $$ ] No active page scope.");
    if (!selector) return wrap([]);

    let els;

    if (typeof selector === "string") {
      // Cek apakah selector adalah ID (ada elemen dengan id yang sama)
      const byId = get(selector);
      if (byId) {
        els = [byId]; // langsung pakai get()
      } else {
        // fallback querySelectorAll untuk class/tag/atribut lain
        els = Array.from(currentPageEl.querySelectorAll(selector));
      }
    } else if (selector instanceof Node) {
      els = [selector];
    } else {
      els = Array.from(selector);
    }

    return wrap(els);
  }

  // ----------------------
  // Local helpers
  // ----------------------
  function get(id) {
    if (!currentPageEl) return null;
    const sel = `#${id}`;
    if (cache.has(sel)) return cache.get(sel);
    const el = currentPageEl.querySelector(sel);
    if (el) cache.set(sel, el);
    return el;
  }
  function one(selector) {
    return wrap([currentPageEl?.querySelector(selector)]);
  }
  function all(selector) {
    return wrap(currentPageEl?.querySelectorAll(selector) || []);
  }
  function byClass(cls) {
    return wrap(currentPageEl?.getElementsByClassName(cls) || []);
  }
  function byTag(tag) {
    return wrap(currentPageEl?.getElementsByTagName(tag) || []);
  }
  function create(tag, attrs = {}) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "class") el.className = value;
      else if (key === "style" && typeof value === "object")
        Object.assign(el.style, value);
      else el.setAttribute(key, value);
    });
    return wrap([el]);
  }

  // ----------------------
  // Global helpers
  // ----------------------
  function global(selector) {
    if (!selector) return wrap([]);
    let nodes;
    if (selector.startsWith(".")) {
      nodes = document.getElementsByClassName(selector.slice(1));
    } else {
      nodes = document.querySelectorAll(selector);
    }
    return wrap(Array.from(nodes));
  }

  function globalOutsideScope(selector) {
    if (!selector) return wrap([]);
    let allEls;
    if (selector.startsWith("."))
      allEls = Array.from(document.getElementsByClassName(selector.slice(1)));
    else allEls = Array.from(document.querySelectorAll(selector));
    if (currentPageEl)
      allEls = allEls.filter((el) => !currentPageEl.contains(el));
    return wrap(allEls);
  }

  // ----------------------
  // Set page scope
  // ----------------------
  function setScopePage(pageOrEl) {
    if (!pageOrEl)
      throw new Error(
        "[ $$ ] setScopePage expects HTMLElement or object with .el"
      );
    if (pageOrEl instanceof HTMLElement) currentPageEl = pageOrEl;
    else if (typeof pageOrEl === "object" && pageOrEl.el instanceof HTMLElement)
      currentPageEl = pageOrEl.el;
    else throw new Error("[ $$ ] Invalid argument for setScopePage");
    cache.clear();
  }

  return {
    $,
    get,
    one,
    all,
    byClass,
    byTag,
    global,
    globalOutsideScope,
    setScopePage,
    create,
    wrap,
  };
}
