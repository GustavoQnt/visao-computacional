import React, { useState, useEffect } from 'react'
import { getAvatarModels } from '../services/api'
import './AvatarSelector.css'

function AvatarSelector({ selectedAvatar, onAvatarChange }) {
  const [avatars, setAvatars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAvatars()
  }, [])

  const loadAvatars = async () => {
    try {
      setLoading(true)
      const data = await getAvatarModels()
      setAvatars(data.avatars || [])

      // Selecionar avatar padrão se nenhum estiver selecionado
      if (!selectedAvatar && data.default) {
        const defaultAvatar = data.avatars.find(av => av.id === data.default)
        if (defaultAvatar) {
          onAvatarChange(defaultAvatar)
        }
      }
    } catch (err) {
      setError('Erro ao carregar avatares')
      console.error('Erro ao carregar avatares:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarSelect = (avatar) => {
    onAvatarChange(avatar)
  }

  if (loading) {
    return (
      <div className="avatar-selector">
        <h3>👤 Selecionar Avatar</h3>
        <div className="loading-avatars">
          <div className="spinner"></div>
          <p>Carregando avatares...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="avatar-selector">
        <h3>👤 Selecionar Avatar</h3>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadAvatars} className="retry-btn">
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="avatar-selector">
      <h3>👤 Selecionar Avatar</h3>

      {avatars.length === 0 ? (
        <div className="no-avatars">
          <p>Nenhum avatar disponível</p>
          <p className="hint">Adicione modelos 3D na pasta models/avatars</p>
        </div>
      ) : (
        <div className="avatar-grid">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`avatar-item ${selectedAvatar?.id === avatar.id ? 'selected' : ''}`}
              onClick={() => handleAvatarSelect(avatar)}
            >
              <div className="avatar-preview">
                <div className="avatar-placeholder">
                  {avatar.type === 'glb' ? '🎭' : '🎨'}
                </div>
              </div>
              <div className="avatar-info">
                <h4>{avatar.id}</h4>
                <p>{avatar.type.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="avatar-tips">
        <h4>💡 Dicas</h4>
        <ul>
          <li>Formatos suportados: GLB, GLTF</li>
          <li>Modelos devem ter T-pose padrão</li>
          <li>Otimize para web (compressão)</li>
        </ul>
      </div>
    </div>
  )
}

export default AvatarSelector
