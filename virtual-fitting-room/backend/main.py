from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from rembg import remove
import io
import asyncio
import os
import json
from typing import List, Optional
from pydantic import BaseModel


MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
PROCESS_TIMEOUT_SECONDS = 30
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}


# Modelos Pydantic para o provador virtual
class ClothingItem(BaseModel):
    id: str
    name: str
    category: str
    gender: str
    size: str
    texture_url: str
    model_url: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None


class AvatarConfig(BaseModel):
    avatar_id: str
    clothing_items: List[str]
    pose: Optional[str] = "T-pose"
    background: Optional[str] = "studio"


app = FastAPI(title="virtual-fitting-room-service", version="2.0.0")

# CORS (liberado para facilitar integração local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar diretórios para modelos 3D se não existirem
os.makedirs("models/avatars", exist_ok=True)
os.makedirs("models/clothes", exist_ok=True)
os.makedirs("models/textures", exist_ok=True)


@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok", "service": "virtual-fitting-room"})


# Endpoints do provador virtual 3D
@app.get("/models/avatar")
async def get_avatar_models() -> JSONResponse:
    """Retorna lista de modelos de avatar disponíveis"""
    try:
        avatar_dir = "models/avatars"
        avatars = []

        if os.path.exists(avatar_dir):
            for file in os.listdir(avatar_dir):
                if file.endswith(('.glb', '.gltf')):
                    avatars.append({
                        "id": file.replace('.glb', '').replace('.gltf', ''),
                        "filename": file,
                        "url": f"/static-models/avatars/{file}",
                        "type": "glb" if file.endswith('.glb') else "gltf"
                    })

        return JSONResponse({
            "avatars": avatars,
            "default": "female-avatar" if avatars else None
        })
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao carregar avatares: {str(e)}")


@app.get("/models/clothes")
async def get_clothing_catalog() -> JSONResponse:
    """Retorna catálogo de roupas disponíveis"""
    try:
        # Dados mockados para demonstração
        clothes_catalog = [
            {
                "id": "tshirt-001",
                "name": "Camiseta Básica",
                "category": "tops",
                "gender": "unisex",
                "size": "M",
                "texture_url": "/static-models/textures/tshirt-001.jpg",
                "model_url": "/static-models/clothes/tshirt-001.glb",
                "price": 49.90,
                "description": "Camiseta básica de algodão"
            },
            {
                "id": "jeans-001",
                "name": "Calça Jeans",
                "category": "bottoms",
                "gender": "unisex",
                "size": "M",
                "texture_url": "/static-models/textures/jeans-001.jpg",
                "model_url": "/static-models/clothes/jeans-001.glb",
                "price": 89.90,
                "description": "Calça jeans clássica"
            },
            {
                "id": "dress-001",
                "name": "Vestido Elegante",
                "category": "dresses",
                "gender": "female",
                "size": "M",
                "texture_url": "/static-models/textures/dress-001.jpg",
                "model_url": "/static-models/clothes/dress-001.glb",
                "price": 129.90,
                "description": "Vestido elegante para ocasiões especiais"
            }
        ]

        return JSONResponse({
            "clothes": clothes_catalog,
            "categories": ["tops", "bottoms", "dresses", "shoes", "accessories"],
            "genders": ["male", "female", "unisex"]
        })
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao carregar catálogo: {str(e)}")


@app.post("/apply-clothes")
async def apply_clothing_to_avatar(config: AvatarConfig) -> JSONResponse:
    """Aplica roupas ao avatar e retorna configuração para renderização"""
    try:
        # Validar se o avatar existe
        avatar_dir = "models/avatars"
        avatar_files = [f for f in os.listdir(avatar_dir) if f.endswith(
            ('.glb', '.gltf'))] if os.path.exists(avatar_dir) else []

        if not avatar_files:
            raise HTTPException(
                status_code=404, detail="Nenhum avatar disponível")

        # Validar roupas
        valid_clothes = []
        for clothing_id in config.clothing_items:
            # Aqui você implementaria a lógica de validação real
            # Por enquanto, aceitamos qualquer ID
            valid_clothes.append(clothing_id)

        # Retornar configuração para o frontend
        return JSONResponse({
            "avatar_config": {
                "avatar_id": config.avatar_id,
                "clothing_items": valid_clothes,
                "pose": config.pose,
                "background": config.background,
                "render_url": f"/static-models/avatars/{config.avatar_id}.glb"
            },
            "compatibility": {
                "avatar_ready": True,
                "clothing_compatible": True,
                "warnings": []
            }
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao aplicar roupas: {str(e)}")


@app.get("/models/avatar/{avatar_id}")
async def get_avatar_model(avatar_id: str):
    """Retorna o arquivo do modelo 3D do avatar"""
    try:
        avatar_path = f"models/avatars/{avatar_id}.glb"
        if not os.path.exists(avatar_path):
            avatar_path = f"models/avatars/{avatar_id}.gltf"

        if os.path.exists(avatar_path):
            return FileResponse(avatar_path, media_type="application/octet-stream")
        else:
            raise HTTPException(
                status_code=404, detail="Avatar não encontrado")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao carregar avatar: {str(e)}")


@app.get("/models/clothes/{clothing_id}")
async def get_clothing_model(clothing_id: str):
    """Retorna o arquivo do modelo 3D da roupa"""
    try:
        clothing_path = f"models/clothes/{clothing_id}.glb"
        if not os.path.exists(clothing_path):
            clothing_path = f"models/clothes/{clothing_id}.gltf"

        if os.path.exists(clothing_path):
            return FileResponse(clothing_path, media_type="application/octet-stream")
        else:
            raise HTTPException(status_code=404, detail="Roupa não encontrada")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao carregar roupa: {str(e)}")


# Funcionalidades existentes do processamento de imagens
def _validate_and_read_upload(file: UploadFile, *, required: bool = True) -> bytes:
    if file is None:
        if required:
            raise HTTPException(
                status_code=400, detail="Arquivo de imagem é obrigatório.")
        return b""

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415, detail="Formato inválido. Aceito: JPG, PNG.")

    # Ler bytes e checar tamanho
    data = file.file.read()
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Arquivo vazio.")
    if len(data) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Arquivo excede 10MB.")

    # Validar que é uma imagem suportada pelo Pillow
    try:
        with Image.open(io.BytesIO(data)) as im:
            im.verify()  # valida assinatura
    except Exception:
        raise HTTPException(
            status_code=415, detail="Arquivo não é uma imagem válida.")

    # Reset cursor do arquivo (por boa prática, ainda que não usemos novamente)
    try:
        file.file.seek(0)
    except Exception:
        pass

    return data


def _remove_background_to_rgba(pil_image: Image.Image) -> Image.Image:
    # rembg.remove trabalha melhor com bytes em muitos casos
    with io.BytesIO() as buf_in:
        pil_image.save(buf_in, format="PNG")
        input_bytes = buf_in.getvalue()
    output_bytes = remove(input_bytes)
    result = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
    return result


def _composite_on_background(foreground_rgba: Image.Image, background_image: Image.Image) -> Image.Image:
    # Redimensionar background para o tamanho do foreground
    bg = background_image.convert("RGB")
    bg = bg.resize(foreground_rgba.size, Image.LANCZOS)
    # Compor (usa o canal alpha do foreground)
    composed = Image.new("RGB", foreground_rgba.size, (255, 255, 255))
    composed.paste(bg, (0, 0))
    composed.paste(foreground_rgba, (0, 0), mask=foreground_rgba.split()[-1])
    return composed


def _process_image_sync(
    file_bytes: bytes,
    remove_background: bool,
    background_bytes: bytes | None,
) -> tuple[bytes, str]:
    # Abrir imagem principal
    original = Image.open(io.BytesIO(file_bytes))

    if not remove_background:
        # Retornar original (mesmo formato de entrada quando possível)
        # Preferir o content-type pelo cabeçalho; se não, usar PNG
        fmt = (original.format or "PNG").upper()
        media = "image/png" if fmt == "PNG" else "image/jpeg"
        return (file_bytes, media)

    # Remover fundo
    fg_rgba = _remove_background_to_rgba(original.convert("RGBA"))

    # Se background fornecido, compor e retornar JPG
    if background_bytes:
        bg_img = Image.open(io.BytesIO(background_bytes))
        composed = _composite_on_background(fg_rgba, bg_img)
        with io.BytesIO() as out:
            composed.save(out, format="JPEG", quality=95, subsampling=0)
            return (out.getvalue(), "image/jpeg")

    # Caso contrário, retornar PNG com transparência
    with io.BytesIO() as out:
        fg_rgba.save(out, format="PNG")
        return (out.getvalue(), "image/png")


async def _process_with_timeout(*args, **kwargs):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _process_image_sync, *args, **kwargs)


@app.post("/process-image")
async def process_image(
    file: UploadFile = File(...),
    remove_background: bool = Form(False),
    background: UploadFile | None = File(None),
):
    file_bytes = _validate_and_read_upload(file, required=True)
    background_bytes = None
    if background is not None:
        if background.filename:
            background_bytes = _validate_and_read_upload(
                background, required=False)

    try:
        processed_bytes, media_type = await asyncio.wait_for(
            _process_with_timeout(
                file_bytes, remove_background, background_bytes),
            timeout=PROCESS_TIMEOUT_SECONDS,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504, detail="Tempo de processamento excedido.")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500, detail="Falha ao processar a imagem.")

    return Response(content=processed_bytes, media_type=media_type)


# Montar arquivos estáticos para modelos 3D em um caminho diferente
app.mount("/static-models", StaticFiles(directory="models"),
          name="static-models")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
