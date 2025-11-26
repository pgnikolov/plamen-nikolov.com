document.addEventListener("DOMContentLoaded", () => {
  // --- Utilities ---
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- TextScramble helper for hero copy ---
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      this.update = this.update.bind(this);
    }
    setText(newText) {
      const oldText = this.el?.textContent || "";
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => (this.resolve = resolve));
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 40);
        const end = start + Math.floor(Math.random() * 40);
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }
    update() {
      let output = '';
      let complete = 0;
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span class="dud">${char}</span>`;
        } else {
          output += from;
        }
      }
      if (this.el) this.el.innerHTML = output;
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }
    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }

  // --- Code intro typing (leave as is) ---
  const codeDisplay = document.getElementById("code-display");
  const codeLines = [
    "class PlamenNikolov(Developer):",
    "    def __init__(self):",
    '        self.role = "Python Developer"',
    '        self.focus = ["Flask", "AI", "Web Automation"]',
    '        self.location = "Netherlands"'
  ];
  const fullText = codeLines.join("\n");
  let i = 0;
  (function typeCode() {
    if (!codeDisplay) return;
    if (i < fullText.length) {
      codeDisplay.textContent = fullText.slice(0, i + 1);
      i++;
      setTimeout(typeCode, 35);
    } else {
      // Highlight once after typing completes to avoid repeated heavy work
      if (window.Prism && typeof Prism.highlightElement === 'function') {
        // Use requestIdleCallback when available to keep typing smooth
        const run = () => Prism.highlightElement(codeDisplay);
        if ('requestIdleCallback' in window) {
          requestIdleCallback(run, { timeout: 500 });
        } else {
          requestAnimationFrame(run);
        }
      }
    }
  })();

  // --- Hero text scramble animation ---
  const devName = document.getElementById("dev-name");
  const devTagline = document.getElementById("dev-tagline");
  const nameStr = devName?.textContent || "";
  const taglineStr = devTagline?.textContent || "";
  let heroAnimated = false;

  const animateHero = () => {
    if (heroAnimated) return;
    heroAnimated = true;
    if (prefersReducedMotion) {
      if (devName) devName.textContent = nameStr;
      if (devTagline) devTagline.textContent = taglineStr;
      return;
    }
    if (devName) devName.textContent = "";
    if (devTagline) devTagline.textContent = "";
    const fxName = devName ? new TextScramble(devName) : null;
    const fxTag = devTagline ? new TextScramble(devTagline) : null;
    fxName?.setText(nameStr).then(() => {
      if (fxTag && taglineStr) {
        setTimeout(() => fxTag.setText(taglineStr), 200);
      }
    });
  };

  // --- GSAP reveal .hero only when scrolled into view ---
  const heroEl = $(".hero");
  const canUseGsap = Boolean(window.gsap && window.ScrollTrigger && heroEl && !prefersReducedMotion);

  if (canUseGsap) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.set(".hero", { opacity: 0, y: 100 });
    gsap.to(".hero", {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".hero",
        start: "top 80%",
        once: true,
        onEnter: () => animateHero()
      }
    });

    // Reveal animations for sections/cards
    if (!prefersReducedMotion) {
      const revealTargets = gsap.utils.toArray(
        ".projects .project, .services .service, .about, .stats .stat, .faq details, .contact, .footer"
      );
      revealTargets.forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true
          }
        });
      });
    }
  } else if (!prefersReducedMotion && heroEl && "IntersectionObserver" in window) {
    const ioHero = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateHero();
          obs.disconnect();
        }
      });
    }, { threshold: 0.5 });
    ioHero.observe(heroEl);
  } else {
    animateHero();
  }

  // --- Custom cursor (optional, as you had) ---
  const cursor = document.querySelector(".cursor");
  if (cursor) {
    if (prefersReducedMotion) {
      cursor.remove();
    } else {
      let rafPending = false;
      let lastX = 0, lastY = 0;
      const render = () => {
        rafPending = false;
        cursor.style.transform = `translate(${lastX - 10}px, ${lastY - 10}px)`;
      };
      document.addEventListener("mousemove", (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        if (!rafPending) {
          rafPending = true;
          requestAnimationFrame(render);
        }
      }, { passive: true });
    }
  }

  // --- Footer year ---
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Active nav item on scroll ---
  const navLinks = $$(".main-nav a");
  const sections = $$("section[id]");
  const linkById = new Map();
  navLinks.forEach((a) => {
    const id = (a.getAttribute("href") || "").replace("#", "");
    if (id) linkById.set(id, a);
  });

  const setActive = (id) => {
    const link = linkById.get(id);
    if (!link) return; // only update when section exists in navbar
    $$(".main-nav li").forEach((li) => li.classList.remove("active"));
    const li = link.closest("li");
    if (li) li.classList.add("active");
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { threshold: 0.6 }
  );
  sections.forEach((sec) => io.observe(sec));

  // --- Smooth scroll for nav links (enhanced) ---
  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // --- Theme toggle (dark/light) ---
  const themeBtn = $("#theme-toggle");
  const root = document.documentElement;
  const applyThemeIcon = () => {
    if (!themeBtn) return;
    const icon = themeBtn.querySelector("i");
    const isLight = root.getAttribute("data-theme") === "light";
    if (icon) {
      icon.classList.toggle("fa-moon", !isLight);
      icon.classList.toggle("fa-sun", isLight);
    }
    themeBtn.setAttribute("aria-pressed", String(isLight));
    themeBtn.title = isLight ? "Switch to dark" : "Switch to light";
  };
  // Initialize theme from storage or OS preference
  const stored = localStorage.getItem("theme");
  if (stored === "light") {
    root.setAttribute("data-theme", "light");
  } else if (stored === "dark") {
    root.removeAttribute("data-theme");
  } else {
    // Respect OS preference if no stored choice
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }
  applyThemeIcon();
  themeBtn?.addEventListener("click", () => {
    const isLight = root.getAttribute("data-theme") === "light";
    if (isLight) {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
    applyThemeIcon();
  });

  // --- Scroll to top button ---
  const scrollTopBtn = $("#scrollTop");
  const onScroll = () => {
    if (!scrollTopBtn) return;
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add("show");
    } else {
      scrollTopBtn.classList.remove("show");
    }
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  scrollTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // --- Animated stats counters ---
  const counters = $$(".stat .num");
  const counted = new WeakSet();
  function countTo(el) {
    if (!el || counted.has(el)) return;
    counted.add(el);
    const target = parseInt(el.getAttribute("data-target"), 10) || 0;
    const duration = 1200;
    const start = performance.now();
    const from = 0;
    function frame(t) {
      const p = Math.min(1, (t - start) / duration);
      const val = Math.floor(from + (target - from) * (p < 0 ? 0 : p));
      el.textContent = String(val);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (counters.length) {
    if (prefersReducedMotion) {
      counters.forEach((el) => {
        el.textContent = el.getAttribute("data-target") || "0";
      });
    } else if ("IntersectionObserver" in window) {
      const io2 = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const targetEl = entry.target.querySelector('.num') || entry.target;
              countTo(targetEl);
              io2.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      $$(".stats .stat").forEach((box) => io2.observe(box));
    } else {
      // Fallback: set immediately
      counters.forEach((el) => {
        el.textContent = el.getAttribute("data-target") || "0";
      });
    }
  }

  // --- Gentle background parallax (2–3%) to add depth ---
  (function initParallax() {
    const bg = document.querySelector('.bg-svg');
    if (!bg || prefersReducedMotion) return;

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.to(bg, {
        yPercent: -3,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      });
      return;
    }

    let ticking = false;
    const maxY = () => window.innerHeight * 0.03;
    const update = () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      const p = maxScroll > 0 ? (window.scrollY || doc.scrollTop) / maxScroll : 0;
      const y = -maxY() * p;
      bg.style.transform = `translate3d(0px, ${y}px, 0)`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => update());
    update();
  })();
});
