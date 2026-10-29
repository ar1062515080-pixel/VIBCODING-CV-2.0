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
  /* ---------- project dossiers ---------- */
  $$("[data-dossier]").forEach((d) => {
    const tabs = $$("[data-dtab]", d);
    const pages = $$(".dpage", d);
    tabs.forEach((t) =>
      t.addEventListener("click", () => {
        const i = Number(t.dataset.dtab);
        tabs.forEach((x, k) => x.classList.toggle("is-on", k === i));
        pages.forEach((p, k) => p.classList.toggle("is-on", k === i));
      })
    );
  });

  $$("[data-booker]").forEach((b) => {
    const steps = $$("[data-step]", b);
    const panels = $$(".bstep", b);
    const next = $("[data-next]", b);
    let cur = 0;
    const go = (i) => {
      cur = (i + steps.length) % steps.length;
      steps.forEach((s, k) => {
        s.classList.toggle("is-on", k === cur);
        s.classList.toggle("is-done", k < cur);
      });
      panels.forEach((p, k) => p.classList.toggle("is-on", k === cur));
      next.textContent = cur === steps.length - 1 ? "重新开始 ↺" : "下一步 →";
    };
    steps.forEach((s) => s.addEventListener("click", () => go(Number(s.dataset.step))));
    next.addEventListener("click", () => go(cur + 1));
  });

  $$("[data-carousel]").forEach((c) => {
    const track = $(".v-ig__track", c);
    const n = track.children.length;
    const count = $("[data-ig-count]", c);
    let cur = 0;
    const go = (i) => {
      cur = (i + n) % n;
      track.style.transform = `translateX(${-cur * 100}%)`;
      count.textContent = `${cur + 1} / ${n}`;
    };
    $("[data-prev]", c).addEventListener("click", () => go(cur - 1));
    $("[data-next]", c).addEventListener("click", () => go(cur + 1));
    let x0 = null;
    track.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
    track.addEventListener("pointerup", (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 30) go(cur + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  });

  const lightbox = $("#lightbox");
  const lbImg = $("img", lightbox);
  const closeLb = () => { lightbox.hidden = true; lbImg.src = ""; };
  $$("[data-lightbox]").forEach((el) =>
    el.addEventListener("click", () => {
      lbImg.src = el.dataset.lightbox;
      lbImg.alt = $("img", el)?.alt || "";
      lightbox.hidden = false;
    })
  );
  lightbox.addEventListener("click", (e) => { if (e.target !== lbImg) closeLb(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lightbox.hidden) closeLb(); });

  $$("[data-copy]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      await copyText(btn.dataset.copy);
      showToast(`已复制：${btn.dataset.copy}`);
    })
  );
})();
