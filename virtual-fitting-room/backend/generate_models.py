#!/usr/bin/env python3
"""
Script para gerar modelos 3D básicos para o provador virtual
Gera avatares e roupas simples usando geometrias básicas
"""

import os
import trimesh
import numpy as np
from pathlib import Path


def create_basic_avatar(gender="unisex", height=1.8, width=0.6, depth=0.3):
    """Cria um avatar básico usando geometrias simples"""

    # Corpo principal (torso)
    torso = trimesh.creation.box(extents=[width, height * 0.4, depth])
    torso.apply_translation([0, height * 0.3, 0])

    # Cabeça
    head_radius = width * 0.3
    head = trimesh.creation.uv_sphere(radius=head_radius)
    head.apply_translation([0, height * 0.7, 0])

    # Braços
    arm_length = height * 0.35
    arm_width = width * 0.15
    left_arm = trimesh.creation.box(extents=[arm_width, arm_length, arm_width])
    left_arm.apply_translation([-width * 0.4, height * 0.4, 0])

    right_arm = trimesh.creation.box(
        extents=[arm_width, arm_length, arm_width])
    right_arm.apply_translation([width * 0.4, height * 0.4, 0])

    # Pernas
    leg_length = height * 0.5
    leg_width = width * 0.2
    left_leg = trimesh.creation.box(extents=[leg_width, leg_length, leg_width])
    left_leg.apply_translation([-width * 0.2, -height * 0.1, 0])

    right_leg = trimesh.creation.box(
        extents=[leg_width, leg_length, leg_width])
    right_leg.apply_translation([width * 0.2, -height * 0.1, 0])

    # Combinar todas as partes
    avatar_parts = [torso, head, left_arm, right_arm, left_leg, right_leg]
    avatar = trimesh.util.concatenate(avatar_parts)

    # Ajustar cor baseada no gênero
    if gender == "female":
        color = [0.9, 0.7, 0.7, 1.0]  # Rosa claro
    elif gender == "male":
        color = [0.7, 0.7, 0.9, 1.0]  # Azul claro
    else:
        color = [0.8, 0.8, 0.8, 1.0]  # Cinza neutro

    avatar.visual.face_colors = color

    return avatar


def create_basic_clothing(category, size="M"):
    """Cria roupas básicas usando geometrias simples"""

    if category == "tops":
        # Camiseta
        clothing = trimesh.creation.box(extents=[0.7, 0.5, 0.4])
        clothing.visual.face_colors = [0.2, 0.6, 0.8, 1.0]  # Azul

    elif category == "bottoms":
        # Calça
        clothing = trimesh.creation.box(extents=[0.6, 0.8, 0.4])
        clothing.visual.face_colors = [0.1, 0.3, 0.7, 1.0]  # Azul escuro

    elif category == "dresses":
        # Vestido
        clothing = trimesh.creation.box(extents=[0.6, 1.0, 0.4])
        clothing.visual.face_colors = [0.8, 0.2, 0.6, 1.0]  # Rosa

    else:
        # Padrão
        clothing = trimesh.creation.box(extents=[0.5, 0.5, 0.3])
        clothing.visual.face_colors = [0.5, 0.5, 0.5, 1.0]  # Cinza

    return clothing


def generate_all_models():
    """Gera todos os modelos básicos"""

    # Criar diretórios se não existirem
    models_dir = Path("models")
    avatars_dir = models_dir / "avatars"
    clothes_dir = models_dir / "clothes"

    avatars_dir.mkdir(parents=True, exist_ok=True)
    clothes_dir.mkdir(parents=True, exist_ok=True)

    # Gerar avatares
    print("Gerando avatares...")

    # Avatar feminino
    female_avatar = create_basic_avatar(gender="female")
    female_avatar.export(str(avatars_dir / "female-avatar.glb"))

    # Avatar masculino
    male_avatar = create_basic_avatar(gender="male")
    male_avatar.export(str(avatars_dir / "male-avatar.glb"))

    # Avatar unissex
    unisex_avatar = create_basic_avatar(gender="unisex")
    unisex_avatar.export(str(avatars_dir / "unisex-avatar.glb"))

    # Gerar roupas
    print("Gerando roupas...")

    # Camiseta
    tshirt = create_basic_clothing("tops")
    tshirt.export(str(clothes_dir / "tshirt-001.glb"))

    # Calça jeans
    jeans = create_basic_clothing("bottoms")
    jeans.export(str(clothes_dir / "jeans-001.glb"))

    # Vestido
    dress = create_basic_clothing("dresses")
    dress.export(str(clothes_dir / "dress-001.glb"))

    print("Modelos gerados com sucesso!")
    print(f"Avatares salvos em: {avatars_dir}")
    print(f"Roupas salvas em: {clothes_dir}")


if __name__ == "__main__":
    try:
        generate_all_models()
    except ImportError:
        print("Erro: Biblioteca trimesh não encontrada.")
        print("Instale com: pip install trimesh")
    except Exception as e:
        print(f"Erro ao gerar modelos: {e}")
