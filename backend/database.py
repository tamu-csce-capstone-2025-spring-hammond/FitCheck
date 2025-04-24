"""Interactions with the database."""

from functools import cache
from uuid import uuid4
from sqlmodel import Session, select

import environment
import models
from auth import derive_password
from sqlmodel import create_engine


@cache
def Engine():
    """Get the database engine."""
    return create_engine(environment.get("DATABASE_URL"), echo=True)


def get_session():
    """Get a database session."""
    return Session(Engine())


def get_db():
    """Get a database session for use with FastAPI."""
    db = get_session()
    try:
        yield db
    finally:
        db.close()


### User functions ###

def remove_sensitive_user_data(user: models.User):
    """Remove sensitive data from a user object."""
    user.password_salt_and_hash = None
    user.login_token = None
    return user


def get_user_by_email(email: str, include_sensitive_data: bool = False):
    """Get a user by email."""
    with get_session() as session:
        user = session.exec(select(models.User).where(models.User.email == email)).first()
        if user and not include_sensitive_data:
            user = remove_sensitive_user_data(user)
        return user


def get_user_by_id(user_id: int, include_sensitive_data: bool = False):
    """Get a user by ID."""
    with get_session() as session:
        user = session.exec(select(models.User).where(models.User.id == user_id)).first()
        if user and not include_sensitive_data:
            user = remove_sensitive_user_data(user)
        return user


def get_user_by_login_token(login_token: str, include_sensitive_data: bool = False):
    """Get a user by login token."""
    with get_session() as session:
        user = session.exec(select(models.User).where(models.User.login_token == login_token)).first()
        if user and not include_sensitive_data:
            user = remove_sensitive_user_data(user)
        return user


def create_user(name: str, email: str, password: str):
    """Create a user."""
    login_token = str(uuid4())
    user = models.User(name=name, email=email, password_salt_and_hash=derive_password(password), login_token=login_token)
    with get_session() as session:
        session.add(user)
        session.commit()
        session.refresh(user)
    return user


def add_clothing_item(user_id: int, description: str, size: str, color: str, s3url: str, style: str, brand: str, category: str):
    from models import ClothingItem

    with get_session() as session:
        item = ClothingItem(
            user_id=user_id,
            description=description,
            size=size,
            color=color,
            s3url=s3url,
            style=style,
            brand=brand,
            category=category,
        )
        session.add(item)
        session.commit()
        session.refresh(item)
        return item
    
def add_outfit(user_id: int, clothing_item_ids: list[int], description: str, s3url: str):
    from models import Outfit

    outfit = Outfit(
        clothing_item_ids=clothing_item_ids,
        description=description,
        s3url=s3url,
        user_id=user_id,
    )
    with get_session() as session:
        
        session.add(outfit)
        session.commit()
        session.refresh(outfit)
        return outfit

def add_outfit_item(outfit_id: int, clothing_item_id: str):
    from models import OutfitItem
    outfit_item = OutfitItem(
        outfit_id=outfit_id,
        clothing_item_id=clothing_item_id
    )

    with get_session() as session:
        session.add(outfit_item)
        session.commit()
        return outfit_item

def mark_clothing_item_worn(clothing_item_id: str):
    from models import ClothingItem
    with get_session() as session:
        clothing_item = session.exec(select(ClothingItem).where(ClothingItem.id == clothing_item_id)).first()
        clothing_item.worn = True
        session.add(clothing_item)
        session.commit()
        return clothing_item

def get_clothing_item_by_id(clothing_item_id: str):
    from models import ClothingItem
    with get_session() as session:
        clothing_item = session.exec(select(ClothingItem).where(ClothingItem.id == clothing_item_id)).first()
        return clothing_item
    
def add_user_selfie(user_id: int, image_url: str, description: str) -> models.UserSelfie:
    """Adds a new selfie record to the database."""
    user_selfie = models.UserSelfie(
        user_id=user_id,
        image_url=image_url,
        description=description,
    )
    with get_session() as session:
        try:
            session.add(user_selfie)
            session.commit()
            session.refresh(user_selfie)
            return user_selfie
        except Exception as e:
            session.rollback()
            raise
