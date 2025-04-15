"""SQLmodel ORM models for the database.

Run this file directly to reset the database.
"""

from sqlmodel import SQLModel, Field, Relationship, create_engine
from typing import Optional, List
from datetime import datetime
import time

def make_id():
    return int(time.time() * 10)

##### User #####

class UserBase(SQLModel):
    """Base model for User, used for creating and updating users."""
    name: str

class UserPublic(UserBase):
    """Public model for User, excluding sensitive information."""
    id: Optional[int] = None
    email: str
    created_at: datetime

class UserPublicFull(UserPublic):
    clothing_items: List["ClothingItem"] = []
    outfits: List["Outfit"] = []
    resale_listings: List["ResaleListing"] = []

class UserUpdate(UserBase):
    """Model for updating an existing user."""
    name: Optional[str] = None

class User(UserBase, table=True):
    """User model for the database, including relationships to other tables."""
    id: Optional[int] = Field(default_factory=make_id, primary_key=True)
    email: str = Field(unique=True)
    password_salt_and_hash: str
    login_token: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    clothing_items: List["ClothingItem"] = Relationship(back_populates="user")
    outfits: List["Outfit"] = Relationship(back_populates="user")
    resale_listings: List["ResaleListing"] = Relationship(back_populates="user")


##### ClothingItem #####

class ClothingItemBase(SQLModel):
    name: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    style: Optional[str] = None
    brand: Optional[str] = None
    s3url: Optional[str] = None
    description: Optional[str] = None
    category: str
    last_worn: Optional[datetime] = None
    user_id: int
    worn: Optional[bool] = None

class ClothingItemPublic(ClothingItemBase):
    id: Optional[int] = None
    created_at: datetime

class ClothingItemPublicFull(ClothingItemPublic):
    outfits: List["OutfitItem"] = []
    wear_history: List["WearHistory"] = []
    resale_listing: Optional["ResaleListing"] = None

class ClothingItemUpdate(ClothingItemBase):
    """Model for updating an existing clothing item."""
    name: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    style: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    last_worn: Optional[datetime] = None
    user_id: Optional[int] = None

class ClothingItem(ClothingItemBase, table=True):
    id: Optional[int] = Field(default_factory=make_id, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="clothing_items")
    outfits: List["OutfitItem"] = Relationship(back_populates="clothing_item")
    wear_history: List["WearHistory"] = Relationship(back_populates="clothing_item")
    resale_listing: Optional["ResaleListing"] = Relationship(back_populates="clothing_item")

# Outfit and OutfitItem Models
class OutfitBase(SQLModel):
    """Base model for Outfit, used for creating and updating outfits."""
    name: str
    user_id: int

class OutfitPublic(OutfitBase):
    """Public model for Outfit, including ID and created timestamp."""
    id: Optional[int] = None
    created_at: datetime

class OutfitPublicFull(OutfitPublic):
    """Detailed public model for Outfit, including related clothing items."""
    items: List["OutfitItem"] = []

class OutfitUpdate(OutfitBase):
    """Model for updating an existing outfit."""
    name: Optional[str] = None
    user_id: Optional[int] = None

class Outfit(OutfitBase, table=True):
    id: Optional[int] = Field(default_factory=make_id, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    description: Optional[str] = None

    user: Optional["User"] = Relationship(back_populates="outfits")
    items: List["OutfitItem"] = Relationship(back_populates="outfit")


# The relationship table for connecting outfits to clothing items
class OutfitItem(SQLModel, table=True):
    id: Optional[int] = Field(default_factory=make_id, primary_key=True)
    outfit_id: int = Field(foreign_key="outfit.id")
    clothing_item_id: int = Field(foreign_key="clothingitem.id")
    description: Optional[str] = None
    outfit: Optional[Outfit] = Relationship(back_populates="items")
    clothing_item: Optional[ClothingItem] = Relationship(back_populates="outfits")

##### ResaleListing #####


class ResaleListingBase(SQLModel):
    """Base model for ResaleListing, used for creating and updating listings."""
    user_id: int
    clothing_item_id: int
    platform: str
    price: int
    url: str
    status: str
    sold_on: Optional[datetime] = None

class ResaleListingPublic(ResaleListingBase):
    """Public model for ResaleListing, including ID and created timestamp."""
    id: Optional[int] = None
    created_at: datetime

class ResaleListingPublicFull(ResaleListingPublic):
    """Detailed public model for ResaleListing, including related clothing item."""
    clothing_item: Optional["ClothingItem"] = None

class ResaleListingUpdate(ResaleListingBase):
    """Model for updating an existing resale listing."""
    platform: Optional[str] = None
    price: Optional[int] = None
    url: Optional[str] = None
    status: Optional[str] = None
    sold_on: Optional[datetime] = None

class ResaleListing(ResaleListingBase, table=True):
    id: Optional[int] = Field(default_factory=make_id, primary_key=True)
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


##### WearHistory #####

class WearHistoryBase(SQLModel):
    """Base model for WearHistory, used for creating and updating wear records."""
    clothing_item_id: int
    date: datetime

class WearHistoryPublic(WearHistoryBase):
    """Public model for WearHistory, including ID and created timestamp."""
    id: Optional[int] = None
    created_at: datetime

class WearHistoryPublicFull(WearHistoryPublic):
    """Detailed public model for WearHistory, including related clothing item."""
    clothing_item: Optional["ClothingItem"] = None

class WearHistoryUpdate(WearHistoryBase):
    """Model for updating an existing wear history record."""
    date: Optional[datetime] = None


class WearHistory(WearHistoryBase, table=True):
    id: Optional[int] = Field(default_factory=make_id, primary_key=True)
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


