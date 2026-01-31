const toggleBtn = document.getElementById("theme-toggle");
if (!toggleBtn) throw new Error("Theme toggle button not found");

const logo = document.getElementById("logo");

// Set random state class on logo
if (logo) {
  const stateClasses = ["correct", "misplaced-both", "misplaced-row", "misplaced-col"];
  const randomClass = stateClasses[Math.floor(Math.random() * stateClasses.length)];
  logo.classList.add(randomClass);
}

// Generate favicon matching the logo
function updateFavicon() {
  if (!logo) return;

  // Double rAF ensures styles are fully recalculated after class toggle
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const logoStyles = getComputedStyle(logo);
      const rootStyles = getComputedStyle(document.documentElement);
      const bgColor = logoStyles.backgroundColor;
      const textColor = rootStyles.getPropertyValue("--text-color").trim();
      const borderColor = rootStyles.getPropertyValue("--cell-border").trim();

      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Border
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, 64, 64);

        // Background (inset for border effect)
        const borderWidth = 4;
        ctx.fillStyle = bgColor;
        ctx.fillRect(borderWidth, borderWidth, 64 - borderWidth * 2, 64 - borderWidth * 2);

        // Letter "T"
        ctx.fillStyle = textColor;
        ctx.font = "bold 40px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("T", 32, 34);

        // Set as favicon
        let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = canvas.toDataURL("image/png");
      }
    });
  });
}

// Initial favicon
updateFavicon();

// Toggle function
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  updateFavicon();
}

// Button click
toggleBtn.addEventListener("click", toggleTheme);
