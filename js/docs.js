// Documentation JavaScript
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("docsSidebar")
  const sidebarToggle = document.getElementById("sidebarToggle")
  const mobileSidebarToggle = document.getElementById("mobileSidebarToggle")
  const navLinks = document.querySelectorAll(".nav-link")
  const docSections = document.querySelectorAll(".doc-section")

  // Mobile sidebar toggle
  if (mobileSidebarToggle) {
    mobileSidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })
  }

  // Sidebar close button
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.remove("open")
    })
  }

  // Navigation link handling
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      const targetId = this.getAttribute("href").substring(1)
      const targetSection = document.getElementById(targetId)

      if (targetSection) {
        // Update active states
        navLinks.forEach((l) => l.classList.remove("active"))
        this.classList.add("active")

        docSections.forEach((section) => section.classList.remove("active"))
        targetSection.classList.add("active")

        // Close mobile sidebar
        sidebar.classList.remove("open")

        // Scroll to top of content
        document.querySelector(".docs-content").scrollTop = 0

        // Update URL hash
        history.pushState(null, null, `#${targetId}`)
      }
    })
  })

  // Handle direct hash navigation
  function handleHashNavigation() {
    const hash = window.location.hash.substring(1)
    if (hash) {
      const targetLink = document.querySelector(`.nav-link[href="#${hash}"]`)
      const targetSection = document.getElementById(hash)

      if (targetLink && targetSection) {
        navLinks.forEach((l) => l.classList.remove("active"))
        targetLink.classList.add("active")

        docSections.forEach((section) => section.classList.remove("active"))
        targetSection.classList.add("active")
      }
    }
  }

  // Handle browser back/forward
  window.addEventListener("popstate", handleHashNavigation)

  // Handle initial hash on page load
  handleHashNavigation()

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !mobileSidebarToggle.contains(e.target)) {
        sidebar.classList.remove("open")
      }
    }
  })

  // Search functionality within docs
  function createSearchBox() {
    const searchContainer = document.createElement("div")
    searchContainer.className = "docs-search"
    searchContainer.innerHTML = `
            <input type="text" id="docsSearch" placeholder="Search documentation..." class="search-input">
            <div id="searchResults" class="search-results"></div>
        `

    const sidebarHeader = document.querySelector(".sidebar-header")
    sidebarHeader.appendChild(searchContainer)

    const searchInput = document.getElementById("docsSearch")
    const searchResults = document.getElementById("searchResults")

    searchInput.addEventListener("input", function () {
      const query = this.value.toLowerCase().trim()

      if (query.length < 2) {
        searchResults.style.display = "none"
        return
      }

      const results = []

      // Search through sections
      docSections.forEach((section) => {
        const sectionId = section.id
        const sectionTitle = section.querySelector("h1")?.textContent || ""
        const sectionContent = section.textContent.toLowerCase()

        if (sectionTitle.toLowerCase().includes(query) || sectionContent.includes(query)) {
          results.push({
            id: sectionId,
            title: sectionTitle,
            type: "section",
          })
        }
      })

      // Display results
      if (results.length > 0) {
        searchResults.innerHTML = results
          .map(
            (result) => `
                    <div class="search-result" data-target="${result.id}">
                        <div class="result-title">${result.title}</div>
                        <div class="result-type">${result.type}</div>
                    </div>
                `,
          )
          .join("")

        searchResults.style.display = "block"

        // Add click handlers to results
        searchResults.querySelectorAll(".search-result").forEach((result) => {
          result.addEventListener("click", function () {
            const targetId = this.dataset.target
            const targetLink = document.querySelector(`.nav-link[href="#${targetId}"]`)

            if (targetLink) {
              targetLink.click()
              searchInput.value = ""
              searchResults.style.display = "none"
            }
          })
        })
      } else {
        searchResults.innerHTML = '<div class="no-results">No results found</div>'
        searchResults.style.display = "block"
      }
    })

    // Hide results when clicking outside
    document.addEventListener("click", (e) => {
      if (!searchContainer.contains(e.target)) {
        searchResults.style.display = "none"
      }
    })
  }

  // Add search functionality
  createSearchBox()

  // Add smooth scrolling for anchor links within sections
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href")
      if (href.startsWith("#") && href.length > 1) {
        const targetElement = document.querySelector(href)
        if (targetElement && targetElement.closest(".doc-section")) {
          e.preventDefault()
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      }
    })
  })

  // Add copy code functionality
  document.querySelectorAll(".code-example code, .code-example pre").forEach((codeBlock) => {
    const copyButton = document.createElement("button")
    copyButton.textContent = "Copy"
    copyButton.className = "copy-code-btn"
    copyButton.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: #374151;
            color: white;
            border: none;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s ease;
        `

    const container = codeBlock.closest(".code-example")
    container.style.position = "relative"
    container.appendChild(copyButton)

    container.addEventListener("mouseenter", () => {
      copyButton.style.opacity = "1"
    })

    container.addEventListener("mouseleave", () => {
      copyButton.style.opacity = "0"
    })

    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(codeBlock.textContent)
        copyButton.textContent = "Copied!"
        setTimeout(() => {
          copyButton.textContent = "Copy"
        }, 2000)
      } catch (err) {
        console.error("Failed to copy code:", err)
      }
    })
  })

  console.log("[v0] Documentation system initialized")
})

// Add search styles
const searchStyles = `
.docs-search {
    margin-top: 1rem;
    position: relative;
}

.search-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    background: #ffffff;
}

.search-input:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
}

.search-result {
    padding: 0.75rem;
    cursor: pointer;
    border-bottom: 1px solid #f3f4f6;
}

.search-result:hover {
    background: #f9fafb;
}

.search-result:last-child {
    border-bottom: none;
}

.result-title {
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 0.25rem;
}

.result-type {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: uppercase;
}

.no-results {
    padding: 1rem;
    text-align: center;
    color: #6b7280;
    font-size: 0.875rem;
}
`

// Inject search styles
const styleSheet = document.createElement("style")
styleSheet.textContent = searchStyles
document.head.appendChild(styleSheet)
