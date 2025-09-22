import React, { useState } from 'react'
import './Dock.css'

interface DockItem {
  id: string
  icon: string
  label: string
  active?: boolean
  badge?: number
}

interface DockProps {
  items: DockItem[]
  onItemClick: (id: string) => void
}

const Dock: React.FC<DockProps> = ({ items, onItemClick }) => {
  const [activeItem, setActiveItem] = useState(items.find(item => item.active)?.id || items[0]?.id)

  const handleItemClick = (id: string) => {
    setActiveItem(id)
    onItemClick(id)
  }

  return (
    <nav className="dock">
      <div className="dock-container">
        <div className="dock-items">
          {items.map((item) => (
            <button
              key={item.id}
              className={`dock-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
              title={item.label}
            >
              <div className="dock-item-icon">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className="dock-item-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </div>
              <span className="dock-item-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Dock