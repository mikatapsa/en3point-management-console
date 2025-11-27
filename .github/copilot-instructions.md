
# Copilot Instructions – Unified Single-Page Management Console

We are using a SINGLE `index.html` with all views as `<section>` blocks.
Navigation is done by hide/unhide using CSS classes, not by loading new HTML files.

## Project Structure

```
en3point-management-console/
├── .github/
│   └── copilot-instructions.md    # This file
├── webpage/
│   ├── index.html                 # Single-page app with all 13 views
│   ├── assets/
│   │   └── media/
│   │       ├── en3point.png       # Logo
│   │       └── loginbackground.png
│   ├── css/
│   │   ├── base.css               # Global resets, typography, dark theme
│   │   ├── layout.css             # Top bar, nav, view system, login layout
│   │   ├── theme.css              # Color scheme, variables
│   │   └── components.css         # Reusable UI components
│   └── js/
│       ├── app.js                 # Navigation system + viewInitializers
│       └── modules/
│           ├── dashboard.js       # Module files exist (placeholders)
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
- **Single-page architecture**: All 13 views in one `index.html`
- **Navigation system**: Top bar with 12 nav buttons + login view
- **View switching**: `showView(name)` toggles `.active` class
- **CSS structure**: 4 organized stylesheets (base, layout, theme, components)
- **Module scaffolding**: 13 module files in `js/modules/` (ready for code migration)
- **Dark theme**: Base styling with dark background (#0b0c10), light text
- **Logo integration**: en3point.png in top bar

### 13 Views (All Placeholder Content)
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
13. **login** – Login screen (with background image)

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
     };
     ```

5. **CSS organization**
   - **`base.css`**: Global resets, typography, body styles
   - **`layout.css`**: Top bar, navigation, view system, structural layouts
   - **`theme.css`**: Color scheme, CSS variables, theming
   - **`components.css`**: Reusable UI components (cards, forms, tables)
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
         const addBtn = document.querySelector("#view-users .add-user-btn");
         addBtn.addEventListener("click", () => { /* ... */ });
     }
     ```

7. **No new HTML files for views**
   - Do not create `/views/*.html` for new sections
   - Extend `index.html` by inserting new `<section id="view-<name>" class="view hidden">...</section>`
   - Add corresponding nav button in top bar

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
    - Scope all queries to the view:
      ```js
      export function init() {
          const root = document.getElementById("view-users");
          const list = root.querySelector(".users-list");
          const addBtn = root.querySelector(".add-user-btn");
          // ...
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
4. **Create module logic** in `js/modules/<name>.js`:
   ```js
   export function init() {
       const root = document.getElementById("view-<name>");
       // Your initialization code
   }
   ```
5. **Register in viewInitializers** in `js/app.js`

### Adding a New View

1. **Add section** to `index.html`:
   ```html
   <section id="view-newview" class="view hidden">
       <h1>New View</h1>
       <p>Content here</p>
   </section>
   ```
2. **Add nav button** in top bar:
   ```html
   <button class="nav-btn" data-view="newview">New View</button>
   ```
3. **Create module**: `js/modules/newview.js`
4. **Register in viewInitializers**: `js/app.js`

### Testing Locally

```bash
cd webpage
python3 -m http.server 8080
# Visit http://localhost:8080
```

## Common Patterns

### Loading Data into a View

```js
// js/modules/users.js
export async function init() {
    const root = document.getElementById("view-users");
    const listEl = root.querySelector(".users-list");
    
    // Fetch data (replace with actual API)
    const users = await fetchUsers();
    
    // Render
    listEl.innerHTML = users.map(u => `
        <div class="user-card">
            <h3>${u.name}</h3>
            <p>${u.email}</p>
        </div>
    `).join('');
}
```

### Form Handling

```js
export function init() {
    const root = document.getElementById("view-users");
    const form = root.querySelector(".user-form");
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Submit to API
        await saveUser(data);
        
        // Refresh view
        init();
    });
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

1. **Single HTML file** – all views are sections in `index.html`
2. **No inline handlers** – all events bound in module `init()` functions
3. **View-scoped queries** – always query within `document.getElementById("view-<name>")`
4. **CSS organization** – use existing 4 CSS files, prefix classes by view
5. **Dark theme** – maintain consistent color scheme (#0b0c10 bg, #5F0AFF accent)
6. **Module pattern** – one module per view, export `init()`, register in `viewInitializers`
7. **Top bar navigation** – nav buttons use `data-view` attributes, no href links
8. **13 views ready** – all placeholders exist, ready for content migration
9. **ES6 modules** – use `import`/`export`, script tag has `type="module"`
10. **Local testing** – run `python3 -m http.server 8080` in `webpage/` directory

When adding features, prioritize consistency with existing patterns, dark theme aesthetics, and mobile-responsive design. Always test navigation between views before completing work.
