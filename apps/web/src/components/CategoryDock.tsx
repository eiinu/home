import React from 'react'
import './CategoryDock.css'

interface CategoryItem {
  id: string
  icon: string
  label: string
  active?: boolean
}

interface CategoryDockProps {
  categories: CategoryItem[]
  activeCategory: string
  onCategoryClick: (id: string) => void
}

const CategoryDock: React.FC<CategoryDockProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryClick 
}) => {
  return (
    <nav className="category-dock">
      <div className="category-dock-container">
        <div className="category-items">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => onCategoryClick(category.id)}
              title={category.label}
            >
              <div className="category-item-icon">
                {category.icon}
              </div>
              <span className="category-item-label">{category.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default CategoryDock