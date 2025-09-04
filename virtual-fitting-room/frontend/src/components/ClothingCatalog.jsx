import React, { useState, useEffect } from 'react'
import { getClothingCatalog, applyClothingToAvatar } from '../services/api'
import './ClothingCatalog.css'

function ClothingCatalog({ selectedClothes, onClothingChange, selectedAvatar }) {
  const [clothes, setClothes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')

  useEffect(() => {
    loadClothingCatalog()
  }, [])

  const loadClothingCatalog = async () => {
    try {
      setLoading(true)
      const data = await getClothingCatalog()
      setClothes(data.clothes || [])
    } catch (err) {
      setError('Erro ao carregar catálogo')
      console.error('Erro ao carregar catálogo:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClothingSelect = (clothing) => {
    if (!selectedAvatar) {
      alert('Selecione um avatar primeiro!')
      return
    }

    const isSelected = selectedClothes.some(item => item.id === clothing.id)

    if (isSelected) {
      // Remover roupa
      const newSelection = selectedClothes.filter(item => item.id !== clothing.id)
      onClothingChange(newSelection)
    } else {
      // Adicionar roupa
      const newSelection = [...selectedClothes, clothing]
      onClothingChange(newSelection)
    }
  }

  const filteredClothes = clothes.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory
    const genderMatch = selectedGender === 'all' || item.gender === selectedGender || item.gender === 'unisex'
    return categoryMatch && genderMatch
  })

  const categories = ['all', 'tops', 'bottoms', 'dresses', 'shoes', 'accessories']
  const genders = ['all', 'male', 'female', 'unisex']

  if (loading) {
    return (
      <div className="clothing-catalog">
        <h3>👕 Catálogo de Roupas</h3>
        <div className="loading-clothes">
          <div className="spinner"></div>
          <p>Carregando catálogo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="clothing-catalog">
        <h3>👕 Catálogo de Roupas</h3>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadClothingCatalog} className="retry-btn">
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="clothing-catalog">
      <h3>👕 Catálogo de Roupas</h3>

      {!selectedAvatar && (
        <div className="no-avatar-warning">
          <p>⚠️ Selecione um avatar para experimentar roupas</p>
        </div>
      )}

      <div className="filters">
        <div className="filter-group">
          <label>Categoria:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Todas' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Gênero:</label>
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            {genders.map(gen => (
              <option key={gen} value={gen}>
                {gen === 'all' ? 'Todos' : gen.charAt(0).toUpperCase() + gen.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredClothes.length === 0 ? (
        <div className="no-clothes">
          <p>Nenhuma roupa encontrada para os filtros selecionados</p>
        </div>
      ) : (
        <div className="clothing-grid">
          {filteredClothes.map((item) => {
            const isSelected = selectedClothes.some(selected => selected.id === item.id)

            return (
              <div
                key={item.id}
                className={`clothing-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleClothingSelect(item)}
              >
                <div className="clothing-preview">
                  <div className="clothing-placeholder">
                    {item.category === 'tops' ? '👕' :
                      item.category === 'bottoms' ? '👖' :
                        item.category === 'dresses' ? '👗' :
                          item.category === 'shoes' ? '👠' : '💍'}
                  </div>
                </div>
                <div className="clothing-info">
                  <h4>{item.name}</h4>
                  <p className="category">{item.category}</p>
                  <p className="gender">{item.gender}</p>
                  {item.price && (
                    <p className="price">R$ {item.price.toFixed(2)}</p>
                  )}
                </div>
                {isSelected && (
                  <div className="selected-indicator">✓</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {selectedClothes.length > 0 && (
        <div className="selected-summary">
          <h4>Roupas Selecionadas ({selectedClothes.length})</h4>
          <button
            onClick={() => onClothingChange([])}
            className="clear-btn"
          >
            🗑️ Limpar Seleção
          </button>
        </div>
      )}
    </div>
  )
}

export default ClothingCatalog
