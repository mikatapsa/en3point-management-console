// app.js – unified SPA navigation + per-view init hooks

const buttons = document.querySelectorAll(".nav-btn");
const viewsContainer = document.getElementById("views-container");
let currentView = null;
const logoutBtn = document.getElementById("logout-btn");
const aiToggleBtn = document.getElementById("ai-toggle-btn");
const aiPanel = document.getElementById("ai-panel");

// map of init functions per view (to be filled as you migrate logic)
const viewInitializers = {
    users: () => import("./modules/users.js").then(m => m.init && m.init()),
    tokenStudio: () => import("./modules/tokenStudio.js").then(m => m.init && m.init()),
    aiAdmin: () => import("./modules/aiAssistant.js").then(m => m.init && m.init()),
    service_provider: () => import("./modules/service_provider.js").then(m => m.init && m.init()),
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

// Logout behavior: clear session/local data and show login
function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userid");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("adminData");
    localStorage.removeItem("loginStatus");
    showLoginModal();
}

// AI Assistant toggle
function toggleAIPanel() {
    if (!aiPanel) return;
    aiPanel.classList.toggle("hidden");
}

// Update AI Assistant context based on current view
function updateAIContext(viewName) {
    const sectionTitle = document.getElementById("ai-section-title");
    const commonQuestionsList = document.getElementById("common-questions-list");
    
    if (!sectionTitle || !commonQuestionsList) return;
    
    const contextMap = {
        tokenStudio: {
            title: "AI Assistant - Token Studio",
            questions: [
                "How do I create a new ERC-20 token?",
                "What properties should a reward token have?",
                "How do I make a burnable token?"
            ]
        },
        users: {
            title: "AI Assistant - Users",
            questions: [
                "How do I find a user by email?",
                "How do I add a new user?",
                "How do I manage user roles?"
            ]
        },
        wallets: {
            title: "AI Assistant - Wallets",
            questions: [
                "How do I view wallet balance?",
                "How do I link a wallet to a user?",
                "How do I transfer tokens?"
            ]
        },
        dashboard: {
            title: "AI Assistant - Dashboard",
            questions: [
                "What's the system status?",
                "How do I view analytics?",
                "Where can I see recent activity?"
            ]
        },
        aiAdmin: {
            title: "AI Assistant - Admin Settings",
            questions: [
                "How do I refresh AI projects?",
                "How can I adjust generation parameters?",
                "How do I remove obsolete project files?"
            ]
        },
        service_provider: {
            title: "AI Assistant - Service Providers",
            questions: [
                "How do I onboard a provider?",
                "How do I modify provider services?",
                "How do I remove a provider?"
            ]
        }
    };
    
    const context = contextMap[viewName] || {
        title: "AI Assistant - General",
        questions: [
            "How do I create a new token?",
            "How do I find a user by email?",
            "How do I review security settings?"
        ]
    };
    
    sectionTitle.textContent = context.title;
    commonQuestionsList.innerHTML = context.questions
        .map(q => `<li class="question-item" data-question="${q}">${q}</li>`)
        .join('');
    
    // Re-attach click listeners to new question items
    attachQuestionClickListeners();
}

// Store recent questions in localStorage
let recentQuestions = JSON.parse(localStorage.getItem("recentQuestions") || "[]");

function addRecentQuestion(question) {
    // Remove if already exists
    recentQuestions = recentQuestions.filter(q => q !== question);
    // Add to beginning
    recentQuestions.unshift(question);
    // Keep only last 5
    recentQuestions = recentQuestions.slice(0, 5);
    // Save
    localStorage.setItem("recentQuestions", JSON.stringify(recentQuestions));
    updateRecentQuestionsList();
}

function updateRecentQuestionsList() {
    const recentList = document.getElementById("recent-questions-list");
    if (!recentList) return;
    
    recentList.innerHTML = recentQuestions
        .map(q => `<li class="question-item" data-question="${q}">${q}</li>`)
        .join('');
    
    // Attach click listeners
    attachQuestionClickListeners();
}

function attachQuestionClickListeners() {
    document.querySelectorAll(".question-item").forEach(item => {
        item.addEventListener("click", () => {
            const question = item.dataset.question;
            const descInput = document.getElementById("token-description-input");
            if (descInput) {
                descInput.value = question;
                descInput.focus();
            }
        });
    });
}

// Deep-link function for AI-suggested actions
window.aiDeepLink = function(viewName, params = {}) {
    showView(viewName);
    
    // If params provided, trigger view-specific prefill
    if (Object.keys(params).length > 0) {
        setTimeout(() => {
            const event = new CustomEvent("aiPrefill", { detail: params });
            document.dispatchEvent(event);
        }, 100);
    }
};

// top nav events
buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        showView(view);
        updateAIContext(view);
    });
});

// Wire logout and AI toggle
if (logoutBtn) logoutBtn.addEventListener("click", logout);
if (aiToggleBtn) aiToggleBtn.addEventListener("click", toggleAIPanel);

// AI Assistant discussion wiring
const discussBtn = document.getElementById("discuss-token-btn");
const descInput = document.getElementById("token-description-input");
const aiResponseBox = document.getElementById("ai-response");
const aiDeepLinks = document.getElementById("ai-deeplinks");

function handleAIDiscussion() {
    const text = descInput.value.trim();
    if (!text) {
        aiResponseBox.innerHTML = `<p class="placeholder-text">Please describe your task first.</p>`;
        aiDeepLinks.innerHTML = '';
        return;
    }
    addRecentQuestion(text);
    const textLower = text.toLowerCase();
    let response = '';
    let links = [];

    if (textLower.includes("token") || textLower.includes("create")) {
        response = `<div class=\"ai-reply\"><p><strong>Understanding:</strong> You want to create a token.</p><p><strong>Suggestion:</strong> Use Token Studio to configure properties.</p></div>`;
        links.push({ label: 'Open Token Studio', view: 'tokenStudio', params: { description: text } });
    } else if (textLower.includes("user") || textLower.includes("find")) {
        response = `<div class=\"ai-reply\"><p><strong>Understanding:</strong> You want to work with users.</p><p><strong>Suggestion:</strong> Navigate to Users for search and management.</p></div>`;
        links.push({ label: 'Go to Users', view: 'users' });
    } else if (textLower.includes("provider")) {
        response = `<div class=\"ai-reply\"><p><strong>Understanding:</strong> You want to manage service providers.</p><p><strong>Suggestion:</strong> Use Service Provider view for onboarding or updates.</p></div>`;
        links.push({ label: 'Service Provider View', view: 'service_provider' });
    } else if (textLower.includes("project") || textLower.includes("ai")) {
        response = `<div class=\"ai-reply\"><p><strong>Understanding:</strong> You refer to AI admin tasks.</p><p><strong>Suggestion:</strong> Open AI Admin to manage projects.</p></div>`;
        links.push({ label: 'AI Admin Settings', view: 'aiAdmin' });
    } else {
        response = `<div class=\"ai-reply\"><p><strong>Understanding:</strong> ${text}</p><p><strong>Suggestion:</strong> Pick a related section or refine your query.</p></div>`;
    }

    aiResponseBox.innerHTML = response;
    aiDeepLinks.innerHTML = links.map(l => `<a href="#" data-view="${l.view}" data-params='${JSON.stringify(l.params||{})}' class="ai-link">${l.label}</a>`).join('');
    document.querySelectorAll('.ai-link').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const view = a.dataset.view;
            const params = JSON.parse(a.dataset.params || '{}');
            window.aiDeepLink(view, params);
        });
    });
}

if (discussBtn && descInput && aiResponseBox) {
    discussBtn.addEventListener("click", handleAIDiscussion);
    descInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && e.ctrlKey) {
            handleAIDiscussion();
        }
    });
}

updateRecentQuestionsList();
attachQuestionClickListeners();

// Check auth on startup
if (checkAuth()) {
    // default view
    showView("dashboard");
}
