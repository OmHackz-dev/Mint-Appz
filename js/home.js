// Home page functionality
document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedApps()
  setupSearch()
  setupCategoryFilters()
  setupAppCardAnimations()
})

const sampleApps = [
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
  },
]

async function loadFeaturedApps() {
  const featuredAppsContainer = document.getElementById("featuredApps")

  if (!featuredAppsContainer) return

  showLoading(featuredAppsContainer)

  try {
    // Simulate API delay for realistic loading experience
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real implementation, this would fetch from JSONBin
    // const response = await makeAPIRequest(`${API_BASE}/your-apps-bin-id`);
    // const apps = response.record.filter(app => app.featured);

    // Using enhanced sample data
    const featuredApps = sampleApps.filter((app) => app.featured)

    if (featuredApps.length === 0) {
      featuredAppsContainer.innerHTML =
        '<p class="no-apps">No featured apps available at the moment. Check back soon!</p>'
      return
    }

    featuredAppsContainer.innerHTML = featuredApps.map((app, index) => createAppCard(app, index)).join("")

    // Trigger animations
    setTimeout(() => {
      const appCards = featuredAppsContainer.querySelectorAll(".app-card")
      appCards.forEach((card, index) => {
        setTimeout(() => {
          card.style.opacity = "1"
          card.style.transform = "translateY(0)"
        }, index * 100)
      })
    }, 100)
  } catch (error) {
    console.error("Error loading featured apps:", error)
    showError(featuredAppsContainer, "Failed to load featured apps. Please try again later.")
  }
}

function createAppCard(app, index = 0) {
  return `
    <div class="app-card" data-app-id="${app.id}" style="opacity: 0; transform: translateY(20px); transition: all 0.5s ease ${index * 0.1}s;">
      <div class="app-header">
        <img src="${app.icon}" alt="${app.name}" class="app-icon" loading="lazy">
        <div class="app-info">
          <h3>${app.name}</h3>
          <span class="app-category">${capitalizeFirst(app.category)}</span>
        </div>
      </div>
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
  `
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput")
  const searchBtn = document.querySelector(".search-btn")

  if (searchInput && searchBtn) {
    const debouncedSearch = debounce(handleSearchInput, 300)

    searchInput.addEventListener("input", debouncedSearch)
    searchBtn.addEventListener("click", performSearch)

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        performSearch()
      }
    })

    // Add search suggestions (placeholder for future enhancement)
    searchInput.addEventListener("focus", () => {
      searchInput.style.transform = "translateY(-2px)"
    })

    searchInput.addEventListener("blur", () => {
      searchInput.style.transform = "translateY(0)"
    })
  }
}

function handleSearchInput() {
  const searchTerm = document.getElementById("searchInput").value.trim()

  // Visual feedback for active search
  const searchBtn = document.querySelector(".search-btn")
  if (searchTerm.length > 0) {
    searchBtn.style.backgroundColor = "var(--mint-green)"
    searchBtn.textContent = "Search"
  } else {
    searchBtn.style.backgroundColor = "var(--black)"
    searchBtn.textContent = "Search"
  }
}

function performSearch() {
  const searchTerm = document.getElementById("searchInput").value.trim()

  if (searchTerm) {
    // Add loading state to search button
    const searchBtn = document.querySelector(".search-btn")
    const originalText = searchBtn.textContent
    searchBtn.textContent = "Searching..."
    searchBtn.disabled = true

    // Simulate search delay
    setTimeout(() => {
      window.location.href = `/store?search=${encodeURIComponent(searchTerm)}`
    }, 500)
  }
}

function setupCategoryFilters() {
  const categoryCards = document.querySelectorAll(".category-card")

  categoryCards.forEach((card, index) => {
    // Add staggered animation on load
    setTimeout(() => {
      card.style.opacity = "1"
      card.style.transform = "translateY(0)"
    }, index * 150)

    card.addEventListener("click", function () {
      const category = this.dataset.category

      // Add click animation
      this.style.transform = "scale(0.95)"
      setTimeout(() => {
        this.style.transform = "translateY(-8px)"
        window.location.href = `/store?category=${category}`
      }, 150)
    })

    // Add hover sound effect placeholder
    card.addEventListener("mouseenter", () => {
      // Placeholder for hover sound effect
      console.log(`Hovering over ${card.dataset.category} category`)
    })
  })
}

function setupAppCardAnimations() {
  // Set initial state for category cards
  const categoryCards = document.querySelectorAll(".category-card")
  categoryCards.forEach((card) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"
    card.style.transition = "all 0.5s ease"
  })
}

function viewAppDetails(appId) {
  // Add loading animation
  const appCard = document.querySelector(`[data-app-id="${appId}"]`)
  if (appCard) {
    appCard.style.transform = "scale(0.98)"
    setTimeout(() => {
      appCard.style.transform = "scale(1)"
    }, 150)
  }

  setTimeout(() => {
    window.location.href = `/app/${appId}`
  }, 200)
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function trackDownload(appId) {
  // Analytics tracking placeholder
  console.log(`Download tracked for app ID: ${appId}`)

  // Could integrate with analytics service
  // gtag('event', 'download', { app_id: appId })
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
  container.innerHTML = '<div class="loading">Loading amazing apps...</div>'
}

function showError(container, message) {
  container.innerHTML = `<div class="error">⚠️ ${message}</div>`
}
