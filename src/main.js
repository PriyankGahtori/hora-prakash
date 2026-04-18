// src/main.js
import { initTabs } from './ui/tabs.js'
import { renderInputTab } from './tabs/input.js'
import { initSwissEph } from './core/swisseph.js'

async function main() {
  await initSwissEph()
  initTabs()
  renderInputTab()
}

main()
