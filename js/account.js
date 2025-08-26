// Account page functionality
document.addEventListener("DOMContentLoaded", () => {
  initializeAccount()
  setupAuthTabs()
  setupAuthForms()
  setupProfileTabs()
  checkAuthState()
})

// JSONBin configuration (replace with your actual bin IDs and API key)
const USERS_BIN_ID = "your-users-bin-id" // Replace with actual JSONBin bin ID
const USER_DATA_BIN_ID = "your-user-data-bin-id" // Replace with actual JSONBin bin ID

let currentUser = null

function initializeAccount() {
  // Check if user is already logged in
  currentUser = getCurrentUser()

  if (currentUser) {
    showProfile()
    loadUserData()
  } else {
    showAuth()
  }
}

function setupAuthTabs() {
  const authTabs = document.querySelectorAll(".auth-tab")

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab
      switchAuthTab(targetTab)
    })
  })
}

function switchAuthTab(tabName) {
  // Update tab buttons
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName)
  })

  // Update form visibility
  document.getElementById("loginForm").classList.toggle("hidden", tabName !== "login")
  document.getElementById("registerForm").classList.toggle("hidden", tabName !== "register")
}

function setupAuthForms() {
  // Login form
  const loginForm = document.getElementById("loginFormElement")
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  // Register form
  const registerForm = document.getElementById("registerFormElement")
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister)
  }

  // Demo login
  const demoLoginBtn = document.getElementById("demoLogin")
  if (demoLoginBtn) {
    demoLoginBtn.addEventListener("click", handleDemoLogin)
  }

  // Password strength checker
  const passwordInput = document.getElementById("registerPassword")
  if (passwordInput) {
    passwordInput.addEventListener("input", checkPasswordStrength)
  }

  // Password confirmation
  const confirmPasswordInput = document.getElementById("confirmPassword")
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", checkPasswordMatch)
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout)
  }

  // Settings forms
  const settingsForm = document.getElementById("settingsForm")
  if (settingsForm) {
    settingsForm.addEventListener("submit", handleSettingsUpdate)
  }

  const passwordForm = document.getElementById("passwordForm")
  if (passwordForm) {
    passwordForm.addEventListener("submit", handlePasswordChange)
  }
}

function setupProfileTabs() {
  const profileTabs = document.querySelectorAll(".profile-tab")

  profileTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab
      switchProfileTab(targetTab)
    })
  })
}

function switchProfileTab(tabName) {
  // Update tab buttons
  document.querySelectorAll(".profile-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName)
  })

  // Update content visibility
  document.querySelectorAll(".profile-tab-content").forEach((content) => {
    content.classList.add("hidden")
  })

  const targetContent = document.getElementById(`${tabName}Tab`)
  if (targetContent) {
    targetContent.classList.remove("hidden")
  }

  // Load tab-specific data
  loadTabData(tabName)
}

async function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value
  const rememberMe = document.getElementById("rememberMe").checked

  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.textContent

  try {
    submitBtn.textContent = "Signing in..."
    submitBtn.disabled = true

    // In a real implementation, this would authenticate with JSONBin
    // For demo purposes, we'll simulate authentication
    await simulateAPICall(1000)

    // Check if user exists (simplified for demo)
    const user = await authenticateUser(email, password)

    if (user) {
      currentUser = user
      setCurrentUser(user)

      if (rememberMe) {
        localStorage.setItem("rememberUser", "true")
      }

      showSuccess("Successfully signed in!")
      setTimeout(() => {
        showProfile()
        loadUserData()
      }, 1000)
    } else {
      showError("Invalid email or password")
    }
  } catch (error) {
    console.error("Login error:", error)
    showError("Login failed. Please try again.")
  } finally {
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }
}

async function handleRegister(e) {
  e.preventDefault()

  const firstName = document.getElementById("firstName").value
  const lastName = document.getElementById("lastName").value
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const agreeTerms = document.getElementById("agreeTerms").checked

  // Validation
  if (password !== confirmPassword) {
    showError("Passwords do not match")
    return
  }

  if (!agreeTerms) {
    showError("Please agree to the Terms of Service and Privacy Policy")
    return
  }

  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.textContent

  try {
    submitBtn.textContent = "Creating account..."
    submitBtn.disabled = true

    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      showError("An account with this email already exists")
      return
    }

    // Create new user
    const newUser = {
      id: generateUserId(),
      firstName,
      lastName,
      email,
      password: hashPassword(password), // In real app, hash on server
      createdAt: new Date().toISOString(),
      avatar: `/placeholder.svg?height=100&width=100&query=user+avatar`,
      bio: "",
      stats: {
        appsUploaded: 0,
        totalDownloads: 0,
        avgRating: 0,
      },
    }

    // Save user (in real app, this would be JSONBin API call)
    await saveUser(newUser)

    currentUser = newUser
    setCurrentUser(newUser)

    showSuccess("Account created successfully!")
    setTimeout(() => {
      showProfile()
      loadUserData()
    }, 1000)
  } catch (error) {
    console.error("Registration error:", error)
    showError("Registration failed. Please try again.")
  } finally {
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }
}

async function handleDemoLogin() {
  const demoUser = {
    id: "demo-user",
    firstName: "Demo",
    lastName: "User",
    email: "demo@mintappz.com",
    createdAt: "2024-01-01T00:00:00.000Z",
    avatar: `/placeholder.svg?height=100&width=100&query=demo+user+avatar`,
    bio: "This is a demo account to explore Mint Appz features.",
    stats: {
      appsUploaded: 3,
      totalDownloads: 1250,
      avgRating: 4.6,
    },
  }

  currentUser = demoUser
  setCurrentUser(demoUser)

  showSuccess("Signed in with demo account!")
  setTimeout(() => {
    showProfile()
    loadUserData()
  }, 1000)
}

function handleLogout() {
  currentUser = null
  localStorage.removeItem("currentUser")
  localStorage.removeItem("rememberUser")

  showSuccess("Successfully signed out!")
  setTimeout(() => {
    showAuth()
  }, 1000)
}

async function handleSettingsUpdate(e) {
  e.preventDefault()

  const firstName = document.getElementById("settingsFirstName").value
  const lastName = document.getElementById("settingsLastName").value
  const email = document.getElementById("settingsEmail").value
  const bio = document.getElementById("settingsBio").value

  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.textContent

  try {
    submitBtn.textContent = "Saving..."
    submitBtn.disabled = true

    // Update user data
    currentUser.firstName = firstName
    currentUser.lastName = lastName
    currentUser.email = email
    currentUser.bio = bio

    // Save updated user (in real app, this would be JSONBin API call)
    await saveUser(currentUser)
    setCurrentUser(currentUser)

    // Update profile display
    updateProfileDisplay()

    showSuccess("Profile updated successfully!")
  } catch (error) {
    console.error("Settings update error:", error)
    showError("Failed to update profile. Please try again.")
  } finally {
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }
}

async function handlePasswordChange(e) {
  e.preventDefault()

  const currentPassword = document.getElementById("currentPassword").value
  const newPassword = document.getElementById("newPassword").value
  const confirmNewPassword = document.getElementById("confirmNewPassword").value

  if (newPassword !== confirmNewPassword) {
    showError("New passwords do not match")
    return
  }

  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalText = submitBtn.textContent

  try {
    submitBtn.textContent = "Updating..."
    submitBtn.disabled = true

    // Verify current password (simplified for demo)
    if (!verifyPassword(currentPassword, currentUser.password)) {
      showError("Current password is incorrect")
      return
    }

    // Update password
    currentUser.password = hashPassword(newPassword)
    await saveUser(currentUser)

    // Clear form
    e.target.reset()

    showSuccess("Password updated successfully!")
  } catch (error) {
    console.error("Password change error:", error)
    showError("Failed to update password. Please try again.")
  } finally {
    submitBtn.textContent = originalText
    submitBtn.disabled = false
  }
}

function checkPasswordStrength() {
  const password = document.getElementById("registerPassword").value
  const strengthIndicator = document.getElementById("passwordStrength")

  let strength = 0
  let message = ""

  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  switch (strength) {
    case 0:
    case 1:
    case 2:
      strengthIndicator.className = "password-strength weak"
      message = "Weak password"
      break
    case 3:
    case 4:
      strengthIndicator.className = "password-strength medium"
      message = "Medium password"
      break
    case 5:
      strengthIndicator.className = "password-strength strong"
      message = "Strong password"
      break
  }

  strengthIndicator.textContent = message
}

function checkPasswordMatch() {
  const password = document.getElementById("registerPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const confirmInput = document.getElementById("confirmPassword")

  if (confirmPassword && password !== confirmPassword) {
    confirmInput.style.borderColor = "#dc3545"
  } else {
    confirmInput.style.borderColor = "#e9ecef"
  }
}

function showAuth() {
  document.getElementById("authContainer").classList.remove("hidden")
  document.getElementById("profileContainer").classList.add("hidden")
}

function showProfile() {
  document.getElementById("authContainer").classList.add("hidden")
  document.getElementById("profileContainer").classList.remove("hidden")
  updateProfileDisplay()
}

function updateProfileDisplay() {
  if (!currentUser) return

  document.getElementById("profileName").textContent = `${currentUser.firstName} ${currentUser.lastName}`
  document.getElementById("profileEmail").textContent = currentUser.email
  document.getElementById("profileAvatar").src = currentUser.avatar
  document.getElementById("memberSince").textContent = new Date(currentUser.createdAt).getFullYear()

  // Update stats
  document.getElementById("appsUploaded").textContent = currentUser.stats.appsUploaded
  document.getElementById("totalDownloads").textContent = currentUser.stats.totalDownloads.toLocaleString()
  document.getElementById("avgRating").textContent = currentUser.stats.avgRating.toFixed(1)

  // Update settings form
  document.getElementById("settingsFirstName").value = currentUser.firstName
  document.getElementById("settingsLastName").value = currentUser.lastName
  document.getElementById("settingsEmail").value = currentUser.email
  document.getElementById("settingsBio").value = currentUser.bio || ""
}

async function loadUserData() {
  // Load user-specific data like apps, downloads, activity
  loadTabData("overview")
}

async function loadTabData(tabName) {
  switch (tabName) {
    case "overview":
      loadRecentActivity()
      break
    case "apps":
      loadUserApps()
      break
    case "downloads":
      loadUserDownloads()
      break
    case "settings":
      // Settings are already loaded in updateProfileDisplay
      break
  }
}

function loadRecentActivity() {
  const activityList = document.getElementById("activityList")

  // Sample activity data
  const activities = [
    {
      icon: "📱",
      title: "App uploaded",
      description: "Photo Editor Pro was successfully uploaded",
      time: "2 hours ago",
    },
    {
      icon: "⭐",
      title: "New review received",
      description: "Your app received a 5-star review",
      time: "1 day ago",
    },
    {
      icon: "📥",
      title: "Download milestone",
      description: "Your apps reached 1,000 total downloads",
      time: "3 days ago",
    },
  ]

  activityList.innerHTML = activities
    .map(
      (activity) => `
    <div class="activity-item">
      <div class="activity-icon">${activity.icon}</div>
      <div class="activity-content">
        <h4>${activity.title}</h4>
        <p>${activity.description}</p>
      </div>
      <div class="activity-time">${activity.time}</div>
    </div>
  `,
    )
    .join("")
}

function loadUserApps() {
  const userAppsGrid = document.getElementById("userAppsGrid")

  // In a real app, this would fetch user's apps from JSONBin
  const userApps = [
    {
      id: 1,
      name: "Photo Editor Pro",
      icon: "/photo-editor-app-icon.png",
      downloads: "10K+",
      rating: 4.8,
      status: "Published",
    },
    {
      id: 5,
      name: "Fitness Tracker",
      icon: "/fitness-app-icon.png",
      downloads: "75K+",
      rating: 4.5,
      status: "Published",
    },
  ]

  if (userApps.length === 0) {
    userAppsGrid.innerHTML = `
      <div class="no-apps">
        <h3>No apps uploaded yet</h3>
        <p>Start by uploading your first app!</p>
        <a href="/upload" class="btn btn-primary">Upload App</a>
      </div>
    `
    return
  }

  userAppsGrid.innerHTML = userApps
    .map(
      (app) => `
    <div class="app-card">
      <div class="app-header">
        <img src="${app.icon}" alt="${app.name}" class="app-icon">
        <div class="app-info">
          <h3>${app.name}</h3>
          <span class="app-category">${app.status}</span>
        </div>
      </div>
      <div class="app-stats">
        <span class="app-stat">⭐ ${app.rating}</span>
        <span class="app-stat">📥 ${app.downloads}</span>
      </div>
      <div class="app-actions">
        <button class="btn btn-outline" onclick="editApp(${app.id})">Edit</button>
        <button class="btn btn-secondary" onclick="deleteApp(${app.id})">Delete</button>
      </div>
    </div>
  `,
    )
    .join("")
}

function loadUserDownloads() {
  const downloadsList = document.getElementById("downloadsList")

  // Sample download history
  const downloads = [
    {
      id: 2,
      name: "Puzzle Master",
      icon: "/puzzle-game-app-icon.png",
      downloadDate: "2024-01-20",
    },
    {
      id: 3,
      name: "Study Buddy",
      icon: "/education-app-icon.png",
      downloadDate: "2024-01-18",
    },
  ]

  if (downloads.length === 0) {
    downloadsList.innerHTML = `
      <div class="no-downloads">
        <h3>No downloads yet</h3>
        <p>Browse the store to find amazing apps!</p>
        <a href="/store" class="btn btn-primary">Browse Store</a>
      </div>
    `
    return
  }

  downloadsList.innerHTML = downloads
    .map(
      (download) => `
    <div class="download-item">
      <img src="${download.icon}" alt="${download.name}">
      <div class="download-info">
        <h4>${download.name}</h4>
        <p>Downloaded on ${formatDate(download.downloadDate)}</p>
      </div>
      <div class="download-date">${formatDate(download.downloadDate)}</div>
    </div>
  `,
    )
    .join("")
}

function checkAuthState() {
  // Check if user should remain logged in
  const rememberUser = localStorage.getItem("rememberUser")
  if (rememberUser && currentUser) {
    // User should remain logged in
    return
  }
}

// Utility functions
async function authenticateUser(email, password) {
  // In a real implementation, this would call JSONBin API
  // For demo, we'll simulate authentication

  if (email === "demo@mintappz.com" && password === "demo123") {
    return {
      id: "demo-user",
      firstName: "Demo",
      lastName: "User",
      email: "demo@mintappz.com",
      createdAt: "2024-01-01T00:00:00.000Z",
      avatar: `/placeholder.svg?height=100&width=100&query=demo+user+avatar`,
      bio: "This is a demo account to explore Mint Appz features.",
      stats: {
        appsUploaded: 3,
        totalDownloads: 1250,
        avgRating: 4.6,
      },
    }
  }

  return null
}

async function findUserByEmail(email) {
  // In a real implementation, this would search JSONBin
  return null
}

async function saveUser(user) {
  // In a real implementation, this would save to JSONBin
  await simulateAPICall(500)
  return user
}

function generateUserId() {
  return "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
}

function hashPassword(password) {
  // In a real implementation, use proper hashing (bcrypt, etc.)
  // This is just for demo purposes
  return btoa(password)
}

function verifyPassword(password, hashedPassword) {
  // In a real implementation, use proper verification
  return btoa(password) === hashedPassword
}

async function simulateAPICall(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

function showSuccess(message) {
  showMessage(message, "success")
}

function showError(message) {
  showMessage(message, "error")
}

function showMessage(message, type) {
  // Remove existing messages
  const existingMessages = document.querySelectorAll(".success, .error")
  existingMessages.forEach((msg) => msg.remove())

  // Create new message
  const messageDiv = document.createElement("div")
  messageDiv.className = type
  messageDiv.textContent = message

  // Insert at top of auth container or profile container
  const container = document.getElementById("authContainer").classList.contains("hidden")
    ? document.getElementById("profileContainer")
    : document.getElementById("authContainer")

  container.insertBefore(messageDiv, container.firstChild)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageDiv.remove()
  }, 5000)
}

function editApp(appId) {
  window.location.href = `/upload?edit=${appId}`
}

function deleteApp(appId) {
  if (confirm("Are you sure you want to delete this app?")) {
    // In a real implementation, this would delete from JSONBin
    console.log(`Deleting app ${appId}`)
    loadUserApps() // Reload the apps list
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Declare the functions that were previously undeclared
function getCurrentUser() {
  // Placeholder for actual implementation
  return JSON.parse(localStorage.getItem("currentUser"))
}

function setCurrentUser(user) {
  // Placeholder for actual implementation
  localStorage.setItem("currentUser", JSON.stringify(user))
}
