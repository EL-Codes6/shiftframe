/* ==========================================================================
   FRAME//SHIFT — Boot
   Config + initializes all modules after libraries are ready.
   ========================================================================== */

const CONFIG = {
  // Set to a Formspree/Getform URL to POST directly.
  // Leave empty to fall back to a mailto: handoff (honest fallback).
  FORM_ENDPOINT: "",
  CONTACT_EMAIL: "franklinelisha73@gmail.com",
};

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function whenReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

function openModal(selector) {
  const modal = document.querySelector(selector);
  if (!modal) {
    console.error(`Cannot open modal: ${selector} was not found.`);
    return;
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");

  const video = modal.querySelector("video");
  if (video) {
    const playback = video.play();
    if (playback) {
      playback.catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Could not start the modal video:", error);
        }
      });
    }
  }
}

function closeModal(modal) {
  const video = modal.querySelector("video");
  if (video) {
    video.pause();
    video.currentTime = 0;
  }
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

function initCursor() {
  const cursor = document.querySelector(".cursor");
  const follower = document.querySelector(".cursor-follower");
  if (!cursor || !follower || window.matchMedia("(pointer: coarse)").matches) return;

  document.body.classList.add("has-custom-cursor");
  document.addEventListener("mousemove", (event) => {
    [cursor, follower].forEach((element) => {
      element.style.left = `${event.clientX}px`;
      element.style.top = `${event.clientY}px`;
      element.classList.add("is-visible");
    });
  });
  document.addEventListener("mouseleave", () => {
    cursor.classList.remove("is-visible", "is-hover");
    follower.classList.remove("is-visible");
  });

  document.querySelectorAll("a, button, [role='button']").forEach((element) => {
    element.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    element.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });
}

function initNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;

  let lastScrollY = window.scrollY;
  let updateScheduled = false;
  const updateNav = () => {
    const scrollY = window.scrollY;
    nav.classList.toggle("is-scrolled", scrollY > 20);

    if (scrollY <= 80 || scrollY < lastScrollY) {
      nav.classList.remove("is-hidden");
    } else if (scrollY > lastScrollY) {
      nav.classList.add("is-hidden");
    }

    lastScrollY = scrollY;
    updateScheduled = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (updateScheduled) return;
      updateScheduled = true;
      window.requestAnimationFrame(updateNav);
    },
    { passive: true }
  );
  updateNav();
}

function initMagnetic() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  document.querySelectorAll("[data-magnetic]").forEach((element) => {
    element.addEventListener("mousemove", (event) => {
      const bounds = element.getBoundingClientRect();
      const x = event.clientX - (bounds.left + bounds.width / 2);
      const y = event.clientY - (bounds.top + bounds.height / 2);
      element.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });
    element.addEventListener("mouseleave", () => {
      element.style.transform = "";
    });
  });
}

function initScrollProgress() {
  const progress = document.querySelector(".scroll-progress");
  if (!progress) return;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0}%`;
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function initNavActive() {
  const links = Array.from(document.querySelectorAll("[data-nav]"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (!links.length || !sections.length) return;

  const update = () => {
    let activeId = "";
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= 160) activeId = `#${section.id}`;
    });
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === activeId);
    });
  };

  window.addEventListener("scroll", update, { passive: true });
  update();
}

function initMisc() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");

  function closeMobileMenu() {
    if (nav) nav.classList.remove("is-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
    if (menu) {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("no-scroll");
  }

  window.closeMobileMenu = closeMobileMenu;

  if (toggle && menu && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = !menu.classList.contains("is-open");
      nav.classList.toggle("is-open", isOpen);
      menu.classList.toggle("is-open", isOpen);
      menu.setAttribute("aria-hidden", String(!isOpen));
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      document.body.classList.toggle("no-scroll", isOpen);
    });

    document.querySelectorAll("[data-menu-link]").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  const year = String(new Date().getFullYear());
  ["year", "yearMobile"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.textContent = year;
  });

  document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });
}

function initForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (!form) return;

  const fields = Array.from(form.querySelectorAll("input, select, textarea"));
  const validateField = (field) => {
    const valid = field.checkValidity();
    const wrapper = field.closest(".field");
    if (wrapper) wrapper.classList.toggle("is-error", !valid);
    return valid;
  };

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".field")?.classList.contains("is-error")) validateField(field);
    });
    field.addEventListener("change", () => validateField(field));
  });

  form.onsubmit = (event) => {
    event.preventDefault();
    const valid = fields.map(validateField).every(Boolean);
    if (!valid) {
      if (status) {
        status.textContent = "Please complete the highlighted fields.";
        status.className = "form__status is-error";
      }
      const firstInvalid = fields.find((field) => !field.checkValidity());
      firstInvalid?.focus();
      return;
    }

    const data = new FormData(form);
    const subject = `Project inquiry: ${data.get("projectType") || "Portfolio"}`;
    const body = [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Project type: ${data.get("projectType")}`,
      `Budget: ${data.get("budget")}`,
      "",
      data.get("message"),
    ].join("\n");

    if (status) {
      status.textContent = "Opening your email app...";
      status.className = "form__status is-ok";
    }
    window.location.href = `mailto:${CONFIG.CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
}

function initVideoPlayback() {
  const hero = document.getElementById("heroVideo");
  if (hero) {
    hero.muted = true;
    hero.addEventListener("error", () => {
      console.error("Hero video failed to load:", hero.currentSrc, hero.error);
    });

    const playHero = () => {
      const playback = hero.play();
      if (playback) {
        playback.catch((error) => {
          if (error.name !== "AbortError") {
            console.warn("Hero video autoplay was blocked:", error);
          }
        });
      }
    };

    const soundToggle = document.getElementById("heroSoundToggle");
    if (soundToggle) {
      soundToggle.addEventListener("click", () => {
        hero.muted = !hero.muted;
        const soundOn = !hero.muted;
        soundToggle.textContent = soundOn ? "Sound on" : "Sound off";
        soundToggle.setAttribute("aria-label", soundOn ? "Turn video sound off" : "Turn video sound on");
        soundToggle.setAttribute("aria-pressed", String(soundOn));
        if (soundOn) {
          hero.volume = 1;
          playHero();
        }
      });
    }

    if (hero.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      playHero();
    } else {
      hero.addEventListener("canplay", playHero, { once: true });
    }
  }

  const showreelButton = document.getElementById("showreelOpen");
  if (showreelButton) {
    showreelButton.addEventListener("click", () => openModal("#showreelModal"));
  }

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.querySelectorAll("[data-close-modal]").forEach((button) => {
      button.addEventListener("click", () => closeModal(modal));
    });
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll(".modal.is-open").forEach(closeModal);
    }
  });
}

function boot() {
  // Register ScrollTrigger if present
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Interaction initializers are supplied by an optional interactions module.
  initLenis();
  const interactionInitializers = [
    "initCursor",
    "initMagnetic",
    "initNav",
    "initScrollProgress",
    "initNavActive",
    "initForm",
    "initMisc",
    "initModals",
  ];
  const missingInitializers = interactionInitializers.filter(
    (name) => typeof window[name] !== "function" && name !== "initModals"
  );
  if (missingInitializers.length > 0) {
    console.warn(
      "Interaction features are unavailable because interactions.js is missing:",
      missingInitializers.join(", ")
    );
  }
  interactionInitializers.forEach((name) => {
    if (typeof window[name] === "function") window[name]();
  });
  initVideoPlayback();

  // Animation / data systems
  initSplitText();
  initTransition();
  initMarquees();
  renderProjects();
  initStats();
  initProcess();
  initPreloader();

  // Refresh ScrollTrigger after assets load
  window.addEventListener("load", () => {
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });
}

whenReady(boot);