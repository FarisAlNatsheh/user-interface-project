import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import {
  Bell,
  FileText,
  LayoutDashboard,
  Settings,
  SlidersHorizontal,
} from 'lucide-react'
import './App.css'
import Alerts from './pages/Alerts'
import Configurations from './pages/Configurations'
import Dashboard from './pages/Dashboard'
import Files from './pages/Files'
import SettingsPage from './pages/Settings'
import Sidebar from './components/Sidebar'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLightMode, setIsLightMode] = useState(true)

  const navigationItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
    { label: 'Configurations', icon: SlidersHorizontal, to: '/configurations' },
    { label: 'Files', icon: FileText, to: '/files' },
    { label: 'Alerts', icon: Bell, to: '/alerts' },
    { label: 'Settings', icon: Settings, to: '/settings' },
  ]

  return (
    <div className={`app-shell ${isLightMode ? 'theme-light' : 'theme-dark'}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((value) => !value)}
        title="Confily"
        items={navigationItems}
        isLightMode={isLightMode}
        onToggleTheme={() => setIsLightMode((value) => !value)}
      />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                isLightMode={isLightMode}
                onToggleTheme={() => setIsLightMode((value) => !value)}
              />
            }
          />
          <Route path="/configurations" element={<Configurations />} />
          <Route path="/files" element={<Files />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
