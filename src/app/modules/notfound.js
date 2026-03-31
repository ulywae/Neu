// src/app/modules/notfound.js

export default function NotFoundPage() {
  const el = document.createElement("div");
  el.setAttribute("data-page", "_notfound");
  el.setAttribute("data-cache", "false");
  el.innerHTML = `
    <div class="page page-404" data-page="_notfound" data-cache="false" style="padding: 2rem; text-align: center;">
      <h1>❌ 404 - Page Not Found</h1>
      <p>Halaman yang kamu tuju tidak ada.</p>
      <a href="/" data-router>Kembali ke halaman utama</a>
    </div>
  `;
  return {
    el,
    name: "_notfound",
    onDestroy() {},
  };
}
