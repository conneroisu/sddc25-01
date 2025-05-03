// JavaScript for sticky PDF preview functionality
document.addEventListener("DOMContentLoaded", function () {
  const pdfLinks = document.querySelectorAll(".pdf-link-container");
  const stickyPreview = document.getElementById("sticky-pdf-preview");
  const stickyIframe = document.getElementById("sticky-pdf-iframe");
  const placeholder = document.querySelector(".sticky-preview-placeholder");
  const stickyContainer = document.querySelector(".sticky-preview-container");
  const footer = document.querySelector("footer");

  // Initialize the placeholder message
  function showPlaceholder() {
    placeholder.style.display = "flex";
    stickyIframe.style.display = "none";
    stickyIframe.src = "";
  }

  function showPdfPreview(pdfUrl, linkElement) {
    if (pdfUrl) {
      // Show loading state
      stickyPreview.classList.add("loading");

      // Show the iframe and hide the placeholder
      placeholder.style.display = "none";
      stickyIframe.style.display = "block";

      // Only set the source if it's different from the current one
      if (stickyIframe.src !== pdfUrl) {
        stickyIframe.src = pdfUrl;
      }

      // Highlight the active link
      pdfLinks.forEach((l) => l.classList.remove("active-pdf"));
      if (linkElement) {
        linkElement.classList.add("active-pdf");
      }

      // Remove loading state when iframe is loaded
      stickyIframe.onload = function () {
        stickyPreview.classList.remove("loading");
      };
    }
  }

  // Initialize with placeholder
  showPlaceholder();

  // Handle hover events for PDF links
  pdfLinks.forEach((link) => {
    link.addEventListener("mouseenter", function () {
      showPdfPreview(this.getAttribute("data-pdf-url"), this);
    });
  });

  // Custom sticky implementation with precise control
  function updateStickyBehavior() {
    // Don't apply sticky behavior on small screens
    if (window.innerWidth <= 992) {
      stickyPreview.classList.remove("is-sticky");
      stickyPreview.classList.remove("at-bottom");
      return;
    }

    // Get relevant dimensions and positions
    const containerRect = stickyContainer.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();

    // Check if preview should be sticky (container is in view but not fully visible)
    if (containerRect.top < 20 && containerRect.bottom > stickyPreview.offsetHeight + 20) {
      // Ensure it doesn't overlap with the footer
      if (footerRect.top - window.innerHeight + stickyPreview.offsetHeight < 0) {
        // Near the footer, adjust position
        stickyPreview.classList.remove("is-sticky");
        stickyPreview.classList.add("at-bottom");
      } else {
        // Normal sticky behavior
        stickyPreview.classList.add("is-sticky");
        stickyPreview.classList.remove("at-bottom");
        // Update width to match container
        stickyPreview.style.width = containerRect.width + "px";
      }
    } else if (containerRect.bottom < stickyPreview.offsetHeight + 40) {
      // Near the bottom of the container
      stickyPreview.classList.remove("is-sticky");
      stickyPreview.classList.add("at-bottom");
    } else {
      // Default non-sticky state
      stickyPreview.classList.remove("is-sticky");
      stickyPreview.classList.remove("at-bottom");
      stickyPreview.style.width = "100%";
    }
  }

  // Initial position update and event binding
  updateStickyBehavior();
  window.addEventListener("scroll", updateStickyBehavior);
  window.addEventListener("resize", updateStickyBehavior);

  window.addEventListener("load", function () {
    updateStickyBehavior();
  });
});
