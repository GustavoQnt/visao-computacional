from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from PIL import Image
from rembg import remove
import io
import asyncio


MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
PROCESS_TIMEOUT_SECONDS = 30
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}


app = FastAPI(title="image-background-service", version="1.0.0")

# CORS (liberado para facilitar integração local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})


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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
