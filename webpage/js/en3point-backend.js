// en3point-backend.js - Centralized API layer for en3point backend
// This file handles all backend communication and mock data

// ============================================
// CONFIGURATION
// ============================================
const API_CONFIG = {
    baseUrl: 'https://api.en3point.com', // Update with actual backend URL
    homeUrl: 'http://localhost:8080', // Local development URL
    endpoints: {
        login: '/auth/login',
        validateToken: '/auth/validate',
        users: '/users',
        wallets: '/wallets',
        tokens: '/tokens',
        security: '/security',
        engagement: '/engagement',
        marketplace: '/marketplace',
        distribution: '/distribution',
    },
    homeUrlSelector: true, // true = use homeUrl, false = use baseUrl
    useMockData: true, // Toggle between mock and real backend
    mockDelay: 300 // Simulated network delay in ms
};

// ============================================
// MOCK DATA
// ============================================
const MOCK_DATA = {
    users: [
        { id: 1, name: "Alice Johnson", email: "alice@en3point.com", group: "Administrators", tags: ["tag1"], walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" },
        { id: 2, name: "Bob Smith", email: "bob@en3point.com", group: "Users", tags: ["tag2"], walletAddress: "0x8f12e1A3B2c4D5E6F7890abCdEf123456789aBcD" },
        { id: 3, name: "Carol Williams", email: "carol@en3point.com", group: "Administrators", tags: ["tag1", "tag2"], walletAddress: "0x1234567890aBcDeF1234567890aBcDeF12345678" },
        { id: 4, name: "David Brown", email: "david@en3point.com", group: "Users", tags: ["tag1"], walletAddress: "0xaBcDeF1234567890aBcDeF1234567890aBcDeF12" },
        { id: 5, name: "Emma Davis", email: "emma@en3point.com", group: "Moderators", tags: ["tag2"], walletAddress: "0x567890aBcDeF1234567890aBcDeF1234567890aB" },
        { id: 6, name: "Frank Miller", email: "frank@en3point.com", group: "Users", tags: ["tag1"], walletAddress: "0xcDeF1234567890aBcDeF1234567890aBcDeF1234" },
        { id: 7, name: "Grace Wilson", email: "grace@en3point.com", group: "Administrators", tags: ["tag2"], walletAddress: "0x234567890aBcDeF1234567890aBcDeF123456789" },
        { id: 8, name: "Henry Moore", email: "henry@en3point.com", group: "Users", tags: ["tag1", "tag2"], walletAddress: "0x7890aBcDeF1234567890aBcDeF1234567890aBcD" }
    ],
    
    wallets: [
        { id: 1, address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", balance: "1250.50", currency: "ETH", userId: 1 },
        { id: 2, address: "0x8f12e1A3B2c4D5E6F7890abCdEf123456789aBcD", balance: "890.25", currency: "ETH", userId: 2 }
    ],
    
    tokens: [
        { id: 1, name: "EN3Point Token", symbol: "EN3", supply: "1000000", price: "0.50" },
        { id: 2, name: "Reward Token", symbol: "RWT", supply: "500000", price: "0.25" }
    ]
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Simulate network delay
function delay(ms = API_CONFIG.mockDelay) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Build full API URL based on homeUrlSelector
function buildUrl(endpoint) {
    const selectedUrl = API_CONFIG.homeUrlSelector ? API_CONFIG.homeUrl : API_CONFIG.baseUrl;
    return `${selectedUrl}${endpoint}`;
}

// Make authenticated request
async function authenticatedRequest(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(buildUrl(endpoint), {
        ...options,
        headers
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
}

// ============================================
// AUTHENTICATION API
// ============================================

/**
 * Login user with credentials
 * @param {Object} credentials - User credentials
 * @param {string} credentials.userid - User ID
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Login response with authToken
 */
export async function login({ userid, password }) {
    if (API_CONFIG.useMockData) {
        // Mock implementation
        await delay();
        
        if (userid && password) {
            return {
                status: true,
                result: {
                    authToken: `mock-token-${Date.now()}`,
                    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                    userid: userid,
                    role: 'admin'
                }
            };
        } else {
            return { 
                status: false, 
                error: 'Invalid credentials' 
            };
        }
    }
    
    // Real backend implementation
    try {
        const response = await fetch(buildUrl(API_CONFIG.endpoints.login), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userid, password })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Login error:', error);
        return { 
            status: false, 
            error: error.message 
        };
    }
}

/**
 * Validate authentication token
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Validation response
 */
export async function validateToken(token) {
    if (API_CONFIG.useMockData) {
        // Mock implementation
        await delay(200);
        return { 
            status: token && token.startsWith('mock-token-') 
        };
    }
    
    // Real backend implementation
    try {
        const response = await fetch(buildUrl(API_CONFIG.endpoints.validateToken), {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Token validation error:', error);
        return { status: false };
    }
}

/**
 * Check current login status
 * @returns {Promise<string>} Login status ("registered" or "anon")
 */
export async function checkLoginStatus() {
    let loginStatus = "anon";
    let token = localStorage.getItem("authToken");
    
    if (token) {
        const activeLogin = await validateToken(token);
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

// ============================================
// USERS API
// ============================================

/**
 * Get all users
 * @returns {Promise<Array>} List of users
 */
export async function getUsers() {
    if (API_CONFIG.useMockData) {
        await delay();
        return { 
            status: true, 
            data: MOCK_DATA.users 
        };
    }
    
    return await authenticatedRequest(API_CONFIG.endpoints.users);
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User object
 */
export async function getUserById(userId) {
    if (API_CONFIG.useMockData) {
        await delay();
        const user = MOCK_DATA.users.find(u => u.id === userId);
        return { 
            status: true, 
            data: user || null 
        };
    }
    
    return await authenticatedRequest(`${API_CONFIG.endpoints.users}/${userId}`);
}

/**
 * Create new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
export async function createUser(userData) {
    if (API_CONFIG.useMockData) {
        await delay();
        const newUser = {
            id: MOCK_DATA.users.length + 1,
            ...userData
        };
        MOCK_DATA.users.push(newUser);
        return { 
            status: true, 
            data: newUser 
        };
    }
    
    return await authenticatedRequest(API_CONFIG.endpoints.users, {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

/**
 * Update user
 * @param {number} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user
 */
export async function updateUser(userId, userData) {
    if (API_CONFIG.useMockData) {
        await delay();
        const index = MOCK_DATA.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            MOCK_DATA.users[index] = { ...MOCK_DATA.users[index], ...userData };
            return { 
                status: true, 
                data: MOCK_DATA.users[index] 
            };
        }
        return { 
            status: false, 
            error: 'User not found' 
        };
    }
    
    return await authenticatedRequest(`${API_CONFIG.endpoints.users}/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
}

/**
 * Delete user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Delete confirmation
 */
export async function deleteUser(userId) {
    if (API_CONFIG.useMockData) {
        await delay();
        const index = MOCK_DATA.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            MOCK_DATA.users.splice(index, 1);
            return { 
                status: true, 
                message: 'User deleted' 
            };
        }
        return { 
            status: false, 
            error: 'User not found' 
        };
    }
    
    return await authenticatedRequest(`${API_CONFIG.endpoints.users}/${userId}`, {
        method: 'DELETE'
    });
}

// ============================================
// WALLETS API
// ============================================

/**
 * Get all wallets
 * @returns {Promise<Array>} List of wallets
 */
export async function getWallets() {
    if (API_CONFIG.useMockData) {
        await delay();
        return { 
            status: true, 
            data: MOCK_DATA.wallets 
        };
    }
    
    return await authenticatedRequest(API_CONFIG.endpoints.wallets);
}

/**
 * Get wallet by address
 * @param {string} address - Wallet address
 * @returns {Promise<Object>} Wallet object
 */
export async function getWalletByAddress(address) {
    if (API_CONFIG.useMockData) {
        await delay();
        const wallet = MOCK_DATA.wallets.find(w => w.address === address);
        return { 
            status: true, 
            data: wallet || null 
        };
    }
    
    return await authenticatedRequest(`${API_CONFIG.endpoints.wallets}/${address}`);
}

// ============================================
// TOKENS API
// ============================================

/**
 * Get all tokens
 * @returns {Promise<Array>} List of tokens
 */
export async function getTokens() {
    if (API_CONFIG.useMockData) {
        await delay();
        return { 
            status: true, 
            data: MOCK_DATA.tokens 
        };
    }
    
    return await authenticatedRequest(API_CONFIG.endpoints.tokens);
}

/**
 * Get token by ID
 * @param {number} tokenId - Token ID
 * @returns {Promise<Object>} Token object
 */
export async function getTokenById(tokenId) {
    if (API_CONFIG.useMockData) {
        await delay();
        const token = MOCK_DATA.tokens.find(t => t.id === tokenId);
        return { 
            status: true, 
            data: token || null 
        };
    }
    
    return await authenticatedRequest(`${API_CONFIG.endpoints.tokens}/${tokenId}`);
}

// ============================================
// EXPORT CONFIGURATION
// ============================================

/**
 * Get current API configuration
 * @returns {Object} API configuration
 */
export function getApiConfig() {
    return { ...API_CONFIG };
}

/**
 * Update API configuration
 * @param {Object} config - Configuration updates
 */
export function setApiConfig(config) {
    Object.assign(API_CONFIG, config);
}

/**
 * Toggle between mock and real backend
 * @param {boolean} useMock - Use mock data
 */
export function setMockMode(useMock) {
    API_CONFIG.useMockData = useMock;
    console.log(`API Mode: ${useMock ? 'MOCK' : 'REAL'}`);
}

/**
 * Set URL selector (home or base)
 * @param {boolean} useHomeUrl - true = use homeUrl, false = use baseUrl
 */
export function setUrlSelector(useHomeUrl) {
    API_CONFIG.homeUrlSelector = useHomeUrl;
    const selectedUrl = useHomeUrl ? API_CONFIG.homeUrl : API_CONFIG.baseUrl;
    console.log(`URL Mode: ${useHomeUrl ? 'HOME' : 'BASE'} (${selectedUrl})`);
}

/**
 * Set custom URLs
 * @param {Object} urls - URL configuration
 * @param {string} urls.baseUrl - Base API URL
 * @param {string} urls.homeUrl - Home/local URL
 */
export function setUrls({ baseUrl, homeUrl }) {
    if (baseUrl) API_CONFIG.baseUrl = baseUrl;
    if (homeUrl) API_CONFIG.homeUrl = homeUrl;
    console.log(`URLs updated - Base: ${API_CONFIG.baseUrl}, Home: ${API_CONFIG.homeUrl}`);
}
