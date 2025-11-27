# Login System Documentation

## Overview
The management console now features a full-screen modal login system that appears:
- On initial page load if no valid `authToken` is found
- Before any view transition if the user is not authenticated
- When the session expires or token becomes invalid

## Architecture

### Files Modified/Created
1. **index.html** - Added login modal overlay before main content
2. **js/app.js** - Added auth checking on startup and view transitions
3. **js/modules/login.js** - Complete authentication logic
4. **css/components.css** - Login modal styles (adapted from legacy)

### Authentication Flow

```
┌─────────────────┐
│  Page Load      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     No Token      ┌──────────────────┐
│ Check authToken │ ───────────────► │ Show Login Modal │
│ in localStorage │                   └────────┬─────────┘
└────────┬────────┘                            │
         │                                     │
    Token Found                           ┌────▼─────┐
         │                                │  User     │
         ▼                                │  Enters   │
┌─────────────────┐     Invalid         │  Creds    │
│ Validate Token  │ ──────────────►     └────┬─────┘
│ via isLogin()   │                           │
└────────┬────────┘                           │
         │                                    ▼
    Token Valid                    ┌──────────────────┐
         │                         │ en3pointLogin()  │
         │                         │  API Call        │
         ▼                         └────────┬─────────┘
┌─────────────────┐                         │
│ Show Dashboard  │ ◄───────────────────────┘
│ Update Admin    │        Success
│ Info Display    │
└─────────────────┘
```

## Implementation Details

### 1. Login Modal (index.html)

```html
<div id="login-modal" class="login-modal hidden">
    <div class="login-modal-overlay"></div>
    <div class="login-modal-content">
        <!-- Provider carousel -->
        <!-- Login form -->
    </div>
</div>
```

**Features:**
- Full-screen overlay with background image
- Provider selection carousel (en3point logo)
- Username/password input fields
- Error message display
- Password reset link (placeholder)

### 2. Auth Checking (js/app.js)

**Key Functions:**
- `checkAuth()` - Verifies authToken exists in localStorage
- `showLoginModal()` - Displays login overlay
- `hideLoginModal()` - Hides login overlay after successful auth
- Modified `showView(name)` - Checks auth before every view transition

**Startup Flow:**
```javascript
// On page load
if (checkAuth()) {
    showView("dashboard");
}
// If no token, login modal shown instead
```

### 3. Authentication Logic (js/modules/login.js)

**Exported Functions:**
- `checkLoginStatus()` - Validates token and returns "anon" or "registered"
- `init()` - Initializes event listeners and UI

**Internal Functions:**
- `en3pointLogin({ userid, password })` - Mock API call (replace with backend)
- `isLogin(token)` - Mock token validation (replace with backend)
- `updateAdminInfo()` - Updates admin display in top bar
- `handleLogin(event)` - Form submission handler
- `handlePasswordReset(event)` - Password reset handler (placeholder)
- `handleCarouselSelection()` - Provider selection handler

**LocalStorage Keys:**
- `authToken` - JWT or session token
- `userid` - User identifier
- `walletAddress` - Blockchain wallet address
- `adminData` - JSON string with full user data
- `loginStatus` - "anon" or "registered"
- `selectedProvider` - Selected service provider

### 4. Styling (css/components.css)

**Key Classes:**
- `.login-modal` - Full-screen fixed overlay (z-index: 1000)
- `.login-modal-overlay` - Background image with grey overlay
- `.login-modal-content` - Centered black box with purple border/glow
- `.carousel-item` - Provider selection items
- `.carousel-item.selected` - Purple highlight with scale effect
- `.login-error-message` - Red error display

**Theme Colors:**
- Background: `#000` (black)
- Border/Glow: `#5F0AFF` (purple - matches console theme)
- Input Background: `#151827` (dark navy)
- Hover/Selected: `#7a2fff` (lighter purple)

## Testing

### Test Locally
```bash
cd webpage
python3 -m http.server 8080
# Visit http://localhost:8080
```

### Test Scenarios

1. **First Visit (No Token)**
   - Login modal should appear immediately
   - Dashboard should not be visible

2. **Successful Login**
   - Enter any username/password
   - Modal closes after 500ms delay
   - Admin info updates in top bar
   - Dashboard becomes visible
   - Token stored in localStorage

3. **View Navigation with Token**
   - Click any nav button
   - No login modal appears
   - View switches normally

4. **View Navigation without Token**
   - Clear localStorage: `localStorage.clear()`
   - Refresh page
   - Try clicking nav buttons
   - Login modal appears before view change

5. **Invalid Token**
   - Set invalid token: `localStorage.setItem('authToken', 'invalid')`
   - Refresh page
   - Token validation fails
   - localStorage cleared
   - Login modal appears

## Backend Integration

### Replace Mock Functions

**1. Login API Call** (`en3pointLogin`)
```javascript
async function en3pointLogin({ userid, password }) {
    const response = await fetch('https://api.en3point.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid, password })
    });
    
    if (!response.ok) {
        throw new Error('Login failed');
    }
    
    return await response.json();
    // Expected: { status: true, result: { authToken, walletAddress, userid, role } }
}
```

**2. Token Validation** (`isLogin`)
```javascript
async function isLogin(token) {
    const response = await fetch('https://api.en3point.com/auth/validate', {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return await response.json();
    // Expected: { status: true/false }
}
```

### Backend Endpoints Needed

1. **POST /auth/login**
   - Body: `{ userid: string, password: string }`
   - Response: `{ status: boolean, result: { authToken, walletAddress, userid, role } }`

2. **GET /auth/validate**
   - Headers: `Authorization: Bearer <token>`
   - Response: `{ status: boolean }`

## Security Considerations

### Current Implementation (Development)
- ⚠️ Mock login accepts any credentials
- ⚠️ Mock validation checks only token prefix
- ⚠️ No HTTPS enforcement
- ⚠️ No CSRF protection
- ⚠️ Tokens stored in localStorage (XSS vulnerable)

### Production Requirements
- ✅ Use real backend authentication
- ✅ Enforce HTTPS only
- ✅ Implement CSRF tokens
- ✅ Consider httpOnly cookies instead of localStorage
- ✅ Add rate limiting on login attempts
- ✅ Implement session timeout
- ✅ Add password strength requirements
- ✅ Implement proper password reset flow
- ✅ Add audit logging for auth events

## Customization

### Add More Providers to Carousel

Edit `index.html`:
```html
<div class="carousel">
    <div class="carousel-item" data-provider="en3point">
        <img src="./assets/media/en3point.png" alt="en3point">
    </div>
    <div class="carousel-item" data-provider="provider2">
        <img src="./assets/media/provider2.png" alt="Provider 2">
    </div>
    <!-- Add more -->
</div>
```

### Change Login Modal Appearance

Edit `css/components.css`:
- `.login-modal-content` - Change size, colors, border
- `.login-modal-overlay` - Change background image
- Color variables for consistent theming

### Add Additional Form Fields

Edit `index.html` and `js/modules/login.js`:
1. Add input field to form
2. Capture value in `handleLogin()`
3. Pass to `en3pointLogin()` call

## Troubleshooting

### Login Modal Won't Appear
- Check: `localStorage.getItem('authToken')` in console
- Clear storage: `localStorage.clear()`
- Refresh page

### Login Button Does Nothing
- Check console for JavaScript errors
- Verify `login.js` module loaded
- Check form has `id="login-form"`

### Admin Info Not Updating
- Check `localStorage.getItem('adminData')`
- Verify `admin-identifier` and `admin-role` elements exist in top bar
- Check `updateAdminInfo()` function

### Modal Appears on Every View Change
- Verify token is stored: `localStorage.getItem('authToken')`
- Check token starts with 'mock-token-' (or passes backend validation)
- Look for errors in `checkAuth()` function

## Future Enhancements

- [ ] Remember me / stay logged in option
- [ ] Session timeout warning
- [ ] Logout button in top bar
- [ ] Password visibility toggle
- [ ] Social login options
- [ ] Two-factor authentication
- [ ] Biometric authentication (WebAuthn)
- [ ] Multi-provider switching after login
- [ ] User profile management
- [ ] Login history/audit trail
