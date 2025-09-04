import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import './VirtualFittingRoom.css'

// Componente do Avatar 3D
function Avatar({ avatar, clothes, onLoad }) {
  const group = useRef()
  const [avatarModel, setAvatarModel] = useState(null)
  const [clothingModels, setClothingModels] = useState([])

  useEffect(() => {
    if (avatar) {
      // Aqui você carregaria o modelo real do avatar
      // Por enquanto, criamos um placeholder
      const geometry = new THREE.BoxGeometry(1, 2, 0.5)
      const material = new THREE.MeshStandardMaterial({
        color: 0xf0f0f0,
        roughness: 0.7,
        metalness: 0.1
      })
      const mesh = new THREE.Mesh(geometry, material)
      setAvatarModel(mesh)
      onLoad && onLoad()
    }
  }, [avatar, onLoad])

  useEffect(() => {
    if (clothes && clothes.length > 0) {
      // Aqui você aplicaria as roupas ao avatar
      // Por enquanto, criamos placeholders
      const newClothing = clothes.map((item, index) => {
        const geometry = new THREE.BoxGeometry(1.1, 0.3, 0.6)
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
          roughness: 0.8,
          metalness: 0.2
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.y = 0.5 - index * 0.4
        return mesh
      })
      setClothingModels(newClothing)
    } else {
      setClothingModels([])
    }
  }, [clothes])

  useFrame((state) => {
    if (group.current) {
      // Animação sutil de rotação
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  if (!avatarModel) {
    return null
  }

  return (
    <group ref={group}>
      {/* Avatar base */}
      <primitive object={avatarModel} />

      {/* Roupas aplicadas */}
      {clothingModels.map((clothing, index) => (
        <primitive key={index} object={clothing} />
      ))}
    </group>
  )
}

// Componente principal do provador virtual
function VirtualFittingRoom({ avatar, clothes, isLoading, setIsLoading }) {
  const [background, setBackground] = useState('studio')
  const [cameraPosition, setCameraPosition] = useState([0, 1, 5])

  const handleAvatarLoad = () => {
    setIsLoading(false)
  }

  const backgrounds = {
    studio: { color: '#f0f0f0', envMap: 'studio' },
    outdoor: { color: '#87CEEB', envMap: 'sunset' },
    indoor: { color: '#8B4513', envMap: 'apartment' }
  }

  const currentBg = backgrounds[background]

  if (!avatar) {
    return (
      <div className="virtual-fitting-room">
        <div className="no-avatar-message">
          <h3>👤 Selecione um Avatar</h3>
          <p>Escolha um avatar no painel esquerdo para começar a experimentar roupas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="virtual-fitting-room">
      <div className="fitting-room-header">
        <h3>🪞 Provador Virtual</h3>
        <div className="background-selector">
          <label>Fundo:</label>
          <select
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          >
            <option value="studio">Estúdio</option>
            <option value="outdoor">Externo</option>
            <option value="indoor">Interno</option>
          </select>
        </div>
      </div>

      <div className="canvas-container">
        <Canvas
          camera={{ position: cameraPosition, fov: 50 }}
          style={{ background: currentBg.color }}
        >
          {/* Iluminação */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
          />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Controles de câmera */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            target={[0, 1, 0]}
          />

          {/* Ambiente */}
          <Environment preset={currentBg.envMap} />

          {/* Avatar com roupas */}
          <Avatar
            avatar={avatar}
            clothes={clothes}
            onLoad={handleAvatarLoad}
          />

          {/* Grid de referência */}
          <gridHelper args={[10, 10, 0x888888, 0xcccccc]} />
        </Canvas>
      </div>

      <div className="fitting-room-controls">
        <button
          onClick={() => setCameraPosition([0, 1, 5])}
          className="camera-btn"
        >
          📷 Vista Frontal
        </button>
        <button
          onClick={() => setCameraPosition([5, 1, 0])}
          className="camera-btn"
        >
          📷 Vista Lateral
        </button>
        <button
          onClick={() => setCameraPosition([0, 3, 3])}
          className="camera-btn"
        >
          📷 Vista Superior
        </button>
      </div>
    </div>
  )
}

export default VirtualFittingRoom
