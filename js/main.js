(() => {
  const S = window.SITE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;

  const state = {
    lang: localStorage.getItem("lang") || "zh",
    expFilter: "all",
    projFilter: "all",
    expOpen: new Set(["kingway"]),
    skill: "coord",
    topic: "job",
    counted: false,
    modalIndex: -1
  };

  const L = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v[state.lang] ?? v.zh : v);
  const t = (key) => L(S.ui[key]) ?? key;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ICONS = {
    compass: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M6.6 2.8h3l1.5 4.6-2.2 1.5a12 12 0 0 0 6.2 6.2l1.5-2.2 4.6 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.6 5a2 2 0 0 1 2-2.2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M9.5 4C5.4 4 2 6.8 2 10.2c0 1.9 1 3.6 2.7 4.7L4 17.5l3-1.6c.8.2 1.6.3 2.5.3"/><path d="M15 9c3.9 0 7 2.5 7 5.6 0 1.7-.9 3.2-2.4 4.2l.6 2.2-2.6-1.4c-.8.2-1.7.3-2.6.3-3.9 0-7-2.5-7-5.6S11.1 9 15 9z"/></svg>',
    card: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M14 10h4M14 13h3"/></svg>',
    file: '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 11v6M9.5 14.5L12 17l2.5-2.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chevron: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>'
  };

  /* lookup helpers for evidence links */
  const findEntry = (id) => {
    const e = S.experience.find((x) => x.id === id);
    if (e) return { type: "exp", item: e };
    const p = S.projects.find((x) => x.id === id);
    if (p) return { type: "proj", item: p };
    return null;
  };
  const allSkills = S.skillGroups.flatMap((g) => g.items);
  const skillById = (id) => allSkills.find((s) => s.id === id);

  /* ================= RENDER ================= */
  function applyStatic() {
    document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
    document.title = t("meta.title");
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    $("#langBtn").dataset.lang = state.lang;
    $("#navResume").href = S.contact.resume;
  }

  function renderHeroStats() {
    $("#heroStats").innerHTML = S.stats
      .map(
        (s) => `<li>
          <b><span class="prefix">${s.prefix || ""}</span><span data-count="${s.value}">${state.counted ? s.value : 0}</span>${s.suffix || ""}</b>
          <span class="idc__label">${esc(L(s.label))}</span>
        </li>`
      )
      .join("");
  }

  function renderAbout() {
    $("#aboutText").innerHTML = S.about.paragraphs.map((p) => `<p>${esc(L(p))}</p>`).join("");
    $("#eduList").innerHTML = S.education
      .map((e, i) => {
        const courses = Array.isArray(e.courses) ? e.courses : L(e.courses);
        return `<article class="edu">
          <div class="edu__head">
            <div>
              <p class="edu__period mono">${esc(L(e.period))}</p>
              <h4>${esc(L(e.school))}</h4>
              <p class="edu__degree">${esc(L(e.degree))}</p>
            </div>
            ${e.badge ? `<span class="pill pill--accent">${e.badge}</span>` : ""}
          </div>
          <button class="link-btn" data-courses="${i}" aria-expanded="false">${esc(t("about.coursesToggle"))} ${ICONS.chevron}</button>
          <div class="collapse" id="courses-${i}"><div class="collapse__inner"><div class="chips">${courses.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div></div></div>
        </article>`;
      })
      .join("");
    $("#bringList").innerHTML = S.about.bring
      .map(
        (b) => `<article class="bring__card reveal tilt">
          <span class="bring__icon">${ICONS[b.icon]}</span>
          <h4>${esc(L(b.title))}</h4>
          <p>${esc(L(b.text))}</p>
        </article>`
      )
      .join("");
  }

  function renderExpFilters() {
    const counts = Object.fromEntries(S.capabilities.map((c) => [c.id, c.id === "all" ? S.experience.length : S.experience.filter((e) => e.tags.includes(c.id)).length]));
    const hint = `<span class="filters__hint">${esc(t("exp.filterHint"))}</span>`;
    $("#expFilters").innerHTML =
      hint +
      S.capabilities
        .map((c) => `<button class="fchip${state.expFilter === c.id ? " is-active" : ""}" role="tab" aria-selected="${state.expFilter === c.id}" data-exp-filter="${c.id}">${esc(L(c.label))}<sup>${counts[c.id]}</sup></button>`)
        .join("");
  }

  function renderTimeline() {
    $("#timeline").innerHTML = S.experience
      .map((e) => {
        const open = state.expOpen.has(e.id);
        const match = state.expFilter === "all" || e.tags.includes(state.expFilter);
        const tagLabels = e.tags.map((id) => S.capabilities.find((c) => c.id === id)).map((c) => `<span class="tag${state.expFilter === c.id ? " is-hit" : ""}">${esc(L(c.label))}</span>`).join("");
        return `<li class="tl reveal${open ? " is-open" : ""}${match ? "" : " is-dim"}" id="exp-${e.id}" style="--c:${e.color}">
          <div class="tl__rail"><span class="tl__dot"></span></div>
          <p class="tl__date mono">${esc(L(e.start))} — ${e.end ? esc(L(e.end)) : `<b class="now">${esc(t("exp.now"))}</b>`}</p>
          <article class="tl__card">
            <button class="tl__head" data-exp="${e.id}" aria-expanded="${open}">
              <div class="tl__titles">
                <h3>${esc(L(e.org))}</h3>
                <p class="tl__role">${esc(L(e.role))}</p>
                <p class="tl__summary">${esc(L(e.summary))}</p>
              </div>
              <div class="tl__metric"><b>${esc(e.metric.value)}</b><span>${esc(L(e.metric.label))}</span></div>
              <span class="tl__toggle" aria-hidden="true">${ICONS.chevron}</span>
            </button>
            <div class="collapse"><div class="collapse__inner">
              <ul class="bullets">${L(e.bullets).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
              <div class="tags">${tagLabels}</div>
            </div></div>
          </article>
        </li>`;
      })
      .join("");
  }

  const cover = (p) => `<div class="cover" style="--a:${p.theme[0]};--b:${p.theme[1]};--c:${p.theme[2]}">
      <span class="cover__blob cover__blob--1"></span><span class="cover__blob cover__blob--2"></span><span class="cover__grid"></span>
      <span class="cover__badge">${esc(L(p.badge))}</span>
    </div>`;

  function renderProjFilters() {
    $("#projFilters").innerHTML = S.projectFilters
      .map((f) => `<button class="fchip${state.projFilter === f.id ? " is-active" : ""}" role="tab" aria-selected="${state.projFilter === f.id}" data-proj-filter="${f.id}">${esc(L(f.label))}</button>`)
      .join("");
  }

  function renderProjects() {
    $("#projectGrid").innerHTML = S.projects
      .map((p, i) => {
        const show = state.projFilter === "all" || p.cat === state.projFilter;
        return `<article class="pcard reveal tilt${show ? "" : " is-hidden"}" id="proj-${p.id}">
          <button class="pcard__btn" data-project="${i}" aria-haspopup="dialog">
            ${cover(p)}
            <div class="pcard__body">
              <p class="pcard__meta mono">${esc(L(p.period))}</p>
              <h3>${esc(L(p.title))}</h3>
              <p class="pcard__role">${esc(L(p.role))}</p>
              <p class="pcard__summary">${esc(L(p.summary))}</p>
              <span class="pcard__cta">${esc(t("proj.open"))} ${ICONS.arrow}</span>
            </div>
          </button>
        </article>`;
      })
      .join("");
  }

  function renderSkills() {
    $("#skillGroups").innerHTML = S.skillGroups
      .map(
        (g) => `<div class="sgroup">
          <p class="sgroup__label mono">${esc(L(g.label))}</p>
          <div class="sgroup__items">
            ${g.items
              .map((s) => `<button class="skill${state.skill === s.id ? " is-active" : ""}" data-skill="${s.id}" aria-pressed="${state.skill === s.id}">${esc(L(s.label))}<span class="skill__n">${s.evidence.length}</span></button>`)
              .join("")}
          </div>
        </div>`
      )
      .join("");
    renderEvidence();
    $("#toolsRow").innerHTML =
      S.tools.map((x) => `<span class="chip chip--lg">${esc(x)}</span>`).join("") +
      S.languages.map((l) => `<span class="chip chip--lg chip--lang">${esc(L(l.label))}<em>${esc(L(l.level))}</em></span>`).join("");
  }

  function renderEvidence() {
    const body = $("#evidenceBody");
    const skill = skillById(state.skill);
    if (!skill) {
      body.innerHTML = `<p class="evidence__empty">${esc(t("skills.evidenceEmpty"))}</p>`;
      return;
    }
    body.innerHTML = `<h4 class="evidence__skill">${esc(L(skill.label))}</h4>
      <ul class="evidence__list">
        ${skill.evidence
          .map((id, i) => {
            const f = findEntry(id);
            if (!f) return "";
            const it = f.item;
            const title = f.type === "exp" ? L(it.org) : L(it.title);
            const period = f.type === "exp" ? `${L(it.start)} — ${it.end ? L(it.end) : t("exp.now")}` : L(it.period);
            const typeLabel = f.type === "exp" ? t("nav.experience") : t("nav.projects");
            return `<li style="--d:${i * 70}ms">
              <button class="ev" data-goto="${id}">
                <span class="ev__type mono">${esc(typeLabel)} · ${esc(period)}</span>
                <span class="ev__title">${esc(title)}</span>
                <span class="ev__role">${esc(L(it.role))}</span>
                <span class="ev__go">${esc(t("skills.go"))} ${ICONS.arrow}</span>
              </button>
            </li>`;
          })
          .join("")}
      </ul>`;
  }

  function renderContact() {
    const c = S.contact;
    const card = (icon, label, value, href, copy, note = "") => `<div class="ccard tilt">
        <span class="ccard__icon">${ICONS[icon]}</span>
        <div class="ccard__text">
          <p class="mono">${esc(label)}</p>
          ${href ? `<a href="${href}">${esc(value)}</a>` : `<span>${esc(value)}</span>`}
          ${note ? `<small>${esc(note)}</small>` : ""}
        </div>
        <button class="ccard__copy" data-copy="${esc(copy)}">${esc(t("contact.copy"))}</button>
      </div>`;
    $("#contactCards").innerHTML =
      card("mail", t("contact.email"), c.email, `mailto:${c.email}`, c.email) +
      card("phone", t("contact.phoneAu"), c.phoneAu, `tel:${c.phoneAu.replace(/\s/g, "")}`, c.phoneAu) +
      card("phone", t("contact.phoneCn"), c.phoneCn, `tel:${c.phoneCn.replace(/\s/g, "")}`, c.phoneCn) +
      card("chat", t("contact.wechat"), c.wechat, "", c.wechat, t("contact.wechatNote")) +
      `<div class="contact__actions">
        <button class="btn btn--ghost" id="vcardBtn">${ICONS.card}<span>${esc(t("contact.vcard"))}</span></button>
        <a class="btn btn--ghost" href="${c.resume}" download>${ICONS.file}<span>${esc(t("contact.resume"))}</span></a>
      </div>`;
    const topics = ["job", "intern", "project", "other"];
    const topicKey = { job: "contact.topicJob", intern: "contact.topicIntern", project: "contact.topicProject", other: "contact.topicOther" };
    $("#topicSeg").innerHTML = topics
      .map((k) => `<button type="button" class="seg__btn${state.topic === k ? " is-active" : ""}" data-topic="${k}" aria-pressed="${state.topic === k}">${esc(t(topicKey[k]))}</button>`)
      .join("");
  }

  function renderAll() {
    applyStatic();
    renderHeroStats();
    renderAbout();
    renderExpFilters();
    renderTimeline();
    renderProjFilters();
    renderProjects();
    renderSkills();
    renderContact();
    startRotator();
    observeReveals();
    bindTilt();
    if (state.modalIndex >= 0) renderModal(state.modalIndex);
  }

  /* ================= ROTATOR ================= */
  let rotTimer;
  function startRotator() {
    clearTimeout(rotTimer);
    const el = $("#rotator");
    const words = S.focus.map(L);
    let i = 0;
    const show = () => {
      el.classList.remove("is-in");
      void el.offsetWidth;
      el.textContent = words[i % words.length];
      el.classList.add("is-in");
      i++;
      if (!reduceMotion) rotTimer = setTimeout(show, 2400);
    };
    show();
  }

  /* ================= COUNTERS ================= */
  function runCounters() {
    if (state.counted) return;
    state.counted = true;
    $$("[data-count]").forEach((el) => {
      const end = +el.dataset.count;
      if (reduceMotion) { el.textContent = end; return; }
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / 1600, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ================= REVEAL ================= */
  const revealIO = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        revealIO.unobserve(e.target);
      }),
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  function observeReveals() {
    $$(".reveal:not(.is-in)").forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      revealIO.observe(el);
    });
  }

  /* ================= MODAL ================= */
  const modal = $("#modal");
  function renderModal(i) {
    const p = S.projects[i];
    const n = S.projects.length;
    $("#modalInner").innerHTML = `
      <div class="modal__cover">${cover(p)}
        <button class="modal__close" data-modal-close aria-label="${esc(t("proj.close"))}">${ICONS.close}</button>
        <div class="modal__headline">
          <p class="mono">${esc(L(p.period))} · ${i + 1} / ${n}</p>
          <h2 id="modalTitle">${esc(L(p.title))}</h2>
        </div>
      </div>
      <div class="modal__body">
        <p class="modal__lead">${esc(L(p.summary))}</p>
        <div class="modal__grid">
          <section><h4 class="mono">${esc(t("proj.context"))}</h4><p>${esc(L(p.context))}</p></section>
          <section><h4 class="mono">${esc(t("proj.role"))}</h4><p>${esc(L(p.role))}</p></section>
        </div>
        <section><h4 class="mono">${esc(t("proj.actions"))}</h4>
          <ol class="steps">${L(p.actions).map((a) => `<li>${esc(a)}</li>`).join("")}</ol>
        </section>
        <section class="outcome"><h4 class="mono">${esc(t("proj.outcome"))}</h4><p>${esc(L(p.outcome))}</p></section>
        <section><h4 class="mono">${esc(t("proj.skills"))}</h4>
          <div class="chips">${p.skills.map((id) => skillById(id)).filter(Boolean).map((s) => `<button class="chip chip--btn" data-skill-jump="${s.id}">${esc(L(s.label))}</button>`).join("")}</div>
        </section>
      </div>
      <div class="modal__nav">
        <button class="btn btn--ghost btn--sm" data-modal-step="-1">← ${esc(t("proj.prev"))}</button>
        <button class="btn btn--ghost btn--sm" data-modal-step="1">${esc(t("proj.next"))} →</button>
      </div>`;
  }
  function openModal(i) {
    state.modalIndex = (i + S.projects.length) % S.projects.length;
    renderModal(state.modalIndex);
    if (!modal.open) modal.showModal();
    $("#modalInner").scrollTop = 0;
    history.replaceState(null, "", `#project/${S.projects[state.modalIndex].id}`);
  }
  function closeModal() {
    if (!modal.open) return;
    modal.classList.add("is-closing");
    setTimeout(() => {
      modal.classList.remove("is-closing");
      modal.close();
    }, reduceMotion ? 0 : 220);
  }
  modal.addEventListener("close", () => {
    state.modalIndex = -1;
    if (location.hash.startsWith("#project/")) history.replaceState(null, "", "#projects");
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  modal.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (!modal.open) return;
    if (e.key === "ArrowRight") openModal(state.modalIndex + 1);
    if (e.key === "ArrowLeft") openModal(state.modalIndex - 1);
  });

  /* ================= NAVIGATION HELPERS ================= */
  function flash(el) {
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
  }
  function gotoEntry(id) {
    const f = findEntry(id);
    if (!f) return;
    if (f.type === "proj") {
      openModal(S.projects.indexOf(f.item));
      return;
    }
    state.expOpen.add(id);
    if (state.expFilter !== "all" && !f.item.tags.includes(state.expFilter)) state.expFilter = "all";
    renderExpFilters();
    renderTimeline();
    observeReveals();
    const el = $(`#exp-${id}`);
    el.classList.add("is-in");
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    setTimeout(() => flash($(".tl__card", el)), 450);
  }
  function selectSkill(id, scroll) {
    state.skill = id;
    $$(".skill").forEach((b) => {
      const on = b.dataset.skill === id;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on);
    });
    renderEvidence();
    if (scroll) $("#skills").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }

  /* ================= EVENTS (delegated) ================= */
  document.addEventListener("click", (e) => {
    const el = e.target.closest("button, a");
    if (!el) return;
    const d = el.dataset;

    if (d.expFilter) {
      state.expFilter = d.expFilter;
      renderExpFilters();
      $$(".tl").forEach((li) => {
        const item = S.experience.find((x) => `exp-${x.id}` === li.id);
        const match = state.expFilter === "all" || item.tags.includes(state.expFilter);
        li.classList.toggle("is-dim", !match);
        $$(".tag", li).forEach((tag, i) => tag.classList.toggle("is-hit", item.tags[i] === state.expFilter));
      });
    } else if (d.exp) {
      const li = el.closest(".tl");
      const open = !li.classList.contains("is-open");
      li.classList.toggle("is-open", open);
      el.setAttribute("aria-expanded", open);
      open ? state.expOpen.add(d.exp) : state.expOpen.delete(d.exp);
    } else if (d.projFilter) {
      state.projFilter = d.projFilter;
      renderProjFilters();
      $$(".pcard").forEach((card, i) => {
        const show = state.projFilter === "all" || S.projects[i].cat === state.projFilter;
        card.classList.toggle("is-hidden", !show);
        if (show) { card.classList.remove("pop"); void card.offsetWidth; card.classList.add("pop"); }
      });
    } else if (d.project !== undefined) {
      openModal(+d.project);
    } else if (d.modalStep) {
      openModal(state.modalIndex + +d.modalStep);
    } else if (d.modalClose !== undefined) {
      closeModal();
    } else if (d.skillJump) {
      closeModal();
      setTimeout(() => selectSkill(d.skillJump, true), 260);
    } else if (d.skill) {
      selectSkill(d.skill);
    } else if (d.goto) {
      gotoEntry(d.goto);
    } else if (d.courses !== undefined) {
      const box = $(`#courses-${d.courses}`);
      const open = !box.classList.contains("is-open");
      box.classList.toggle("is-open", open);
      el.setAttribute("aria-expanded", open);
      el.firstChild.textContent = `${t(open ? "about.coursesHide" : "about.coursesToggle")} `;
    } else if (d.copy) {
      copy(d.copy, el);
    } else if (d.topic) {
      state.topic = d.topic;
      $$(".seg__btn").forEach((b) => {
        b.classList.toggle("is-active", b === el);
        b.setAttribute("aria-pressed", b === el);
      });
    } else if (el.id === "vcardBtn") {
      downloadVcard();
    }
  });

  /* ================= HEADER ================= */
  const nav = $("#nav");
  $("#menuBtn").addEventListener("click", () => nav.classList.toggle("is-open"));
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));

  $("#langBtn").addEventListener("click", () => {
    state.lang = state.lang === "zh" ? "en" : "zh";
    localStorage.setItem("lang", state.lang);
    renderAll();
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
    toast(t("toast.lang"));
  });

  $("#themeBtn").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  const progress = $("#progress");
  const onScroll = () => {
    const h = document.documentElement;
    progress.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;
    nav.classList.toggle("is-scrolled", h.scrollTop > 20);
  };
  addEventListener("scroll", onScroll, { passive: true });

  const navLinks = $$("#navLinks a");
  const sectionIO = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
      }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("[data-section]").forEach((s) => sectionIO.observe(s));

  const statsIO = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      runCounters();
      statsIO.disconnect();
    }
  }, { threshold: 0.4 });
  statsIO.observe($("#heroStats"));

  /* ================= POINTER EFFECTS ================= */
  if (finePointer && !reduceMotion) {
    const hero = $("#home");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
      hero.style.setProperty("--my", `${e.clientY - r.top}px`);
    });

    document.addEventListener("pointermove", (e) => {
      const m = e.target.closest(".magnetic");
      $$(".magnetic").forEach((b) => { if (b !== m) b.style.transform = ""; });
      if (!m) return;
      const r = m.getBoundingClientRect();
      m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
    });
  }

  function bindTilt() {
    if (!finePointer || reduceMotion) return;
    $$(".tilt").forEach((el) => {
      if (el.dataset.tiltBound) return;
      el.dataset.tiltBound = "1";
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
        el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
        el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ================= CONTACT ACTIONS ================= */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 1800);
  }

  async function copy(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    btn.textContent = t("contact.copied");
    btn.classList.add("is-done");
    setTimeout(() => {
      btn.textContent = t("contact.copy");
      btn.classList.remove("is-done");
    }, 1500);
    toast(`${t("contact.copied")} · ${text}`);
  }

  function downloadVcard() {
    const c = S.contact;
    const vcf = [
      "BEGIN:VCARD", "VERSION:3.0",
      "N:Li;Yanrui;;;", "FN:Yanrui Li (李沿睿)",
      "TITLE:Strategic Communication · PR · Content",
      `EMAIL;TYPE=INTERNET:${c.email}`,
      `TEL;TYPE=CELL:${c.phoneAu.replace(/\s/g, "")}`,
      `TEL;TYPE=CELL:${c.phoneCn.replace(/\s/g, "")}`,
      `NOTE:WeChat ${c.wechat}`,
      "END:VCARD"
    ].join("\r\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([vcf], { type: "text/vcard" })),
      download: "Yanrui-Li.vcf"
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }

  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = f.name.value.trim();
    const msg = f.msg.value.trim();
    if (!name || !msg) {
      toast(t("contact.formError"));
      (!name ? f.name : f.msg).focus();
      f.classList.add("shake");
      setTimeout(() => f.classList.remove("shake"), 500);
      return;
    }
    const topicKey = { job: "contact.topicJob", intern: "contact.topicIntern", project: "contact.topicProject", other: "contact.topicOther" }[state.topic];
    const org = f.org.value.trim();
    const subject = `[${t(topicKey)}] ${name}${org ? ` · ${org}` : ""}`;
    location.href = `mailto:${S.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${msg}\n\n— ${name}${org ? `, ${org}` : ""}`)}`;
  });

  /* ================= INIT ================= */
  renderAll();
  onScroll();
  const m = location.hash.match(/^#project\/(\w+)/);
  if (m) {
    const i = S.projects.findIndex((p) => p.id === m[1]);
    if (i >= 0) setTimeout(() => openModal(i), 300);
  }
})();
