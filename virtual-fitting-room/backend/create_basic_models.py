#!/usr/bin/env python3
"""
Script simples para criar modelos 3D básicos para o provador virtual
Cria arquivos GLB simples usando geometrias básicas
"""

import os
import json
from pathlib import Path


def create_simple_glb_file(filename, content_type="model"):
    """Cria um arquivo GLB básico com conteúdo simples"""

    # Estrutura básica de um arquivo GLB
    # Em um ambiente real, este seria um arquivo binário real
    glb_content = {
        "type": content_type,
        "version": "2.0",
        "format": "GLB",
        "description": f"Modelo 3D básico - {content_type}",
        "geometry": "box_basic",
        "materials": "standard",
        "animation": "static_t_pose"
    }

    # Criar o arquivo
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(glb_content, f, indent=2, ensure_ascii=False)

    print(f"Arquivo criado: {filename}")


def create_texture_file(filename, texture_type="basic"):
    """Cria um arquivo de textura básico"""

    # Estrutura básica de uma textura
    texture_content = {
        "type": "texture",
        "format": "JPG",
        "resolution": "512x512",
        "texture_type": texture_type,
        "description": f"Textura básica - {texture_type}"
    }

    # Criar o arquivo
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(texture_content, f, indent=2, ensure_ascii=False)

    print(f"Textura criada: {filename}")


def generate_all_basic_models():
    """Gera todos os modelos básicos"""

    # Criar diretórios se não existirem
    models_dir = Path("models")
    avatars_dir = models_dir / "avatars"
    clothes_dir = models_dir / "clothes"
    textures_dir = models_dir / "textures"

    avatars_dir.mkdir(parents=True, exist_ok=True)
    clothes_dir.mkdir(parents=True, exist_ok=True)
    textures_dir.mkdir(parents=True, exist_ok=True)

    print("Gerando modelos básicos...")

    # Avatares
    create_simple_glb_file(avatars_dir / "female-avatar.glb", "avatar_female")
    create_simple_glb_file(avatars_dir / "male-avatar.glb", "avatar_male")
    create_simple_glb_file(avatars_dir / "unisex-avatar.glb", "avatar_unisex")

    # Roupas
    create_simple_glb_file(clothes_dir / "tshirt-001.glb", "clothing_tops")
    create_simple_glb_file(clothes_dir / "jeans-001.glb", "clothing_bottoms")
    create_simple_glb_file(clothes_dir / "dress-001.glb", "clothing_dresses")

    # Texturas
    create_texture_file(textures_dir / "tshirt-001.jpg", "tshirt_basic")
    create_texture_file(textures_dir / "jeans-001.jpg", "jeans_denim")
    create_texture_file(textures_dir / "dress-001.jpg", "dress_elegant")

    print("\nTodos os modelos básicos foram criados!")
    print(f"Avatares: {avatars_dir}")
    print(f"Roupas: {clothes_dir}")
    print(f"Texturas: {textures_dir}")
    print("\nNota: Estes são arquivos de demonstração.")
    print("Para modelos 3D reais, use Blender ou similar para exportar arquivos GLB.")


if __name__ == "__main__":
    try:
        generate_all_basic_models()
    except Exception as e:
        print(f"Erro ao gerar modelos: {e}")
