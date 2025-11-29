// modules/tokens.js - Token Studio functionality

import { getWallets } from '../en3point-backend.js';

// State management
let currentStep = 1;
const totalSteps = 5;
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
    resetTokenData();
    
    // Setup event listeners
    setupDiscussionListeners();
    setupWizardNavigation();
    setupFormListeners();
    setupPropertyManagement();
    
    // Load wallets for minting
    await loadWallets();
    
    // Update preview
    updatePreview();
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
