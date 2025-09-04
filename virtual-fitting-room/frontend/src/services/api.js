import axios from 'axios'

// Configuração base da API
const API_BASE_URL = 'http://localhost:8001'  // Mudando para porta 8001

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    if (error.response) {
      // Erro do servidor
      throw new Error(error.response.data.detail || 'Erro no servidor')
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão com o servidor')
    } else {
      // Erro geral
      throw new Error('Erro inesperado')
    }
  }
)

// Serviços para Avatares
export const getAvatarModels = async () => {
  try {
    const response = await api.get('/models/avatar')
    return response.data
  } catch (error) {
    console.error('Erro ao buscar avatares:', error)
    throw error
  }
}

export const getAvatarModel = async (avatarId) => {
  try {
    const response = await api.get(`/models/avatar/${avatarId}`)
    return response.data
  } catch (error) {
    console.error('Erro ao buscar avatar:', error)
    throw error
  }
}

// Serviços para Roupas
export const getClothingCatalog = async () => {
  try {
    const response = await api.get('/models/clothes')
    return response.data
  } catch (error) {
    console.error('Erro ao buscar catálogo:', error)
    throw error
  }
}

export const getClothingModel = async (clothingId) => {
  try {
    const response = await api.get(`/models/clothes/${clothingId}`)
    return response.data
  } catch (error) {
    console.error('Erro ao buscar roupa:', error)
    throw error
  }
}

// Serviço para aplicar roupas ao avatar
export const applyClothingToAvatar = async (avatarConfig) => {
  try {
    const response = await api.post('/apply-clothes', avatarConfig)
    return response.data
  } catch (error) {
    console.error('Erro ao aplicar roupas:', error)
    throw error
  }
}

// Serviço de health check
export const checkHealth = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    console.error('Erro no health check:', error)
    throw error
  }
}

// Serviços existentes para processamento de imagens
export const processImage = async (formData) => {
  try {
    const response = await api.post('/process-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao processar imagem:', error)
    throw error
  }
}

export default api
