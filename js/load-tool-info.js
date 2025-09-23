function loadTools() {
  // Check if we're on the homepage with tools section
  const toolsSection = document.querySelector("#tools #tools-list");
  if (toolsSection) {
    populateToolsList(toolsSection);
  }
}

function populateToolsList(toolsContainer) {
  fetch("data/tools.json")
    .then((response) => response.json())
    .then((data) => {
      // Clear existing tools
      toolsContainer.innerHTML = "";

      // Filter published posts
      const publishedTools = data.tools.filter((tool) => tool.published);

      publishedTools.forEach((tool) => {
        const listItem = document.createElement("li");
        listItem.className = "hc-flexbox";

        listItem.innerHTML = `
          <div class="thumbnail vc-flexbox">
            <img src="${tool.image}" alt="${tool.title} thumbnail">
          </div>
          <div class="post-info pad-left">
            <p class="post-date">${tool.date}</p>
            <a class="post-link" href="${tool.link}">
              ${tool.title}
            </a>
            <p class="summary">
              ${tool.summary}
            </p>
          </div>
        `;

        toolsContainer.appendChild(listItem);
      });
    })
    .catch((error) => {
      console.error("Error loading tools:", error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  loadTools();
});
