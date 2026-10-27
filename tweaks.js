// Tweaks-panel för Recursive: storlek, vikt och spärrning för H1, H2, H3, Body och Meta.
// Startvärdena läses från sidans :root, så panelen följer CSS:en. Bara för utveckling: ta bort <script src="tweaks.js"> inför lansering.
(() => {
  const ROLES = [
    { id: "h1", label: "H1" },
    { id: "h2", label: "H2" },
    { id: "h3", label: "H3" },
    { id: "body", label: "Body" },
    { id: "meta", label: "Meta" },
  ];
  const KEY = "stagedoor-tweaks-v5";
  const css0 = getComputedStyle(document.documentElement);
  const read = (k, id) => parseFloat(css0.getPropertyValue(`--${k}-${id}`)) || 0;
  const defaults = Object.fromEntries(ROLES.map(({ id }) => [id, { size: read("size", id), w: read("w", id), t: read("t", id) }]));
  let saved;
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { saved = {}; }
  const state = Object.fromEntries(ROLES.map(({ id }) => [id, { ...defaults[id], ...saved[id] }]));

  const root = document.documentElement.style;
  function apply() {
    ROLES.forEach(({ id }) => {
      const v = state[id];
      root.setProperty(`--size-${id}`, `${v.size}px`);
      root.setProperty(`--w-${id}`, v.w);
      root.setProperty(`--t-${id}`, `${v.t}em`);
    });
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }

  const css = `
  .tw-toggle,.tw-panel{font:500 13px/1.4 system-ui,sans-serif;color:#111;letter-spacing:0;font-variation-settings:normal}
  .tw-toggle{position:fixed;right:16px;bottom:16px;z-index:99;background:#fff;border:1px solid #111;border-radius:999px;padding:10px 16px;cursor:pointer;box-shadow:0 6px 20px -8px rgba(0,0,0,.5)}
  .tw-panel{position:fixed;right:16px;bottom:64px;z-index:99;width:min(320px,calc(100vw - 32px));max-height:calc(100vh - 96px);overflow:auto;background:#fff;border:1px solid #111;border-radius:10px;padding:14px 16px;box-shadow:0 12px 32px -12px rgba(0,0,0,.6)}
  .tw-panel[hidden]{display:none}
  .tw-panel fieldset{border:0;border-top:1px solid #ddd;padding:10px 0 4px;margin:0}
  .tw-panel legend{font-weight:700;padding:0 0 4px}
  .tw-panel label{display:grid;grid-template-columns:72px 1fr 44px;align-items:center;gap:8px;margin:4px 0}
  .tw-panel output{text-align:right;font-variant-numeric:tabular-nums}
  .tw-panel input[type=range]{width:100%;accent-color:#b84b24}
  .tw-panel .tw-row{display:flex;gap:8px;margin-top:10px}
  .tw-panel button{flex:1;font:inherit;padding:8px;border:1px solid #111;border-radius:6px;background:#fff;cursor:pointer}
  .tw-panel button:hover{background:#111;color:#fff}
  .tw-panel :focus-visible,.tw-toggle:focus-visible{outline:2px solid #b84b24;outline-offset:2px}`;
  document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);

  const FMT = { size: v => `${v}px`, w: v => v, t: v => `${(+v).toFixed(3)}` };
  const slider = (role, key, label, min, max, step) =>
    `<label>${label}<input type="range" data-role="${role}" data-key="${key}" min="${min}" max="${max}" step="${step}" value="${state[role][key]}"><output>${FMT[key](state[role][key])}</output></label>`;

  const panel = document.createElement("div");
  panel.className = "tw-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Typografi-tweaks");
  panel.innerHTML = ROLES.map(({ id, label }) => `
    <fieldset><legend>${label}</legend>
      ${slider(id, "size", "Storlek", 10, 72, 1)}
      ${slider(id, "w", "Vikt", 300, 1000, 10)}
      ${slider(id, "t", "Spärrning", -.08, .12, .005)}
    </fieldset>`).join("") + `
    <div class="tw-row"><button type="button" data-act="copy">Kopiera CSS</button><button type="button" data-act="reset">Återställ</button></div>`;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "tw-toggle";
  toggle.textContent = "Tweaks";
  toggle.setAttribute("aria-expanded", "false");
  toggle.onclick = () => { panel.hidden = !panel.hidden; toggle.setAttribute("aria-expanded", String(!panel.hidden)); };

  panel.addEventListener("input", e => {
    const { role, key } = e.target.dataset;
    if (!role) return;
    state[role][key] = +e.target.value;
    e.target.nextElementSibling.textContent = FMT[key](e.target.value);
    apply();
  });
  panel.addEventListener("click", async e => {
    const act = e.target.dataset.act;
    if (act === "reset") { try { localStorage.removeItem(KEY); } catch {} location.reload(); }
    if (act === "copy") {
      const text = ":root{\n" + ROLES.map(({ id }) => {
        const v = state[id];
        return `  --size-${id}:${v.size}px; --w-${id}:${v.w}; --t-${id}:${v.t}em;`;
      }).join("\n") + "\n}";
      try { await navigator.clipboard.writeText(text); e.target.textContent = "Kopierat"; }
      catch { prompt("Kopiera:", text); }
      setTimeout(() => e.target.textContent = "Kopiera CSS", 1500);
    }
  });

  document.body.append(panel, toggle);
  // Rör inte sidan förrän något har ändrats, så att CSS:ens mobil- och datorvärden gäller
  if (Object.keys(saved).length) apply();
})();
