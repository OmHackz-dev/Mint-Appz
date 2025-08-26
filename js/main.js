// Global variables and utilities
const API_BASE = "https://api.jsonbin.io/v3/b"
const API_KEY = "$2a$10$356BX7sGlMdIOQL.a.ECa.g1npi.U8Radm4lt6fdytdgLaAx82Cx6" // Updated with the actual JSONBin API key provided by user

const APP_CONFIG = {
  iconUrlTemplate: "example.com/app.icon", // Template for app icon URLs
  apkUrlTemplate: "example.com/app.apk", // Template for app download URLs
  appIconPath: "user_read_only_context/text_attachments/mint-appz-lI1mG.svg", // Mint Appz logo
}

// Navigation functionality
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    // Close mobile menu when clicking on a link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      })
    })
  }

  // Set active navigation link
  setActiveNavLink()
})

function setActiveNavLink() {
  const currentPath = window.location.pathname
  const navLinks = document.querySelectorAll(".nav-link")

  navLinks.forEach((link) => {
    link.classList.remove("active")
    const href = link.getAttribute("href")

    if (
      currentPath === href ||
      (currentPath === "/" && href === "/") ||
      (currentPath.startsWith("/docs") && href === "/docs")
    ) {
      link.classList.add("active")
    }
  })
}

// API utilities
async function makeAPIRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
        "X-Access-Key": API_KEY, // JSONBin also uses X-Access-Key
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Local storage utilities
function getFromStorage(key) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error("Error reading from storage:", error)
    return null
  }
}

function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Error writing to storage:", error)
  }
}

// User authentication utilities
function getCurrentUser() {
  return getFromStorage("currentUser")
}

function setCurrentUser(user) {
  setToStorage("currentUser", user)
}

function logout() {
  localStorage.removeItem("currentUser")
  window.location.href = "/account"
}

// Show loading state
function showLoading(element) {
  if (element) {
    element.innerHTML = '<div class="loading">Loading...</div>'
  }
}

// Show error message
function showError(element, message) {
  if (element) {
    element.innerHTML = `<div class="error">Error: ${message}</div>`
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Debounce function for search
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Utility functions for app URL generation
function generateAppIconUrl(appId) {
  return APP_CONFIG.iconUrlTemplate.replace("app", appId)
}

function generateAppDownloadUrl(appId) {
  return APP_CONFIG.apkUrlTemplate.replace("app", appId)
}

// Notification system for user feedback
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === "error" ? "#ef4444" : type === "success" ? "#10b981" : "#3b82f6"};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// CSS animations for notifications
const notificationStyles = `
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
`

const styleSheet = document.createElement("style")
styleSheet.textContent = notificationStyles
document.head.appendChild(styleSheet)

console.log("[v0] Mint Appz initialized with JSONBin API integration")
