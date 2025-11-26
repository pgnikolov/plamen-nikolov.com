document.addEventListener("DOMContentLoaded", () => {
  // --- Utilities ---
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // --- TextScramble (for hero name) ---
  // Lightweight text scrambling animation adapted for the hero name
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      this.update = this.update.bind(this);
    }
    setText(newText) {
      const oldText = this.el.textContent || "";
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
      this.el.innerHTML = output;
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
    if (i < fullText.length) {
      codeDisplay.textContent = fullText.slice(0, i + 1);
      Prism.highlightElement(codeDisplay);
      i++;
      setTimeout(typeCode, 35);
    }
  })();

  // --- Hero name + tagline: scramble effect triggered on scroll into view ---
  const devName = document.getElementById("dev-name");
  const nameStr = "Plamen Nikolov";
  const devTagline = document.getElementById("dev-tagline");
  const taglineStr = devTagline ? devTagline.textContent : "";
  let heroAnimated = false;

  const animateHero = () => {
    if (heroAnimated) return;
    heroAnimated = true;
    if (!devName) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      devName.textContent = nameStr;
      if (devTagline) devTagline.textContent = taglineStr;
      return;
    }

    // Prepare: clear current text so the scramble builds from empty
    devName.textContent = "";
    if (devTagline) devTagline.textContent = "";

    const fxName = new TextScramble(devName);
    const fxTag = devTagline ? new TextScramble(devTagline) : null;

    // Animate name first, then tagline shortly after
    fxName.setText(nameStr).then(() => {
      if (fxTag && taglineStr) {
        setTimeout(() => fxTag.setText(taglineStr), 200);
      }
    });
  };

  // --- GSAP reveal .hero only when scrolled into view ---
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(".hero", {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".hero",
        start: "top 80%",
        once: true,
        onEnter: () => {
          animateHero();
        }
      }
    });

    // Reveal animations for sections/cards
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

  // Fallback: If GSAP/ScrollTrigger isn't available, animate when hero is visible using IntersectionObserver
  if (!window.gsap || !window.ScrollTrigger) {
    const hero = $(".hero");
    if (hero) {
      const ioName = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateHero();
            obs.disconnect();
          }
        });
      }, { threshold: 0.5 });
      ioName.observe(hero);
    } else {
      // As a last resort, run after a tiny delay
      setTimeout(animateHero, 600);
    }
  }

  // --- Custom cursor (optional, as you had) ---
  const cursor = document.querySelector(".cursor");
  if (cursor) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
    });
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
    if ("IntersectionObserver" in window) {
      const io2 = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) countTo(e.target.querySelector('.num') || e.target);
          });
        },
        { threshold: 0.6 }
      );

      // --- Gentle background parallax (2–3%) to add depth ---
      (function initParallax() {
        const bg = document.querySelector('.bg-svg');
        if (!bg) return;

        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        // Use GSAP ScrollTrigger if available for smooth, scrubbed parallax
        if (window.gsap && window.ScrollTrigger) {
          gsap.registerPlugin(ScrollTrigger);
          // Move subtly opposite to scroll (max about 2vw/3vh over full page)
          gsap.to(bg, {
            xPercent: -2, // ~2% of viewport width
            yPercent: -3, // ~3% of viewport height
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

        // Vanilla fallback: translate based on page scroll progress
        let ticking = false;
        const maxX = () => window.innerWidth * 0.02;  // 2% of viewport width
        const maxY = () => window.innerHeight * 0.03; // 3% of viewport height

        const update = () => {
          const doc = document.documentElement;
          const maxScroll = doc.scrollHeight - window.innerHeight;
          const p = maxScroll > 0 ? (window.scrollY || doc.scrollTop) / maxScroll : 0;
          const x = -maxX() * p;
          const y = -maxY() * p;
          bg.style.transform = `translate3d(${x}px, ${y}px, 0)`;
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
      $$(".stats .stat").forEach((box) => io2.observe(box));
    } else {
      // Fallback: set immediately
      counters.forEach((el) => {
        el.textContent = el.getAttribute("data-target") || "0";
      });
    }
  }
});
