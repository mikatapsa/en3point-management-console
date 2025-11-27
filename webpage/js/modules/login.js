// login.js – authentication and login modal handling

// Mock API function - replace with actual backend call
async function en3pointLogin({ userid, password }) {
    // TODO: Replace with actual API call to en3point-backend
    // const response = await fetch('API_ENDPOINT/auth/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ userid, password })
    // });
    // return await response.json();

    // Mock successful login for development
    return new Promise((resolve) => {
        setTimeout(() => {
            if (userid && password) {
                resolve({
                    status: true,
                    result: {
                        authToken: `mock-token-${Date.now()}`,
                        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                        userid: userid,
                        role: 'admin'
                    }
                });
            } else {
                resolve({ status: false, error: 'Invalid credentials' });
            }
        }, 500);
    });
}

// Mock token validation - replace with actual backend call
async function isLogin(token) {
    // TODO: Replace with actual API call to validate token
    // const response = await fetch('API_ENDPOINT/auth/validate', {
    //     headers: { 'Authorization': `Bearer ${token}` }
    // });
    // return await response.json();

    // Mock validation for development
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ status: token && token.startsWith('mock-token-') });
        }, 200);
    });
}

// Check login status and validate token
export async function checkLoginStatus() {
    let loginStatus = "anon";
    let token = localStorage.getItem("authToken");
    
    if (token) {
        const activeLogin = await isLogin(token);
        if (activeLogin.status) {
            loginStatus = "registered";
        } else {
            // Token invalid, clear it
            localStorage.removeItem("authToken");
            localStorage.removeItem("userid");
            localStorage.removeItem("walletAddress");
            localStorage.removeItem("adminData");
        }
    }
    
    localStorage.setItem("loginStatus", loginStatus);
    return loginStatus;
}

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
        const result = await en3pointLogin({ userid: username, password });
        
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
