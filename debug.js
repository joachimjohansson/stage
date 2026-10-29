// Felsökning av menyn på iPhone: öppna sidan med ?debug och ta en skärmdump av rutan. Ta bort före lansering.
(async () => {
  document.head.insertAdjacentHTML("beforeend", `<style>
    #programmet{outline:4px solid magenta;outline-offset:-4px}
    .act{outline:2px dashed blue}
    #scenen{outline:4px solid cyan;outline-offset:-4px}
    #dbg{position:fixed;left:4px;right:4px;bottom:4px;z-index:999;background:#fff;color:#000;font:11px/1.35 ui-monospace,monospace;padding:6px;border:2px solid magenta;white-space:pre-wrap;max-height:45vh;overflow:auto}
  </style>`);
  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 1500));
  const top = el => Math.round(el.getBoundingClientRect().top + scrollY);
  const h = el => Math.round(el.getBoundingClientRect().height);
  const P = document.querySelector("#programmet"), S = document.querySelector("#scenen");
  const dishes = [...P.querySelectorAll(".dish")], last = dishes.at(-1);
  const cs = el => getComputedStyle(el);
  const lines = [
    navigator.userAgent,
    `bredd ${innerWidth}×${innerHeight} dpr ${devicePixelRatio} zoom? ${visualViewport && visualViewport.scale}`,
    `typsnitt: ${[...document.fonts].map(f => f.family + ":" + f.status).join(" ")}`,
    `meny: topp ${top(P)} höjd ${h(P)} slut ${top(P) + h(P)} | offsetH ${P.offsetHeight} scrollH ${P.scrollHeight}`,
    `sista rätten slutar ${top(last) + h(last)} (${dishes.length} rätter)`,
    `#menu höjd ${h(document.querySelector("#menu"))}, akter: ${[...P.querySelectorAll(".act")].map(h).join(", ")}`,
    `.cols display ${cs(P.querySelector(".cols")).display}, .dish display ${cs(dishes[0]).display}, rätt 1 höjd ${h(dishes[0])}`,
    `om: topp ${top(S)} höjd ${h(S)}`,
    `section display ${cs(P).display} position ${cs(P).position} contain ${cs(P).contain} cv ${cs(P).contentVisibility}`,
    `poster höjd ${h(document.querySelector(".poster"))}`,
    `Meny-rubrik: css ${cs(P.querySelector(".title h2")).fontSize}, ritad höjd ${h(P.querySelector(".title h2"))} | text-size-adjust ${cs(document.documentElement).webkitTextSizeAdjust}`,
  ];
  const box = document.createElement("div");
  box.id = "dbg";
  box.textContent = lines.join("\n");
  document.body.append(box);
})();
