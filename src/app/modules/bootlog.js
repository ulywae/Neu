// BIOS-style boot log overlay (silent, visual only)
let logContainer, logList, logBar, logStatus;

export function initBootlog(showProgress = false) {
  const container = document.createElement("div");
  container.id = "bootlog-overlay";

  container.innerHTML = `
  <div id="bootlog-list"></div>
  ${
    showProgress
      ? `
    <div class="bootlog-progress">
      <div id="bootlog-bar"></div>
    </div>
    <div id="bootlog-status">Booting...</div>
  `
      : `<!-- Progress bar disembunyikan untuk sekarang -->`
  }
`;

  document.body.appendChild(container);

  logContainer = container;
  logList = container.querySelector("#bootlog-list");
  logBar = container.querySelector("#bootlog-bar");
  logStatus = container.querySelector("#bootlog-status");
}

export function logMessage(text, status = "") {
  if (!logList) return;
  const ts = new Date().toLocaleTimeString("id-ID", { hour12: false });
  const line = document.createElement("div");
  line.style.padding = "2px 0";
  line.textContent = `[${ts}] ${text} ${status}`;
  logList.appendChild(line);
  logList.scrollTop = logList.scrollHeight;
}

export async function logMessageTypewriter(text, status = "", speed = 12) {
  if (!logList) return;

  const ts = new Date().toLocaleTimeString("id-ID", { hour12: false });
  const line = document.createElement("div");
  line.style.padding = "2px 0";
  line.classList.add("bootlog-line");
  logList.appendChild(line);

  // efek ketik manual
  let fullText = `[${ts}] ${text} ${status}`;
  let current = "";
  for (let i = 0; i < fullText.length; i++) {
    current += fullText[i];
    line.textContent = current;

    // delay ketikan acak biar lebih “hidup”
    const jitter = Math.random() * 20;
    await new Promise((res) => setTimeout(res, speed + jitter));
  }

  logList.scrollTop = logList.scrollHeight;
}

export function updateBootProgress(percent, msg = "") {
  if (logBar) logBar.style.width = percent + "%";
  if (logStatus && msg) logStatus.textContent = msg;
}

export function endBootlog() {
  if (!logContainer) return;
  if (logStatus) logStatus.textContent = "System Ready.";
  logContainer.style.transition = "opacity .6s ease";
  logContainer.style.opacity = 0;
  setTimeout(() => {
    if (logContainer && logContainer.parentNode)
      logContainer.parentNode.removeChild(logContainer);
  }, 700);
}
