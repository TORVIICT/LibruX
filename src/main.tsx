import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/material-symbols-outlined';
import './index.css'
import Authentication from './pages/Authentication/Authentication.tsx'
import { Sidebar } from './components/layout/Sidebar.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sidebar />
    <Authentication />
  </StrictMode>,
)
