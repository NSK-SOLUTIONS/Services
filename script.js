/* =========================================================
   NSK SOLUTIONS — SITE SCRIPT
   Handles: mobile nav, sticky header, scrollspy, reveal-on-
   scroll animations, back-to-top, marquee is CSS-only, and
   the enquiry form (WhatsApp handoff + friendly confirmation).
   ========================================================= */
(function () {
  "use strict";

  var d = document;

  /* ---------------------------------------------------------
     Footer year
     --------------------------------------------------------- */
  var yearEl = d.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------- */
  var hamburger = d.getElementById("hamburger");
  var nav = d.getElementById("siteNav");
  var scrim = d.getElementById("navScrim");

  function openNav() {
    nav.classList.add("is-open");
    scrim.classList.add("is-open");
    hamburger.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    d.body.style.overflow = "hidden";
  }
  function closeNav() {
    nav.classList.remove("is-open");
    scrim.classList.remove("is-open");
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    d.body.style.overflow = "";
  }
  if (hamburger && nav && scrim) {
    hamburger.addEventListener("click", function () {
      nav.classList.contains("is-open") ? closeNav() : openNav();
    });
    scrim.addEventListener("click", closeNav);
    Array.prototype.slice.call(nav.querySelectorAll(".nav__link")).forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------------------------------------------------------
     Sticky header shrink-on-scroll
     --------------------------------------------------------- */
  var header = d.getElementById("siteHeader");
  var lastScrollTop = 0;
  function onScrollHeader() {
    var y = window.scrollY || d.documentElement.scrollTop;
    if (y > 40) {
      header.style.padding = "0";
    } else {
      header.style.padding = "";
    }
    lastScrollTop = y;
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------------------------------------------------------
     Scrollspy — highlight active nav link
     --------------------------------------------------------- */
  var sections = Array.prototype.slice.call(
    d.querySelectorAll("main section[id], main#home")
  );
  var navLinks = Array.prototype.slice.call(d.querySelectorAll(".nav__link"));

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var match = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", match);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      if (s.id) spy.observe(s);
    });
  }

  /* ---------------------------------------------------------
     Reveal-on-scroll for [data-reveal] elements
     --------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(d.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = (i % 6) * 70;
            setTimeout(function () {
              el.classList.add("is-visible");
            }, delay);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
    // Safety net: guarantee visibility even if an observer never fires
    // (e.g. an element sized 0 at load, or a rendering-engine quirk).
    setTimeout(function () {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }, 2500);
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------------------------------------------------------
     Back to top button
     --------------------------------------------------------- */
  var toTop = d.getElementById("toTop");
  if (toTop) {
    window.addEventListener(
      "scroll",
      function () {
        toTop.classList.toggle("is-visible", window.scrollY > 600);
      },
      { passive: true }
    );
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------------------------------------------------
     Contact form: friendly validation + WhatsApp handoff
     --------------------------------------------------------- */
  var form = d.getElementById("contactForm");
  var note = d.getElementById("formNote");
  var whatsappBtn = d.getElementById("whatsappSendBtn");
  var NSK_WHATSAPP_NUMBER = "919344258382";

  function readForm() {
    var data = new FormData(form);
    return {
      name: (data.get("name") || "").toString().trim(),
      phone: (data.get("phone") || "").toString().trim(),
      service: (data.get("service") || "").toString().trim(),
      message: (data.get("message") || "").toString().trim()
    };
  }

  function validate(values) {
    if (!values.name) return "Please add your name.";
    if (!values.phone || values.phone.replace(/[^0-9]/g, "").length < 7) {
      return "Please add a valid phone number.";
    }
    if (!values.service) return "Please select a service.";
    return null;
  }

  function buildWhatsAppMessage(values) {
    var lines = [
      "Hi NSK Solutions, I'd like an enquiry:",
      "Name: " + values.name,
      "Phone: " + values.phone,
      "Service: " + values.service
    ];
    if (values.message) lines.push("Details: " + values.message);
    return encodeURIComponent(lines.join("\n"));
  }

  function showNote(text, isError) {
    note.textContent = text;
    note.classList.toggle("is-error", !!isError);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var values = readForm();
      var error = validate(values);
      if (error) {
        showNote(error, true);
        return;
      }
      showNote(
        "Thanks, " + values.name.split(" ")[0] + " — we've noted your enquiry. " +
        "Call +91 93442 58382 any time, or use \u201cSend via WhatsApp\u201d to reach us instantly."
      );
      form.reset();
    });
  }

  if (whatsappBtn && form) {
    whatsappBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var values = readForm();
      var error = validate(values);
      if (error) {
        showNote(error, true);
        return;
      }
      var url =
        "https://wa.me/" + NSK_WHATSAPP_NUMBER + "?text=" + buildWhatsAppMessage(values);
      window.open(url, "_blank", "noopener");
    });
  }
})();
