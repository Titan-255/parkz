from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.all_schemas import AIChatRequest, AIChatResponse
from app.services.ai_parking_assistant import AIParkingAssistant

router = APIRouter(prefix="/ai", tags=["Google Maps AI Parking Assistant"])

@router.post("/assistant", response_model=AIChatResponse)
def query_ai_parking_assistant(
    chat_req: AIChatRequest,
    db: Session = Depends(get_db)
):
    return AIParkingAssistant.process_query(
        db=db,
        message=chat_req.message,
        user_lat=chat_req.latitude,
        user_lng=chat_req.longitude,
        vehicle_type=chat_req.vehicle_type
    )
