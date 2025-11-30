// modules/users.js - User management functionality

import { getUsers } from '../en3point-backend.js';

let allUsers = []; // Will be populated from backend
let currentTag = "all";
let currentSearch = "";
let selectedUserId = null;

// Get user initials for avatar
function getUserInitials(name) {
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
}

// Filter users based on tag and search
function filterUsers() {
    return allUsers.filter(user => {
        // Filter by tag
        const tagMatch = currentTag === "all" || user.tags.includes(currentTag);
        
        // Filter by search
        const searchMatch = !currentSearch || 
            user.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
            user.email.toLowerCase().includes(currentSearch.toLowerCase());
        
        return tagMatch && searchMatch;
    });
}

// Render user list
function renderUserList() {
    const usersList = document.getElementById("users-list");
    const filteredUsers = filterUsers();
    
    if (filteredUsers.length === 0) {
        usersList.innerHTML = '<div class="users-list-empty"><p>No users found</p></div>';
        return;
    }
    
    usersList.innerHTML = filteredUsers.map(user => `
        <div class="users-list-item ${selectedUserId === user.id ? 'active' : ''}" data-user-id="${user.id}">
            <div class="users-list-item-avatar">${getUserInitials(user.name)}</div>
            <div class="users-list-item-info">
                <div class="users-list-item-name">${user.name}</div>
                <div class="users-list-item-email">${user.email}</div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.users-list-item').forEach(item => {
        item.addEventListener('click', () => {
            const userId = parseInt(item.dataset.userId);
            selectUser(userId);
        });
    });
}

// Select and display user details
function selectUser(userId) {
    selectedUserId = userId;
    // Use loaded users array from backend (mockUsers deprecated)
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) return;
    
    const detailContainer = document.getElementById("users-detail-container");
    // Mock owned tokens for demo purposes (would come from backend later)
    const ownedTokens = generateMockTokensForUser(user);

    detailContainer.innerHTML = `
        <div class="users-detail-card">
            <div class="users-detail-header">
                <div class="users-detail-avatar">${getUserInitials(user.name)}</div>
                <div class="users-detail-header-info">
                    <h2>${user.name}</h2>
                    <p>${user.email}</p>
                </div>
            </div>
            <div class="users-detail-info">
                <div class="users-detail-field">
                    <div class="users-detail-field-label">User ID</div>
                    <div class="users-detail-field-value">#${user.id}</div>
                </div>
                <div class="users-detail-field">
                    <div class="users-detail-field-label">Group</div>
                    <div class="users-detail-field-value">${user.group}</div>
                </div>
                <div class="users-detail-field">
                    <div class="users-detail-field-label">Wallet Address</div>
                    <div class="users-detail-field-value">${user.walletAddress}</div>
                </div>
                <div class="users-detail-field">
                    <div class="users-detail-field-label">Tags</div>
                    <div class="users-detail-tags">
                        ${user.tags.map(tag => `<span class="users-detail-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="users-token-section">
                <h3 class="users-token-section-title">Owned Tokens</h3>
                <div id="users-token-grid" class="users-token-grid">
                    ${ownedTokens.map(t => tokenCardMarkup(t)).join('')}
                </div>
            </div>
            <div class="users-detail-actions">
                <button class="btn btn-primary" onclick="alert('Edit user functionality coming soon')">Edit User</button>
                <button class="btn btn-secondary" onclick="alert('Delete user functionality coming soon')">Delete User</button>
            </div>
        </div>
    `;

    // Wire token card clicks to open modal
    document.querySelectorAll('.users-token-card').forEach(card => {
        card.addEventListener('click', () => {
            const symbol = card.getAttribute('data-symbol');
            const token = ownedTokens.find(t => t.symbol === symbol);
            if (token) openTokenModal(token, user);
        });
    });
    
    // Update active state in list
    renderUserList();
}

// Generate mock tokens (placeholder until backend integration)
function generateMockTokensForUser(user) {
    const base = user.id % 3 + 3; // 3–5 tokens
    const samples = [
        { name: 'Reward Points', symbol: 'RWD', type: 'ERC20', supply: '1,000,000', desc: 'Loyalty reward token' },
        { name: 'Access Pass', symbol: 'PASS', type: 'ERC721', supply: '500', desc: 'Membership NFT pass' },
        { name: 'Voucher Credit', symbol: 'VCHR', type: 'ERC20', supply: '250,000', desc: 'Voucher credit token' },
        { name: 'Engagement Badge', symbol: 'BADGE', type: 'ERC1155', supply: '10,000', desc: 'Engagement multi-token' },
        { name: 'Legacy Point', symbol: 'LGPT', type: 'ERC20', supply: '5,000,000', desc: 'Legacy points' }
    ];
    return samples.slice(0, base);
}

function tokenCardMarkup(t) {
    return `
        <div class="users-token-card" data-symbol="${t.symbol}" tabindex="0" role="button" aria-label="View token ${t.name}">
            <div class="users-token-card-header">
                <span class="users-token-symbol">${t.symbol}</span>
                <span class="users-token-type">${t.type}</span>
            </div>
            <div class="users-token-name">${t.name}</div>
            <div class="users-token-supply">Supply: ${t.supply}</div>
        </div>
    `;
}

// Token detail modal
function openTokenModal(token, user) {
    closeTokenModal(); // ensure single instance
    const modal = document.createElement('div');
    modal.className = 'users-token-modal-overlay';
    modal.innerHTML = `
        <div class="users-token-modal" role="dialog" aria-modal="true" aria-label="Token ${token.name} details">
            <div class="users-token-modal-header">
                <h2>${token.name} <span class="modal-symbol">(${token.symbol})</span></h2>
                <button class="users-token-modal-close" aria-label="Close token details">×</button>
            </div>
            <div class="users-token-modal-body">
                <div class="users-token-modal-props">
                    <div><strong>Type:</strong> ${token.type}</div>
                    <div><strong>Supply:</strong> ${token.supply}</div>
                    <div><strong>Owner Wallet:</strong> ${user.walletAddress}</div>
                    <div><strong>Description:</strong> ${token.desc}</div>
                </div>
                <div class="users-token-modal-actions">
                    <button class="btn btn-primary" data-deeplink-mode="editor">Open in Editor</button>
                    <button class="btn btn-secondary" data-deeplink-mode="distribution">View Distribution</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.users-token-modal-close').addEventListener('click', closeTokenModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeTokenModal(); });
    modal.querySelectorAll('[data-deeplink-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-deeplink-mode');
            localStorage.setItem('tokenStudioMode', mode);
            localStorage.setItem('tokenStudioTokenSymbol', token.symbol);
            // Navigate via existing deep-link helper
            if (window.aiDeepLink) {
                window.aiDeepLink('tokenStudio');
            }
            closeTokenModal();
        });
    });
}

function closeTokenModal() {
    const existing = document.querySelector('.users-token-modal-overlay');
    if (existing) existing.remove();
}

// Handle tag selection
function handleTagSelection(tag) {
    currentTag = tag;
    
    // Update active tag
    document.querySelectorAll('.users-tag').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tag === tag);
    });
    
    // Reset selection and re-render
    selectedUserId = null;
    renderUserList();
    
    // Clear detail panel
    const detailContainer = document.getElementById("users-detail-container");
    detailContainer.innerHTML = '<div class="users-detail-empty"><p>Select a user to view details</p></div>';
}

// Handle search input
function handleSearch(query) {
    currentSearch = query;
    selectedUserId = null;
    renderUserList();
    
    // Clear detail panel if search changed
    const detailContainer = document.getElementById("users-detail-container");
    detailContainer.innerHTML = '<div class="users-detail-empty"><p>Select a user to view details</p></div>';
}

// Initialize users view - load data and setup UI
export async function init() {
    console.log("Initializing users view");
    
    try {
        // Load users from backend
        const response = await getUsers();
        allUsers = response.data || [];
        
        // Reset state
        currentTag = "all";
        currentSearch = "";
        selectedUserId = null;
        
        // Set up tag selector
        document.querySelectorAll('.users-tag').forEach(btn => {
            btn.addEventListener('click', () => {
                handleTagSelection(btn.dataset.tag);
            });
        });
        
        // Set up search
        const searchInput = document.getElementById('users-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                handleSearch(e.target.value);
            });
        }
        
        // Initial render
        renderUserList();

        // Mode selection handlers - ensure only selected section visible
        const modeButtons = document.querySelectorAll('.users-mode-btn');
        const userContainer = document.querySelector('.users-container');
        const forms = document.querySelectorAll('.users-onboard-form');

        function switchMode(mode) {
            modeButtons.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
            if (userContainer) {
                userContainer.style.display = (mode === 'find') ? 'grid' : 'none';
            }
            forms.forEach(f => {
                const frmMode = f.getAttribute('data-mode-panel');
                f.hidden = frmMode !== mode;
            });
        }
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => switchMode(btn.dataset.mode));
        });

        // Initialize default mode to 'find' so others are hidden
        switchMode('find');

        // Stub onboarding form submissions
        const formDefs = [
            { id: 'onboard-user-form', status: 'ou-status', label: 'User' },
            { id: 'onboard-admin-form', status: 'oa-status', label: 'Admin' },
            { id: 'onboard-member-form', status: 'om-status', label: 'Member' },
        ];
        formDefs.forEach(def => {
            const form = document.getElementById(def.id);
            const statusEl = document.getElementById(def.status);
            form?.addEventListener('submit', (e) => {
                e.preventDefault();
                if (statusEl) {
                    statusEl.textContent = `Onboarding ${def.label} (demo)...`;
                    setTimeout(()=>{ statusEl.textContent = `${def.label} onboarded (demo, not persisted).`; form.reset(); }, 900);
                }
            });
        });
        
    } catch (error) {
        console.error('Failed to load users:', error);
        const detailPanel = document.querySelector('.users-detail-panel');
        if (detailPanel) {
            detailPanel.innerHTML = '<p class="error">Failed to load users. Please try again.</p>';
        }
    }
}
