function loadBlogPosts() {
  // Check if we're on the homepage with articles section
  const articlesSection = document.querySelector("#articles #posts");
  if (articlesSection) {
    populateArticlesList(articlesSection);
  }

  // Check if we're on an article page
  const articleHeader = document.querySelector(".article-header");
  if (articleHeader) {
    populateArticleHeader(articleHeader);
  }
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

function populateArticleHeader(headerElement) {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get("id");

  if (!articleId) {
    console.warn("No article ID found");
    return;
  }

  fetch("../data/blog-posts.json")
    .then((response) => response.json())
    .then((data) => {
      const post = data.posts.find((p) => p.id === articleId);

      if (post) {
        const author = data.authors[post.authorId];

        // Update all the header elements (same as before)
        updateHeaderElements(headerElement, post, author);

        // Load the article content
        loadArticleContent(post);

        // Populate author bio
        populateAuthorBio(author);
      }
    })
    .catch((error) => {
      console.error("Error loading article data:", error);
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
      authorAvatar.src = `../${author.avatar}`;
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

    imageElement.src = `../${post.image}`;
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

function loadArticleContent(post) {
  const articleBody = document.querySelector(".article-content");

  fetch(`../content/${post.id}.md`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load content: ${response.status}`);
      }
      return response.text();
    })
    .then((markdownContent) => {
      // Use marked.js without custom renderer first
      const htmlContent = marked.parse(markdownContent);

      // Add the HTML to the page
      articleBody.innerHTML += htmlContent;

      // Post-process images to add captions
      addImageCaptions(articleBody);

      // Re-run syntax highlighting
      if (typeof hljs !== "undefined") {
        hljs.highlightAll();
      }
    })
    .catch((error) => {
      console.error("Error loading article content:", error);
      articleBody.innerHTML =
        "<p>Sorry, article content could not be loaded.</p>";
    });
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

function populateAuthorBio(author) {
  const authorBioSection = document.querySelector(".author-bio");

  if (!authorBioSection || !author) {
    return;
  }

  // Update bio avatar
  const bioAvatar = authorBioSection.querySelector(".bio-avatar");
  if (bioAvatar) {
    bioAvatar.src = `../${author.avatar}`;
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

document.addEventListener("DOMContentLoaded", function () {
  loadBlogPosts();
});
