// JavaScript for sticky PDF preview functionality
document.addEventListener("DOMContentLoaded", function () {
  const pdfLinks = document.querySelectorAll(".pdf-link-container");
  const stickyPreview = document.getElementById("sticky-pdf-preview");
  const stickyIframe = document.getElementById("sticky-pdf-iframe");
  const placeholder = document.querySelector(".sticky-preview-placeholder");
  const stickyContainer = document.querySelector(".sticky-preview-container");
  const footer = document.querySelector("footer");

  // Cache for fetched PDF blobs
  const pdfCache = new Map();

  // Prefetch PDFs during idle time to improve Chrome performance
  function prefetchAllPdfs() {
    pdfLinks.forEach(link => {
      const url = link.getAttribute('data-pdf-url');
      if (url && !pdfCache.has(url)) {
        fetch(url)
          .then(response => response.blob())
          .then(blob => {
            pdfCache.set(url, URL.createObjectURL(blob));
          })
          .catch(() => {});
      }
    });
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(prefetchAllPdfs);
  } else {
    setTimeout(prefetchAllPdfs, 2000);
  }

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

      // Hide placeholder and show iframe
      placeholder.style.display = "none";
      stickyIframe.style.display = "block";

      // Highlight the active link immediately
      pdfLinks.forEach(l => l.classList.remove("active-pdf"));
      if (linkElement) {
        linkElement.classList.add("active-pdf");
      }

      if (pdfCache.has(pdfUrl)) {
        // Use cached blob URL for fast load
        stickyIframe.src = pdfCache.get(pdfUrl);
        stickyPreview.classList.remove("loading");
      } else {
        // Fetch PDF, cache blob URL, then display
        fetch(pdfUrl)
          .then(response => response.blob())
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            pdfCache.set(pdfUrl, blobUrl);
            stickyIframe.src = blobUrl;
          })
          .catch(() => {
            // On error, fallback to direct URL
            stickyIframe.src = pdfUrl;
          })
          .finally(() => {
            stickyPreview.classList.remove("loading");
          });
      }

      // Also clear loading state on load
      stickyIframe.onload = function () {
        stickyPreview.classList.remove("loading");
      };
    }
  }

  // Handle hover events for PDF links
  pdfLinks.forEach((link) => {
    link.addEventListener("mouseenter", function () {
      showPdfPreview(this.getAttribute("data-pdf-url"), this);
    });
  });

  // Custom sticky implementation with precise control
  function updateStickyBehavior() {
    if (window.innerWidth <= 992) {
      stickyPreview.classList.remove("is-sticky");
      stickyPreview.classList.remove("at-bottom");
      return;
    }

    const containerRect = stickyContainer.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();

    if (containerRect.top < 20 && containerRect.bottom > stickyPreview.offsetHeight + 20) {
      if (footerRect.top - window.innerHeight + stickyPreview.offsetHeight < 0) {
        stickyPreview.classList.remove("is-sticky");
        stickyPreview.classList.add("at-bottom");
      } else {
        stickyPreview.classList.add("is-sticky");
        stickyPreview.classList.remove("at-bottom");
        stickyPreview.style.width = containerRect.width + "px";
      }
    } else if (containerRect.bottom < stickyPreview.offsetHeight + 40) {
      stickyPreview.classList.remove("is-sticky");
      stickyPreview.classList.add("at-bottom");
    } else {
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
