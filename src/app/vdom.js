// src/app/vdom.js
// ===========================
// VDOM Helpers
// ===========================
export function raw(htmlString) {
  return { rawHTML: htmlString };
}

export function h(tag, attrs = {}, children = [], rawHTML = null) {
  if (typeof children === "string") children = [children];
  return { tag, attrs, children, ...(rawHTML ? { rawHTML } : {}) };
}

export function assignKeys(vnode, prefix = "root") {
  if (!vnode || !vnode.children) return;
  const children = Array.isArray(vnode.children)
    ? vnode.children
    : [vnode.children];
  children.forEach((c, i) => {
    if (typeof c === "string") return;
    if (!c.attrs) c.attrs = {};
    if (!c.attrs["data-key"]) c.attrs["data-key"] = `${prefix}-${i}`;
    assignKeys(c, `${prefix}-${i}`);
  });
}

export function v(tag, attrs = {}, children = [], name = null) {
  // flatten children
  const flatChildren = [].concat(
    ...(Array.isArray(children) ? children : [children])
  );

  // detect rawHTML child
  let rawHTML = null;
  flatChildren.forEach((c, i) => {
    if (c?.rawHTML) {
      rawHTML = c.rawHTML;
      flatChildren.splice(i, 1);
    }
  });

  // auto-assign name if root
  if (name) attrs["data-page"] = name;

  const vnode = h(tag, attrs, flatChildren, rawHTML);
  assignKeys(vnode, name || "root");
  return vnode;
}

export function vRoot(name, children = [], attrs = {}) {
  return v("div", attrs, children, name);
}

// ===========================
// VDOM Render & Patch
// ===========================
export function renderVDOM(vNode) {
  if (typeof vNode === "string") return createEl("div", {}, vNode);
  const el = document.createElement(vNode.tag || "div");
  if (vNode.attrs) {
    for (const [k, v] of Object.entries(vNode.attrs)) el.setAttribute(k, v);
  }
  if (Array.isArray(vNode.children)) {
    vNode.children.forEach((c) => el.appendChild(renderVDOM(c)));
  } else if (vNode.text) {
    el.textContent = vNode.text;
  }
  return el;
}

export function unmountVDOM(comp) {
  if (comp?.unmount) comp.unmount();
  if (comp?.el?.remove) comp.el.remove();
}

export function patchVDOM(oldVNode, newVNode, el) {
  // simple patch (replace children)
  if (!oldVNode || !newVNode) return;
  el.innerHTML = "";
  newVNode.children?.forEach((c) => el.appendChild(renderVDOM(c)));
}

function createEl(tag, attrs, html) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.innerHTML = html;
  return el;
}

// ===========================
// Page Creators
// ===========================
export function createVDOMPage(
  name,
  htmlRaw = "",
  children = [],
  options = {}
) {
  const { cache = false, onInit, onDestroy } = options;
  const attrs = cache ? { "data-cache": "true" } : {};
  const allChildren = [...children];
  if (htmlRaw) allChildren.push(v("div", {}, raw(htmlRaw)));
  return { name, vNode: vRoot(name, allChildren, attrs), onInit, onDestroy };
}

/**
 * createHTMLPage
 * @param {string} name - nama page → otomatis jadi data-page
 * @param {string} htmlRaw - optional raw HTML (`?raw`)
 * @param {Object} options - { cache, vdom, onInit, onDestroy, children: vNodes[] }
 */
export function createHTMLPage(name, htmlRaw, options = {}) {
  const {
    cache = false,
    vdom = false,
    onInit,
    onDestroy,
    children = [],
  } = options;

  const attrs = {};
  if (cache) attrs["data-cache"] = "true";
  if (vdom) attrs["data-vdom"] = "true";

  // gabungkan htmlRaw + children → satu vNode container
  const allChildren = [];
  if (htmlRaw) allChildren.push(raw(htmlRaw));
  if (children.length) allChildren.push(...children);

  const vNode = vRoot(name, allChildren, attrs);

  return {
    name,
    vNode,
    onInit: onInit || (() => console.log(`🚀 ${name} init`)),
    onDestroy: onDestroy || (() => console.log(`🧹 ${name} destroyed`)),
  };
}
