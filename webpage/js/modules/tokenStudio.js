// modules/tokenStudio.js - Token Studio functionality

import { getWallets } from '../en3point-backend.js';

// State management
let currentStep = 1;
let currentMode = 'creator';
const totalSteps = 5;
let tokenConfig = null;
let tokenData = {
    name: '',
    symbol: '',
    description: '',
    image: null,
    imageUrl: '',
    type: 'ERC20',
    supply: '',
    decimals: 18,
    customProperties: [],
    generatedProperties: [],
    standardFeatures: [],
    configCustomProperties: [],
    blockchain: 'ethereum',
    walletAddress: '',
    mintQuantity: ''
};

// Dummy AI responses for discussion
const aiResponses = [
    "That sounds like a great token concept! Based on your description, I recommend starting with an ERC-20 fungible token with a fixed supply.",
    "Interesting! For a loyalty program, you might want to consider making the token burnable and adding transfer restrictions.",
    "I can help you with that! Would you like the token to have any special features like minting limits or time-locks?",
    "Great idea! For an NFT collection, you'll want to use ERC-721. How many unique tokens do you plan to create?",
    "I understand. Let me suggest some standard properties that would work well for your use case."
];

// Dummy generated properties based on AI prompt
const propertyTemplates = {
    burnable: { key: 'burnable', value: 'true', description: 'Token can be burned' },
    pausable: { key: 'pausable', value: 'true', description: 'Token transfers can be paused' },
    mintable: { key: 'mintable', value: 'true', description: 'New tokens can be minted' },
    maxHolding: { key: 'maxHolding', value: '10000', description: 'Maximum tokens per wallet' },
    transferFee: { key: 'transferFee', value: '0.1', description: 'Fee percentage on transfers' },
    vestingPeriod: { key: 'vestingPeriod', value: '30', description: 'Vesting period in days' }
};

// Initialize view
export async function init() {
    console.log("Initializing Token Studio");
    
    // Reset state
    currentStep = 1;
    currentMode = 'creator';
    resetTokenData();
    
    // Setup mode switching
    setupModeSelector();
    
    // Setup event listeners
    setupDiscussionListeners();
    setupWizardNavigation();
    setupFormListeners();
    setupPropertyManagement();
    setupFinderFilters();
    setupEditorBulkActions();
    setupDistributionMode();
    
    // Load configuration and wallets
    await loadTokenConfig();
    await loadWallets();
    
    // Update preview
    updatePreview();

    // Deep-link activation (from Users view modal)
    const storedMode = localStorage.getItem('tokenStudioMode');
    if (storedMode) {
        const btn = document.querySelector(`.mode-btn[data-mode="${storedMode}"]`);
        btn?.click();
        localStorage.removeItem('tokenStudioMode');
    }
    const storedSymbol = localStorage.getItem('tokenStudioTokenSymbol');
    if (storedSymbol) {
        console.log('Deep-linked token symbol:', storedSymbol);
        // Future: auto-populate finder/editor selection
        localStorage.removeItem('tokenStudioTokenSymbol');
    }
}

// Mode Selector
function setupModeSelector() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    const tokenModes = document.querySelectorAll('.token-mode');
    
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            
            // Update active button
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active mode
            tokenModes.forEach(m => m.classList.remove('active'));
            const targetMode = document.querySelector(`.token-mode[data-mode="${mode}"]`);
            if (targetMode) {
                targetMode.classList.add('active');
                currentMode = mode;
            }
        });
    });
}

// Load token configuration (types, standard features, custom properties)
async function loadTokenConfig() {
    try {
        const res = await fetch('./data/tokenConfig.json');
        if (!res.ok) throw new Error('Failed to load tokenConfig.json');
        tokenConfig = await res.json();

        populateBusinessTypes();
        renderCustomPropertiesConfig();
        attachBusinessTypeHandler();
        attachConfigListeners();
    } catch (err) {
        console.error('Error loading token config:', err);
    }
}

function populateBusinessTypes() {
    const sel = document.getElementById('business-type');
    if (!sel || !tokenConfig?.types) return;
    sel.innerHTML = tokenConfig.types.map(t => `<option value="${t}">${t[0].toUpperCase()+t.slice(1)}</option>`).join('');
}

function attachBusinessTypeHandler() {
    const sel = document.getElementById('business-type');
    if (!sel) return;
    sel.addEventListener('change', () => renderStandardFeatures(sel.value));
    // Initial render
    if (sel.value) renderStandardFeatures(sel.value);
}

function renderStandardFeatures(type) {
    const container = document.getElementById('standard-feature-list');
    if (!container) return;
    const features = tokenConfig?.standardFeatures?.[type] || [];
    if (features.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No standard features for selected type</p>';
        return;
    }
    container.innerHTML = features.map(key => featureConfigRow(key)).join('');
    attachConfigListeners();
}

function renderCustomPropertiesConfig() {
    const container = document.getElementById('custom-properties-config-list');
    if (!container || !tokenConfig?.customProperties) return;
    container.innerHTML = tokenConfig.customProperties.map(p => propertyConfigRow(p)).join('');
    attachConfigListeners();
}

function featureConfigRow(key) {
    const label = keyLabel(key);
    return `
        <div class="feature-row" data-key="${key}">
            <div class="feature-main">
                <label class="feature-label">
                    <input type="checkbox" class="feature-enable" data-key="${key}" />
                    ${label}
                </label>
                <select class="feature-visibility" data-key="${key}">
                    <option value="public">Public</option>
                    <option value="group">Group</option>
                    <option value="private">Private</option>
                </select>
            </div>
            <textarea class="feature-desc" data-key="${key}" placeholder="Describe this property..."></textarea>
        </div>`;
}

function propertyConfigRow(p) {
    const control = propertyControl(p);
    return `
        <div class="feature-row config-card" data-key="${p.key}">
            <div class="feature-main">
                <label class="feature-label">${p.label}</label>
                <div class="feature-control">${control}</div>
                <select class="feature-visibility" data-key="${p.key}">
                    <option value="public">Public</option>
                    <option value="group">Group</option>
                    <option value="private">Private</option>
                </select>
            </div>
            <textarea class="feature-desc" data-key="${p.key}" placeholder="Describe this property..."></textarea>
        </div>`;
}

function propertyControl(p) {
    switch (p.type) {
        case 'boolean':
            return `<input type="checkbox" data-prop="${p.key}" />`;
        case 'datetime':
            return `<input type="datetime-local" data-prop="${p.key}" />`;
        default:
            return `<input type="text" data-prop="${p.key}" />`;
    }
}

function keyLabel(key) {
    const map = {
        burnable: 'Burnable',
        mintable: 'Mintable',
        pausable: 'Pausable',
        transferable: 'Transferable',
        suspended: 'Suspended',
        locked: 'Locked',
        validFrom: 'Valid From',
        validUntil: 'Valid Until'
    };
    return map[key] || key;
}

function resetTokenData() {
    tokenData = {
        name: '',
        symbol: '',
        description: '',
        image: null,
        imageUrl: '',
        type: 'ERC20',
        supply: '',
        decimals: 18,
        customProperties: [],
        generatedProperties: [],
        standardFeatures: [],
        configCustomProperties: [],
        blockchain: 'ethereum',
        walletAddress: '',
        mintQuantity: ''
    };
}

// Discussion Section
function setupDiscussionListeners() {
    const discussBtn = document.getElementById('discuss-token-btn');
    const descriptionInput = document.getElementById('token-description-input');
    
    if (discussBtn) {
        discussBtn.addEventListener('click', () => {
            const userInput = descriptionInput.value.trim();
            if (userInput) {
                simulateAIResponse(userInput);
            }
        });
    }
}

function simulateAIResponse(userInput) {
    const responseDiv = document.getElementById('ai-response');
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    
    responseDiv.innerHTML = `
        <div class="ai-message">
            <p><strong>You:</strong> ${userInput}</p>
            <p><strong>AI Assistant:</strong> ${randomResponse}</p>
            <p class="ai-suggestions">
                <strong>Suggestions:</strong><br/>
                • Start with basic token information in Step 1<br/>
                • Consider adding an image in Step 2<br/>
                • Define custom properties in Step 3
            </p>
        </div>
    `;
}

// Wizard Navigation
function setupWizardNavigation() {
    const prevBtn = document.getElementById('prev-step-btn');
    const nextBtn = document.getElementById('next-step-btn');
    const createBtn = document.getElementById('create-token-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validateCurrentStep() && currentStep < totalSteps) {
                goToStep(currentStep + 1);
            }
        });
    }
    
    if (createBtn) {
        createBtn.addEventListener('click', createToken);
    }
}

function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.querySelector(`.wizard-step[data-step="${step}"]`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // Update progress bar
    document.querySelectorAll('.progress-step').forEach(el => {
        const stepNum = parseInt(el.dataset.step);
        el.classList.toggle('active', stepNum === step);
        el.classList.toggle('completed', stepNum < step);
    });
    
    currentStep = step;
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-step-btn');
    const nextBtn = document.getElementById('next-step-btn');
    const createBtn = document.getElementById('create-token-btn');
    
    if (prevBtn) prevBtn.disabled = currentStep === 1;
    
    if (step === totalSteps) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (createBtn) createBtn.style.display = 'block';
    } else {
        if (nextBtn) nextBtn.style.display = 'block';
        if (createBtn) createBtn.style.display = 'none';
    }
    
    updatePreview();
}

function validateCurrentStep() {
    if (currentStep === 1) {
        const name = document.getElementById('token-name')?.value.trim();
        const symbol = document.getElementById('token-symbol')?.value.trim();
        
        if (!name || !symbol) {
            alert('Please fill in token name and symbol');
            return false;
        }
    }
    return true;
}

// Form Listeners
function setupFormListeners() {
    // Step 1: Basic Info
    const nameInput = document.getElementById('token-name');
    const symbolInput = document.getElementById('token-symbol');
    const descInput = document.getElementById('token-description');
    
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            tokenData.name = e.target.value;
            updatePreview();
        });
    }
    
    if (symbolInput) {
        symbolInput.addEventListener('input', (e) => {
            tokenData.symbol = e.target.value.toUpperCase();
            e.target.value = tokenData.symbol;
            updatePreview();
        });
    }
    
    if (descInput) {
        descInput.addEventListener('input', (e) => {
            tokenData.description = e.target.value;
            updatePreview();
        });
    }
    
    // Step 2: Image
    const imageUpload = document.getElementById('token-image-upload');
    const generateBtn = document.getElementById('generate-image-btn');
    
    if (imageUpload) {
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    tokenData.imageUrl = event.target.result;
                    updatePreview();
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const prompt = document.getElementById('token-image-prompt')?.value;
            if (prompt) {
                simulateImageGeneration(prompt);
            }
        });
    }
    
    // Step 3: Properties
    const typeSelect = document.getElementById('token-type');
    const supplyInput = document.getElementById('token-supply');
    const decimalsInput = document.getElementById('token-decimals');
    
    if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
            tokenData.type = e.target.value;
            updatePreview();
        });
    }
    
    if (supplyInput) {
        supplyInput.addEventListener('input', (e) => {
            tokenData.supply = e.target.value;
            updatePreview();
        });
    }
    
    if (decimalsInput) {
        decimalsInput.addEventListener('input', (e) => {
            tokenData.decimals = e.target.value;
            updatePreview();
        });
    }
    
    // Step 4: AI Properties
    const generatePropsBtn = document.getElementById('generate-properties-btn');
    if (generatePropsBtn) {
        generatePropsBtn.addEventListener('click', generateAIProperties);
    }
    
    // Step 5: Review
    const blockchainSelect = document.getElementById('blockchain-select');
    const walletSelect = document.getElementById('wallet-select');
    const mintQuantity = document.getElementById('mint-quantity');
    
    if (blockchainSelect) {
        blockchainSelect.addEventListener('change', (e) => {
            tokenData.blockchain = e.target.value;
            updatePreview();
        });
    }
    
    if (walletSelect) {
        walletSelect.addEventListener('change', (e) => {
            tokenData.walletAddress = e.target.value;
            updatePreview();
        });
    }
    
    if (mintQuantity) {
        mintQuantity.addEventListener('input', (e) => {
            tokenData.mintQuantity = e.target.value;
            updatePreview();
        });
    }
}

function simulateImageGeneration(prompt) {
    // Simulate AI image generation with placeholder
    const placeholder = `https://via.placeholder.com/300x300/5F0AFF/ffffff?text=${encodeURIComponent(tokenData.symbol || 'Token')}`;
    tokenData.imageUrl = placeholder;
    updatePreview();
    alert(`Image generation started for: "${prompt}"\n\nUsing placeholder image for now.`);
}

// Property Management
function setupPropertyManagement() {
    const addPropertyBtn = document.getElementById('add-property-btn');
    if (addPropertyBtn) {
        addPropertyBtn.addEventListener('click', addCustomProperty);
    }
}

function addCustomProperty() {
    const propertyId = Date.now();
    const property = { id: propertyId, key: '', value: '' };
    tokenData.customProperties.push(property);
    
    const list = document.getElementById('custom-properties-list');
    const propertyDiv = document.createElement('div');
    propertyDiv.className = 'property-row';
    propertyDiv.dataset.id = propertyId;
    propertyDiv.innerHTML = `
        <input type="text" placeholder="Property key" class="property-key" />
        <input type="text" placeholder="Property value" class="property-value" />
        <button class="btn-remove" data-id="${propertyId}">×</button>
    `;
    
    list.appendChild(propertyDiv);
    
    // Add event listeners
    const keyInput = propertyDiv.querySelector('.property-key');
    const valueInput = propertyDiv.querySelector('.property-value');
    const removeBtn = propertyDiv.querySelector('.btn-remove');
    
    keyInput.addEventListener('input', (e) => {
        property.key = e.target.value;
        updatePreview();
    });
    
    valueInput.addEventListener('input', (e) => {
        property.value = e.target.value;
        updatePreview();
    });
    
    removeBtn.addEventListener('click', () => {
        tokenData.customProperties = tokenData.customProperties.filter(p => p.id !== propertyId);
        propertyDiv.remove();
        updatePreview();
    });
}

function generateAIProperties() {
    const prompt = document.getElementById('ai-property-prompt')?.value.trim();
    
    if (!prompt) {
        alert('Please describe the properties you want');
        return;
    }
    
    // Simulate AI property generation
    const generatedDiv = document.getElementById('generated-properties');
    tokenData.generatedProperties = [];
    
    // Pick random properties from templates
    const templates = Object.values(propertyTemplates);
    const numProperties = Math.floor(Math.random() * 3) + 2; // 2-4 properties
    const selected = templates.sort(() => 0.5 - Math.random()).slice(0, numProperties);
    
    generatedDiv.innerHTML = '<h4>Generated Properties (Accept or Remove):</h4>';
    
    selected.forEach(prop => {
        const propId = Date.now() + Math.random();
        const property = { id: propId, ...prop, accepted: true };
        tokenData.generatedProperties.push(property);
        
        const propDiv = document.createElement('div');
        propDiv.className = 'generated-property accepted';
        propDiv.dataset.id = propId;
        propDiv.innerHTML = `
            <div class="property-info">
                <strong>${prop.key}:</strong> ${prop.value}
                <span class="property-desc">${prop.description}</span>
            </div>
            <div class="property-actions">
                <button class="btn-accept" data-id="${propId}">✓ Accept</button>
                <button class="btn-reject" data-id="${propId}">× Remove</button>
            </div>
        `;
        
        generatedDiv.appendChild(propDiv);
        
        propDiv.querySelector('.btn-accept').addEventListener('click', () => {
            property.accepted = true;
            propDiv.classList.add('accepted');
            propDiv.classList.remove('rejected');
            updatePreview();
        });
        
        propDiv.querySelector('.btn-reject').addEventListener('click', () => {
            property.accepted = false;
            propDiv.classList.add('rejected');
            propDiv.classList.remove('accepted');
            updatePreview();
        });
    });
    
    updatePreview();
}

// Load Wallets
async function loadWallets() {
    try {
        const wallets = await getWallets();
        const walletSelect = document.getElementById('wallet-select');
        
        if (walletSelect) {
            walletSelect.innerHTML = '<option value="">Select wallet...</option>';
            wallets.forEach(wallet => {
                const option = document.createElement('option');
                option.value = wallet.address;
                option.textContent = `${wallet.address.substring(0, 10)}...${wallet.address.substring(wallet.address.length - 8)} (${wallet.balance} ${wallet.currency})`;
                walletSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load wallets:', error);
    }
}

// Update Preview
function updatePreview() {
    // Update name and symbol
    document.getElementById('preview-name').textContent = tokenData.name || 'Token Name';
    document.getElementById('preview-symbol').textContent = tokenData.symbol || 'SYMBOL';
    document.getElementById('preview-description').textContent = tokenData.description || 'Token description will appear here...';
    
    // Update image
    const imageContainer = document.getElementById('preview-image-placeholder');
    if (tokenData.imageUrl) {
        imageContainer.innerHTML = `<img src="${tokenData.imageUrl}" alt="Token Image" />`;
    } else {
        imageContainer.innerHTML = '<span>🪙</span><p>No image yet</p>';
    }
    
    // Update properties list
    const propertiesList = document.getElementById('preview-properties-list');
    const allProperties = [
        { key: 'Type', value: tokenData.type },
        { key: 'Supply', value: tokenData.supply || 'Not set' },
        { key: 'Decimals', value: tokenData.decimals },
        ...tokenData.standardFeatures.filter(f => f.enabled).map(f => ({ key: f.key, value: f.description || 'enabled' })),
        ...tokenData.configCustomProperties.map(p => ({ key: p.key, value: p.value || p.description || '(configured)' })),
        ...tokenData.customProperties.filter(p => p.key && p.value).map(p => ({ key: p.key, value: p.value })),
        ...tokenData.generatedProperties.filter(p => p.accepted).map(p => ({ key: p.key, value: p.value }))
    ];
    
    if (allProperties.length > 3) {
        propertiesList.innerHTML = allProperties.map(p => 
            `<div class="property-item"><strong>${p.key}:</strong> ${p.value}</div>`
        ).join('');
    } else {
        propertiesList.innerHTML = '<p class="placeholder-text">Properties will appear as you fill the form</p>';
    }
    
    // Update actions list
    const actionsList = document.getElementById('preview-actions-list');
    if (currentStep === totalSteps) {
        actionsList.innerHTML = `
            <div class="action-item"><strong>Blockchain:</strong> ${tokenData.blockchain}</div>
            <div class="action-item"><strong>Mint to:</strong> ${tokenData.walletAddress || 'Not selected'}</div>
            <div class="action-item"><strong>Quantity:</strong> ${tokenData.mintQuantity || 'Not set'}</div>
        `;
    } else {
        actionsList.innerHTML = '<p class="placeholder-text">Complete all steps to see minting options</p>';
    }
}

// Create Token
function createToken() {
    if (!tokenData.name || !tokenData.symbol) {
        alert('Please provide at least token name and symbol');
        return;
    }
    
    // Simulate token creation
    console.log('Creating token:', tokenData);
    
    const message = `
Token Created Successfully! 🎉

Name: ${tokenData.name}
Symbol: ${tokenData.symbol}
Type: ${tokenData.type}
Supply: ${tokenData.supply}
Blockchain: ${tokenData.blockchain}
Wallet: ${tokenData.walletAddress}

This is a mock creation. In production, this would deploy to the blockchain.
    `.trim();
    
    alert(message);
    
    // Reset for new token
    if (confirm('Would you like to create another token?')) {
        resetTokenData();
        goToStep(1);
        
        // Clear form inputs
        document.getElementById('token-name').value = '';
        document.getElementById('token-symbol').value = '';
        document.getElementById('token-description').value = '';
        document.getElementById('token-supply').value = '';
        document.getElementById('custom-properties-list').innerHTML = '';
        document.getElementById('generated-properties').innerHTML = '';
    }
}

// Token Finder Filters
function setupFinderFilters() {
    const finderSearchBtn = document.getElementById('finder-search-btn');
    const finderClearBtn = document.getElementById('finder-clear-btn');
    const minterSearchBtn = document.getElementById('minter-search-btn');
    const minterClearBtn = document.getElementById('minter-clear-btn');
    
    if (finderSearchBtn) {
        finderSearchBtn.addEventListener('click', () => {
            const filters = {
                name: document.getElementById('finder-name')?.value,
                symbol: document.getElementById('finder-symbol')?.value,
                type: document.getElementById('finder-type')?.value,
                blockchain: document.getElementById('finder-blockchain')?.value,
                owner: document.getElementById('finder-owner')?.value,
                operator: document.getElementById('finder-operator')?.value,
                admin: document.getElementById('finder-admin')?.value,
                properties: document.getElementById('finder-properties')?.value,
                activity: document.getElementById('finder-activity')?.value
            };
            console.log('Searching tokens with filters:', filters);
            // TODO: Implement actual search logic
            const resultsList = document.getElementById('finder-results-list');
            if (resultsList) {
                resultsList.innerHTML = '<p class="placeholder-text">Search functionality to be implemented</p>';
            }
        });
    }
    
    if (finderClearBtn) {
        finderClearBtn.addEventListener('click', () => {
            document.getElementById('finder-name').value = '';
            document.getElementById('finder-symbol').value = '';
            document.getElementById('finder-type').value = '';
            document.getElementById('finder-blockchain').value = '';
            document.getElementById('finder-owner').value = '';
            document.getElementById('finder-operator').value = '';
            document.getElementById('finder-admin').value = '';
            document.getElementById('finder-properties').value = '';
            document.getElementById('finder-activity').value = '';
        });
    }
    
    if (minterSearchBtn) {
        minterSearchBtn.addEventListener('click', () => {
            console.log('Minter search clicked');
            // TODO: Implement minter search logic
        });
    }
    
    if (minterClearBtn) {
        minterClearBtn.addEventListener('click', () => {
            document.getElementById('minter-name').value = '';
            document.getElementById('minter-symbol').value = '';
            document.getElementById('minter-type').value = '';
        });
    }
}

// Editor Bulk Actions
function setupEditorBulkActions() {
    const selectAllCheckbox = document.getElementById('select-all-tokens');
    const bulkEditBtn = document.getElementById('bulk-edit-btn');
    const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
    const editorSearchBtn = document.getElementById('editor-search-btn');
    const selectedCount = document.getElementById('selected-count');
    
    let selectedTokens = [];
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            // TODO: Implement select all logic
            console.log('Select all:', e.target.checked);
        });
    }
    
    if (bulkEditBtn) {
        bulkEditBtn.addEventListener('click', () => {
            console.log('Bulk edit clicked', selectedTokens);
            // TODO: Implement bulk edit logic
        });
    }
    
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete selected tokens?')) {
                console.log('Bulk delete clicked', selectedTokens);
                // TODO: Implement bulk delete logic
            }
        });
    }
    
    if (editorSearchBtn) {
        editorSearchBtn.addEventListener('click', () => {
            const searchTerm = document.getElementById('editor-search')?.value;
            console.log('Editor search:', searchTerm);
            // TODO: Implement editor search logic
        });
    }
}

// Distribution Mode
function setupDistributionMode() {
    const tokenSelect = document.getElementById('distribution-token-select');
    const refreshBtn = document.getElementById('distribution-refresh-btn');
    const timeframeSelect = document.getElementById('distribution-timeframe');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const selectedToken = tokenSelect?.value;
            const timeframe = timeframeSelect?.value;
            console.log('Refreshing distribution data for:', selectedToken, timeframe);
            
            // TODO: Implement actual data fetching and chart rendering
            // Mock data display
            document.getElementById('total-holders').textContent = '1,234';
            document.getElementById('total-supply').textContent = '1,000,000';
            document.getElementById('circulating-supply').textContent = '750,000';
            document.getElementById('daily-volume').textContent = '$45,678';
            
            // Update chart placeholders
            const holdersChart = document.getElementById('holders-chart');
            const transactionsChart = document.getElementById('transactions-chart');
            const volumeChart = document.getElementById('volume-chart');
            
            if (holdersChart) {
                holdersChart.innerHTML = '<p class="placeholder-text">Chart rendering to be implemented</p>';
            }
            if (transactionsChart) {
                transactionsChart.innerHTML = '<p class="placeholder-text">Chart rendering to be implemented</p>';
            }
            if (volumeChart) {
                volumeChart.innerHTML = '<p class="placeholder-text">Chart rendering to be implemented</p>';
            }
        });
    }
}


// Configuration listeners
function attachConfigListeners() {
    const stdRows = document.querySelectorAll('#standard-feature-list .feature-row');
    const customRows = document.querySelectorAll('#custom-properties-config-list .feature-row');
    [...stdRows, ...customRows].forEach(r => {
        r.querySelectorAll('.feature-enable, .feature-visibility, .feature-desc, [data-prop]').forEach(el => {
            el.addEventListener('change', collectConfiguredData);
            el.addEventListener('input', collectConfiguredData);
        });
    });
    collectConfiguredData();
}

function collectConfiguredData() {
    // Standard features
    const stdRows = document.querySelectorAll('#standard-feature-list .feature-row');
    tokenData.standardFeatures = Array.from(stdRows).map(r => {
        const key = r.getAttribute('data-key');
        const enabled = r.querySelector('.feature-enable')?.checked || false;
        const visibility = r.querySelector('.feature-visibility')?.value || 'public';
        const description = r.querySelector('.feature-desc')?.value.trim() || '';
        return { key, enabled, visibility, description };
    }).filter(f => f.enabled || f.description);

    // Custom configured properties
    const customRows = document.querySelectorAll('#custom-properties-config-list .feature-row');
    tokenData.configCustomProperties = Array.from(customRows).map(r => {
        const key = r.getAttribute('data-key');
        const inputEl = r.querySelector('[data-prop]');
        let value = '';
        if (inputEl) {
            if (inputEl.type === 'checkbox') value = inputEl.checked ? 'true' : 'false';
            else value = inputEl.value.trim();
        }
        const visibility = r.querySelector('.feature-visibility')?.value || 'public';
        const description = r.querySelector('.feature-desc')?.value.trim() || '';
        if (value || description) r.classList.add('value-set'); else r.classList.remove('value-set');
        return { key, value, visibility, description };
    }).filter(p => p.value || p.description);

    updatePreview();
}

