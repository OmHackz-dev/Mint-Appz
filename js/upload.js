// Upload page functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeUploadPage()
  setupFormHandlers()
  setupIconPreview()
  setupCharacterCounters()
  setupModalHandlers()
  checkAuthentication()
})

let currentUser = null
let editingAppId = null
let userApps = []

function initializeUploadPage() {
  // Check if we're editing an existing app
  const urlParams = new URLSearchParams(window.location.search)
  editingAppId = urlParams.get("edit")

  if (editingAppId) {
    document.getElementById("pageTitle").textContent = "Edit App"
    document.getElementById("pageDescription").textContent = "Update your app information"
    document.getElementById("submitText").textContent = "Update App"
    loadAppForEditing(editingAppId)
  }

  loadUserApps()
}

function setupFormHandlers() {
  const uploadForm = document.getElementById("uploadForm")
  if (uploadForm) {
    uploadForm.addEventListener("submit", handleFormSubmit)
  }

  const cancelBtn = document.getElementById("cancelBtn")
  if (cancelBtn) {
    cancelBtn.addEventListener("click", handleCancel)
  }

  const previewBtn = document.getElementById("previewBtn")
  if (previewBtn) {
    previewBtn.addEventListener("click", showPreview)
  }

  const refreshAppsBtn = document.getElementById("refreshApps")
  if (refreshAppsBtn) {
    refreshAppsBtn.addEventListener("click", loadUserApps)
  }

  // Filter handlers
  const statusFilter = document.getElementById("statusFilter")
  const categoryFilter = document.getElementById("categoryFilter")

  if (statusFilter) {
    statusFilter.addEventListener("change", filterUserApps)
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterUserApps)
  }
}

function setupIconPreview() {
  const iconInput = document.getElementById("appIcon")
  const iconPreview = document.getElementById("iconPreview")

  if (iconInput && iconPreview) {
    iconInput.addEventListener("input", () => {
      const url = iconInput.value.trim()
      if (url && isValidImageUrl(url)) {
        iconPreview.src = url
        iconPreview.classList.remove("hidden")
        iconPreview.onerror = () => {
          iconPreview.classList.add("hidden")
        }
      } else {
        iconPreview.classList.add("hidden")
      }
    })
  }
}

function setupCharacterCounters() {
  const descriptionInput = document.getElementById("appDescription")
  const descriptionCounter = document.getElementById("descriptionCounter")

  if (descriptionInput && descriptionCounter) {
    descriptionInput.addEventListener("input", () => {
      const length = descriptionInput.value.length
      const maxLength = 500

      descriptionCounter.textContent = length

      // Update counter styling based on length
      const counterContainer = descriptionCounter.parentElement
      counterContainer.classList.remove("warning", "danger")

      if (length > maxLength * 0.8) {
        counterContainer.classList.add("warning")
      }
      if (length > maxLength * 0.95) {
        counterContainer.classList.add("danger")
      }
    })
  }
}

function setupModalHandlers() {
  const previewModal = document.getElementById("previewModal")
  const closePreview = document.getElementById("closePreview")
  const closePreviewBtn = document.getElementById("closePreviewBtn")
  const confirmUpload = document.getElementById("confirmUpload")

  if (closePreview) {
    closePreview.addEventListener("click", hidePreview)
  }

  if (closePreviewBtn) {
    closePreviewBtn.addEventListener("click", hidePreview)
  }

  if (confirmUpload) {
    confirmUpload.addEventListener("click", () => {
      hidePreview()
      document.getElementById("uploadForm").dispatchEvent(new Event("submit"))
    })
  }

  // Close modal when clicking outside
  if (previewModal) {
    previewModal.addEventListener("click", (e) => {
      if (e.target === previewModal) {
        hidePreview()
      }
    })
  }
}

function checkAuthentication() {
  currentUser = getCurrentUser()

  if (!currentUser) {
    document.getElementById("authRequired").classList.remove("hidden")
    document.getElementById("uploadContent").classList.add("hidden")
  } else {
    document.getElementById("authRequired").classList.add("hidden")
    document.getElementById("uploadContent").classList.remove("hidden")
  }
}

async function handleFormSubmit(e) {
  e.preventDefault()

  if (!currentUser) {
    showError("You must be signed in to upload apps")
    return
  }

  const formData = collectFormData()
  if (!validateFormData(formData)) {
    return
  }

  const submitBtn = document.getElementById("submitBtn")
  const originalText = submitBtn.textContent

  try {
    submitBtn.textContent = editingAppId ? "Updating..." : "Uploading..."
    submitBtn.disabled = true

    if (editingAppId) {
      await updateApp(editingAppId, formData)
      showSuccess("App updated successfully!")
    } else {
      await uploadApp(formData)
      showSuccess("App uploaded successfully!")
    }

    // Reset form and reload apps
    if (!editingAppId) {
      document.getElementById("uploadForm").reset()
      document.getElementById("iconPreview").classList.add("hidden")
      document.getElementById("descriptionCounter").textContent = "0"
    }

    loadUserApps()

    // Redirect to manage section
    setTimeout(() => {
      document.querySelector(".manage-apps-section").scrollIntoView({ behavior: "smooth" })
    }, 1000)
  } catch (error) {
    console.error("Upload error:", error)
    showError("Failed to upload app. Please try again.")
  } finally {
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }
}

function collectFormData() {
  return {
    name: document.getElementById("appName").value.trim(),
    category: document.getElementById("appCategory").value,
    description: document.getElementById("appDescription").value.trim(),
    version: document.getElementById("appVersion").value.trim(),
    size: document.getElementById("appSize").value.trim(),
    icon: document.getElementById("appIcon").value.trim(),
    screenshots: document
      .getElementById("appScreenshots")
      .value.split("\n")
      .map((url) => url.trim())
      .filter((url) => url && isValidImageUrl(url)),
    downloadUrl: document.getElementById("appDownloadUrl").value.trim(),
    minAndroidVersion: document.getElementById("minAndroidVersion").value,
    isFeatured: document.getElementById("isFeatured").checked,
    tags: document
      .getElementById("appTags")
      .value.split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag),
    developerWebsite: document.getElementById("developerWebsite").value.trim(),
    supportEmail: document.getElementById("supportEmail").value.trim(),
  }
}

function validateFormData(data) {
  const errors = []

  if (!data.name) errors.push("App name is required")
  if (!data.category) errors.push("Category is required")
  if (!data.description) errors.push("Description is required")
  if (!data.version) errors.push("Version is required")
  if (!data.size) errors.push("App size is required")
  if (!data.icon) errors.push("App icon URL is required")
  if (!data.downloadUrl) errors.push("Download URL is required")

  if (!isValidImageUrl(data.icon)) {
    errors.push("App icon must be a valid image URL")
  }

  if (!isValidUrl(data.downloadUrl)) {
    errors.push("Download URL must be a valid URL")
  }

  if (data.developerWebsite && !isValidUrl(data.developerWebsite)) {
    errors.push("Developer website must be a valid URL")
  }

  if (data.supportEmail && !isValidEmail(data.supportEmail)) {
    errors.push("Support email must be a valid email address")
  }

  if (errors.length > 0) {
    showError("Please fix the following errors:\n• " + errors.join("\n• "))
    return false
  }

  return true
}

async function uploadApp(appData) {
  const newApp = {
    id: generateAppId(),
    ...appData,
    uploaderId: currentUser.id,
    uploaderName: `${currentUser.firstName} ${currentUser.lastName}`,
    uploadDate: new Date().toISOString(),
    status: "pending", // pending, published, rejected, draft
    downloads: "0",
    rating: 0,
    reviews: [],
    featured: false, // Admin decision
  }

  // In a real implementation, this would save to JSONBin
  await simulateAPICall(2000)

  // Add to local storage for demo
  const existingApps = JSON.parse(localStorage.getItem("userApps") || "[]")
  existingApps.push(newApp)
  localStorage.setItem("userApps", JSON.stringify(existingApps))

  return newApp
}

async function updateApp(appId, appData) {
  // In a real implementation, this would update in JSONBin
  await simulateAPICall(1500)

  // Update in local storage for demo
  const existingApps = JSON.parse(localStorage.getItem("userApps") || "[]")
  const appIndex = existingApps.findIndex((app) => app.id === appId)

  if (appIndex !== -1) {
    existingApps[appIndex] = {
      ...existingApps[appIndex],
      ...appData,
      updatedDate: new Date().toISOString(),
    }
    localStorage.setItem("userApps", JSON.stringify(existingApps))
  }

  return existingApps[appIndex]
}

async function deleteApp(appId) {
  if (!confirm("Are you sure you want to delete this app? This action cannot be undone.")) {
    return
  }

  try {
    // In a real implementation, this would delete from JSONBin
    await simulateAPICall(1000)

    // Remove from local storage for demo
    const existingApps = JSON.parse(localStorage.getItem("userApps") || "[]")
    const filteredApps = existingApps.filter((app) => app.id !== appId)
    localStorage.setItem("userApps", JSON.stringify(filteredApps))

    showSuccess("App deleted successfully!")
    loadUserApps()
  } catch (error) {
    console.error("Delete error:", error)
    showError("Failed to delete app. Please try again.")
  }
}

async function loadUserApps() {
  const userAppsGrid = document.getElementById("userAppsGrid")
  if (!userAppsGrid) return

  showLoading(userAppsGrid)

  try {
    // In a real implementation, this would fetch from JSONBin
    await simulateAPICall(800)

    // Load from local storage for demo
    const allApps = JSON.parse(localStorage.getItem("userApps") || "[]")
    userApps = allApps.filter((app) => app.uploaderId === currentUser?.id)

    displayUserApps(userApps)
  } catch (error) {
    console.error("Load apps error:", error)
    showError(userAppsGrid, "Failed to load your apps")
  }
}

function displayUserApps(apps) {
  const userAppsGrid = document.getElementById("userAppsGrid")

  if (apps.length === 0) {
    userAppsGrid.innerHTML = `
      <div class="no-apps">
        <h3>No apps uploaded yet</h3>
        <p>Upload your first app to get started!</p>
        <button class="btn btn-primary" onclick="scrollToUploadForm()">Upload App</button>
      </div>
    `
    return
  }

  userAppsGrid.innerHTML = apps
    .map(
      (app) => `
    <div class="user-app-card">
      <div class="app-card-status ${app.status}">${app.status}</div>
      <div class="app-card-header">
        <img src="${app.icon}" alt="${app.name}" class="app-card-icon">
        <div class="app-card-info">
          <h4>${app.name}</h4>
          <span class="app-card-category">${app.category}</span>
        </div>
      </div>
      <p class="app-card-description">${app.description}</p>
      <div class="app-card-stats">
        <span class="app-card-stat">⭐ ${app.rating || "0.0"}</span>
        <span class="app-card-stat">📥 ${app.downloads}</span>
        <span class="app-card-stat">📱 ${app.size}</span>
        <span class="app-card-stat">📅 ${formatDate(app.uploadDate)}</span>
      </div>
      <div class="app-card-actions">
        <button class="btn btn-outline" onclick="editApp('${app.id}')">Edit</button>
        <button class="btn btn-secondary" onclick="deleteApp('${app.id}')">Delete</button>
        <a href="${app.downloadUrl}" class="btn btn-primary" download>Download</a>
      </div>
    </div>
  `,
    )
    .join("")
}

function filterUserApps() {
  const statusFilter = document.getElementById("statusFilter").value
  const categoryFilter = document.getElementById("categoryFilter").value

  let filteredApps = [...userApps]

  if (statusFilter) {
    filteredApps = filteredApps.filter((app) => app.status === statusFilter)
  }

  if (categoryFilter) {
    filteredApps = filteredApps.filter((app) => app.category === categoryFilter)
  }

  displayUserApps(filteredApps)
}

async function loadAppForEditing(appId) {
  try {
    // In a real implementation, this would fetch from JSONBin
    const allApps = JSON.parse(localStorage.getItem("userApps") || "[]")
    const app = allApps.find((a) => a.id === appId && a.uploaderId === currentUser?.id)

    if (!app) {
      showError("App not found or you don't have permission to edit it")
      return
    }

    // Populate form with app data
    document.getElementById("appName").value = app.name
    document.getElementById("appCategory").value = app.category
    document.getElementById("appDescription").value = app.description
    document.getElementById("appVersion").value = app.version
    document.getElementById("appSize").value = app.size
    document.getElementById("appIcon").value = app.icon
    document.getElementById("appScreenshots").value = app.screenshots?.join("\n") || ""
    document.getElementById("appDownloadUrl").value = app.downloadUrl
    document.getElementById("minAndroidVersion").value = app.minAndroidVersion || ""
    document.getElementById("isFeatured").checked = app.isFeatured || false
    document.getElementById("appTags").value = app.tags?.join(", ") || ""
    document.getElementById("developerWebsite").value = app.developerWebsite || ""
    document.getElementById("supportEmail").value = app.supportEmail || ""

    // Update character counter
    document.getElementById("descriptionCounter").textContent = app.description.length

    // Show icon preview
    if (app.icon) {
      const iconPreview = document.getElementById("iconPreview")
      iconPreview.src = app.icon
      iconPreview.classList.remove("hidden")
    }
  } catch (error) {
    console.error("Load app error:", error)
    showError("Failed to load app for editing")
  }
}

function showPreview() {
  const formData = collectFormData()

  if (!validateFormData(formData)) {
    return
  }

  const previewContent = document.getElementById("previewContent")
  previewContent.innerHTML = `
    <div class="preview-app-card">
      <div class="preview-header">
        <img src="${formData.icon}" alt="${formData.name}" class="preview-icon">
        <div class="preview-info">
          <h4>${formData.name}</h4>
          <span class="preview-category">${formData.category}</span>
        </div>
      </div>
      <p class="preview-description">${formData.description}</p>
      <div class="preview-details">
        <div class="preview-detail">
          <strong>Version</strong>
          <span>${formData.version}</span>
        </div>
        <div class="preview-detail">
          <strong>Size</strong>
          <span>${formData.size}</span>
        </div>
        <div class="preview-detail">
          <strong>Category</strong>
          <span>${formData.category}</span>
        </div>
        ${
          formData.minAndroidVersion
            ? `
          <div class="preview-detail">
            <strong>Min Android</strong>
            <span>${formData.minAndroidVersion}</span>
          </div>
        `
            : ""
        }
        ${
          formData.tags.length > 0
            ? `
          <div class="preview-detail">
            <strong>Tags</strong>
            <span>${formData.tags.join(", ")}</span>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `

  document.getElementById("previewModal").classList.remove("hidden")
}

function hidePreview() {
  document.getElementById("previewModal").classList.add("hidden")
}

function handleCancel() {
  if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
    if (editingAppId) {
      window.location.href = "/upload"
    } else {
      document.getElementById("uploadForm").reset()
      document.getElementById("iconPreview").classList.add("hidden")
      document.getElementById("descriptionCounter").textContent = "0"
    }
  }
}

function editApp(appId) {
  window.location.href = `/upload?edit=${appId}`
}

function scrollToUploadForm() {
  document.querySelector(".upload-form-container").scrollIntoView({ behavior: "smooth" })
}

// Utility functions
function generateAppId() {
  return "app_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
}

function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

function isValidImageUrl(url) {
  if (!isValidUrl(url)) return false
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

async function simulateAPICall(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

function showLoading(container) {
  container.innerHTML = '<div class="loading">Loading your apps...</div>'
}

function showError(containerOrMessage, message) {
  if (typeof containerOrMessage === "string") {
    // Show error message at top of page
    showMessage(containerOrMessage, "error")
  } else {
    // Show error in specific container
    containerOrMessage.innerHTML = `<div class="error">⚠️ ${message}</div>`
  }
}

function showSuccess(message) {
  showMessage(message, "success")
}

function showMessage(message, type) {
  // Remove existing messages
  const existingMessages = document.querySelectorAll(".success, .error")
  existingMessages.forEach((msg) => msg.remove())

  // Create new message
  const messageDiv = document.createElement("div")
  messageDiv.className = type
  messageDiv.textContent = message

  // Insert at top of upload content
  const uploadContent = document.getElementById("uploadContent")
  uploadContent.insertBefore(messageDiv, uploadContent.firstChild)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageDiv.remove()
  }, 5000)
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser"))
  } catch {
    return null
  }
}
