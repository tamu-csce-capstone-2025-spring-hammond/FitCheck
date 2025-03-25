"""Interactions with the database."""

from functools import cache
from uuid import uuid4

import environment
import models
from auth import derive_password

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


@cache
def Engine():
    """Get the database engine."""
    return create_engine(environment.get("DATABASE_URL"), echo=True)


def Session():
    """Get a database session."""
    return sessionmaker(bind=Engine())()


### User functions ###

def remove_sensitive_user_data(user: models.User):
    """Remove sensitive data from a user object."""
    user.password_salt_and_hash = None
    user.login_token = None
    return user


def get_user_by_email(email: str, include_sensitive_data: bool = False):
    """Get a user by email."""
    user = Session().query(models.User).filter(models.User.email == email).first()
    if user and not include_sensitive_data:
        user = remove_sensitive_user_data(user)
    return user


def get_user_by_id(user_id: int, include_sensitive_data: bool = False):
    """Get a user by ID."""
    user = Session().query(models.User).filter(models.User.id == user_id).first()
    if user and not include_sensitive_data:
        user = remove_sensitive_user_data(user)
    return user
    


def get_user_by_login_token(login_token: str, include_sensitive_data: bool = False):
    """Get a user by login token."""
    user = Session().query(models.User).filter(models.User.login_token == login_token).first()
    if user and not include_sensitive_data:
        user = remove_sensitive_user_data(user)
    return user


def create_user(name: str, email: str, password: str):
    """Create a user."""
    login_token = str(uuid4())
    user = models.User(name=name, email=email, password_salt_and_hash=derive_password(password), login_token=login_token)
    with Session() as session:
        session.add(user)
        session.commit()
        session.refresh(user)  # So the user variable is populated
    return user

def add_clothing_item(user_id: int, name: str, size: str, color: str, style: str, brand: str, category: str):
    from models import ClothingItem

    with Session() as session:
        item = ClothingItem(
            user_id=user_id,
            name=name,
            size=size,
            color=color,
            style=style,
            brand=brand,
            category=category,
        )
        session.add(item)
        session.commit()
        session.refresh(item)
        return item
