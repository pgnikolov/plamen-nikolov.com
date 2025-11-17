document.addEventListener("DOMContentLoaded", () => {
  // --- Utilities ---
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

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

  // --- Name typing: triggered on scroll into view ---
  const devName = document.getElementById("dev-name");
  const nameStr = "Plamen Nikolov";
  let j = 0;
  let nameTyped = false;
  function typeName() {
    if (nameTyped) return;
    nameTyped = true;
    (function tick() {
      if (j < nameStr.length) {
        devName.textContent += nameStr.charAt(j);
        j++;
        setTimeout(tick, 100);
      }
    })();
  }

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
          typeName();
        }
      }
    });

    // Reveal animations for sections/cards
    const revealTargets = gsap.utils.toArray(
      ".projects .project, .services .service, .about, .faq details, .contact, .footer"
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
    $$(".main-nav li").forEach((li) => li.classList.remove("active"));
    const link = linkById.get(id);
    if (!link) return;
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
});
