// Store page functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeStore()
  setupFilters()
  setupSearch()
  setupViewToggle()
  setupSorting()
  loadApps()
})

// Extended sample data for store
const allApps = [
  {
    id: 1,
    name: "Photo Editor Pro",
    description:
      "Professional photo editing with advanced filters, effects, and AI-powered tools. Perfect for creating stunning visuals.",
    icon: "/photo-editor-app-icon.png",
    category: "productivity",
    downloadUrl: "https://example.com/photo-editor.apk",
    featured: true,
    downloads: "10K+",
    rating: 4.8,
    size: "25MB",
    uploadDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Puzzle Master",
    description:
      "Challenge your mind with hundreds of brain-teasing puzzles. From sudoku to crosswords, keep your brain sharp.",
    icon: "/puzzle-game-app-icon.png",
    category: "games",
    downloadUrl: "https://example.com/puzzle-master.apk",
    featured: true,
    downloads: "50K+",
    rating: 4.6,
    size: "18MB",
    uploadDate: "2024-01-10",
  },
  {
    id: 3,
    name: "Study Buddy",
    description:
      "Your ultimate learning companion with flashcards, note-taking, and progress tracking. Ace your exams!",
    icon: "/education-app-icon.png",
    category: "education",
    downloadUrl: "https://example.com/study-buddy.apk",
    featured: true,
    downloads: "25K+",
    rating: 4.9,
    size: "32MB",
    uploadDate: "2024-01-20",
  },
  {
    id: 4,
    name: "Chat Connect",
    description: "Stay connected with friends and family worldwide. Secure messaging with end-to-end encryption.",
    icon: "/chat-social-app-icon.png",
    category: "social",
    downloadUrl: "https://example.com/chat-connect.apk",
    featured: true,
    downloads: "100K+",
    rating: 4.7,
    size: "45MB",
    uploadDate: "2024-01-05",
  },
  {
    id: 5,
    name: "Fitness Tracker",
    description: "Track your workouts, monitor your progress, and achieve your fitness goals with personalized plans.",
    icon: "/fitness-app-icon.png",
    category: "productivity",
    downloadUrl: "https://example.com/fitness-tracker.apk",
    featured: true,
    downloads: "75K+",
    rating: 4.5,
    size: "28MB",
    uploadDate: "2024-01-12",
  },
  {
    id: 6,
    name: "Music Mixer",
    description: "Create amazing beats and mix music like a pro. Perfect for aspiring DJs and music enthusiasts.",
    icon: "/music-mixer-app-icon.png",
    category: "games",
    downloadUrl: "https://example.com/music-mixer.apk",
    featured: true,
    downloads: "30K+",
    rating: 4.4,
    size: "55MB",
    uploadDate: "2024-01-08",
  },
  {
    id: 7,
    name: "Task Manager Pro",
    description: "Organize your life with powerful task management, reminders, and productivity tracking features.",
    icon: "/task-manager-app-icon.png",
    category: "productivity",
    downloadUrl: "https://example.com/task-manager.apk",
    featured: false,
    downloads: "15K+",
    rating: 4.3,
    size: "22MB",
    uploadDate: "2024-01-18",
  },
  {
    id: 8,
    name: "Language Learning",
    description: "Master new languages with interactive lessons, pronunciation guides, and progress tracking.",
    icon: "/language-app-icon.png",
    category: "education",
    downloadUrl: "https://example.com/language-learning.apk",
    featured: false,
    downloads: "40K+",
    rating: 4.6,
    size: "38MB",
    uploadDate: "2024-01-14",
  },
  {
    id: 9,
    name: "Social Hub",
    description: "Connect with like-minded people, share interests, and build meaningful relationships online.",
    icon: "/social-hub-app-icon.png",
    category: "social",
    downloadUrl: "https://example.com/social-hub.apk",
    featured: false,
    downloads: "60K+",
    rating: 4.2,
    size: "42MB",
    uploadDate: "2024-01-16",
  },
  {
    id: 10,
    name: "Arcade Games",
    description: "Classic arcade games collection with modern graphics and addictive gameplay mechanics.",
    icon: "/arcade-games-app-icon.png",
    category: "games",
    downloadUrl: "https://example.com/arcade-games.apk",
    featured: false,
    downloads: "80K+",
    rating: 4.1,
    size: "65MB",
    uploadDate: "2024-01-11",
  },
]

let currentApps = [...allApps]
let currentPage = 1
const appsPerPage = 9
let currentView = "grid"
let currentSort = "newest"

function initializeStore() {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const searchTerm = urlParams.get("search")
  const category = urlParams.get("category")

  // Set initial filters
  if (searchTerm) {
    document.getElementById("storeSearch").value = searchTerm
  }
  if (category) {
    document.getElementById("categoryFilter").value = category
  }

  // Apply initial filters
  applyFilters()
}

function setupFilters() {
  const categoryFilter = document.getElementById("categoryFilter")
  const searchInput = document.getElementById("storeSearch")

  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyFilters)
  }

  if (searchInput) {
    const debouncedFilter = debounce(applyFilters, 300)
    searchInput.addEventListener("input", debouncedFilter)
  }
}

function setupSearch() {
  const searchBtn = document.getElementById("searchBtn")
  const searchInput = document.getElementById("storeSearch")

  if (searchBtn) {
    searchBtn.addEventListener("click", applyFilters)
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        applyFilters()
      }
    })
  }
}

function setupViewToggle() {
  // Create view toggle buttons
  const resultsInfo = document.querySelector(".results-info")
  if (resultsInfo) {
    const viewToggle = document.createElement("div")
    viewToggle.className = "view-toggle"
    viewToggle.innerHTML = `
      <button class="view-btn active" data-view="grid" title="Grid View">⊞</button>
      <button class="view-btn" data-view="list" title="List View">☰</button>
    `
    resultsInfo.appendChild(viewToggle)

    // Add event listeners
    viewToggle.addEventListener("click", (e) => {
      if (e.target.classList.contains("view-btn")) {
        const newView = e.target.dataset.view
        switchView(newView)
      }
    })
  }
}

function setupSorting() {
  // Create sort buttons
  const filtersRow = document.querySelector(".filters-row")
  if (filtersRow) {
    const sortContainer = document.createElement("div")
    sortContainer.className = "sort-container"
    sortContainer.innerHTML = `
      <button class="sort-btn active" data-sort="newest">Newest</button>
      <button class="sort-btn" data-sort="popular">Popular</button>
      <button class="sort-btn" data-sort="rating">Rating</button>
      <button class="sort-btn" data-sort="name">Name</button>
    `
    filtersRow.appendChild(sortContainer)

    // Add event listeners
    sortContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("sort-btn")) {
        const newSort = e.target.dataset.sort
        changeSorting(newSort)
      }
    })
  }
}

function applyFilters() {
  const searchTerm = document.getElementById("storeSearch").value.toLowerCase().trim()
  const selectedCategory = document.getElementById("categoryFilter").value

  // Filter apps
  currentApps = allApps.filter((app) => {
    const matchesSearch =
      !searchTerm ||
      app.name.toLowerCase().includes(searchTerm) ||
      app.description.toLowerCase().includes(searchTerm) ||
      app.category.toLowerCase().includes(searchTerm)

    const matchesCategory = !selectedCategory || app.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Apply current sorting
  applySorting()

  // Reset to first page
  currentPage = 1

  // Update display
  displayApps()
  updateResultsInfo()
}

function applySorting() {
  switch (currentSort) {
    case "newest":
      currentApps.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
      break
    case "popular":
      currentApps.sort((a, b) => {
        const aDownloads = Number.parseInt(a.downloads.replace(/[^\d]/g, ""))
        const bDownloads = Number.parseInt(b.downloads.replace(/[^\d]/g, ""))
        return bDownloads - aDownloads
      })
      break
    case "rating":
      currentApps.sort((a, b) => b.rating - a.rating)
      break
    case "name":
      currentApps.sort((a, b) => a.name.localeCompare(b.name))
      break
  }
}

function changeSorting(newSort) {
  currentSort = newSort

  // Update active sort button
  document.querySelectorAll(".sort-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.sort === newSort)
  })

  // Apply sorting and update display
  applySorting()
  displayApps()
}

function switchView(newView) {
  currentView = newView

  // Update active view button
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === newView)
  })

  // Update grid class
  const appsGrid = document.getElementById("storeApps")
  if (appsGrid) {
    appsGrid.classList.toggle("list-view", newView === "list")
  }
}

async function loadApps() {
  const storeAppsContainer = document.getElementById("storeApps")
  if (!storeAppsContainer) return

  showLoading(storeAppsContainer)

  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // In a real implementation, this would fetch from JSONBin
    // const response = await makeAPIRequest(`${API_BASE}/your-apps-bin-id`);
    // allApps = response.record;

    applyFilters()
  } catch (error) {
    console.error("Error loading apps:", error)
    showError(storeAppsContainer, "Failed to load apps. Please try again later.")
  }
}

function displayApps() {
  const storeAppsContainer = document.getElementById("storeApps")
  if (!storeAppsContainer) return

  if (currentApps.length === 0) {
    storeAppsContainer.innerHTML = `
      <div class="no-results">
        <h3>No apps found</h3>
        <p>Try adjusting your search terms or filters</p>
        <button class="clear-filters-btn" onclick="clearFilters()">Clear Filters</button>
      </div>
    `
    return
  }

  // Calculate pagination
  const startIndex = (currentPage - 1) * appsPerPage
  const endIndex = startIndex + appsPerPage
  const appsToShow = currentApps.slice(startIndex, endIndex)

  // Generate app cards
  storeAppsContainer.innerHTML = appsToShow.map((app, index) => createAppCard(app, index)).join("")

  // Add animations
  setTimeout(() => {
    const appCards = storeAppsContainer.querySelectorAll(".app-card")
    appCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = "1"
        card.style.transform = currentView === "grid" ? "translateY(0)" : "translateX(0)"
      }, index * 50)
    })
  }, 100)

  // Update pagination
  updatePagination()
}

function createAppCard(app, index = 0) {
  const transformStyle = currentView === "grid" ? "translateY(20px)" : "translateX(-20px)"

  return `
    <div class="app-card" data-app-id="${app.id}" style="opacity: 0; transform: ${transformStyle}; transition: all 0.5s ease ${index * 0.05}s;">
      <div class="app-header">
        <img src="${app.icon}" alt="${app.name}" class="app-icon" loading="lazy">
        <div class="app-info">
          <h3>${app.name}</h3>
          <span class="app-category">${capitalizeFirst(app.category)}</span>
        </div>
      </div>
      <div class="app-content">
        <p class="app-description">${app.description}</p>
        <div class="app-stats">
          <span class="app-stat">⭐ ${app.rating}</span>
          <span class="app-stat">📥 ${app.downloads}</span>
          <span class="app-stat">📱 ${app.size}</span>
        </div>
        <div class="app-actions">
          <a href="${app.downloadUrl}" class="btn btn-primary" download onclick="trackDownload(${app.id})">Download</a>
          <button class="btn btn-outline" onclick="viewAppDetails(${app.id})">Details</button>
        </div>
      </div>
    </div>
  `
}

function updateResultsInfo() {
  const resultsCount = document.getElementById("resultsCount")
  if (resultsCount) {
    const total = currentApps.length
    const startIndex = (currentPage - 1) * appsPerPage + 1
    const endIndex = Math.min(currentPage * appsPerPage, total)

    if (total === 0) {
      resultsCount.textContent = "No apps found"
    } else {
      resultsCount.textContent = `Showing ${startIndex}-${endIndex} of ${total} apps`
    }
  }
}

function updatePagination() {
  const totalPages = Math.ceil(currentApps.length / appsPerPage)

  // Remove existing pagination
  const existingPagination = document.querySelector(".pagination")
  if (existingPagination) {
    existingPagination.remove()
  }

  // Don't show pagination if only one page
  if (totalPages <= 1) return

  // Create pagination
  const storeContent = document.querySelector(".store-content .container")
  const pagination = document.createElement("div")
  pagination.className = "pagination"

  let paginationHTML = `
    <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>
      ← Previous
    </button>
  `

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      paginationHTML += `
        <button class="pagination-btn ${i === currentPage ? "active" : ""}" onclick="changePage(${i})">
          ${i}
        </button>
      `
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHTML += `<span class="pagination-info">...</span>`
    }
  }

  paginationHTML += `
    <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>
      Next →
    </button>
  `

  pagination.innerHTML = paginationHTML
  storeContent.appendChild(pagination)
}

function changePage(newPage) {
  const totalPages = Math.ceil(currentApps.length / appsPerPage)

  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage
    displayApps()

    // Scroll to top of store content
    document.querySelector(".store-content").scrollIntoView({ behavior: "smooth" })
  }
}

function clearFilters() {
  document.getElementById("storeSearch").value = ""
  document.getElementById("categoryFilter").value = ""

  // Update URL
  const url = new URL(window.location)
  url.searchParams.delete("search")
  url.searchParams.delete("category")
  window.history.replaceState({}, "", url)

  applyFilters()
}

function viewAppDetails(appId) {
  window.location.href = `/app/${appId}`
}

function trackDownload(appId) {
  console.log(`Download tracked for app ID: ${appId}`)
  // Analytics tracking would go here
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function showLoading(container) {
  container.innerHTML = '<div class="loading">Loading apps...</div>'
}

function showError(container, message) {
  container.innerHTML = `<div class="error">⚠️ ${message}</div>`
}
