(function () {
  // Configuration options
  const config = {
    previewWidth: 400,
    previewHeight: 300,
    previewOffset: 20,
    previewDelay: 300,
    hideDelay: 800,
    useThumbnails: true,
    defaultThumbnail: "images/pdf-icon.png",
    pdfIndicator: true,
    tooltipText: "Hover to preview",
    bufferZone: 30,
  };

  // Track state
  let activePreview = null;
  let isMouseOverPreview = false;
  let isMouseOverLink = false;
  let hidePreviewTimer = null;

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAll);
  } else {
    initializeAll();
  }

  // Main initialization function for all preview functionality
  function initializeAll() {
    // Add CSS styles
    injectStyles();

    // Setup PDF links
    setupPdfLinks();

    // Setup weekly reports preview
    setupWeeklyReportsPreview();

    // Global event listeners
    document.addEventListener("click", handleGlobalClick);
    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("scroll", handleWindowScroll);
    document.addEventListener("mousemove", handleGlobalMouseMove);
  }

  // Inject required CSS styles
  function injectStyles() {
    const css = `
      .pdf-link-wrapper {
        display: inline-block;
        position: relative;
      }

      .pdf-link {
        color: #c8102e;
        text-decoration: none;
        position: relative;
        cursor: pointer;
      }

      .pdf-link:hover {
        text-decoration: underline;
      }

      .pdf-indicator {
        font-size: 0.8em;
        color: #666;
        margin-left: 5px;
        cursor: help;
      }

      .pdf-preview-container {
        position: absolute;
        z-index: 1000;
        background: white;
        border: 1px solid #ccc;
        box-shadow: 0 3px 8px rgba(0,0,0,0.25);
        border-radius: 4px;
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
      }

      .pdf-preview-container.visible {
        opacity: 1;
        visibility: visible;
      }

      .pdf-preview-header {
        padding: 6px 10px;
        background: #f5f5f5;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
      }

      .pdf-preview-title {
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 300px;
      }

      .pdf-preview-close {
        cursor: pointer;
        font-weight: bold;
        color: #666;
        padding: 0 4px;
      }

      .pdf-preview-close:hover {
        color: #000;
      }

      .pdf-preview-content {
        height: ${config.previewHeight - 30}px;
        width: ${config.previewWidth}px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f9f9f9;
      }

      .pdf-preview-iframe {
        width: 100%;
        height: 100%;
        border: none;
      }

      .pdf-preview-thumbnail {
        max-width: 100%;
        max-height: 100%;
        display: block;
      }

      .pdf-preview-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        color: #666;
      }

      .pdf-preview-spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #c8102e;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
        margin-bottom: 10px;
      }

      .pdf-preview-error {
        text-align: center;
        padding: 20px;
        color: #666;
        font-size: 13px;
      }

      .pdf-preview-placeholder {
        width: 64px;
        height: 64px;
        margin-bottom: 10px;
      }

      .pdf-preview-footer {
        padding: 6px 10px;
        background: #f5f5f5;
        border-top: 1px solid #ddd;
        font-size: 11px;
        text-align: center;
        color: #666;
      }

      .pdf-preview-buffer {
        position: absolute;
        background: transparent;
        pointer-events: none;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @media (max-width: 768px) {
        .pdf-preview-container {
          position: fixed;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%);
          width: 90vw;
          max-width: ${config.previewWidth}px;
        }

        .pdf-preview-content {
          width: 100%;
        }
      }
    `;

    const styleElement = document.createElement("style");
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
  }

  // Find and enhance all PDF links
  function setupPdfLinks() {
    // Select all links ending with .pdf
    const pdfLinks = document.querySelectorAll('a[href$=".pdf"]:not(.pdf-link)');

    pdfLinks.forEach((link, index) => {
      // Skip if already processed
      if (link.closest(".pdf-link-wrapper")) {
        return;
      }

      const pdfUrl = link.getAttribute("href");
      const linkText = link.textContent.trim();

      // Create wrapper element
      const wrapper = document.createElement("span");
      wrapper.className = "pdf-link-wrapper";
      wrapper.setAttribute("data-pdf-url", pdfUrl);
      wrapper.setAttribute("data-pdf-id", `pdf-${index}`);
      wrapper.setAttribute("title", config.tooltipText);

      // Create enhanced link
      const enhancedLink = document.createElement("a");
      enhancedLink.href = pdfUrl;
      enhancedLink.className = "pdf-link";
      enhancedLink.textContent = linkText;

      // Add PDF indicator if enabled
      if (config.pdfIndicator) {
        const indicator = document.createElement("span");
        indicator.className = "pdf-indicator";
        indicator.textContent = "[PDF]";
        wrapper.appendChild(enhancedLink);
        wrapper.appendChild(indicator);
      } else {
        wrapper.appendChild(enhancedLink);
      }

      // Replace original link with wrapper
      link.parentNode.replaceChild(wrapper, link);

      // Add event listeners
      wrapper.addEventListener("mouseenter", function () {
        handlePdfLinkHover(this);
      });

      wrapper.addEventListener("mouseleave", function () {
        isMouseOverLink = false;
        scheduleHidePreviewIfNeeded();
      });

      wrapper.addEventListener("touchstart", function (event) {
        handlePdfLinkTouch(event, this);
      });
    });
  }

  // Setup weekly reports preview functionality
  function setupWeeklyReportsPreview() {
    const previewContainer = document.querySelector(".weekly-reports-preview-container");
    const previewPlaceholder = document.querySelector(".preview-placeholder");
    const previewFrame = document.getElementById("weekly-report-preview-frame");

    if (previewContainer && previewPlaceholder && previewFrame) {
      // Get all weekly report rows
      const reportRows = document.querySelectorAll(".reports-table tbody tr");

      // Add event listeners to each row
      reportRows.forEach((row) => {
        row.addEventListener("mouseenter", function () {
          const pdfUrl = this.getAttribute("data-report-url");
          if (pdfUrl) {
            // Show the preview
            previewFrame.src = pdfUrl;
            previewPlaceholder.style.zIndex = 0;
            previewFrame.parentElement.style.zIndex = 1;
          }
        });

        // Make the entire row clickable to open the PDF
        row.addEventListener("click", function () {
          const pdfUrl = this.getAttribute("data-report-url");
          if (pdfUrl) {
            window.open(pdfUrl, "_blank");
          }
        });
      });
    }
  }

  // Handle hovering over PDF link
  function handlePdfLinkHover(wrapper) {
    isMouseOverLink = true;
    clearTimeout(hidePreviewTimer);

    const pdfUrl = wrapper.getAttribute("data-pdf-url");
    const pdfId = wrapper.getAttribute("data-pdf-id");

    // Don't create multiple previews of the same PDF
    if (activePreview && activePreview.id === pdfId + "-preview") {
      return;
    }

    // Hide any existing preview if showing a different one
    if (activePreview) {
      hidePreviewImmediately(activePreview);
    }

    // Create new preview with delay
    setTimeout(() => {
      if (isMouseOverLink) {
        createPreviewContainer(wrapper, pdfUrl, pdfId);
      }
    }, config.previewDelay);
  }

  // Schedule hiding the preview after a delay if mouse is not over link or preview
  function scheduleHidePreviewIfNeeded() {
    clearTimeout(hidePreviewTimer);

    if (!isMouseOverLink && !isMouseOverPreview && activePreview) {
      hidePreviewTimer = setTimeout(() => {
        if (!isMouseOverLink && !isMouseOverPreview && activePreview) {
          hidePreview(activePreview);
        }
      }, config.hideDelay);
    }
  }

  // Handle global mouse movement to track mouse position
  function handleGlobalMouseMove(event) {
    if (!activePreview) return;

    // Check if mouse is over the active preview
    const previewRect = activePreview.getBoundingClientRect();
    const buffer = config.bufferZone;

    // Expand the detection area with the buffer zone
    isMouseOverPreview =
      event.clientX >= previewRect.left - buffer &&
      event.clientX <= previewRect.right + buffer &&
      event.clientY >= previewRect.top - buffer &&
      event.clientY <= previewRect.bottom + buffer;

    // If mouse moved out of both link and preview, schedule hiding
    if (!isMouseOverLink && !isMouseOverPreview) {
      scheduleHidePreviewIfNeeded();
    } else {
      // Mouse is over either link or preview, cancel any pending hide
      clearTimeout(hidePreviewTimer);
    }
  }

  // Handle touch on PDF link for mobile
  function handlePdfLinkTouch(event, wrapper) {
    // Prevent default only if we're showing a preview
    const pdfId = wrapper.getAttribute("data-pdf-id");
    const previewElement = document.getElementById(pdfId + "-preview");

    if (!previewElement) {
      // Show preview on first touch
      event.preventDefault();
      createPreviewContainer(wrapper, wrapper.getAttribute("data-pdf-url"), pdfId);
    }
    // Otherwise let the link work normally on second touch
  }

  // Create the preview container
  function createPreviewContainer(wrapper, pdfUrl, pdfId) {
    // Remove any existing preview first
    const existingPreview = document.getElementById(pdfId + "-preview");
    if (existingPreview) {
      existingPreview.remove();
    }

    // Extract filename for title
    const filename = pdfUrl.split("/").pop();

    // Create preview container
    const previewContainer = document.createElement("div");
    previewContainer.id = pdfId + "-preview";
    previewContainer.className = "pdf-preview-container";

    // Track this as the active preview
    activePreview = previewContainer;

    // Create preview header
    const header = document.createElement("div");
    header.className = "pdf-preview-header";

    const title = document.createElement("div");
    title.className = "pdf-preview-title";
    title.textContent = filename;

    const closeButton = document.createElement("div");
    closeButton.className = "pdf-preview-close";
    closeButton.textContent = "×";
    closeButton.addEventListener("click", () => {
      hidePreviewImmediately(previewContainer);
    });

    header.appendChild(title);
    header.appendChild(closeButton);

    // Create content area
    const content = document.createElement("div");
    content.className = "pdf-preview-content";

    // Add loading indicator
    const loading = document.createElement("div");
    loading.className = "pdf-preview-loading";

    const spinner = document.createElement("div");
    spinner.className = "pdf-preview-spinner";

    const loadingText = document.createElement("div");
    loadingText.textContent = "Loading preview...";

    loading.appendChild(spinner);
    loading.appendChild(loadingText);
    content.appendChild(loading);

    // Create footer
    const footer = document.createElement("div");
    footer.className = "pdf-preview-footer";
    footer.textContent = "Click link to open full PDF";

    // Assemble preview
    previewContainer.appendChild(header);
    previewContainer.appendChild(content);
    previewContainer.appendChild(footer);

    // Add mouse event listeners
    previewContainer.addEventListener("mouseenter", function () {
      isMouseOverPreview = true;
      clearTimeout(hidePreviewTimer);
    });

    previewContainer.addEventListener("mouseleave", function () {
      isMouseOverPreview = false;
      scheduleHidePreviewIfNeeded();
    });

    // Add to document
    document.body.appendChild(previewContainer);

    // Position the preview
    positionPreview(previewContainer, wrapper);

    // Create buffer zone between link and preview
    createBufferZone(wrapper, previewContainer);

    // Make visible after positioning
    setTimeout(() => {
      previewContainer.classList.add("visible");
    }, 10);

    // Attempt to load the PDF
    loadPdfPreview(pdfUrl, content, loading);
  }

  // Create an invisible buffer zone to help with mouse movement between link and preview
  function createBufferZone(wrapper, previewContainer) {
    // Remove any existing buffer
    const existingBuffer = document.querySelector(".pdf-preview-buffer");
    if (existingBuffer) {
      existingBuffer.remove();
    }

    const wrapperRect = wrapper.getBoundingClientRect();
    const previewRect = previewContainer.getBoundingClientRect();

    // Calculate buffer zone dimensions
    let bufferTop, bufferLeft, bufferWidth, bufferHeight;

    // Determine relative positions to create appropriate buffer
    if (previewRect.top >= wrapperRect.bottom) {
      // Preview is below the link
      bufferTop = wrapperRect.bottom + window.scrollY;
      bufferLeft = Math.min(wrapperRect.left, previewRect.left) + window.scrollX;
      bufferWidth = Math.max(wrapperRect.width, previewRect.width);
      bufferHeight = previewRect.top - wrapperRect.bottom;
    } else if (previewRect.bottom <= wrapperRect.top) {
      // Preview is above the link
      bufferTop = previewRect.bottom + window.scrollY;
      bufferLeft = Math.min(wrapperRect.left, previewRect.left) + window.scrollX;
      bufferWidth = Math.max(wrapperRect.width, previewRect.width);
      bufferHeight = wrapperRect.top - previewRect.bottom;
    } else if (previewRect.left >= wrapperRect.right) {
      // Preview is to the right of the link
      bufferTop = Math.min(wrapperRect.top, previewRect.top) + window.scrollY;
      bufferLeft = wrapperRect.right + window.scrollX;
      bufferWidth = previewRect.left - wrapperRect.right;
      bufferHeight = Math.max(wrapperRect.height, previewRect.height);
    } else if (previewRect.right <= wrapperRect.left) {
      // Preview is to the left of the link
      bufferTop = Math.min(wrapperRect.top, previewRect.top) + window.scrollY;
      bufferLeft = previewRect.right + window.scrollX;
      bufferWidth = wrapperRect.left - previewRect.right;
      bufferHeight = Math.max(wrapperRect.height, previewRect.height);
    }

    // Create buffer element if we have valid dimensions
    if (bufferWidth > 0 && bufferHeight > 0) {
      const buffer = document.createElement("div");
      buffer.className = "pdf-preview-buffer";
      buffer.style.top = `${bufferTop}px`;
      buffer.style.left = `${bufferLeft}px`;
      buffer.style.width = `${bufferWidth}px`;
      buffer.style.height = `${bufferHeight}px`;

      // Add to document
      document.body.appendChild(buffer);

      // Add mouse event listeners
      buffer.addEventListener("mousemove", function () {
        // When mouse moves over buffer, prevent hiding
        clearTimeout(hidePreviewTimer);
      });
    }
  }

  // Position the preview relative to link
  function positionPreview(previewContainer, wrapper) {
    const rect = wrapper.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Check if we're on mobile
    if (windowWidth <= 768) {
      // Mobile positioning is handled by CSS (centered)
      return;
    }

    // Default position (below and right)
    let top = rect.bottom + config.previewOffset;
    let left = rect.left;

    // Check if preview would go off right edge
    if (left + config.previewWidth > windowWidth - 20) {
      left = windowWidth - config.previewWidth - 20;
    }

    // Check if preview would go off bottom edge
    if (top + config.previewHeight > windowHeight - 20) {
      // Position above instead
      top = rect.top - config.previewHeight - config.previewOffset;

      // If still off-screen, position to the side
      if (top < 20) {
        top = Math.max(20, rect.top - config.previewHeight / 2 + rect.height / 2);

        if (rect.left > windowWidth / 2) {
          // Position to the left
          left = rect.left - config.previewWidth - config.previewOffset;
        } else {
          // Position to the right
          left = rect.right + config.previewOffset;
        }
      }
    }

    // Apply final position
    previewContainer.style.top = `${top + window.scrollY}px`;
    previewContainer.style.left = `${left}px`;
  }

  // Hide preview with animation
  function hidePreview(previewContainer) {
    if (!previewContainer) return;

    previewContainer.classList.remove("visible");

    // Remove after animation completes
    setTimeout(() => {
      hidePreviewImmediately(previewContainer);
    }, 200);
  }

  // Hide preview immediately without animation
  function hidePreviewImmediately(previewContainer) {
    if (!previewContainer) return;

    // Remove buffer zone
    const buffer = document.querySelector(".pdf-preview-buffer");
    if (buffer) {
      buffer.remove();
    }

    // Remove preview
    if (previewContainer.parentNode) {
      previewContainer.parentNode.removeChild(previewContainer);
    }

    // Reset active preview if this was it
    if (activePreview === previewContainer) {
      activePreview = null;
    }
  }

  // Load PDF preview
  function loadPdfPreview(pdfUrl, contentElement, loadingElement) {
    // Try iframe first
    const iframe = document.createElement("iframe");
    iframe.className = "pdf-preview-iframe";
    iframe.src = pdfUrl;

    // Hide iframe until it loads
    iframe.style.display = "none";

    // Handle load success
    iframe.onload = function () {
      loadingElement.style.display = "none";
      iframe.style.display = "block";
    };

    // Handle load error
    iframe.onerror = function () {
      fallbackToThumbnail(pdfUrl, contentElement, loadingElement);
    };

    // Add iframe to content element
    contentElement.appendChild(iframe);

    // Set timeout for fallback (some browsers don't trigger onerror for PDFs)
    setTimeout(() => {
      if (loadingElement.style.display !== "none") {
        fallbackToThumbnail(pdfUrl, contentElement, loadingElement);
      }
    }, 3000);
  }

  function fallbackToThumbnail(pdfUrl, contentElement, loadingElement) {
    // Remove iframe if present
    const iframe = contentElement.querySelector("iframe");
    if (iframe) {
      contentElement.removeChild(iframe);
    }

    // Create error message
    const errorDiv = document.createElement("div");
    errorDiv.className = "pdf-preview-error";

    // Create PDF icon
    const icon = document.createElement("img");
    icon.src = config.defaultThumbnail;
    icon.className = "pdf-preview-placeholder";
    icon.alt = "PDF";

    // Create message
    const message = document.createElement("div");
    message.textContent = "Preview not available";

    // Add elements
    errorDiv.appendChild(icon);
    errorDiv.appendChild(message);

    // Hide loading and show error
    loadingElement.style.display = "none";
    contentElement.appendChild(errorDiv);
  }

  // Global click handler to close all previews
  function handleGlobalClick(event) {
    // If click is outside a preview or pdf link, close all previews
    if (!event.target.closest(".pdf-preview-container") && !event.target.closest(".pdf-link-wrapper")) {
      // Close active preview
      if (activePreview) {
        hidePreviewImmediately(activePreview);
      }

      // Reset state
      isMouseOverLink = false;
      isMouseOverPreview = false;
      clearTimeout(hidePreviewTimer);
    }
  }

  // Handle window resize
  function handleWindowResize() {
    // Reposition active preview if exists
    if (activePreview) {
      const pdfId = activePreview.id.replace("-preview", "");
      const wrapper = document.querySelector(`[data-pdf-id="${pdfId}"]`);

      if (wrapper) {
        positionPreview(activePreview, wrapper);

        // Recreate buffer zone
        createBufferZone(wrapper, activePreview);
      }
    }
  }

  // Handle window scroll
  function handleWindowScroll() {
    // Close preview on scroll for mobile
    if (window.innerWidth <= 768 && activePreview) {
      hidePreviewImmediately(activePreview);
      return;
    }

    // Reposition active preview
    handleWindowResize();
  }
})();

// JavaScript for sticky PDF preview functionality
document.addEventListener("DOMContentLoaded", function () {
  const pdfLinks = document.querySelectorAll(".pdf-link-container");
  const stickyPreview = document.getElementById("sticky-pdf-preview");
  const stickyIframe = document.getElementById("sticky-pdf-iframe");
  const placeholder = document.querySelector(".sticky-preview-placeholder");
  const documentsSection = document.getElementById("documents-sections");
  const stickyContainer = document.querySelector(".sticky-preview-container");
  const footer = document.querySelector("footer");

  // Initialize the placeholder message
  function showPlaceholder() {
    placeholder.style.display = "flex";
    stickyIframe.style.display = "none";
    stickyIframe.src = "";
    activePdfUrl = null;
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

      activePdfUrl = pdfUrl;

      // Remove loading state when iframe is loaded
      stickyIframe.onload = function () {
        stickyPreview.classList.remove("loading");
      };
    }
  }

  // Initialize with placeholder
  showPlaceholder();

  // Handle hover events for PDF links
  let hoverTimer;
  pdfLinks.forEach((link) => {
    // Mouse enter - show preview after small delay to prevent flickering
    link.addEventListener("mouseenter", function () {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        const pdfUrl = this.getAttribute("data-pdf-url");
        showPdfPreview(pdfUrl, this);
      }, 150); // Small delay to prevent flickering when moving mouse between links
    });

    // Mouse leave - clear hover timer
    link.addEventListener("mouseleave", function () {
      clearTimeout(hoverTimer);
    });

    // Click - show preview and remember the selection
    link.addEventListener("click", function (e) {
      // Prevent anchor tag default behavior
      const linkElement = this.querySelector(".pdf-link");
      if (linkElement) {
        e.preventDefault();
      }

      const pdfUrl = this.getAttribute("data-pdf-url");
      lastClickedPdfUrl = pdfUrl;
      showPdfPreview(pdfUrl, this);

      // Scroll to the preview if on mobile
      if (window.innerWidth <= 992) {
        stickyPreview.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
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
    const previewRect = stickyPreview.getBoundingClientRect();
    const documentsSectionRect = documentsSection.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate boundaries
    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;
    const previewHeight = stickyPreview.offsetHeight;
    const containerHeight = stickyContainer.offsetHeight;
    const footerTop = footerRect.top;

    // Calculate the fixed width needed for the preview when sticky
    // It should maintain the same width as its container
    const fixedWidth = containerRect.width;

    // Check if preview should be sticky (container is in view but not fully visible)
    if (containerTop < 20 && containerBottom > previewHeight + 20) {
      // Ensure it doesn't overlap with the footer
      if (footerTop - windowHeight + previewHeight < 0) {
        // Near the footer, adjust position
        stickyPreview.classList.remove("is-sticky");
        stickyPreview.classList.add("at-bottom");
      } else {
        // Normal sticky behavior
        stickyPreview.classList.add("is-sticky");
        stickyPreview.classList.remove("at-bottom");
        // Update width to match container
        stickyPreview.style.width = fixedWidth + "px";
      }
    } else if (containerBottom < previewHeight + 40) {
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
