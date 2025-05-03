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
    pdfLinks.forEach((link) => {
      const url = link.getAttribute("data-pdf-url");
      if (url && !pdfCache.has(url)) {
        fetch(url)
          .then((response) => response.blob())
          .then((blob) => {
            pdfCache.set(url, URL.createObjectURL(blob));
          })
          .catch(() => {});
      }
    });
  }

  if ("requestIdleCallback" in window) {
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
      pdfLinks.forEach((l) => l.classList.remove("active-pdf"));
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
          .then((response) => response.blob())
          .then((blob) => {
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

  // Calculate available height for the sticky preview
  function getAvailableHeight() {
    const windowHeight = window.innerHeight;
    const footerTop = footer.getBoundingClientRect().top;
    const headerOffset = 20; // Fixed header offset
    const footerBuffer = 20; // Additional buffer for footer

    // Return height from top of viewport (plus header offset) to bottom of container (or top of footer)
    if (footerTop < windowHeight) {
      return footerTop - headerOffset - footerBuffer;
    } else {
      return windowHeight - headerOffset - footerBuffer;
    }
  }

  // Custom sticky implementation with precise control and dynamic height
  function updateStickyBehavior() {
    if (window.innerWidth <= 992) {
      stickyPreview.classList.remove("is-sticky");
      stickyPreview.classList.remove("at-bottom");
      return;
    }

    const containerRect = stickyContainer.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const availableHeight = getAvailableHeight();

    // Apply the calculated height to the sticky preview
    if (stickyPreview.classList.contains("is-sticky") || stickyPreview.classList.contains("at-bottom")) {
      stickyPreview.style.height = availableHeight + "px";
    }

    if (containerRect.top < 20 && containerRect.bottom > stickyPreview.offsetHeight + 20) {
      if (footerRect.top - window.innerHeight + stickyPreview.offsetHeight < 0) {
        // We're at the bottom of the page
        stickyPreview.classList.remove("is-sticky");
        stickyPreview.classList.add("at-bottom");
        // When at bottom, recalculate height to avoid footer overlap
        const bottomToFooter = Math.max(0, footerRect.top - containerRect.bottom);
        stickyPreview.style.height = (availableHeight + bottomToFooter) + "px";
      } else {
        // We're in the middle of the page (sticky state)
        stickyPreview.classList.add("is-sticky");
        stickyPreview.classList.remove("at-bottom");
        stickyPreview.style.width = containerRect.width + "px";
        stickyPreview.style.height = availableHeight + "px";
      }
    } else if (containerRect.bottom < stickyPreview.offsetHeight + 40) {
      // We're near the bottom of the container
      stickyPreview.classList.remove("is-sticky");
      stickyPreview.classList.add("at-bottom");
      // Adjust height to avoid footer overlap
      const bottomToFooter = Math.max(0, footerRect.top - containerRect.bottom);
      stickyPreview.style.height = (availableHeight + bottomToFooter) + "px";
    } else {
      // We're at the top of the container (normal state)
      stickyPreview.classList.remove("is-sticky");
      stickyPreview.classList.remove("at-bottom");
      stickyPreview.style.width = "100%";
      // When at top, use viewport-based height
      stickyPreview.style.height = "calc(100vh - 20px)";
    }
  }

  // Initial position update and event binding
  updateStickyBehavior();
  window.addEventListener("scroll", updateStickyBehavior);
  window.addEventListener("resize", updateStickyBehavior);

  // Recalculate on page load to ensure all elements are properly sized
  window.addEventListener("load", function () {
    updateStickyBehavior();
  });

  // Show the first PDF by default after a brief delay
  setTimeout(function() {
    const firstPdfLink = document.querySelector(".pdf-link-container");
    if (firstPdfLink) {
      showPdfPreview(firstPdfLink.getAttribute("data-pdf-url"), firstPdfLink);
    }
  }, 500);
});
// ADD TO THE END OF custom.js

// Team members interaction enhancement
document.addEventListener("DOMContentLoaded", function() {
  const teamMembers = document.querySelectorAll('.team');
  
  // Add staggered animation effect on page load
  teamMembers.forEach((member, index) => {
    setTimeout(() => {
      member.style.opacity = '1';
      member.style.transform = 'translateY(0)';
    }, 150 * index);
  });
  
  // Add hover listener for better touch device support
  teamMembers.forEach(member => {
    member.addEventListener('mouseenter', function() {
      // This helps trigger hover effects more reliably on touch devices
      this.classList.add('is-hovered');
    });
    
    member.addEventListener('mouseleave', function() {
      this.classList.remove('is-hovered');
    });
  });
  
  // Fallback for browsers that don't support object-fit (like IE)
  if ('objectFit' in document.documentElement.style === false) {
    document.querySelectorAll('.team img').forEach(img => {
      const container = img.parentElement;
      const imgUrl = img.src;
      
      if (imgUrl) {
        container.style.backgroundImage = 'url(' + imgUrl + ')';
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center top';
        img.style.opacity = 0;
      }
    });
  }
  
  // Equalize heights of team member cards if needed
  function equalizeTeamHeights() {
    if (window.innerWidth >= 768) {
      // Reset heights first
      teamMembers.forEach(member => {
        member.style.height = 'auto';
      });
      
      // Find the tallest card
      let maxHeight = 0;
      teamMembers.forEach(member => {
        const height = member.offsetHeight;
        maxHeight = Math.max(maxHeight, height);
      });
      
      // Set all cards to the height of the tallest
      if (maxHeight > 0) {
        teamMembers.forEach(member => {
          member.style.height = maxHeight + 'px';
        });
      }
    } else {
      // On mobile, let cards be their natural height
      teamMembers.forEach(member => {
        member.style.height = 'auto';
      });
    }
  }
  
  // Run on page load and resize
  window.addEventListener('load', equalizeTeamHeights);
  window.addEventListener('resize', equalizeTeamHeights);
});
