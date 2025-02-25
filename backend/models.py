"""SQLAlchemy ORM models for the database.

Run this file directly to reset the database.
"""

import database

from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean, Enum, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.sql import func


# Base class for ORM models
Base = declarative_base()

# Model definition (EXAMPLE)
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    
    password_hash = Column(String, nullable=False)  # Store hashed passwords
    created_at = Column(DateTime, default=func.now())

    clothing_items = relationship("ClothingItem", back_populates="user", cascade="all, delete")
    outfits = relationship("Outfit", back_populates="user", cascade="all, delete")

    def __repr__(self):
        return f"<User(id={self.id}, name={self.name}, email={self.email})>"

class ClothingItem(Base):
    __tablename__ = "clothing_items"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    size = Column(String, nullable=True)  # "M", "L",
    color = Column(String, nullable=True)
    style = Column(String, nullable=True)  # "Casual", "Formal"
    brand = Column(String, nullable=True)
    category = Column(Enum("Shirt", "Pants", "Shoes", "Outerwear", "Accessories", name="category_enum"), nullable=False)
    last_worn = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="clothing_items")
    outfits = relationship("OutfitItem", back_populates="clothing_item", cascade="all, delete")
    wear_history = relationship("WearHistory", back_populates="clothing_item", cascade="all, delete")

class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="outfits")
    items = relationship("OutfitItem", back_populates="outfit", cascade="all, delete")

class OutfitItem(Base):
    """ Many-to-Many relationship between Outfit and ClothingItem """
    __tablename__ = "outfit_items"

    id = Column(Integer, primary_key=True)
    outfit_id = Column(Integer, ForeignKey("outfits.id"), nullable=False)
    clothing_item_id = Column(Integer, ForeignKey("clothing_items.id"), nullable=False)

    outfit = relationship("Outfit", back_populates="items")
    clothing_item = relationship("ClothingItem", back_populates="outfits")

# Reset the database
if __name__ == "__main__":
    # Confirm reset
    confirm = input("Are you sure you want to reset the database? (y/n): ")
    if confirm.lower() != "y":
        print("Database reset cancelled.")
        exit(0)
    
    # Get the database engine
    engine = database.Engine()

    # Delete everything
    Base.metadata.drop_all(engine)

    # Create the tables in the database
    Base.metadata.create_all(engine)

