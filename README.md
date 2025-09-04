# Image Background Service - Mono Repo

Microsserviço completo para edição de imagens com remoção e substituição de fundo, incluindo interface web para upload.

## 📁 Estrutura do Projeto

```
visao-computacional/
├── frontend/           # Interface web para upload
│   ├── index.html     # Página principal
│   ├── styles.css     # Estilos da interface
│   └── script.js      # Lógica JavaScript
├── backend/           # Microsserviço FastAPI
│   ├── main.py       # API principal
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
└── README.md         # Este arquivo
```

## 🚀 Funcionalidades

### Backend (FastAPI)
- ✅ **POST /process-image**: Processamento de imagens
- ✅ Remoção automática de fundo usando OpenCV + PIL
- ✅ Substituição opcional de fundo
- ✅ Validações de tamanho e formato
- ✅ Timeout de processamento
- ✅ Suporte a Docker
- ✅ Health check endpoint
- ✅ CORS configurado para desenvolvimento

### Frontend
- ✅ Interface responsiva para upload
- ✅ Preview de imagens antes/depois
- ✅ Suporte a drag & drop
- ✅ Download automático da imagem processada
- ✅ Feedback visual de progresso

## 🛠️ Requisitos

- Python 3.11+
- Docker (opcional)
- Navegador moderno

## 📦 Instalação e Execução

### Opção 1: Docker (Recomendado)

```bash
# Navegar para o diretório backend
cd backend

# Construir e executar com Docker Compose
docker-compose up --build
```

### Opção 2: Execução Local

```bash
# Instalar dependências
pip install -r backend/requirements.txt

# Executar o servidor
python backend/main.py
```

**Nota**: O sistema usa apenas PIL para máxima compatibilidade e evitar problemas de instalação.

## 🌐 Uso da API

### Endpoint Principal

```http
POST /process-image
```

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `file` | File | ✅ | Arquivo de imagem (.jpg, .png) |
| `remove_background` | boolean | ❌ | Remover fundo (default: false) |
| `background` | File | ❌ | Imagem de fundo para substituição |

#### Limites

- **Tamanho máximo**: 10MB por arquivo
- **Formatos aceitos**: JPG, PNG
- **Timeout**: 60 segundos
- **Processamento**: PIL (simples e compatível com Windows)

#### Exemplos de Uso

```bash
# Apenas upload (sem processamento)
curl -X POST "http://localhost:8000/process-image" \
     -F "file=@imagem.jpg"

# Remover fundo
curl -X POST "http://localhost:8000/process-image" \
     -F "file=@imagem.jpg" \
     -F "remove_background=true"

# Remover fundo e aplicar novo
curl -X POST "http://localhost:8000/process-image" \
     -F "file=@imagem.jpg" \
     -F "remove_background=true" \
     -F "background=@fundo.jpg"
```

## 🖥️ Interface Web

### Como Usar

1. **Abra o navegador** e acesse `frontend/index.html`
2. **Selecione uma imagem** para upload
3. **Marque a opção** "Remover fundo" se desejar
4. **Opcionalmente**, selecione uma imagem de fundo
5. **Clique em "Processar Imagem"**
6. **Aguarde o processamento** e visualize o resultado
7. **Baixe a imagem** processada

### Funcionalidades da Interface

- **Preview em tempo real**: Veja a imagem antes de processar
- **Comparação lado a lado**: Original vs Processada
- **Feedback visual**: Loading e mensagens de erro
- **Download automático**: Botão para salvar o resultado

## 🔧 Desenvolvimento

### Estrutura do Backend

```python
# Validações implementadas
- Tamanho máximo de arquivo (10MB)
- Formatos suportados (JPG, PNG)
- Timeout de processamento (60s)

# Funcionalidades
- Remoção de fundo com rembg
- Composição de imagens com Pillow
- Tratamento de erros robusto
- Logging detalhado
```

### Estrutura do Frontend

```javascript
// Funcionalidades implementadas
- Upload assíncrono
- Preview de imagens
- Validação client-side
- Feedback de progresso
- Download automático
```

## 🐳 Docker

### Construir Imagem

```bash
cd backend
docker build -t image-background-service .
```

### Executar Container

```bash
docker run -p 8000:8000 image-background-service
```

### Docker Compose

```bash
# Desenvolvimento
docker-compose up --build

# Produção
docker-compose -f docker-compose.yml up -d
```

## 📊 Monitoramento

### Health Check

```bash
curl http://localhost:8000/health
```

### Logs

```bash
# Ver logs do container
docker-compose logs -f image-background-service
```

## 🔒 Segurança

- ✅ Validação de entrada de arquivos
- ✅ Limites de tamanho de upload
- ✅ Timeout de processamento
- ✅ Usuário não-root no container
- ✅ Sanitização de nomes de arquivo

## 🐛 Tratamento de Erros

### Códigos de Status HTTP

- `200`: Sucesso
- `400`: Arquivo inválido
- `413`: Arquivo muito grande
- `408`: Timeout
- `500`: Erro interno

### Mensagens de Erro

- Arquivo muito grande
- Formato não suportado
- Processamento excedeu tempo limite
- Erro interno do servidor

## 📈 Performance

- **Processamento paralelo**: Suporte a múltiplas requisições
- **Otimização de memória**: Streams para arquivos grandes
- **Cache inteligente**: Reutilização de recursos
- **Timeout configurável**: Prevenção de travamentos

## 🔄 Próximos Passos

- [ ] Suporte a mais formatos (WebP, TIFF)
- [ ] API de redimensionamento automático
- [ ] Suporte a batch processing
- [ ] Interface administrativa
- [ ] Métricas e monitoramento avançado
- [ ] Suporte a cloud storage (S3, GCS)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.
