document.addEventListener("DOMContentLoaded", () => {
  // --- Typing name ---
  const devName = document.getElementById("dev-name");
  const text = "Plamen Nikolov";
  let i = 0;

  function typeWriter() {
    if (i < text.length) {
      devName.textContent += text.charAt(i);
      i++;
      setTimeout(typeWriter, 100);
    }
  }
  typeWriter();

  // --- Code intro typing ---
  const codeDisplay = document.getElementById("code-display");
  const codeLines = [
    "class PlamenNikolov(Developer):",
    "    def __init__(self):",
    '        self.role = "Python Developer"',
    '        self.focus = ["Flask", "AI", "Web Automation"]',
    '        self.location = "Netherlands"'
  ];

  let fullText = codeLines.join("\n");
  let index = 0;

  function typeEffect() {
    if (index < fullText.length) {
      codeDisplay.textContent = fullText.slice(0, index + 1);
      Prism.highlightElement(codeDisplay);
      index++;
      setTimeout(typeEffect, 35);
    }
  }
  typeEffect();

  // --- Custom cursor ---
  const cursor = document.querySelector(".cursor");
  document.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
  });
});
