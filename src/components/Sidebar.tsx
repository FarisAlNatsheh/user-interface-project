import type { ComponentType } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, Moon, Sun } from 'lucide-react'

export type SidebarItem = {
  label: string
  to: string
  icon: ComponentType<{ size?: number }>
}

type SidebarProps = {
  isOpen: boolean
  onToggle: () => void
  title: string
  items: SidebarItem[]
  isLightMode: boolean
  onToggleTheme: () => void
}

function Sidebar({
  isOpen,
  onToggle,
  title,
  items,
  isLightMode,
  onToggleTheme,
}: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Menu size={22} />
        </button>
        <div className="sidebar-title">{title}</div>
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink key={item.label} className="sidebar-item" to={item.to}>
              <span className="sidebar-icon">
                <Icon size={20} />
              </span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
      <div className="sidebar-footer">
        <label className="sidebar-theme">
          <span className="sidebar-theme-label">Light mode</span>
          <span className="sidebar-theme-icon" aria-hidden="true">
            {isLightMode ? <Sun size={14} /> : <Moon size={14} />}
          </span>
          <span className="sidebar-switch">
            <input
              className="sidebar-switch-input"
              type="checkbox"
              checked={isLightMode}
              onChange={onToggleTheme}
            />
            <span className="sidebar-switch-track" aria-hidden="true" />
          </span>
        </label>
      </div>
    </aside>
  )
}

export default Sidebar
