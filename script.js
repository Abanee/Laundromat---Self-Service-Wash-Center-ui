/* ============================================================
   WASHHUB — GLOBAL JAVASCRIPT
   Single controller for all pages.
   Handles: theme, direction, mobile nav, accessibility,
            scroll-reveal, machine tabs, newsletter,
            H2 timeline, back-to-top, image lazy-load.
   ============================================================ */
(function () {
  "use strict";

  var root  = document.documentElement;
  var THEME_KEY = "washhub-theme";
  var DIR_KEY   = "washhub-dir";

  /* ---- Reduced-motion ---- */
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     THEME (light / dark)
     ============================================================ */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var isDark = theme === "dark";
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    });
  }

  function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
    var theme = stored || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(theme);
  }

  function toggleTheme() {
    var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    var next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }

  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", toggleTheme);
  });

  /* ============================================================
     DIRECTION (LTR / RTL)
     ============================================================ */
  function applyDir(dir) {
    root.setAttribute("dir", dir);
    root.setAttribute("lang", dir === "rtl" ? "ar" : "en");

    // Update all dir-toggle labels
    document.querySelectorAll(".dir-toggle-label").forEach(function (el) {
      el.textContent = dir === "rtl" ? "LTR" : "RTL";
    });
    document.querySelectorAll(".dir-toggle").forEach(function (btn) {
      btn.setAttribute("aria-label", dir === "rtl" ? "Switch to left-to-right layout" : "Switch to right-to-left layout");
    });
  }

  function initDir() {
    var stored = null;
    try { stored = localStorage.getItem(DIR_KEY); } catch (e) {}
    applyDir(stored === "rtl" ? "rtl" : "ltr");
  }

  function toggleDir() {
    var current = root.getAttribute("dir") === "rtl" ? "rtl" : "ltr";
    var next = current === "rtl" ? "ltr" : "rtl";
    applyDir(next);
    try { localStorage.setItem(DIR_KEY, next); } catch (e) {}
  }

  document.querySelectorAll(".dir-toggle").forEach(function (btn) {
    btn.addEventListener("click", toggleDir);
  });

  /* ============================================================
     MOBILE NAVIGATION
     ============================================================ */
  var menuBtn    = document.getElementById("menuBtn");
  var mobileNav  = document.getElementById("mobileNav");
  var mobileScrim = document.getElementById("mobileScrim");
  var mobileClose = document.getElementById("mobileClose");
  var lastFocused = null;

  function openMobileNav() {
    if (!mobileNav) return;
    lastFocused = document.activeElement;
    mobileNav.classList.add("is-open");
    if (mobileScrim) mobileScrim.classList.add("is-open");
    mobileNav.setAttribute("aria-hidden", "false");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    var first = mobileNav.querySelector("a, button");
    if (first) first.focus();
  }

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove("is-open");
    if (mobileScrim) mobileScrim.classList.remove("is-open");
    mobileNav.setAttribute("aria-hidden", "true");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  if (menuBtn)    menuBtn.addEventListener("click", openMobileNav);
  if (mobileClose) mobileClose.addEventListener("click", closeMobileNav);
  if (mobileScrim) mobileScrim.addEventListener("click", closeMobileNav);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileNav && mobileNav.classList.contains("is-open")) {
      closeMobileNav();
    }
  });

  if (mobileNav) {
    // Close on nav link click
    mobileNav.querySelectorAll("ul a").forEach(function (link) {
      link.addEventListener("click", closeMobileNav);
    });

    // Focus trap
    mobileNav.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !mobileNav.classList.contains("is-open")) return;
      var focusable = mobileNav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  /* ============================================================
     HOME 1 — MACHINE TABS
     ============================================================ */
  var machineTabs   = document.querySelectorAll(".machine-tab");
  var machineWashers = document.getElementById("washers");
  var machineDryers  = document.getElementById("dryers");

  machineTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      machineTabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      var target = tab.getAttribute("data-target");
      if (machineWashers) machineWashers.hidden = target !== "washers";
      if (machineDryers)  machineDryers.hidden  = target !== "dryers";
    });
  });

  // Machine card expand (touch-friendly)
  document.querySelectorAll(".machine-card").forEach(function (card) {
    card.addEventListener("click", function () {
      if (card.getAttribute("disabled")) return;
      var expanded = card.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".machine-card[aria-expanded='true']").forEach(function (c) {
        if (c !== card) c.setAttribute("aria-expanded", "false");
      });
      card.setAttribute("aria-expanded", String(!expanded));
    });
  });

  /* ============================================================
     HOME 1 — CENTER SELECT
     ============================================================ */
  var centerData = {
    "Downtown Center":  { open: "11:00 PM", washersTotal: 12, washersAvail: 7,  dryersTotal: 8,  dryersAvail: 5, wait: "Under 10 min" },
    "Riverside Center": { open: "10:00 PM", washersTotal: 10, washersAvail: 3,  dryersTotal: 6,  dryersAvail: 2, wait: "15–20 min" },
    "Northside Center": { open: "Midnight", washersTotal: 14, washersAvail: 11, dryersTotal: 10, dryersAvail: 8, wait: "Under 5 min" }
  };
  var centerSelect = document.getElementById("centerSelect");
  var statsEls = document.querySelectorAll(".center-stat dd");

  if (centerSelect && statsEls.length >= 4) {
    centerSelect.addEventListener("change", function () {
      var data = centerData[centerSelect.value];
      if (!data) return;
      statsEls[0].textContent = data.open;
      statsEls[1].innerHTML   = data.washersTotal + ' <span class="stat-accent">(' + data.washersAvail + ' Available)</span>';
      statsEls[2].innerHTML   = data.dryersTotal  + ' <span class="stat-accent">(' + data.dryersAvail  + ' Available)</span>';
      statsEls[3].textContent = data.wait;
    });
  }

  /* ============================================================
     HOME 2 — TIMELINE NAVIGATION
     ============================================================ */
  var tlSteps = document.querySelectorAll(".h2-tl-step");
  var tlPrev  = document.getElementById("tlPrev");
  var tlNext  = document.getElementById("tlNext");
  var tlActive = 0;

  function setTlActive(index) {
    if (!tlSteps.length) return;
    tlActive = Math.max(0, Math.min(tlSteps.length - 1, index));
    tlSteps.forEach(function (step, i) {
      step.classList.toggle("is-active", i === tlActive);
    });
    if (tlPrev) tlPrev.disabled = tlActive === 0;
    if (tlNext) tlNext.disabled = tlActive === tlSteps.length - 1;
  }

  if (tlSteps.length) {
    setTlActive(0);
    if (tlPrev) tlPrev.addEventListener("click", function () { setTlActive(tlActive - 1); });
    if (tlNext) tlNext.addEventListener("click", function () { setTlActive(tlActive + 1); });
    tlSteps.forEach(function (step, i) {
      step.addEventListener("click", function () { setTlActive(i); });
    });
  }

  /* ============================================================
     NEWSLETTER FORMS
     ============================================================ */
  document.querySelectorAll(".newsletter-form").forEach(function (form) {
    var status = form.closest(".footer-newsletter, .footer-col, div")
                     ? form.parentElement.querySelector(".newsletter-status") : null;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input[type='email']");
      if (!input || !input.value || !input.value.includes("@")) {
        if (status) { status.style.color = "var(--error)"; status.textContent = "Please enter a valid email address."; }
        if (input) input.focus();
        return;
      }
      if (status) { status.style.color = "var(--success)"; status.textContent = "You're subscribed! Thanks for joining."; }
      input.value = "";
      setTimeout(function () { if (status) status.textContent = ""; }, 5000);
    });
  });

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var revealSelectors = [
      "[data-reveal]",
      ".hero-copy", ".hero-visual",
      ".h2-hero-copy", ".h2-hero-visual",
      ".h2-statement-inner", ".h2-story-grid",
      ".h2-timeline-head", ".h2-timeline-track",
      ".h2-facility-grid", ".h2-freedom-grid",
      ".h2-drop-grid", ".h2-lifestyle-grid",
      ".h2-values-head", ".h2-values-list",
      ".h2-location-grid", ".h2-testimonials-grid",
      ".h2-final-cta-inner",
      ".machine-dashboard", ".pricing-rows",
      ".steps-row", ".drop-collect-card",
      ".location-card", ".testimonial",
      ".trust-item", ".about-stats"
    ].join(", ");

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity    = "1";
          entry.target.style.transform  = "translateY(0)";
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(revealSelectors).forEach(function (el) {
      if (el.getAttribute("data-reveal") !== null) return; // handled by CSS
      el.style.opacity   = "0";
      el.style.transform = "translateY(18px)";
      el.style.transition = "opacity 560ms cubic-bezier(.4,0,.2,1), transform 560ms cubic-bezier(.4,0,.2,1)";
      revealObserver.observe(el);
    });

    // Also handle [data-reveal] CSS-based ones
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // No animation — just make visible
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Mark [data-reveal] as visible via class for CSS transition */
  if ("IntersectionObserver" in window) {
    var cssRevealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          cssRevealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      cssRevealObserver.observe(el);
    });
  }

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  document.querySelectorAll(".back-to-top").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });

  /* ============================================================
     HEADER SCROLL SHADOW
     ============================================================ */
  var siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    window.addEventListener("scroll", function () {
      siteHeader.classList.toggle("scrolled", window.scrollY > 40);
    }, { passive: true });
  }

  /* ============================================================
     IMAGE LAZY LOAD FADE-IN
     ============================================================ */
  document.querySelectorAll("img[data-src]").forEach(function (img) {
    img.src = img.getAttribute("data-src");
    img.removeAttribute("data-src");
  });

  /* ============================================================
     SERVICES — MACHINE SIZE SELECTOR
     ============================================================ */
  var sizeCards = document.querySelectorAll(".svc-size-card");
  sizeCards.forEach(function (card) {
    card.addEventListener("click", function () {
      sizeCards.forEach(function (c) {
        c.classList.remove("is-selected");
        c.setAttribute("aria-selected", "false");
      });
      card.classList.add("is-selected");
      card.setAttribute("aria-selected", "true");
    });
  });

  /* ============================================================
     SERVICES — FAQ ACCORDION
     ============================================================ */
  var faqItems = document.querySelectorAll(".svc-faq-item");
  faqItems.forEach(function (item) {
    var btn = item.querySelector(".svc-faq-btn");
    var content = item.querySelector(".svc-faq-content");
    if (!btn || !content) return;

    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove("is-open");
          var otherBtn = other.querySelector(".svc-faq-btn");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ============================================================
     SERVICES — NAV STRIP SCROLL SPY
     ============================================================ */
  var svcStripLinks = document.querySelectorAll(".svc-strip-link");
  if (svcStripLinks.length) {
    var svcSections = [];
    svcStripLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        var sec = document.querySelector(href);
        if (sec) svcSections.push({ link: link, sec: sec });
      }
    });

    if (svcSections.length) {
      window.addEventListener("scroll", function () {
        var scrollPos = window.scrollY + 160;
        var current = svcSections[0];
        svcSections.forEach(function (s) {
          if (s.sec.offsetTop <= scrollPos) {
            current = s;
          }
        });
        svcStripLinks.forEach(function (l) { l.classList.remove("is-active"); });
        if (current && current.link) current.link.classList.add("is-active");
      }, { passive: true });
    }
  }

  /* ============================================================
     PLANS & PRICING — MODE SWITCHER
     ============================================================ */
  var prcModeTabs = document.querySelectorAll(".prc-mode-tab");
  var prcPanels = document.querySelectorAll(".prc-tab-panel");
  if (prcModeTabs.length && prcPanels.length) {
    prcModeTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var targetId = tab.getAttribute("data-target");
        prcModeTabs.forEach(function (t) {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        prcPanels.forEach(function (p) {
          p.classList.remove("is-active");
        });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        var targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add("is-active");
        }
      });
    });
  }

  /* ============================================================
     PLANS & PRICING — COST ESTIMATOR
     ============================================================ */
  var prcCalc = document.getElementById("prcEstimator");
  if (prcCalc) {
    var prcService = "self";
    var prcLoad = 8;
    var prcDry = "std";

    var serviceBtns = prcCalc.querySelectorAll("[data-prc-service]");
    var loadBtns = prcCalc.querySelectorAll("[data-prc-load]");
    var dryBtns = prcCalc.querySelectorAll("[data-prc-dry]");
    var checkEco = document.getElementById("prcAddonEco");
    var checkSoft = document.getElementById("prcAddonSoft");
    var checkFold = document.getElementById("prcAddonFold");

    var outTotal = document.getElementById("prcOutTotal");
    var outBase = document.getElementById("prcOutBase");
    var outDry = document.getElementById("prcOutDry");
    var outAddons = document.getElementById("prcOutAddons");
    var outTime = document.getElementById("prcOutTime");

    function updatePrcEstimate() {
      var baseCost = 0;
      var dryCost = 0;
      var addonCost = 0;
      var estMinutes = 0;

      // Base Wash
      if (prcService === "self") {
        if (prcLoad === 8) { baseCost = 80; estMinutes += 30; }
        else if (prcLoad === 14) { baseCost = 140; estMinutes += 38; }
        else { baseCost = 190; estMinutes += 42; }
      } else {
        // Drop & Collect (Washed, Dried, Hand-folded)
        if (prcLoad === 8) { baseCost = 340; estMinutes = 240; }
        else if (prcLoad === 14) { baseCost = 560; estMinutes = 300; }
        else { baseCost = 720; estMinutes = 360; }
      }

      // Dryer
      if (prcService === "self") {
        if (prcDry === "none") { dryCost = 0; }
        else if (prcDry === "std") { dryCost = 60; estMinutes += 25; }
        else if (prcDry === "deep") { dryCost = 100; estMinutes += 35; }
      } else {
        if (prcDry === "deep") { dryCost = 40; }
        else { dryCost = 0; }
      }

      // Addons
      if (checkEco && checkEco.checked) addonCost += 20;
      if (checkSoft && checkSoft.checked) addonCost += 15;
      if (checkFold && checkFold.checked) {
        if (prcService === "self") addonCost += 50;
      }

      var totalCost = baseCost + dryCost + addonCost;

      if (outTotal) outTotal.textContent = "₹" + totalCost;
      if (outBase) outBase.textContent = "₹" + baseCost;
      if (outDry) outDry.textContent = "₹" + dryCost;
      if (outAddons) outAddons.textContent = "₹" + addonCost;
      if (outTime) {
        if (prcService === "self") {
          outTime.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Approx. ' + estMinutes + ' minutes total cycle';
        } else {
          outTime.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Ready for pickup in ' + Math.round(estMinutes / 60) + ' hours';
        }
      }
    }

    serviceBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        serviceBtns.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        prcService = btn.getAttribute("data-prc-service");
        updatePrcEstimate();
      });
    });

    loadBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        loadBtns.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        prcLoad = parseInt(btn.getAttribute("data-prc-load"), 10);
        updatePrcEstimate();
      });
    });

    dryBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        dryBtns.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        prcDry = btn.getAttribute("data-prc-dry");
        updatePrcEstimate();
      });
    });

    [checkEco, checkSoft, checkFold].forEach(function (chk) {
      if (chk) chk.addEventListener("change", updatePrcEstimate);
    });

    updatePrcEstimate();
  }

  /* ============================================================
     PLANS & PRICING — WEIGHT SCALE STEPS
     ============================================================ */
  var scaleSteps = document.querySelectorAll(".prc-scale-step");
  if (scaleSteps.length) {
    scaleSteps.forEach(function (step) {
      step.addEventListener("click", function () {
        scaleSteps.forEach(function (s) { s.classList.remove("is-active"); });
        step.classList.add("is-active");
      });
    });
  }

  /* ============================================================
     PLANS & PRICING — FAQ ACCORDION
     ============================================================ */
  var prcFaqItems = document.querySelectorAll(".prc-faq-item");
  if (prcFaqItems.length) {
    prcFaqItems.forEach(function (item) {
      var btn = item.querySelector(".prc-faq-btn");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        prcFaqItems.forEach(function (other) {
          if (other !== item) {
            other.classList.remove("is-open");
            var obtn = other.querySelector(".prc-faq-btn");
            if (obtn) obtn.setAttribute("aria-expanded", "false");
          }
        });
        item.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  }

  /* ============================================================
     BLOG — CATEGORY FILTER
     ============================================================ */
  var blgCatBtns = document.querySelectorAll(".blg-cat-btn");
  var blgArticles = document.querySelectorAll(".blg-card[data-category], .blg-featured-card[data-category]");
  if (blgCatBtns.length && blgArticles.length) {
    blgCatBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var selectedCat = btn.getAttribute("data-category");
        blgCatBtns.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");

        blgArticles.forEach(function (art) {
          var artCat = art.getAttribute("data-category");
          if (selectedCat === "all" || artCat === selectedCat) {
            art.style.display = "";
            art.style.opacity = "1";
          } else {
            art.style.display = "none";
          }
        });
      });
    });
  }

  /* ============================================================
     BLOG — QUICK GUIDE ACCORDION
     ============================================================ */
  var blgAccItems = document.querySelectorAll(".blg-acc-item");
  if (blgAccItems.length) {
    blgAccItems.forEach(function (item) {
      var btn = item.querySelector(".blg-acc-btn");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        blgAccItems.forEach(function (other) {
          if (other !== item) {
            other.classList.remove("is-open");
            var obtn = other.querySelector(".blg-acc-btn");
            if (obtn) obtn.setAttribute("aria-expanded", "false");
          }
        });
        item.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  }

  /* ============================================================
     BLOG — NEWSLETTER SUBSCRIPTION
     ============================================================ */
  var blgNlForm = document.querySelector(".blg-nl-form");
  if (blgNlForm) {
    blgNlForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = blgNlForm.querySelector(".blg-nl-input");
      var status = document.querySelector(".blg-nl-status");
      if (!input || !input.value || !input.value.includes("@")) {
        if (status) {
          status.style.color = "var(--error)";
          status.textContent = "Please enter a valid email address.";
        }
        if (input) input.focus();
        return;
      }
      if (status) {
        status.style.color = "var(--success)";
        status.textContent = "You're subscribed! Enjoy practical laundry tips with zero spam.";
      }
      input.value = "";
      setTimeout(function () {
        if (status) status.textContent = "";
      }, 5000);
    });
  }

  /* ============================================================
     BLOG — PAGINATION
     ============================================================ */
  var blgPageBtns = document.querySelectorAll(".blg-page-btn[data-page]");
  if (blgPageBtns.length) {
    blgPageBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        blgPageBtns.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var gridSec = document.querySelector(".blg-grid-section");
        if (gridSec) {
          gridSec.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  /* ============================================================
     CONTACT — REAL MAP SWITCHER
     ============================================================ */
  var mapBtns = document.querySelectorAll(".cnt-map-btn");
  var mapFrame = document.getElementById("cntMapFrame");
  var mapOverlayTitle = document.getElementById("cntMapOverlayTitle");
  var mapOverlayDesc = document.getElementById("cntMapOverlayDesc");

  var mapLocations = {
    downtown: {
      url: "https://maps.google.com/maps?q=Connaught%20Place%20New%20Delhi&t=&z=15&ie=UTF8&iwloc=&output=embed",
      title: "Downtown Flagship Center",
      desc: "142 Connaught Circus, Central Market. Open daily 6:00 AM – 11:00 PM. 16 washers, 12 dryers. Dedicated client parking bays."
    },
    westside: {
      url: "https://maps.google.com/maps?q=Indiranagar%20Bengaluru&t=&z=15&ie=UTF8&iwloc=&output=embed",
      title: "Westside Express Hub",
      desc: "48 Market Lane, Indiranagar. Open daily 6:00 AM – 11:00 PM. 12 washers, 10 dryers. Free street parking & EV chargers."
    },
    university: {
      url: "https://maps.google.com/maps?q=North%20Campus%20Delhi&t=&z=15&ie=UTF8&iwloc=&output=embed",
      title: "University Metro Branch",
      desc: "12 North Campus Promenade (adjacent to Metro Exit 2). Open daily 6:00 AM – 11:00 PM. 14 washers, 12 dryers. Student lounge & high-speed Wi-Fi."
    }
  };

  if (mapBtns.length && mapFrame) {
    mapBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-map-loc");
        if (!mapLocations[key]) return;

        mapBtns.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");

        mapFrame.src = mapLocations[key].url;
        if (mapOverlayTitle) mapOverlayTitle.textContent = mapLocations[key].title;
        if (mapOverlayDesc) mapOverlayDesc.textContent = mapLocations[key].desc;
      });
    });
  }

  /* ============================================================
     CONTACT — FORM HANDLING & B2B TOGGLE
     ============================================================ */
  var cntForm = document.getElementById("cntForm");
  var cntTopic = document.getElementById("cntTopic");
  var cntB2bExtra = document.getElementById("cntB2bExtra");
  var cntStatus = document.getElementById("cntFormStatus");

  if (cntTopic && cntB2bExtra) {
    cntTopic.addEventListener("change", function () {
      if (cntTopic.value === "business") {
        cntB2bExtra.classList.add("is-visible");
      } else {
        cntB2bExtra.classList.remove("is-visible");
      }
    });
  }

  if (cntForm) {
    cntForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cntName");
      var email = document.getElementById("cntEmail");
      var msg = document.getElementById("cntMsg");

      if (!name || !name.value.trim() || !email || !email.value.includes("@") || !msg || !msg.value.trim()) {
        if (cntStatus) {
          cntStatus.className = "cnt-form-status is-error";
          cntStatus.textContent = "Please fill in all required fields with a valid email.";
        }
        return;
      }

      if (cntStatus) {
        cntStatus.className = "cnt-form-status is-success";
        cntStatus.textContent = "Thank you! Your inquiry has been sent directly to our branch desk. An attendant will respond within 2 hours.";
      }

      cntForm.reset();
      if (cntB2bExtra) cntB2bExtra.classList.remove("is-visible");

      setTimeout(function () {
        if (cntStatus) {
          cntStatus.className = "cnt-form-status";
          cntStatus.textContent = "";
        }
      }, 6000);
    });
  }

  /* ============================================================
     CONTACT — VISIT FAQ ACCORDION
     ============================================================ */
  var cntFaqItems = document.querySelectorAll(".cnt-faq-item");
  if (cntFaqItems.length) {
    cntFaqItems.forEach(function (item) {
      var btn = item.querySelector(".cnt-faq-btn");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        cntFaqItems.forEach(function (other) {
          if (other !== item) {
            other.classList.remove("is-open");
            var obtn = other.querySelector(".cnt-faq-btn");
            if (obtn) obtn.setAttribute("aria-expanded", "false");
          }
        });
        item.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  }

  /* ============================================================
     AUTHENTICATION PAGES (login.html & signup.html)
     ============================================================ */
  function initAuth() {
    // Password show/hide toggle
    document.querySelectorAll(".auth-eye-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var inputId = btn.getAttribute("data-target");
        var input = document.getElementById(inputId);
        if (!input) return;
        var isPassword = input.getAttribute("type") === "password";
        input.setAttribute("type", isPassword ? "text" : "password");
        btn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
        var eyeSvg = btn.querySelector("svg");
        if (eyeSvg) {
          if (isPassword) {
            eyeSvg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
          } else {
            eyeSvg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
          }
        }
      });
    });

    // Password strength calculator (signup.html)
    var signupPass = document.getElementById("signupPassword");
    var strengthBars = document.querySelectorAll(".auth-strength-bar");
    var strengthText = document.getElementById("authStrengthText");

    if (signupPass && strengthBars.length && strengthText) {
      signupPass.addEventListener("input", function () {
        var val = signupPass.value;
        var score = 0;
        if (val.length >= 6) score++;
        if (val.length >= 10) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        strengthBars.forEach(function (bar, idx) {
          if (idx < score) {
            if (score <= 1) bar.style.background = "#EF4444";
            else if (score === 2) bar.style.background = "#F59E0B";
            else if (score === 3) bar.style.background = "#10B981";
            else bar.style.background = "#059669";
          } else {
            bar.style.background = "var(--border-color)";
          }
        });

        var labels = ["Too weak", "Fair", "Good", "Strong"];
        strengthText.textContent = val.length ? (labels[score - 1] || "Too weak") : "Password strength";
      });
    }

    // Forms submission simulation
    var loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var alertEl = document.getElementById("authAlert");
        var btn = loginForm.querySelector(".auth-submit-btn");
        if (btn) btn.disabled = true;
        if (alertEl) {
          alertEl.style.display = "block";
          alertEl.className = "alert alert-success";
          alertEl.innerHTML = "<strong>Success!</strong> Logging you in to WashHub...";
        }
        setTimeout(function () {
          window.location.href = "index.html";
        }, 1200);
      });
    }

    var signupForm = document.getElementById("signupForm");
    if (signupForm) {
      signupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var pass = document.getElementById("signupPassword");
        var confirm = document.getElementById("signupConfirm");
        var alertEl = document.getElementById("authAlert");

        if (pass && confirm && pass.value !== confirm.value) {
          if (alertEl) {
            alertEl.style.display = "block";
            alertEl.className = "alert alert-danger";
            alertEl.innerHTML = "<strong>Error:</strong> Passwords do not match. Please re-enter.";
          }
          return;
        }

        var btn = signupForm.querySelector(".auth-submit-btn");
        if (btn) btn.disabled = true;
        if (alertEl) {
          alertEl.style.display = "block";
          alertEl.className = "alert alert-success";
          alertEl.innerHTML = "<strong>Account created!</strong> Redirecting to your dashboard...";
        }
        setTimeout(function () {
          window.location.href = "index.html";
        }, 1400);
      });
    }

    // Third-party SSO click feedback
    document.querySelectorAll(".auth-sso-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var provider = btn.getAttribute("data-provider") || "Third-party";
        var alertEl = document.getElementById("authAlert");
        if (alertEl) {
          alertEl.style.display = "block";
          alertEl.className = "alert alert-info";
          alertEl.innerHTML = "Connecting to " + provider + " secure authentication...";
          setTimeout(function () {
            window.location.href = "index.html";
          }, 1200);
        }
      });
    });
  }

  /* ============================================================
     SMART WASH & FABRIC ASSISTANT (Exclusive to index.html)
     ============================================================ */
  function initFabricAssistant() {
    var section = document.getElementById("fabric-assistant");
    if (!section) return;

    var fabricData = {
      cottons: {
        title: "Everyday Cottons",
        drum: "10kg Standard Inverter Drum",
        machines: "W01, W02, W05",
        light: { temp: "30°C Eco", spin: "1,200 RPM", duration: "28 min", tip: "Cold water washing protects colored cottons and reduces carbon footprint." },
        normal: { temp: "40°C Warm", spin: "1,400 RPM", duration: "34 min", tip: "Our high-speed 1,400 RPM spin cuts dryer time by up to 50%." },
        heavy: { temp: "60°C Hot", spin: "1,400 RPM", duration: "42 min", tip: "Hot water combined with oxygenated detergent lifts ground-in soil and grease." }
      },
      bedding: {
        title: "Bedding & Duvets",
        drum: "18kg Mega Inverter Drum",
        machines: "W03, W08",
        light: { temp: "40°C Warm", spin: "1,000 RPM", duration: "36 min", tip: "King-sized duvets need extra drum space to tumble freely for an even wash." },
        normal: { temp: "60°C Thermal", spin: "1,200 RPM", duration: "44 min", tip: "60°C thermal sanitization eliminates 99.9% of dust mites and allergens." },
        heavy: { temp: "60°C Deep Wash", spin: "1,200 RPM", duration: "52 min", tip: "Includes an extra deep-rinse cycle to completely flush detergent out of heavy fibers." }
      },
      delicates: {
        title: "Delicates & Silk",
        drum: "7kg Honeycomb Gentle Drum",
        machines: "W09, W10",
        light: { temp: "20°C Cold Gentle", spin: "600 RPM", duration: "22 min", tip: "Gentle drum rhythm mimics hand washing to preserve silk, lace, and knits." },
        normal: { temp: "30°C Delicates", spin: "800 RPM", duration: "28 min", tip: "Mesh laundry bags are available at our vending counter for extra protection." },
        heavy: { temp: "30°C Stain Lift", spin: "800 RPM", duration: "35 min", tip: "Enzyme-friendly soak removes stains without stretching fragile fibers." }
      },
      activewear: {
        title: "Activewear & Gym",
        drum: "10kg Performance Drum",
        machines: "W04, W07",
        light: { temp: "30°C Sport Refresh", spin: "1,000 RPM", duration: "25 min", tip: "Rapid rinse removes sweat and restores moisture-wicking properties fast." },
        normal: { temp: "40°C Odor Shield", spin: "1,200 RPM", duration: "35 min", tip: "Antibacterial wash penetrates synthetic fibers to eliminate persistent gym odor." },
        heavy: { temp: "40°C Intense Sport", spin: "1,200 RPM", duration: "42 min", tip: "High-volume aeration dissolves mud and mineral salts from outdoor sports gear." }
      },
      pets: {
        title: "Pet Bedding & Rugs",
        drum: "14kg Dedicated Pet & Rug Drum",
        machines: "W11, W12",
        light: { temp: "40°C Pet Refresh", spin: "1,200 RPM", duration: "32 min", tip: "Dedicated pet drum with specialized hair-trap drain avoids cross-contamination." },
        normal: { temp: "60°C Sanitizing", spin: "1,400 RPM", duration: "45 min", tip: "Thermal sanitation eradicates fleas, pet dander, and stubborn fur odors." },
        heavy: { temp: "60°C Ultra Deep", spin: "1,400 RPM", duration: "55 min", tip: "Dual pre-wash and heavy spin dislodges pet hair straight into our micro-filter." }
      },
      workwear: {
        title: "Workwear & Heavy Denim",
        drum: "14kg Heavy-Duty Drum",
        machines: "W08, W09",
        light: { temp: "40°C Standard Care", spin: "1,000 RPM", duration: "32 min", tip: "Turn jeans and uniforms inside out to prevent surface friction and color fade." },
        normal: { temp: "50°C Deep Extraction", spin: "1,200 RPM", duration: "40 min", tip: "High-torque agitation lifts motor grease, cooking oil, and outdoor dirt easily." },
        heavy: { temp: "60°C Heavy Sanitizing", spin: "1,400 RPM", duration: "52 min", tip: "Pre-wash cycle loosens embedded grime before the thermal wash cycle." }
      }
    };

    var currentFabric = "cottons";
    var currentSoil = "normal";

    var fabricBtns = section.querySelectorAll(".fa-option-btn");
    var soilBtns = section.querySelectorAll(".fa-soil-btn");

    var drumEl = document.getElementById("faDrumName");
    var machinesEl = document.getElementById("faDrumMachines");
    var tempEl = document.getElementById("faTemp");
    var spinEl = document.getElementById("faSpin");
    var durationEl = document.getElementById("faDuration");
    var tipEl = document.getElementById("faTip");
    var resultCard = section.querySelector(".fa-result-card");

    function updateRecommendation() {
      var item = fabricData[currentFabric];
      if (!item) return;
      var detail = item[currentSoil] || item.normal;

      if (drumEl) drumEl.textContent = item.drum;
      if (machinesEl) machinesEl.textContent = "Available at Downtown: " + item.machines;
      if (tempEl) tempEl.textContent = detail.temp;
      if (spinEl) spinEl.textContent = detail.spin;
      if (durationEl) durationEl.textContent = detail.duration;
      if (tipEl) tipEl.textContent = detail.tip;

      if (resultCard) {
        resultCard.style.transform = "scale(0.99)";
        setTimeout(function () {
          resultCard.style.transform = "scale(1)";
        }, 120);
      }
    }

    fabricBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        fabricBtns.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        currentFabric = btn.getAttribute("data-fabric") || "cottons";
        updateRecommendation();
      });
    });

    soilBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        soilBtns.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        currentSoil = btn.getAttribute("data-soil") || "normal";
        updateRecommendation();
      });
    });
  }

  /* ============================================================
     HOME 2 — DROP & COLLECT CAROUSEL
     ============================================================ */
  function initDropCarousel() {
    var carousel = document.getElementById("dropCarousel");
    if (!carousel) return;

    var slides = carousel.querySelectorAll(".h2-carousel-slide");
    var dots = carousel.querySelectorAll(".h2-carousel-dot");
    var prevBtn = document.getElementById("carouselPrevBtn");
    var nextBtn = document.getElementById("carouselNextBtn");
    var stageLabel = document.getElementById("carouselStageLabel");
    var steps = document.querySelectorAll(".h2-drop-step");

    if (!slides.length) return;

    var currentIndex = 0;
    var stages = [
      "Stage 1 of 4 · Drop-off",
      "Stage 2 of 4 · Eco Wash",
      "Stage 3 of 4 · Dry & Fold",
      "Stage 4 of 4 · Ready for Pickup"
    ];
    var timer = null;

    function goToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach(function (slide, i) {
        if (i === currentIndex) {
          slide.classList.add("is-active");
        } else {
          slide.classList.remove("is-active");
        }
      });

      dots.forEach(function (dot, i) {
        if (i === currentIndex) {
          dot.classList.add("is-active");
        } else {
          dot.classList.remove("is-active");
        }
      });

      steps.forEach(function (step, i) {
        if (i === currentIndex) {
          step.classList.add("is-active");
        } else {
          step.classList.remove("is-active");
        }
      });

      if (stageLabel && stages[currentIndex]) {
        stageLabel.textContent = stages[currentIndex];
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goToSlide(currentIndex - 1);
        resetTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goToSlide(currentIndex + 1);
        resetTimer();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        goToSlide(i);
        resetTimer();
      });
    });

    steps.forEach(function (step, i) {
      step.addEventListener("click", function () {
        goToSlide(i);
        resetTimer();
      });
      step.addEventListener("mouseenter", function () {
        goToSlide(i);
        stopTimer();
      });
      step.addEventListener("mouseleave", function () {
        startTimer();
      });
    });

    function startTimer() {
      stopTimer();
      timer = setInterval(function () {
        goToSlide(currentIndex + 1);
      }, 4500);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function resetTimer() {
      stopTimer();
      startTimer();
    }

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);

    startTimer();
  }

  /* ============================================================
     HOME 1 — HERO CAROUSEL CONTROLLER
     ============================================================ */
  function initHeroCarousel() {
    var carousel = document.getElementById("heroCarousel");
    if (!carousel) return;

    var slides = carousel.querySelectorAll(".hero-carousel-slide");
    var dots = carousel.querySelectorAll(".hero-carousel-dot");
    var prevBtn = document.getElementById("heroPrevBtn");
    var nextBtn = document.getElementById("heroNextBtn");
    var currentIndex = 0;
    var timer = null;

    if (!slides.length) return;

    function goToSlide(index) {
      if (index >= slides.length) index = 0;
      if (index < 0) index = slides.length - 1;
      currentIndex = index;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === currentIndex);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === currentIndex);
        dot.setAttribute("aria-selected", String(i === currentIndex));
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goToSlide(currentIndex - 1);
        resetTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goToSlide(currentIndex + 1);
        resetTimer();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        goToSlide(i);
        resetTimer();
      });
    });

    function startTimer() {
      stopTimer();
      timer = setInterval(function () {
        goToSlide(currentIndex + 1);
      }, 4200);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function resetTimer() {
      stopTimer();
      startTimer();
    }

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);

    startTimer();
  }

  /* ============================================================
     GLOBAL SEARCH MODAL CONTROLLER
     ============================================================ */
  function initSearchModal() {
    var searchBtns = document.querySelectorAll("#searchBtn, .search-toggle");
    var modal = document.getElementById("searchModal");
    if (!modal) return;

    var backdrop = document.getElementById("searchBackdrop");
    var closeBtn = document.getElementById("searchCloseBtn");
    var input = document.getElementById("siteSearchInput");
    var resultsList = document.getElementById("searchResultsList");
    var tagChips = modal.querySelectorAll(".search-tag-chip");

    var searchData = [
      {
        title: "Real-Time Machine Availability",
        desc: "Live washer and dryer counts before you visit.",
        category: "Machines",
        url: "index.html#availability"
      },
      {
        title: "Downtown Center Location",
        desc: "452 Grand Avenue · Open 6am–11pm · 12 machines ready.",
        category: "Locations",
        url: "index.html#locations"
      },
      {
        title: "Self-Service Wash Rates & Pricing",
        desc: "Transparent washer, dryer, and detergent prices.",
        category: "Pricing",
        url: "pricing.html"
      },
      {
        title: "Drop & Collect Service",
        desc: "Drop off in 60 seconds; we wash, dry, fold & seal.",
        category: "Services",
        url: "services.html"
      },
      {
        title: "Fabric & Load Advisor",
        desc: "Get machine size & cycle recommendations for your load.",
        category: "Tool",
        url: "index.html#fabricAdvisor"
      },
      {
        title: "Eco-Smart Technology & Washing",
        desc: "High-efficiency commercial drums using 30% less water.",
        category: "Eco",
        url: "index.html#ecoSmart"
      },
      {
        title: "Opening Hours & Contact Centers",
        desc: "Open 7 days a week from 6:00 AM to 11:00 PM.",
        category: "Hours",
        url: "contact.html"
      },
      {
        title: "WashHub About & Standards",
        desc: "Our mission: making laundry seamless and stress-free.",
        category: "About",
        url: "about.html"
      },
      {
        title: "Photo Gallery & Facilities Tour",
        desc: "Explore modern equipment, folding areas, lounges, and machines.",
        category: "Gallery",
        url: "gallery.html"
      }
    ];

    function renderResults(query) {
      if (!resultsList) return;
      var q = (query || "").trim().toLowerCase();
      var filtered = searchData.filter(function (item) {
        if (!q) return true;
        return item.title.toLowerCase().includes(q) ||
               item.desc.toLowerCase().includes(q) ||
               item.category.toLowerCase().includes(q);
      });

      if (!filtered.length) {
        resultsList.innerHTML = '<div class="search-no-results">No results found for "' + escapeHtml(q) + '". Try searching for <strong>pricing</strong>, <strong>machines</strong>, or <strong>locations</strong>.</div>';
        return;
      }

      var html = "";
      filtered.forEach(function (item) {
        html += '<a href="' + item.url + '" class="search-result-item">' +
                  '<div class="search-res-left">' +
                    '<div class="search-res-title">' + escapeHtml(item.title) + '</div>' +
                    '<div class="search-res-desc">' + escapeHtml(item.desc) + '</div>' +
                  '</div>' +
                  '<span class="search-res-badge">' + escapeHtml(item.category) + '</span>' +
                '</a>';
      });
      resultsList.innerHTML = html;
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function openModal() {
      modal.removeAttribute("hidden");
      void modal.offsetWidth;
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
      renderResults(input ? input.value : "");
      if (input) {
        setTimeout(function () { input.focus(); }, 50);
      }
    }

    function closeModal() {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(function () {
        modal.setAttribute("hidden", "true");
      }, 250);
    }

    searchBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
      });
    });

    if (backdrop) backdrop.addEventListener("click", closeModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    if (input) {
      input.addEventListener("input", function () {
        renderResults(input.value);
      });
    }

    tagChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var term = chip.getAttribute("data-search-term") || "";
        if (input) {
          input.value = term;
          input.focus();
        }
        renderResults(term);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });

    if (resultsList) {
      resultsList.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          closeModal();
        }
      });
    }
  }

  /* ============================================================
     GALLERY INTERACTIVE FILTERING & VIEW MORE
     ============================================================ */

  function initGallery() {
    var galleryGrid = document.getElementById("galleryGrid");
    if (!galleryGrid) return;

    var filterBtns = document.querySelectorAll(".gallery-filter-btn");
    var searchInput = document.getElementById("gallerySearchInput");
    var loadMoreBtn = document.getElementById("galleryLoadMoreBtn");
    var statusCounter = document.getElementById("galleryStatusCounter");
    var cards = Array.from(galleryGrid.querySelectorAll(".gallery-card"));

    var activeCategory = "all";
    var searchQuery = "";
    var isExpanded = false;

    function updateGalleryDisplay() {
      var matchingCards = cards.filter(function (card) {
        var cardCat = card.getAttribute("data-category") || "";
        var cardTitle = (card.getAttribute("data-title") || "").toLowerCase();
        var cardDesc = (card.getAttribute("data-desc") || "").toLowerCase();

        var matchesCategory = activeCategory === "all" || cardCat === activeCategory;
        var matchesSearch = !searchQuery || cardTitle.indexOf(searchQuery) !== -1 || cardDesc.indexOf(searchQuery) !== -1;

        return matchesCategory && matchesSearch;
      });

      cards.forEach(function (card) {
        card.classList.add("is-hidden");
      });

      var visibleLimit = isExpanded || searchQuery ? matchingCards.length : Math.min(12, matchingCards.length);

      for (var i = 0; i < visibleLimit; i++) {
        matchingCards[i].classList.remove("is-hidden");
      }

      if (statusCounter) {
        statusCounter.textContent = "Showing " + visibleLimit + " of " + matchingCards.length + " photos";
      }

      if (loadMoreBtn) {
        if (matchingCards.length <= 12 || searchQuery) {
          loadMoreBtn.style.display = "none";
        } else {
          loadMoreBtn.style.display = "inline-flex";
          var span = loadMoreBtn.querySelector("span");
          if (span) {
            span.textContent = isExpanded ? "Show Less" : "View More Photos";
          }
          var svg = loadMoreBtn.querySelector("svg");
          if (svg) {
            svg.style.transform = isExpanded ? "rotate(180deg)" : "rotate(0deg)";
          }
        }
      }
    }

    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        activeCategory = btn.getAttribute("data-filter") || "all";
        isExpanded = false;
        updateGalleryDisplay();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        searchQuery = searchInput.value.trim().toLowerCase();
        updateGalleryDisplay();
      });
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", function () {
        isExpanded = !isExpanded;
        updateGalleryDisplay();
        if (!isExpanded && galleryGrid) {
          galleryGrid.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    updateGalleryDisplay();
  }

  /* ============================================================
     INIT
     ============================================================ */

  initTheme();
  initDir();
  initAuth();
  initFabricAssistant();
  initDropCarousel();
  initHeroCarousel();
  initSearchModal();
  initGallery();

})();

