// app.js – unified SPA navigation + per-view init hooks

const views = document.querySelectorAll(".view");
const buttons = document.querySelectorAll(".nav-btn");

// map of init functions per view (to be filled as you migrate logic)
const viewInitializers = {
    // dashboard: () => import("./modules/dashboard.js").then(m => m.init && m.init()),
    // users: () => import("./modules/users.js").then(m => m.init && m.init()),
};

function showView(name) {
    // Check auth before view transition
    if (!checkAuth()) {
        return; // showLoginModal() already called by checkAuth
    }

    views.forEach(v => v.classList.remove("active"));
    const target = document.getElementById(`view-${name}`);
    if (target) {
        target.classList.add("active");
    }

    buttons.forEach(b => {
        b.classList.toggle("active", b.dataset.view === name);
    });

    if (viewInitializers[name]) {
        viewInitializers[name]();
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
