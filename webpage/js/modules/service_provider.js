// service_provider.js - Service Provider Management logic
export function init() {
  console.log('init service_provider view');
  const modeButtons = document.querySelectorAll('.sp-mode-btn');
  const panels = document.querySelectorAll('.sp-panel');
  const onboardForm = document.getElementById('sp-onboard-form');
  const onboardStatus = document.getElementById('sp-onboard-status');
  const selectProvider = document.getElementById('sp-select-provider');
  const currentServicesEl = document.getElementById('sp-current-services');
  const updateForm = document.getElementById('sp-update-form');
  const updateServicesInput = document.getElementById('sp-update-services');
  const removeBtn = document.getElementById('sp-remove-provider');
  const manageStatus = document.getElementById('sp-manage-status');

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.toggle('active', b === btn));
      panels.forEach(p => p.classList.toggle('active', p.id === `sp-${btn.dataset.mode}`));
    });
  });

  onboardForm?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('sp-name').value.trim();
    if (!name) { onboardStatus.textContent='Name required.'; return; }
    onboardStatus.textContent='Onboarding provider (demo)...';
    setTimeout(()=>{ onboardStatus.textContent='Provider onboarded (demo, not persisted).'; onboardForm.reset(); }, 900);
  });

  selectProvider?.addEventListener('change', () => {
    const val = selectProvider.value;
    if (!val) { currentServicesEl.textContent='Select a provider to view services.'; updateForm.setAttribute('aria-hidden','true'); return; }
    currentServicesEl.textContent='Services: analytics, storage (demo)';
    updateForm.setAttribute('aria-hidden','false');
  });

  updateForm?.addEventListener('submit', e => {
    e.preventDefault();
    manageStatus.textContent='Updating services (demo)...';
    setTimeout(()=>{ manageStatus.textContent='Services updated (demo).'; updateServicesInput.value=''; }, 800);
  });

  removeBtn?.addEventListener('click', () => {
    manageStatus.textContent='Removing provider (demo)...';
    setTimeout(()=>{ manageStatus.textContent='Provider removed (demo).'; selectProvider.value=''; currentServicesEl.textContent='Select a provider to view services.'; updateForm.setAttribute('aria-hidden','true'); }, 900);
  });
}
