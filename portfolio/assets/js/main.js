document.addEventListener("DOMContentLoaded", () => {
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
  gsap.registerPlugin(ScrollTrigger);
  gsap.to(".hero", {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".hero",
      start: "top 80%",
      once: true, // играе еднократно
      onEnter: () => {
        typeName(); // стартираме typing на името точно при влизане
      }
    }
  });

  // --- Custom cursor (optional, as you had) ---
  const cursor = document.querySelector(".cursor");
  if (cursor) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
    });
  }
});
