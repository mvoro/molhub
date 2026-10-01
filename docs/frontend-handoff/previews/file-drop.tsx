// Handoff-only fixture: actual component, forced active state, no simulated drag events.
import { createRoot } from 'react-dom/client'
import '../../../src/index.css'
import { FileDropOverlay } from '../../../src/components/chat-composer/file-drop'

document.documentElement.classList.toggle('dark', new URLSearchParams(window.location.search).get('theme') === 'dark')
createRoot(document.getElementById('root')!).render(
  <FileDropOverlay active limit="До 10 файлов, каждый до 25 МБ" />,
)
