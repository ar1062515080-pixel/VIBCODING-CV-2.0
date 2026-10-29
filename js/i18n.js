(() => {
  const CJK = /[\u3400-\u9fff\uff01-\uff5e\u3000-\u303f]/;
  const INLINE = new Set(["B", "MARK", "EM", "STRONG", "SMALL", "I", "BR"]);
  const ATTRS = ["alt", "aria-label", "data-type"];
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const hasOwnText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim());

  // Smallest element that owns each Chinese text run; inline tags inside mixed text climb to their parent.
  const collect = (root = document.body) => {
    const found = new Set();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!CJK.test(node.nodeValue)) continue;
      let el = node.parentElement;
      if (!el || el.closest("script, style")) continue;
      while (INLINE.has(el.tagName) && el.parentElement && hasOwnText(el.parentElement)) el = el.parentElement;
      found.add(el);
    }
    return [...found].filter((el) => ![...found].some((other) => other !== el && other.contains(el)));
  };

  const state = { lang: "zh", els: null, attrEls: null };
  const origHTML = new WeakMap();
  const origAttrs = new WeakMap();

  const apply = (lang) => {
    const dict = window.I18N_EN || {};
    if (!state.els) {
      state.els = collect();
      state.els.forEach((el) => origHTML.set(el, el.innerHTML));
      state.attrEls = [...document.querySelectorAll(ATTRS.map((a) => `[${a}]`).join(","))].filter((el) =>
        ATTRS.some((a) => CJK.test(el.getAttribute(a) || ""))
      );
      state.attrEls.forEach((el) => {
        const o = {};
        ATTRS.forEach((a) => el.hasAttribute(a) && (o[a] = el.getAttribute(a)));
        origAttrs.set(el, o);
      });
      state.title = document.title;
      state.desc = document.querySelector('meta[name="description"]')?.content;
    }
    state.els.forEach((el) => {
      const html = origHTML.get(el);
      if (lang === "en") {
        const en = dict[norm(html)];
        if (en !== undefined) el.innerHTML = en;
      } else {
        el.innerHTML = html;
      }
    });
    state.attrEls.forEach((el) => {
      const attrs = origAttrs.get(el);
      Object.entries(attrs).forEach(([a, v]) => el.setAttribute(a, lang === "en" ? dict[norm(v)] ?? v : v));
    });
    document.title = lang === "en" ? dict["__title"] || state.title : state.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = lang === "en" ? dict["__desc"] || state.desc : state.desc;
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    document.documentElement.dataset.lang = lang;
    state.lang = lang;
    try { localStorage.setItem("lang", lang); } catch {}
    document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
  };

  window.I18N = {
    collect,
    norm,
    apply,
    get lang() { return state.lang; },
    t: (zh) => (state.lang === "en" ? (window.I18N_EN || {})[zh] ?? zh : zh),
  };
})();
