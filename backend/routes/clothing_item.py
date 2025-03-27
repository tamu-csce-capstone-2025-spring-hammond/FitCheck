"""Routes for clothing item management."""

from fastapi import APIRouter

from backend import database
from backend.models import ClothingItem

# FastAPI router
router = APIRouter()

## TODO unfinished
@router.get("/my-clothes")
def get_my_clothes():
    with database.Session() as session:
        clothes = session.query(ClothingItem).filter(ClothingItem.user_id == 1).all()

        return [
            {
                "id": c.id,
                "name": c.name,
                "size": c.size,
                "color": c.color,
                "category": c.category,
                "created_at": str(c.created_at)
            }
            for c in clothes
        ]
