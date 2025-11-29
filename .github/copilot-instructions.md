
# Copilot Instructions – Unified Single-Page Management Console

We are using a SINGLE `index.html` as the shell, with view content loaded dynamically from separate HTML module files.
Navigation loads HTML content from `html/modules/<name>.html` files into the main container.

## Project Structure

```
en3point-management-console/
├── .github/
│   └── copilot-instructions.md    # This file
├── webpage/
│   ├── index.html                 # Shell with header, nav, login modal, view container
│   ├── assets/
│   │   └── media/
│   │       ├── en3point.png       # Logo
│   │       └── loginbackground.png
│   ├── html/
│   │   └── modules/               # View HTML content (loaded dynamically)
│   │       ├── dashboard.html
│   │       ├── users.html
│   │       ├── wallets.html
│   │       ├── tokens.html
│   │       ├── security.html
│   │       ├── engagement.html
│   │       ├── marketplace.html
│   │       ├── distribution.html
│   │       ├── tokeneditor.html
│   │       ├── condition_builder.html
│   │       ├── chart.html
│   │       └── perspective.html
│   ├── css/
│   │   ├── base.css               # Global resets, typography, dark theme
│   │   ├── layout.css             # Top bar, nav, view system, login layout
│   │   ├── theme.css              # Color scheme, variables
│   │   ├── components.css         # Shared/global components (cards, buttons, forms, tables)
│   │   └── modules/               # Module-specific styles (matches js/modules/)
│   │       ├── dashboard.css
│   │       ├── users.css
│   │       ├── wallets.css
│   │       ├── tokens.css
│   │       ├── security.css
│   │       ├── engagement.css
│   │       ├── marketplace.css
│   │       ├── distribution.css
│   │       ├── tokeneditor.css
│   │       ├── condition_builder.css
│   │       ├── chart.css
│   │       ├── perspective.css
│   │       └── login.css
│   └── js/
│       ├── app.js                 # Navigation system + HTML loading + viewInitializers
│       └── modules/
│           ├── dashboard.js
│           ├── users.js
│           ├── wallets.js
│           ├── tokens.js
│           ├── security.js
│           ├── engagement.js
│           ├── marketplace.js
│           ├── distribution.js
│           ├── tokeneditor.js
│           ├── condition_builder.js
│           ├── chart.js
│           ├── perspective.js
│           └── login.js
```

## Current Implementation Status

### ✅ Implemented
- **Single-page shell**: `index.html` contains header, nav, login modal, and view container
- **Modular HTML**: Each view in separate file (`html/modules/<name>.html`)
- **Dynamic loading**: `app.js` fetches and injects HTML content on navigation
- **Navigation system**: Top bar with 12 nav buttons + login modal
- **CSS structure**: Modular organization matching JS/HTML structure
  - 4 base stylesheets (base, layout, theme, components)
  - 12 module-specific CSS files in `css/modules/`
  - 12 module-specific HTML files in `html/modules/`
- **JS module scaffolding**: 13 module files in `js/modules/`
- **Login system**: Full-screen modal with auth checking
- **Dark theme**: Base styling with dark background (#0b0c10), light text
- **Logo integration**: en3point.png in top bar

### 12 Views (Modular HTML Files)
1. **dashboard** – Main overview (default view)
2. **users** – User management
3. **wallets** – Wallet operations
4. **tokens** – Token management
5. **security** – Security settings
6. **engagement** – Engagement analytics
7. **marketplace** – Marketplace management
8. **distribution** – Distribution tools
9. **tokeneditor** – Token editor interface
10. **condition_builder** – Condition builder UI
11. **chart** – Chart/analytics view
12. **perspective** – Perspective management

Note: Login is a modal overlay, not a separate view.

### ❌ Not Yet Implemented
- View-specific business logic (modules are empty)
- API integration with en3point-backend
- Authentication flow (login module)
- Dynamic data loading
- User role management
- Form validation
- Error handling
- Loading states

## Core Rules

1. **Views live inside `index.html`**
   - Each view is a `<section>` with:
     - `id="view-<name>"`
     - class `"view hidden"` (default state)
   - Example:
     ```html
     <section id="view-users" class="view hidden">
         <h1>Users view</h1>
         <!-- Content here -->
     </section>
     ```

2. **Navigation buttons**
   - Use `<button class="nav-btn" data-view="<name>">`
   - Do **not** add inline `onclick` attributes
   - JS in `js/app.js` already registers click handlers and calls `showView(name)`
   - Active button gets `.active` class (purple background: #5F0AFF)

3. **Show/hide logic**
   - Use the existing `showView(name)` in `js/app.js`
   - Do not create new show/hide functions per view
   - Do not manipulate `style.display` directly; rely on `.view` and `.active` classes
   - CSS handles visibility:
     ```css
     .view { display: none; }
     .view.active { display: block; }
     ```

4. **Per-view JS modules**
   - For each view `<name>`, use: `js/modules/<name>.js`
   - Module should export:
     ```js
     export function init() {
         // Setup code for this view
         // Called when view becomes active
     }
     ```
   - To hook into navigation, add to `viewInitializers` in `js/app.js`:
     ```js
     const viewInitializers = {
         dashboard: () => import("./modules/dashboard.js").then(m => m.init && m.init()),
         users: () => import("./modules/users.js").then(m => m.init && m.init()),
         // ... etc
5. **CSS organization**
   - **`base.css`**: Global resets, typography, body styles
   - **`layout.css`**: Top bar, navigation, view system, structural layouts
   - **`theme.css`**: Color scheme, CSS variables, theming
   - **`components.css`**: Shared/global components (cards, buttons, forms, tables, grids)
   - **`css/modules/<name>.css`**: Module-specific styles matching `js/modules/<name>.js`
   - **Modular pattern**: Each view has its own CSS file in `css/modules/`
     - `css/modules/login.css` → Login modal styles
     - `css/modules/dashboard.css` → Dashboard-specific styles
     - `css/modules/users.css` → Users view styles
     - etc.
   - **Naming convention**: Prefix classes with module name
     - `.dashboard-card`, `.users-list`, `.tokens-table`, `.login-modal`
   - **All module CSS files are loaded in `index.html`** - no dynamic loading needed
   - **View-specific styles**: Add to `components.css` with prefixed class names:
     - `.dashboard-card`, `.users-list`, `.tokens-table`
   - **Do not create separate view CSS files** unless view is highly complex

6. **No inline JavaScript**
   - Do not generate `onclick=""`, `onchange=""`, etc. in HTML
   - Always bind events using `addEventListener` inside the relevant module's `init()`
   - Example:
     ```js
     // In js/modules/users.js
     export function init() {
         const addBtn = document.querySelector(".add-user-btn");
         addBtn.addEventListener("click", () => { /* ... */ });
     }
     ```
   - Note: No need to scope queries to `#view-users` since HTML is injected into container

7. **Adding new views**
   - Create `html/modules/<name>.html` with view content
   - Create `css/modules/<name>.css` with view-specific styles
   - Create `js/modules/<name>.js` with view logic
8. **Components**
   - Reusable fragments (cards, tables, forms) defined in `components.css`
   - For complex components, create template strings in module files
   - Avoid duplicating markup; use JavaScript template rendering
   - Example:
     ```js
     function createCard(title, content) {
         return `<div class="card">
             <h3>${title}</h3>
             <p>${content}</p>
         </div>`;
     }
     ```

9. **Media**
   - Use files from `assets/media/` (en3point.png, loginbackground.png)
   - Do not assume external CDNs unless explicitly requested
   - Reference with relative paths: `./assets/media/en3point.png`

10. **Module development pattern**
    - HTML files contain only markup (no script tags)
    - CSS files style the view-specific elements
    - JS files handle all interactivity
    - Query elements directly (no need to scope to view ID)
    - Clean up event listeners if needed (e.g., for recurring timers)
    - Keep modules focused on single responsibility
      }
      ```
    - Clean up event listeners if needed (e.g., for recurring timers)
    - Keep modules focused on single responsibility

## Color Scheme (Dark Theme)

- **Background**: `#0b0c10` (dark navy)
- **Text**: `#f5f5f5` (off-white)
- **Top bar**: `#151827` (darker navy)
- **Nav buttons**: `#202634` (gray-blue)
- **Active nav**: `#5F0AFF` (purple)
- **Accent**: `#5F0AFF` (purple for active states, highlights)

Use these consistently throughout new components.

## Development Workflow

### Adding Content to an Existing View

1. **Locate the view section** in `index.html` (e.g., `#view-dashboard`)
2. **Replace placeholder content** with your HTML structure
3. **Add styles** to `components.css` with view-prefixed classes
### Adding Content to an Existing View

1. **Edit the HTML module** in `html/modules/<name>.html`
2. **Add styles** to `css/modules/<name>.css` with view-prefixed classes
3. **Create module logic** in `js/modules/<name>.js`:
   ```js
   export function init() {
       // Your initialization code
       // Elements are directly accessible (already in DOM)
   }
   ```
4. **Register in viewInitializers** in `js/app.js`

### Adding a New View

1. **Create HTML module**: `html/modules/<name>.html`
   ```html
   <h1>New View</h1>
   <p>Content here</p>
   ```
2. **Create CSS module**: `css/modules/<name>.css`
3. **Create JS module**: `js/modules/<name>.js`
4. **Add nav button** in `index.html` top bar:
   ```html
   <button class="nav-btn" data-view="<name>">New View</button>
   ```
5. **Add CSS link** in `index.html` head:
   ```html
   <link rel="stylesheet" href="./css/modules/<name>.css" />
   ```
6. **Register initializer**: `js/app.js` viewInitializers object
python3 -m http.server 8080
# Visit http://localhost:8080
```

## Common Patterns

### Loading Data into a View

```js
### Loading Data into a View

```js
// js/modules/users.js
export async function init() {
    const listEl = document.querySelector(".users-list");
    
    // Fetch data (replace with actual API)
    const users = await fetchUsers();
    
    // Render
    listEl.innerHTML = users.map(u => `
        <div class="user-card">
            <h3>${u.name}</h3>
            <p>${u.email}</p>
        </div>
### Form Handling

```js
export function init() {
    const form = document.querySelector(".user-form");
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Submit to API
        await saveUser(data);
        
        // Refresh view
        init();
    });
}   });
}
```

### Dynamic Tables

```js
function renderTable(data) {
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        <td>${row.name}</td>
                        <td>${row.email}</td>
                        <td><button class="edit-btn" data-id="${row.id}">Edit</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
```

## Integration with Backend

The backend is in `en3point-backend/` (separate workspace folder):
- **Lambda handlers**: `lambdas/` (anchoring, content, family, provider, senior, system)
- **Models**: `models/` (auditModel, engagementModel, seniorModel, etc.)
- **Services**: `services/` (auditService, contentService, polygonService, etc.)

### API Call Pattern

```js
// In module files
async function fetchUsers() {
    try {
        const response = await fetch('API_ENDPOINT/users', {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}
```

## Key Takeaways for AI Agents

1. **Modular HTML structure** – each view in `html/modules/<name>.html`
2. **Modular CSS structure** – each view CSS in `css/modules/<name>.css`
3. **Modular JS structure** – each view logic in `js/modules/<name>.js`
4. **Dynamic loading** – `app.js` fetches HTML and injects into container
5. **No scoping needed** – query elements directly (only one view loaded at a time)
6. **No inline handlers** – all events bound in module `init()` functions
7. **Dark theme** – maintain consistent color scheme (#0b0c10 bg, #5F0AFF accent)
8. **Module pattern** – one module per view (HTML + CSS + JS), export `init()`, register in `viewInitializers`
9. **Top bar navigation** – nav buttons use `data-view` attributes
10. **12 views ready** – all placeholder files exist, ready for content
11. **ES6 modules** – use `import`/`export`, script tag has `type="module"`
12. **Local testing** – run `python3 -m http.server 8080` in `webpage/` directory

When adding features, prioritize consistency with existing patterns, dark theme aesthetics, and mobile-responsive design. Always test navigation between views before completing work.
