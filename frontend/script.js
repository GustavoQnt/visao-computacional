// Configuração da API
const API_BASE_URL = 'http://localhost:8000';

// Elementos DOM
const uploadForm = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');
const backgroundInput = document.getElementById('backgroundInput');
const removeBackgroundCheckbox = document.getElementById('removeBackground');
const backgroundSection = document.getElementById('backgroundSection');
const submitBtn = document.getElementById('submitBtn');
const previewSection = document.getElementById('previewSection');
const originalImage = document.getElementById('originalImage');
const processedImage = document.getElementById('processedImage');
const downloadBtn = document.getElementById('downloadBtn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Estado da aplicação
let processedImageBlob = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
  // Toggle da seção de fundo quando checkbox é marcado/desmarcado
  removeBackgroundCheckbox.addEventListener('change', function () {
    backgroundSection.style.display = this.checked ? 'block' : 'none';
  });

  // Preview da imagem selecionada
  imageInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        originalImage.src = e.target.result;
        previewSection.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // Submit do formulário
  uploadForm.addEventListener('submit', handleFormSubmit);

  // Download da imagem processada
  downloadBtn.addEventListener('click', downloadProcessedImage);
});

// Função para lidar com o submit do formulário
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData();
  const imageFile = imageInput.files[0];

  if (!imageFile) {
    showError('Por favor, selecione uma imagem.');
    return;
  }

  // Verificar tamanho do arquivo (10MB limite)
  if (imageFile.size > 10 * 1024 * 1024) {
    showError('O arquivo deve ter no máximo 10MB.');
    return;
  }

  // Adicionar arquivo da imagem
  formData.append('file', imageFile);

  // Adicionar parâmetro de remoção de fundo
  formData.append('remove_background', removeBackgroundCheckbox.checked);

  // Adicionar imagem de fundo se fornecida
  const backgroundFile = backgroundInput.files[0];
  if (backgroundFile) {
    if (backgroundFile.size > 10 * 1024 * 1024) {
      showError('A imagem de fundo deve ter no máximo 10MB.');
      return;
    }
    formData.append('background', backgroundFile);
  }

  // Mostrar loading
  showLoading();

  try {
    const response = await fetch(`${API_BASE_URL}/process-image`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erro ao processar a imagem');
    }

    // Obter a imagem processada como blob
    const blob = await response.blob();
    processedImageBlob = blob;

    // Criar URL para preview
    const imageUrl = URL.createObjectURL(blob);
    processedImage.src = imageUrl;

    // Mostrar botão de download
    downloadBtn.style.display = 'block';

    hideLoading();
    hideError();

  } catch (error) {
    hideLoading();
    showError(error.message);
    console.error('Erro:', error);
  }
}

// Função para baixar a imagem processada
function downloadProcessedImage() {
  if (!processedImageBlob) return;

  const url = URL.createObjectURL(processedImageBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'imagem_processada.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Funções utilitárias para mostrar/esconder elementos
function showLoading() {
  loading.style.display = 'block';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processando...';
}

function hideLoading() {
  loading.style.display = 'none';
  submitBtn.disabled = false;
  submitBtn.textContent = 'Processar Imagem';
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function hideError() {
  errorDiv.style.display = 'none';
}
