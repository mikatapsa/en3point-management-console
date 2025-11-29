// app.js – unified SPA navigation + per-view init hooks

const buttons = document.querySelectorAll(".nav-btn");
const viewsContainer = document.getElementById("views-container");
let currentView = null;

// map of init functions per view (to be filled as you migrate logic)
const viewInitializers = {
    users: () => import("./modules/users.js").then(m => m.init && m.init()),
    tokens: () => import("./modules/tokens.js").then(m => m.init && m.init()),
    // dashboard: () => import("./modules/dashboard.js").then(m => m.init && m.init()),
};

// Load HTML module content
async function loadViewContent(name) {
    try {
        const response = await fetch(`./html/modules/${name}.html`);
        if (!response.ok) {
            throw new Error(`Failed to load ${name}.html`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error loading view ${name}:`, error);
        return `<h1>Error Loading View</h1><p>Could not load ${name} view.</p>`;
    }
}

async function showView(name) {
    // Check auth before view transition
    if (!checkAuth()) {
        return; // showLoginModal() already called by checkAuth
    }

    // Update active button
    buttons.forEach(b => {
        b.classList.toggle("active", b.dataset.view === name);
    });

    // Load and display view content
    if (currentView !== name) {
        const content = await loadViewContent(name);
        viewsContainer.innerHTML = content;
        currentView = name;

        // Call view initializer if exists
        if (viewInitializers[name]) {
            viewInitializers[name]();
        }
    }
}

// Check authentication status
function checkAuth() {
    const token = localStorage.getItem("authToken");
    if (!token) {
        showLoginModal();
        return false;
    }
    return true;
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById("login-modal");
    if (modal) {
        modal.classList.remove("hidden");
    }
}

// Hide login modal
function hideLoginModal() {
    const modal = document.getElementById("login-modal");
    if (modal) {
        modal.classList.add("hidden");
    }
}

// Make functions available globally for login module
window.hideLoginModal = hideLoginModal;
window.showLoginModal = showLoginModal;

// top nav events
buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        showView(view);
    });
});

// Check auth on startup
if (checkAuth()) {
    // default view
    showView("dashboard");
}
