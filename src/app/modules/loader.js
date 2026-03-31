// animated loader (compact) - uses #loader element in index.html
let loaderBar, loaderText, loaderRoot;

export function showLoader(spinner = 0) {
  const root = document.getElementById("loader");
  loaderRoot = root;
  const blocksSpinner = [
    `<div id="spinner" class="loader-spinner"></div>`,
    `<span class="Loader-root Loader-md" role="presentation">
      <svg class="Loader-circle" role="img" aria-labelledby="L3" focusable="false">
        <title id="L3">Loading…</title>
        <g role="presentation">
          <circle class="Loader-track" cx="50%" cy="50%" r="1.75em"></circle>
          <circle class="Loader-spin" cx="50%" cy="50%" r="1.75em"></circle>
        </g>
      </svg>
    </span>`,
    `<div class="blob-area">
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="position:absolute; width:0; height:0;">
       <defs>
          <filter id="gooey">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur>
              <feColorMatrix 
                  in="blur" 
                  mode="matrix"
                  values="1 0 0 0 0  
                          0 1 0 0 0  
                          0 0 1 0 0  
                          0 0 0 18 -7" 
                  result="goo">
              </feColorMatrix>
              <feBlend in="SourceGraphic" in2="goo"></feBlend>
          </filter>
       </defs>
     </svg>

     <div class="blob blob-0"></div>
     <div class="blob blob-1"></div>
     <div class="blob blob-2"></div>
     <div class="blob blob-3"></div>
     <div class="blob blob-4"></div>
     <div class="blob blob-5"></div>
    </div>`,
    `<div class="loader-container">
      <div class="cube">
        <div class="face">L</div>
        <div class="face">O</div>
        <div class="face">A</div>
        <div class="face">D</div>
        <div class="face">I</div>
        <div class="face">N</div>
        <div class="face">G</div>
      </div>
      <div class="particles">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>`,
    `<div id="loader-container">
      <div class="cubeX">
        <div class="sideCube frontCube"></div>
        <div class="sideCube backCube"></div>
        <div class="sideCube rightCube"></div>
        <div class="sideCube leftCube"></div>
        <div class="sideCube topCube"></div>
        <div class="sideCube bottomCube"></div>
      </div>
    </div>`,
  ];

  const _spinner = blocksSpinner[spinner] ? spinner : 1;

  root.innerHTML = `
    <div class="loader-overlay">
      ${blocksSpinner[_spinner]}
      <div id="loaderText" class="loader-text">Starting NeuSPA...</div>
      <div id="loaderProgress" class="loader-progress">
        <div id="loaderBar" class="loader-bar"></div>
      </div>
      <div class="loader-subtext">Silent boot — professional mode</div>
    </div>
  `;

  loaderBar = root.querySelector("#loaderBar");
  loaderText = root.querySelector("#loaderText");
}

export function updateLoaderText(text) {
  if (!loaderText) return;
  loaderText.textContent = text;
}

export async function updateProgressAnimated(target, duration = 400) {
  if (!loaderBar) return;
  const computed = parseFloat(loaderBar.style.width) || 0;
  const start = computed;
  const diff = target - start;
  const startTime = performance.now();

  return new Promise((resolve) => {
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const value = start + diff * t;
      loaderBar.style.width = value + "%";
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

export function hideLoader() {
  if (!loaderRoot) return;
  loaderRoot.style.transition = "opacity .6s ease";
  loaderRoot.style.opacity = 0;
  setTimeout(() => {
    loaderRoot.remove();
  }, 650);
}
