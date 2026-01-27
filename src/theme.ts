const toggleBtn = document.getElementById("theme-toggle");
if (!toggleBtn) throw new Error("Theme toggle button not found");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// Toggle function
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

// Button click
toggleBtn.addEventListener("click", toggleTheme);
