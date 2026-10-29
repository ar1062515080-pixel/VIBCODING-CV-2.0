(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav ---------- */
  const nav = $("#nav");
  $("#burger").addEventListener("click", () => nav.classList.toggle("is-open"));
  $$(".nav__links a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));

  const navLinks = $$("[data-nav]");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === entry.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("[data-section]").forEach((s) => sectionObserver.observe(s));

  /* ---------- reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => revealObserver.observe(el));
  $$(".case").forEach((el, i) => {
    el.style.transitionDelay = `${i * 90}ms`;
    revealObserver.observe(el);
  });

  /* ---------- showcase cabinet: one folder open at a time ---------- */
  const cases = $$("[data-case]");
  const setCase = (target) => {
    cases.forEach((c) => {
      const open = c === target && !c.classList.contains("is-open");
      c.classList.toggle("is-open", open);
      $(".case__head", c).setAttribute("aria-expanded", String(open));
    });
    if (target.classList.contains("is-open")) {
      setTimeout(() => {
        const top = target.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      }, 320);
    }
  };
  cases.forEach((c) => $(".case__head", c).addEventListener("click", () => setCase(c)));

  /* ---------- AI drawer ---------- */
  const dividers = $$("[data-divider]");
  const typed = new WeakSet();
  const typeLine = (el) => {
    if (!el || typed.has(el)) return;
    typed.add(el);
    const text = el.dataset.type;
    if (reduceMotion) { el.textContent = text; return; }
    let i = 0;
    const tick = () => {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, 28 + Math.random() * 40);
    };
    tick();
  };
  const openDivider = (d) => {
    dividers.forEach((x) => {
      const open = x === d;
      x.classList.toggle("is-open", open);
      $(".divider__tab", x).setAttribute("aria-expanded", String(open));
    });
    setTimeout(() => typeLine($(".prompt__line", d)), 500);
  };
  dividers.forEach((d) => $(".divider__tab", d).addEventListener("click", () => openDivider(d)));

  const aiObserver = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      typeLine($(".divider.is-open .prompt__line"));
      aiObserver.disconnect();
    },
    { threshold: 0.3 }
  );
  aiObserver.observe($("#drawer"));

  /* ---------- counters ---------- */
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = Number(el.dataset.count);
        countObserver.unobserve(el);
        if (reduceMotion) return;
        const start = performance.now();
        const dur = 1400;
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => countObserver.observe(el));

  /* ---------- hero parallax ---------- */
  const stage = $("#heroStage");
  const layers = $$("[data-depth]", stage);
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((l) => {
        const d = Number(l.dataset.depth);
        l.style.setProperty("--px", (nx * d * 18).toFixed(1));
        l.style.setProperty("--py", (ny * d * 14).toFixed(1));
      });
    });
    stage.addEventListener("pointerleave", () => {
      layers.forEach((l) => { l.style.setProperty("--px", 0); l.style.setProperty("--py", 0); });
    });
  }

  /* desktop folder selection mimics Finder: hovering moves the highlight */
  const dfolders = $$(".dfolder");
  dfolders.forEach((f) =>
    f.addEventListener("mouseenter", () => dfolders.forEach((x) => x.classList.toggle("is-selected", x === f)))
  );

  /* ---------- copy to clipboard ---------- */
  const toast = $("#toast");
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-show"), 1800);
  };
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  };
  $$("[data-copy]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      await copyText(btn.dataset.copy);
      showToast(`已复制：${btn.dataset.copy}`);
    })
  );
})();
