from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.core.database import get_database

router = APIRouter(
    prefix="/api/csat",
    tags=["CSAT Ratings"]
)

in_memory_csat = []

class CSATPayload(BaseModel):
    ticket_id: str
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = ""
    conversation_id: Optional[str] = None


@router.post("/rating")
async def submit_csat_rating(payload: CSATPayload):
    rating_doc = {
        "ticket_id": payload.ticket_id,
        "conversation_id": payload.conversation_id,
        "rating": payload.rating,
        "feedback": payload.feedback,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }

    in_memory_csat.append(rating_doc)

    # Try saving to MongoDB csat_ratings collection & updating ticket
    try:
        db = get_database()
        db["csat_ratings"].insert_one(rating_doc)
        db["tickets"].update_one(
            {"ticket_id": payload.ticket_id},
            {"$set": {"csat_score": payload.rating, "csat_feedback": payload.feedback}}
        )
    except Exception as err:
        print("Mongo CSAT save error:", err)

    return {
        "success": True,
        "message": "Thank you for your feedback!",
        "rating": payload.rating
    }


@router.get("/stats")
async def get_csat_stats():
    ratings_list = []
    try:
        db = get_database()
        mongo_ratings = list(db["csat_ratings"].find({}, {"_id": 0}))
        ratings_list = mongo_ratings
    except Exception as err:
        print("Mongo CSAT fetch warning:", err)
        ratings_list = in_memory_csat

    if not ratings_list and in_memory_csat:
        ratings_list = in_memory_csat

    total_count = len(ratings_list)
    if total_count == 0:
        return {
            "average_csat": 5.0,
            "total_ratings": 0,
            "satisfaction_percentage": 100,
            "distribution": {5: 0, 4: 0, 3: 0, 2: 0, 1: 0},
            "recent_feedback": []
        }

    sum_ratings = sum(r["rating"] for r in ratings_list)
    avg = round(sum_ratings / total_count, 1)
    sat_pct = round((sum(1 for r in ratings_list if r["rating"] >= 4) / total_count) * 100)

    dist = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    for r in ratings_list:
        score = r.get("rating", 5)
        dist[score] = dist.get(score, 0) + 1

    return {
        "average_csat": avg,
        "total_ratings": total_count,
        "satisfaction_percentage": sat_pct,
        "distribution": dist,
        "recent_feedback": ratings_list[-5:]
    }
