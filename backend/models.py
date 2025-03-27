"""SQLmodel ORM models for the database.

Run this file directly to reset the database.
"""

from sqlmodel import SQLModel, Field, Relationship, create_engine
from typing import Optional, List
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True)
    password_salt_and_hash: str
    login_token: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    clothing_items: List["ClothingItem"] = Relationship(back_populates="user")
    outfits: List["Outfit"] = Relationship(back_populates="user")
    resale_listings: List["ResaleListing"] = Relationship(back_populates="user")

class ClothingItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    size: Optional[str] = None
    color: Optional[str] = None
    style: Optional[str] = None
    brand: Optional[str] = None
    category: str  # Enum not natively supported in SQLModel, use string values
    last_worn: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user_id: int = Field(foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="clothing_items")
    outfits: List["OutfitItem"] = Relationship(back_populates="clothing_item")
    wear_history: List["WearHistory"] = Relationship(back_populates="clothing_item")
    resale_listing: Optional["ResaleListing"] = Relationship(back_populates="clothing_item")

class Outfit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User] = Relationship(back_populates="outfits")
    items: List["OutfitItem"] = Relationship(back_populates="outfit")

class OutfitItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    outfit_id: int = Field(foreign_key="outfit.id")
    clothing_item_id: int = Field(foreign_key="clothingitem.id")

    outfit: Optional[Outfit] = Relationship(back_populates="items")
    clothing_item: Optional[ClothingItem] = Relationship(back_populates="outfits")

class ResaleListing(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    clothing_item_id: int = Field(foreign_key="clothingitem.id")
    platform: str
    price: int
    url: str
    status: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    sold_on: Optional[datetime] = None

    user: Optional[User] = Relationship(back_populates="resale_listings")
    clothing_item: Optional[ClothingItem] = Relationship(back_populates="resale_listing")

class WearHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    clothing_item_id: int = Field(foreign_key="clothingitem.id")
    date: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

    clothing_item: Optional[ClothingItem] = Relationship(back_populates="wear_history")


# Drop all tables and recreate them
if __name__ == "__main__":
    import dotenv
    import os
    
    dotenv.load_dotenv()

    confirm = input("Are you sure you want to reset the database? (y/n): ")
    if confirm.lower() != "y":
        print("Database reset cancelled.")
        exit(0)

    engine = create_engine(os.environ.get("DATABASE_URL"), echo=True)
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

