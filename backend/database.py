"""Interactions with the database."""

from functools import cache

import environment

from sqlalchemy import create_engine

@cache
def Engine():
    """Get the database engine."""
    return create_engine(environment.get("DATABASE_URL"), echo=True)

