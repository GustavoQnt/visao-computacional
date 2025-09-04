import React, { useState, useEffect } from 'react'
import VirtualFittingRoom from './components/VirtualFittingRoom'
import ClothingCatalog from './components/ClothingCatalog'
import AvatarSelector from './components/AvatarSelector'
import { ClothingProvider } from './hooks/useClothing.jsx'
import './App.css'

function App() {
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [selectedClothes, setSelectedClothes] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleAvatarChange = (avatar) => {
    setSelectedAvatar(avatar)
    // Resetar roupas selecionadas quando trocar de avatar
    setSelectedClothes([])
  }

  const handleClothingChange = (clothes) => {
    setSelectedClothes(clothes)
  }

  return (
    <ClothingProvider>
      <div className="app">
        <header className="app-header">
          <h1>🛍️ Provador Virtual 3D</h1>
          <p>Experimente roupas em tempo real com nossa boneca 3D</p>
        </header>

        <main className="app-main">
          <div className="left-panel">
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onAvatarChange={handleAvatarChange}
            />
            <ClothingCatalog
              selectedClothes={selectedClothes}
              onClothingChange={handleClothingChange}
              selectedAvatar={selectedAvatar}
            />
          </div>

          <div className="center-panel">
            <VirtualFittingRoom
              avatar={selectedAvatar}
              clothes={selectedClothes}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>

          <div className="right-panel">
            <div className="controls-panel">
              <h3>🎮 Controles</h3>
              <div className="control-item">
                <span>🖱️ Mouse:</span> Rotacionar avatar
              </div>
              <div className="control-item">
                <span>🔍 Scroll:</span> Zoom in/out
              </div>
              <div className="control-item">
                <span>📱 Touch:</span> Gestos para mobile
              </div>
            </div>

            <div className="avatar-info">
              <h3>👤 Informações do Avatar</h3>
              {selectedAvatar ? (
                <div>
                  <p><strong>Modelo:</strong> {selectedAvatar.name}</p>
                  <p><strong>Tipo:</strong> {selectedAvatar.type}</p>
                </div>
              ) : (
                <p>Selecione um avatar para começar</p>
              )}
            </div>

            <div className="clothing-info">
              <h3>👕 Roupas Selecionadas</h3>
              {selectedClothes.length > 0 ? (
                <ul>
                  {selectedClothes.map((item, index) => (
                    <li key={index}>{item.name}</li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma roupa selecionada</p>
              )}
            </div>
          </div>
        </main>

        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Carregando modelo 3D...</p>
          </div>
        )}
      </div>
    </ClothingProvider>
  )
}

export default App
