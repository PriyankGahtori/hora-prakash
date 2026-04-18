// src/ui/tabs.js
export function initTabs() {
  document.getElementById('tab-nav').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn')
    if (!btn || btn.disabled) return
    switchTab(btn.dataset.tab)
  })
}

export function switchTab(name) {
  if (!name) return
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name))
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${name}`))
}

export function enableTab(name) {
  const btn = document.querySelector(`.tab-btn[data-tab="${name}"]`)
  if (btn) btn.disabled = false
}
