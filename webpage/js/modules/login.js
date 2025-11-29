// login.js – authentication and login modal handling

import { login, validateToken, checkLoginStatus } from '../en3point-backend.js';

// Check login status and validate token (re-exported from backend)
export { checkLoginStatus };

// Update admin info display
function updateAdminInfo() {
    const userid = localStorage.getItem('userid') || 'dummy-admin';
    const adminData = localStorage.getItem('adminData');
    let role = 'Admin';
    
    if (adminData) {
        try {
            const data = JSON.parse(adminData);
            role = data.role || 'Admin';
        } catch (e) {
            console.error('Failed to parse admin data:', e);
        }
    }
    
    const userIdEl = document.getElementById('admin-identifier');
    const roleEl = document.getElementById('admin-role');
    
    if (userIdEl) userIdEl.textContent = `User: ${userid}`;
    if (roleEl) roleEl.textContent = `Role: ${role}`;
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorMessage = document.getElementById('login-error-message');
    const loginButton = document.getElementById('login-button');
    
    // Clear previous error
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    
    if (!username || !password) {
        errorMessage.textContent = 'Please fill in all fields.';
        errorMessage.style.display = 'block';
        return;
    }
    
    // Disable button during login
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';
    
    try {
        const result = await login({ userid: username, password });
        
        if (result.status) {
            // Store auth data
            localStorage.setItem('userid', username);
            localStorage.setItem('authToken', result.result.authToken);
            localStorage.setItem('walletAddress', result.result.walletAddress);
            localStorage.setItem('adminData', JSON.stringify(result.result));
            localStorage.setItem('loginStatus', 'registered');
            
            // Update admin info display
            updateAdminInfo();
            
            // Hide modal and show dashboard
            if (window.hideLoginModal) {
                window.hideLoginModal();
            }
            
            // Clear form
            document.getElementById('login-form').reset();
            
            // Navigate to dashboard
            const dashboardBtn = document.querySelector('[data-view="dashboard"]');
            if (dashboardBtn) {
                dashboardBtn.click();
            }
        } else {
            errorMessage.textContent = result.error || 'Login failed. Please check your credentials.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    } finally {
        // Re-enable button
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
}

// Handle password reset
function handlePasswordReset(event) {
    event.preventDefault();
    // TODO: Implement password reset functionality
    alert('Password reset functionality will be implemented soon.');
}

// Handle carousel item selection
function handleCarouselSelection() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    
    carouselItems.forEach(item => {
        item.addEventListener('click', () => {
            carouselItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            
            // Store selected provider
            const provider = item.dataset.provider;
            localStorage.setItem('selectedProvider', provider);
        });
    });
    
    // Select first item by default
    if (carouselItems.length > 0) {
        carouselItems[0].classList.add('selected');
        localStorage.setItem('selectedProvider', carouselItems[0].dataset.provider);
    }
}

// Initialize login module
function init() {
    const loginForm = document.getElementById('login-form');
    const resetLink = document.getElementById('reset-password-link');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (resetLink) {
        resetLink.addEventListener('click', handlePasswordReset);
    }
    
    // Setup carousel
    handleCarouselSelection();
    
    // Update admin info if already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        updateAdminInfo();
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export { init };
