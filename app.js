/* Deuda Clara — interacciones de la landing. Sin dependencias. */
(function () {
  "use strict";

  var defaults = {
    version: "1.0.0",
    apkUrl: "descargas/deuda-clara.apk.zip",
    apkAvailable: "auto",
    apkSize: null,
    sha256: "",
    contactEmail: "",
  };

  var config = Object.assign({}, defaults, window.DEUDA_CLARA_SITE || {});
  var root = document.documentElement;

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll(selector)
    );
  }

  function setText(selector, value) {
    $$(selector).forEach(function (element) {
      element.textContent = value;
    });
  }

  /* ---------------------------------------------------------------------
     Tema claro / oscuro
     --------------------------------------------------------------------- */

  var themeQuery = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  function applyTheme(theme, persist) {
    var next = theme === "dark" ? "dark" : "light";
    root.dataset.theme = next;

    if (persist) {
      try {
        localStorage.setItem("deuda-clara-theme", next);
      } catch (error) {
        /* El almacenamiento puede estar bloqueado; el tema sigue funcionando. */
      }
    }

    $$("[data-theme-toggle]").forEach(function (button) {
      var label =
        next === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
    });

    var meta = $('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", next === "dark" ? "#07110F" : "#0B2B26");
    }
  }

  applyTheme(root.dataset.theme || "light", false);

  $$("[data-theme-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      applyTheme(
        root.dataset.theme === "dark" ? "light" : "dark",
        true
      );
    });
  });

  if (themeQuery) {
    var onSystemThemeChange = function (event) {
      var saved = null;
      try {
        saved = localStorage.getItem("deuda-clara-theme");
      } catch (error) {
        saved = null;
      }
      if (saved !== "light" && saved !== "dark") {
        applyTheme(event.matches ? "dark" : "light", false);
      }
    };

    if (typeof themeQuery.addEventListener === "function") {
      themeQuery.addEventListener("change", onSystemThemeChange);
    } else if (typeof themeQuery.addListener === "function") {
      themeQuery.addListener(onSystemThemeChange);
    }
  }

  /* ---------------------------------------------------------------------
     Encabezado y menú móvil
     --------------------------------------------------------------------- */

  var header = $("[data-header]");
  var navToggle = $("[data-nav-toggle]");
  var mobileNav = $("#menu-movil");

  function updateHeader() {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 6);
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  function closeMobileNav() {
    if (!navToggle || !mobileNav) {
      return;
    }
    navToggle.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    var label = $(".sr-only", navToggle);
    if (label) {
      label.textContent = "Abrir menú";
    }
  }

  function openMobileNav() {
    if (!navToggle || !mobileNav) {
      return;
    }
    navToggle.setAttribute("aria-expanded", "true");
    mobileNav.classList.add("is-open");
    document.body.classList.add("nav-open");
    var label = $(".sr-only", navToggle);
    if (label) {
      label.textContent = "Cerrar menú";
    }
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      if (navToggle.getAttribute("aria-expanded") === "true") {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    $$("a", mobileNav).forEach(function (link) {
      link.addEventListener("click", closeMobileNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && mobileNav.classList.contains("is-open")) {
        closeMobileNav();
        navToggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (
        mobileNav.classList.contains("is-open") &&
        !mobileNav.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        closeMobileNav();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 920) {
        closeMobileNav();
      }
    });
  }

  /* ---------------------------------------------------------------------
     Preguntas frecuentes: una abierta a la vez
     --------------------------------------------------------------------- */

  var faqItems = $$(".faq-item");

  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) {
        return;
      }
      faqItems.forEach(function (other) {
        if (other !== item && other.open) {
          other.open = false;
        }
      });
    });
  });

  /* ---------------------------------------------------------------------
     Textos de configuración
     --------------------------------------------------------------------- */

  setText("[data-version]", config.version);
  setText("[data-year]", String(new Date().getFullYear()));

  var contactEmail =
    typeof config.contactEmail === "string" ? config.contactEmail.trim() : "";

  if (contactEmail) {
    $$("[data-contact-block]").forEach(function (block) {
      block.hidden = false;
    });
    $$("[data-contact-fallback]").forEach(function (fallback) {
      fallback.hidden = true;
    });
    $$("[data-contact-email]").forEach(function (link) {
      link.textContent = contactEmail;
      link.href = "mailto:" + contactEmail;
    });
  }

  /* ---------------------------------------------------------------------
     Descarga del APK
     --------------------------------------------------------------------- */

  var downloadLinks = $$("[data-download]");
  var status = $("[data-download-status]");
  var statusText = $("[data-download-status-text]");
  var pendingNote = $("[data-download-pending]");
  var sizeWrap = $("[data-size-wrap]");
  var sizeElement = $("[data-apk-size]");
  var checksumBox = $("[data-checksum]");
  var checksumValue = $("[data-checksum-value]");
  var isDownloadReady = false;

  function formatSize(value) {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    if (typeof value === "string") {
      return value.trim();
    }

    var bytes = Number(value);
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return "";
    }

    var megabytes = bytes / (1024 * 1024);
    if (megabytes >= 1) {
      return megabytes.toFixed(1).replace(".", ",") + " MB";
    }

    return Math.max(1, Math.round(bytes / 1024)) + " KB";
  }

  function setStatus(mode, text) {
    if (!status) {
      return;
    }
    status.classList.remove("is-ready", "is-pending", "is-checking");
    status.classList.add(mode);
    if (statusText) {
      statusText.textContent = text;
    }
  }

  function setDownloadReady(size) {
    isDownloadReady = true;
    var label = "Descargar APK";
    var humanSize = formatSize(size) || formatSize(config.apkSize);

    downloadLinks.forEach(function (link) {
      link.href = config.apkUrl;
      link.removeAttribute("aria-disabled");
      link.classList.remove("is-pending");
    });

    $$("[data-download-label]").forEach(function (element) {
      element.textContent = label;
    });

    if (humanSize && sizeWrap && sizeElement) {
      sizeElement.textContent = humanSize;
      sizeWrap.hidden = false;
    }

    setStatus(
      "is-ready",
      "Listo para descargar · versión " +
        config.version +
        (humanSize ? " · " + humanSize : "")
    );

    if (pendingNote) {
      pendingNote.hidden = true;
    }

    if (config.sha256 && checksumBox && checksumValue) {
      checksumValue.textContent = config.sha256;
      checksumBox.hidden = false;
    }
  }

  function setDownloadPending(message) {
    isDownloadReady = false;

    downloadLinks.forEach(function (link) {
      link.setAttribute("aria-disabled", "true");
      link.classList.add("is-pending");
    });

    $$("[data-download-label]").forEach(function (element) {
      element.textContent = "APK en preparación";
    });

    setStatus("is-pending", message || "Disponible próximamente");

    if (pendingNote) {
      pendingNote.hidden = false;
    }
  }

  downloadLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (!isDownloadReady) {
        event.preventDefault();
      }
    });
  });

  function checkAvailability() {
    if (!downloadLinks.length) {
      return;
    }

    if (config.apkAvailable === false) {
      setDownloadPending("Disponible próximamente");
      return;
    }

    if (config.apkAvailable === true) {
      setDownloadReady(config.apkSize);
      return;
    }

    setStatus("is-checking", "Comprobando disponibilidad del APK…");

    fetch(config.apkUrl, { method: "HEAD", cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }

        var contentType = (
          response.headers.get("content-type") || ""
        ).toLowerCase();

        if (contentType.indexOf("text/html") !== -1) {
          throw new Error("La ruta devolvió HTML en lugar del APK");
        }

        var headerLength = Number(response.headers.get("content-length"));
        var size = headerLength > 0 ? headerLength : config.apkSize;
        setDownloadReady(size);
      })
      .catch(function () {
        setDownloadPending("Disponible próximamente");
      });
  }

  checkAvailability();
})();
