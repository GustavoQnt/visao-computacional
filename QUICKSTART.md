# 🚀 Guia Rápido - Sistema de Processamento de Imagens

## 📦 Instalação Simples (Windows)

### Passo 1: Instalar Dependências
```bash
cd backend
pip install fastapi uvicorn python-multipart pillow pydantic
```

### Passo 2: Executar o Servidor
```bash
python main.py
```

### Passo 3: Abrir o Frontend
Abra o arquivo `frontend/index.html` no seu navegador.

---

## 🧪 Teste Rápido

### Verificar se está funcionando:
```bash
curl http://localhost:8000/health
```

**Resposta esperada:**
```json
{"status": "healthy", "timestamp": 1234567890.123}
```

---

## 🎯 Como Usar

1. **Abra** `frontend/index.html` no navegador
2. **Selecione** uma imagem (JPG ou PNG)
3. **Marque** "Remover fundo da imagem"
4. **Clique** "Processar Imagem"
5. **Aguarde** o processamento (até 60 segundos)
6. **Baixe** a imagem resultante

---

## ⚙️ Funcionalidades

- ✅ **Upload de imagens** (até 10MB)
- ✅ **Remoção de fundo branco** (automática)
- ✅ **Download da imagem processada**
- ✅ **Preview antes/depois**
- ✅ **Interface responsiva**

---

## 🔧 Problemas Comuns

### "Módulo não encontrado"
```bash
# Instale apenas as dependências básicas
pip install fastapi uvicorn python-multipart pillow pydantic
```

### "Erro de CORS"
- ✅ Já resolvido no código
- Use navegador moderno (Chrome, Firefox, Edge)

### "Erro 500"
- Sistema tem fallback automático
- Verifique os logs do terminal

---

## 📁 Estrutura
```
visao-computacional/
├── frontend/
│   ├── index.html    # Interface web
│   ├── styles.css    # Estilos
│   └── script.js     # JavaScript
└── backend/
    ├── main.py       # API FastAPI
    └── requirements.txt
```

---

## 🎉 Pronto para usar!

O sistema está funcionando com tecnologia simples e confiável, usando apenas PIL (Python Imaging Library) para máxima compatibilidade com Windows.
