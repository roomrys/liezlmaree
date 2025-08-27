function loadTopBar(topbarPath = "topbar.html") {
  const topBarElement = document.querySelector("top-bar");

  if (topBarElement) {
    fetch(topbarPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((html) => {
        topBarElement.innerHTML = html;
      })
      .catch((error) => {
        console.error("Error loading topbar:", error);
      });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadTopBar();
});
