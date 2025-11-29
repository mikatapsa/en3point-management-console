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
            
            <div class="users-detail-actions">
                <button class="btn btn-primary" onclick="alert('Edit user functionality coming soon')">Edit User</button>
                <button class="btn btn-secondary" onclick="alert('Delete user functionality coming soon')">Delete User</button>
            </div>
        </div>
    `;
    
    // Update active state in list
    renderUserList();
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
        
    } catch (error) {
        console.error('Failed to load users:', error);
        const detailPanel = document.querySelector('.users-detail-panel');
        if (detailPanel) {
            detailPanel.innerHTML = '<p class="error">Failed to load users. Please try again.</p>';
        }
    }
}
