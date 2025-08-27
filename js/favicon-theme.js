function setFavicon() {
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Remove existing favicon
  const existingFavicon = document.querySelector('link[rel="icon"]');
  if (existingFavicon) {
    existingFavicon.remove();
  }

  // Create new favicon
  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.href = isDarkMode ? "./assets/lm-magenta.png" : "./assets/lm.png";

  document.head.appendChild(favicon);
}

// Set favicon on load
document.addEventListener("DOMContentLoaded", setFavicon);

// Listen for theme changes
if (window.matchMedia) {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", setFavicon);
}
