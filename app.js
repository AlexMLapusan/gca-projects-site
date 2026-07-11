/* GCA Projects — site behaviour: i18n, case-study modal, nav, reveals. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  // In the single-file published build, images are embedded as data URIs
  // and window.__GCA_IMG__ maps original paths to them.
  function asset(src) {
    return (window.__GCA_IMG__ && window.__GCA_IMG__[src]) || src;
  }

  // single-file build: static images carry data-src and hydrate from the map
  function hydrateImages() {
    document.querySelectorAll("img[data-src]").forEach(function (img) {
      img.src = asset(img.getAttribute("data-src"));
      img.removeAttribute("data-src");
    });
  }

  // ---------- language handling ----------
  // Add a language: drop i18n/<code>.json (same keys as en.json) and add the
  // code here — the switcher button is generated automatically.
  var LANGS = ["en", "ro"];
  var FALLBACK = "en";
  var dicts = window.__GCA_I18N__ || null; // embedded build (published artifact)
  var current = null;

  function detectLang() {
    var saved = null;
    try { saved = localStorage.getItem("gca-lang"); } catch (e) { /* private mode */ }
    if (saved && LANGS.indexOf(saved) !== -1) return saved;
    var nav = (navigator.language || "").slice(0, 2).toLowerCase();
    return LANGS.indexOf(nav) !== -1 ? nav : FALLBACK;
  }

  function loadDicts() {
    if (dicts) return Promise.resolve(dicts);
    // one bad/missing locale file must not take down the others — t() falls
    // back to English for any key missing from a partial dictionary
    return Promise.all(LANGS.map(function (l) {
      return fetch("i18n/" + l + ".json")
        .then(function (r) { return r.ok ? r.json() : {}; })
        .catch(function () { return {}; });
    })).then(function (all) {
      dicts = {};
      LANGS.forEach(function (l, i) { dicts[l] = all[i]; });
      return dicts;
    });
  }

  function t(key) {
    var d = (dicts && (dicts[current] || dicts[FALLBACK])) || {};
    return d[key] !== undefined ? d[key] : (dicts && dicts[FALLBACK] && dicts[FALLBACK][key]) || "";
  }

  function applyLang(lang) {
    current = lang;
    try { localStorage.setItem("gca-lang", lang); } catch (e) { /* ignore */ }
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"));
      if (v) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-content]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-content"));
      if (v) el.setAttribute("content", v);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-alt"));
      if (v) el.alt = plain(v);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-aria"));
      if (v) el.setAttribute("aria-label", plain(v));
    });
    document.title = t("meta.title") || document.title;

    document.querySelectorAll("[data-setlang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-setlang") === lang));
    });

    // contact deep links carry a prefilled message in the visitor's language
    var wa = document.getElementById("walink");
    if (wa) wa.href = "https://wa.me/31610686950?text=" + encodeURIComponent(t("contact.waPrefill"));
    var mail = document.getElementById("maillink");
    if (mail) mail.href = "mailto:gcaprojects@yahoo.com?subject=" + encodeURIComponent(t("contact.mailSubject"));

    // re-render the modal if open
    if (openCase) renderCase(openCase);
  }

  // ---------- case studies ----------
  // Images per case; text comes from the dictionaries (proj.<id>.*).
  var CASES = {
    a: { tag: "proj.a.tag", title: "proj.a.title", body: "proj.a.body", chips: "proj.a.chips",
         before: ["assets/img/a-before.jpg"], during: ["assets/img/a-during.jpg"],
         after: ["assets/img/a-after-1.jpg", "assets/img/a-after-2.jpg", "assets/img/a-after-3.jpg", "assets/img/a-after-4.jpg"] },
    b: { tag: "proj.b.tag", title: "proj.b.title", body: "proj.b.body", chips: "proj.b.chips",
         before: ["assets/img/b-before.jpg"], during: ["assets/img/b-during.jpg"],
         after: ["assets/img/b-after-1.jpg", "assets/img/b-after-2.jpg", "assets/img/b-after-3.jpg", "assets/img/b-after-4.jpg"] },
    c: { tag: "proj.c.tag", title: "proj.c.title", body: "proj.c.body", chips: "proj.c.chips",
         before: ["assets/img/c-before.jpg"], during: ["assets/img/c-during.jpg"],
         after: ["assets/img/c-after-1.jpg", "assets/img/c-after-2.jpg", "assets/img/c-after-3.jpg"] },
    d: { tag: "proj.d.tag", title: "proj.d.title", body: "proj.d.body", chips: "proj.d.chips",
         before: ["assets/img/d-before.jpg"], during: ["assets/img/d-during.jpg"],
         after: ["assets/img/d-after-1.jpg", "assets/img/d-after-2.jpg", "assets/img/d-after-3.jpg", "assets/img/d-after-4.jpg"] },
    e: { tag: "proj.e.tag", title: "proj.e.title", body: "proj.e.body", chips: "proj.e.chips",
         before: ["assets/img/e-before.jpg"], during: ["assets/img/e-during.jpg"],
         after: ["assets/img/e-after-1.jpg", "assets/img/e-after-2.jpg"] },
  };

  var modal = document.getElementById("casemodal");
  var openCase = null;
  var lastFocus = null;

  function plain(s) {
    var el = document.createElement("span");
    el.innerHTML = s;
    return el.textContent;
  }

  function renderCase(id) {
    var c = CASES[id];
    if (!c) return;
    document.getElementById("modal-tag").innerHTML = t(c.tag);
    document.getElementById("modal-title").innerHTML = t(c.title);
    document.getElementById("modal-body").innerHTML = t(c.body);

    var chips = document.getElementById("modal-chips");
    chips.textContent = "";
    t(c.chips).split("·").forEach(function (label) {
      var s = document.createElement("span");
      s.textContent = label.trim();
      chips.appendChild(s);
    });

    var gal = document.getElementById("modal-gallery");
    gal.textContent = "";
    [["before", c.before], ["during", c.during], ["after", c.after]].forEach(function (pair) {
      var group = document.createElement("div");
      group.className = "mg-group";
      var h = document.createElement("h4");
      h.textContent = t("proj." + pair[0]);
      group.appendChild(h);
      var row = document.createElement("div");
      row.className = "mg-row";
      pair[1].forEach(function (src) {
        var img = document.createElement("img");
        img.src = asset(src);
        img.loading = "lazy";
        img.alt = plain(t(c.title) + " — " + t("proj." + pair[0]));
        img.tabIndex = 0;
        img.setAttribute("role", "button");
        img.addEventListener("click", function () { openZoom(asset(src), img.alt, img); });
        img.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openZoom(asset(src), img.alt, img); }
        });
        row.appendChild(img);
      });
      group.appendChild(row);
      gal.appendChild(group);
    });
  }

  function showCase(id) {
    openCase = id;
    lastFocus = document.activeElement;
    renderCase(id);
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close").focus();
  }

  function hideCase() {
    openCase = null;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  // ---------- zoom overlay ----------
  var zoom = document.getElementById("zoom");
  var zoomImg = document.getElementById("zoom-img");
  var zoomReturnFocus = null;

  function openZoom(src, alt, origin) {
    zoomImg.src = src;
    zoomImg.alt = alt || "";
    zoom.hidden = false;
    zoomReturnFocus = origin || document.activeElement;
    zoom.querySelector(".zoom-close").focus();
  }
  function closeZoom() {
    zoom.hidden = true;
    zoomImg.src = "";
    if (zoomReturnFocus) { zoomReturnFocus.focus(); zoomReturnFocus = null; }
  }

  // ---------- wiring ----------
  document.addEventListener("DOMContentLoaded", function () {
    hydrateImages();
    // if the user already clicked a language before the dictionaries arrived,
    // honour that choice instead of re-detecting
    loadDicts().then(function () { applyLang(current || detectLang()); });

    document.querySelectorAll("[data-setlang]").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.getAttribute("data-setlang")); });
    });

    // project cards open the case modal (click or Enter/Space)
    document.querySelectorAll(".proj-card").forEach(function (card) {
      var id = card.getAttribute("data-case");
      card.addEventListener("click", function () { showCase(id); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showCase(id); }
      });
    });

    modal.addEventListener("click", function (e) {
      if (e.target.hasAttribute("data-close")) hideCase();
    });

    zoom.addEventListener("click", closeZoom);

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (!zoom.hidden) closeZoom();
      else if (!modal.hidden) hideCase();
      else if (mobilenav && !mobilenav.hidden) toggleNav(false);
    });

    // focus trap for the dialog — document-level so Tab can't escape even
    // when focus fell back to <body> after clicking non-focusable content
    document.addEventListener("keydown", function (e) {
      if (modal.hidden || e.key !== "Tab") return;
      var focusables = modal.querySelectorAll("button, img[tabindex], a[href]");
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // mobile nav
    var toggle = document.querySelector(".navtoggle");
    var mobilenav = document.getElementById("mobilenav");
    function toggleNav(open) {
      toggle.setAttribute("aria-expanded", String(open));
      mobilenav.hidden = !open;
    }
    toggle.addEventListener("click", function () {
      toggleNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    mobilenav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { toggleNav(false); });
    });

    // contact form composes an email (no backend needed)
    var form = document.getElementById("quoteform");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var body = t("contact.mailBodyIntro") + "\n\n" +
        t("form.name") + ": " + (data.get("name") || "") + "\n" +
        t("form.town") + ": " + (data.get("town") || "") + "\n\n" +
        (data.get("msg") || "");
      location.href = "mailto:gcaprojects@yahoo.com" +
        "?subject=" + encodeURIComponent(t("contact.mailSubject")) +
        "&body=" + encodeURIComponent(body);
    });

    // scroll reveals
    if ("IntersectionObserver" in window &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      document.querySelectorAll(".rev").forEach(function (el) { io.observe(el); });
    } else {
      document.querySelectorAll(".rev").forEach(function (el) { el.classList.add("in"); });
    }
  });
})();
