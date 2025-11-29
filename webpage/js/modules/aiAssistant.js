// aiAssistant.js - Admin AI Assistant Settings logic (renamed from security)
export function init() {
  console.log('init aiAssistant admin settings view');
  const projectItems = document.querySelectorAll('.ai-project-item');
  const titleEl = document.getElementById('ai-project-title');
  const metaEl = document.getElementById('ai-project-meta');
  const statusEl = document.getElementById('ai-admin-status');
  const downloadBtn = document.getElementById('ai-download-info');
  const updateBtn = document.getElementById('ai-update-params');
  const removeBtn = document.getElementById('ai-remove-files');
  const paramsForm = document.getElementById('ai-params-form');
  const refreshBtn = document.getElementById('ai-refresh-projects');
  const newProjectBtn = document.getElementById('ai-new-project-btn');

  function setActiveProject(id, label) {
    projectItems.forEach(i => i.classList.toggle('active', i.dataset.projectId === id));
    titleEl.textContent = label;
    metaEl.innerHTML = `<p><strong>ID:</strong> ${id}</p><p><strong>Name:</strong> ${label}</p><p><strong>Status:</strong> ACTIVE (demo)</p>`;
    downloadBtn.disabled = updateBtn.disabled = removeBtn.disabled = false;
    paramsForm.setAttribute('aria-hidden','false');
    statusEl.textContent = '';
  }

  projectItems.forEach(item => {
    item.addEventListener('click', () => setActiveProject(item.dataset.projectId, item.textContent));
  });

  paramsForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    statusEl.textContent = 'Saving parameters (demo)...';
    setTimeout(()=>{ statusEl.textContent = 'Parameters updated.'; }, 800);
  });

  downloadBtn?.addEventListener('click', () => {
    statusEl.textContent = 'Downloading project info (demo)...';
    setTimeout(()=>{ statusEl.textContent = 'Download complete.'; }, 800);
  });
  updateBtn?.addEventListener('click', () => {
    statusEl.textContent = 'Adjust parameters below and save.';
  });
  removeBtn?.addEventListener('click', () => {
    statusEl.textContent = 'Removing files (demo)...';
    setTimeout(()=>{ statusEl.textContent = 'Files removed.'; metaEl.innerHTML='<p class="placeholder-text">Select a project</p>'; downloadBtn.disabled=updateBtn.disabled=removeBtn.disabled=true; paramsForm.setAttribute('aria-hidden','true'); titleEl.textContent='Select a project'; }, 900);
  });

  refreshBtn?.addEventListener('click', () => {
    statusEl.textContent = 'Refreshing projects (demo)...';
    setTimeout(()=>{ statusEl.textContent = 'Projects refreshed.'; }, 600);
  });
  newProjectBtn?.addEventListener('click', () => {
    statusEl.textContent = 'Creating new project (demo)...';
    setTimeout(()=>{ statusEl.textContent = 'New project created (not persisted).'; }, 1000);
  });
}
