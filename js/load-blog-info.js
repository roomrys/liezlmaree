function loadBlogPosts() {
  // Check if we're on the homepage with articles section
  const articlesSection = document.querySelector("#articles #posts");
  if (articlesSection) {
    populateArticlesList(articlesSection);
  }

  // Check if we're on an article page
  const articleHeader = document.querySelector(".article-header");
  if (articleHeader) {
    // Keep container hidden initially
    showLoadingSpinner();
    populateArticleHeader(articleHeader);
  }
}

function showLoadingSpinner() {
  const container = document.querySelector(".container");
  const spinner = document.querySelector(".css-spinner");

  if (container) {
    container.classList.remove("content-loaded");
  }
  if (spinner) {
    spinner.classList.remove("hidden");
  }
}

function hideLoadingSpinner() {
  const container = document.querySelector(".container");
  const spinner = document.querySelector(".css-spinner");

  // Add a small delay to ensure content is fully rendered
  setTimeout(() => {
    if (container) {
      container.classList.add("content-loaded");
    }
    if (spinner) {
      spinner.classList.add("hidden");
    }
  }, 200);
}

function populateAuthorBio(author) {
  const authorBioSection = document.querySelector(".author-bio");

  if (!authorBioSection || !author) {
    return;
  }

  // Update bio avatar
  const bioAvatar = authorBioSection.querySelector(".bio-avatar");
  if (bioAvatar) {
    bioAvatar.src = `./${author.avatar}`;
    bioAvatar.alt = author.name;
  }

  // Update bio name
  const bioName = authorBioSection.querySelector(".bio-content h3");
  if (bioName) {
    bioName.textContent = `About ${author.name}`;
  }

  // Update bio description
  const bioDescription = authorBioSection.querySelector(".bio-content p");
  if (bioDescription) {
    bioDescription.textContent = author.bio;
  }

  // Update bio links
  const bioLinks = authorBioSection.querySelector(".bio-links");
  if (bioLinks && author.links) {
    bioLinks.innerHTML = "";

    // Add each social link
    if (author.links.email) {
      const emailLink = document.createElement("a");
      emailLink.href = `mailto:${author.links.email}`;
      emailLink.textContent = "Email";
      bioLinks.appendChild(emailLink);
    }

    if (author.links.linkedin) {
      const linkedinLink = document.createElement("a");
      linkedinLink.href = author.links.linkedin;
      linkedinLink.textContent = "LinkedIn";
      linkedinLink.target = "_blank";
      bioLinks.appendChild(linkedinLink);
    }

    if (author.links.github) {
      const githubLink = document.createElement("a");
      githubLink.href = author.links.github;
      githubLink.textContent = "GitHub";
      githubLink.target = "_blank";
      bioLinks.appendChild(githubLink);
    }

    if (author.links.website) {
      const websiteLink = document.createElement("a");
      websiteLink.href = author.links.website;
      websiteLink.textContent = "Website";
      websiteLink.target = "_blank";
      bioLinks.appendChild(websiteLink);
    }
  }
}

function populateArticleHeader(headerElement) {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get("id") || getArticleIdFromPath();

  if (!articleId) {
    console.warn("No article ID found");
    hideLoadingSpinner();
    return;
  }

  fetch("./data/blog-posts.json")
    .then((response) => response.json())
    .then((data) => {
      const post = data.posts.find((p) => p.id === articleId);

      if (post) {
        const author = data.authors ? data.authors[post.authorId] : null;

        // Update all the header elements
        updateHeaderElements(headerElement, post, author);

        // Load the article content
        loadArticleContent(post).finally(() => {
          // Hide loading spinner after content is loaded
          hideLoadingSpinner();
        });

        // Populate author bio
        if (typeof populateAuthorBio === "function") {
          populateAuthorBio(author);
        }
      } else {
        console.error("Post not found:", articleId);
        hideLoadingSpinner();
      }
    })
    .catch((error) => {
      console.error("Error loading article data:", error);
      hideLoadingSpinner();
    });
}

function loadArticleContent(post) {
  return new Promise((resolve, reject) => {
    const articleBody = document.querySelector(".article-content");

    if (!post.id) {
      console.warn("No content file specified");
      resolve();
      return;
    }

    fetch(`./content/${post.id}.md`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }
        return response.text();
      })
      .then((markdownContent) => {
        // Convert markdown to HTML
        const htmlContent = marked.parse(markdownContent);

        // Add the HTML to the page
        const summaryDiv = articleBody.querySelector(".article-summary");
        if (summaryDiv) {
          summaryDiv.insertAdjacentHTML("afterend", htmlContent);
        } else {
          articleBody.innerHTML += htmlContent;
        }

        // Post-process images to add captions
        addImageCaptions(articleBody);

        // Re-run syntax highlighting
        if (typeof hljs !== "undefined") {
          hljs.highlightAll();
        }

        // Render math equations with KaTeX
        if (typeof renderMathInElement !== "undefined") {
          renderMathInElement(articleBody, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
              { left: "\\[", right: "\\]", display: true },
              { left: "\\(", right: "\\)", display: false },
            ],
            throwOnError: false,
          });
        }

        resolve();
      })
      .catch((error) => {
        console.error("Error loading article content:", error);
        articleBody.innerHTML +=
          "<p>Sorry, article content could not be loaded.</p>";
        reject(error);
      });
  });
}

function populateArticlesList(postsContainer) {
  fetch("data/blog-posts.json")
    .then((response) => response.json())
    .then((data) => {
      // Clear existing posts
      postsContainer.innerHTML = "";

      // Filter published posts
      const publishedPosts = data.posts.filter((post) => post.published);

      publishedPosts.forEach((post) => {
        const listItem = document.createElement("li");
        listItem.className = "hc-flexbox";

        listItem.innerHTML = `
          <div class="thumbnail vc-flexbox">
            <img src="${post.image}" alt="${post.title} thumbnail">
          </div>
          <div class="post-info pad-left">
            <p class="post-date">${post.date}</p>
            <a class="post-link" href="article_template.html?id=${post.id}">
              ${post.title}
            </a>
            <p class="summary">
              ${post.summary}
            </p>
          </div>
        `;

        postsContainer.appendChild(listItem);
      });
    })
    .catch((error) => {
      console.error("Error loading blog posts:", error);
    });
}

function updateHeaderElements(headerElement, post, author) {
  // Update breadcrumb
  const breadcrumbSpan = headerElement.querySelector(".breadcrumb span");
  if (breadcrumbSpan) {
    breadcrumbSpan.textContent = post.title;
  }

  // Update title
  const titleElement = headerElement.querySelector(".article-title");
  if (titleElement) {
    titleElement.textContent = post.title;
    document.title = `${post.title} - liezlmaree`;
  }

  // Update author info
  if (author) {
    const authorAvatar = headerElement.querySelector(".author-avatar");
    const authorName = headerElement.querySelector(".author-name");

    if (authorAvatar) {
      authorAvatar.src = `./${author.avatar}`;
      authorAvatar.alt = author.name;
    }

    if (authorName) {
      authorName.textContent = author.name;
    }
  }

  // Update date
  const dateElement = headerElement.querySelector(".post-date");
  if (dateElement) {
    dateElement.textContent = `${post.date} • ${post.readTime}`;
  }

  // Update image
  const imageElement = headerElement.querySelector(".article-image img");
  const imageContainer = headerElement.querySelector(".article-image");
  if (imageElement && imageContainer) {
    imageElement.onload = function () {
      imageElement.classList.add("loaded");
      imageContainer.classList.add("loaded");
    };

    imageElement.onerror = function () {
      imageContainer.style.display = "none";
    };

    imageElement.src = `./${post.image}`;
    imageElement.alt = `${post.title} hero image`;
  }

  // Update tags
  const tagsContainer = headerElement.querySelector(".article-tags");
  if (tagsContainer) {
    tagsContainer.innerHTML = "";
    post.tags.forEach((tag, index) => {
      const tagSpan = document.createElement("span");
      tagSpan.className = "tag";
      tagSpan.textContent = tag;
      tagsContainer.appendChild(tagSpan);

      if (index < post.tags.length - 1) {
        const separator = document.createElement("span");
        separator.className = "tag-separator";
        separator.textContent = ", ";
        tagsContainer.appendChild(separator);
      }
    });
  }

  // Update summary
  const summaryElement = document.querySelector(".article-summary p");
  if (summaryElement) {
    summaryElement.textContent = post.summary;
  }
}

function addImageCaptions(container) {
  const images = container.querySelectorAll("img");

  images.forEach((img) => {
    const title = img.getAttribute("title");
    if (title) {
      // Create figure wrapper
      const figure = document.createElement("figure");
      figure.className = "image-figure";

      // Move image into figure
      img.parentNode.insertBefore(figure, img);
      figure.appendChild(img);

      // Add caption
      const caption = document.createElement("figcaption");
      caption.className = "image-caption";
      caption.textContent = title;
      figure.appendChild(caption);

      // Add class to image
      img.classList.add("article-content-image");

      // Remove title attribute to avoid tooltip
      img.removeAttribute("title");
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  loadBlogPosts();
});
