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

def get_user_by_email(email: str):
    """Get a user by email."""
    return Session().query(models.User).filter(models.User.email == email).first()


def get_user_by_id(user_id: int):
    """Get a user by ID."""
    return Session().query(models.User).filter(models.User.id == user_id).first()


def get_user_by_login_token(login_token: str):
    """Get a user by login token."""
    return Session().query(models.User).filter(models.User.login_token == login_token).first()


def create_user(name: str, email: str, password: str):
    """Create a user."""
    login_token = str(uuid4())
    user = models.User(name=name, email=email, password_salt_and_hash=derive_password(password), login_token=login_token)
    with Session() as session:
        session.add(user)
        session.commit()
    return user

