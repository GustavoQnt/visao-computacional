import React, { createContext, useContext, useState, useCallback } from 'react'

const ClothingContext = createContext()

export const useClothing = () => {
  const context = useContext(ClothingContext)
  if (!context) {
    throw new Error('useClothing deve ser usado dentro de ClothingProvider')
  }
  return context
}

export const ClothingProvider = ({ children }) => {
  const [selectedClothes, setSelectedClothes] = useState([])
  const [clothingHistory, setClothingHistory] = useState([])
  const [favorites, setFavorites] = useState([])

  const addClothing = useCallback((clothing) => {
    setSelectedClothes(prev => {
      const newSelection = [...prev, clothing]
      setClothingHistory(prevHistory => [...prevHistory, {
        action: 'add',
        clothing,
        timestamp: new Date().toISOString()
      }])
      return newSelection
    })
  }, [])

  const removeClothing = useCallback((clothingId) => {
    setSelectedClothes(prev => {
      const clothing = prev.find(item => item.id === clothingId)
      const newSelection = prev.filter(item => item.id !== clothingId)
      if (clothing) {
        setClothingHistory(prevHistory => [...prevHistory, {
          action: 'remove',
          clothing,
          timestamp: new Date().toISOString()
        }])
      }
      return newSelection
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedClothes([])
    setClothingHistory(prevHistory => [...prevHistory, {
      action: 'clear',
      timestamp: new Date().toISOString()
    }])
  }, [])

  const toggleFavorite = useCallback((clothing) => {
    setFavorites(prev => {
      const isFavorite = prev.some(item => item.id === clothing.id)
      if (isFavorite) {
        return prev.filter(item => item.id !== clothing.id)
      } else {
        return [...prev, clothing]
      }
    })
  }, [])

  const getClothingById = useCallback((clothingId) => {
    return selectedClothes.find(item => item.id === clothingId)
  }, [selectedClothes])

  const getClothingByCategory = useCallback((category) => {
    return selectedClothes.filter(item => item.category === category)
  }, [selectedClothes])

  const getTotalPrice = useCallback(() => {
    return selectedClothes.reduce((total, item) => total + (item.price || 0), 0)
  }, [selectedClothes])

  const value = {
    selectedClothes,
    clothingHistory,
    favorites,
    addClothing,
    removeClothing,
    clearSelection,
    toggleFavorite,
    getClothingById,
    getClothingByCategory,
    getTotalPrice,
  }

  return (
    <ClothingContext.Provider value={value}>
      {children}
    </ClothingContext.Provider>
  )
}
