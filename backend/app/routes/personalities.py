"""Personality routes for listing available AI personas."""

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import PersonalityResponse
from app.services.personality_service import get_personality, list_personalities

router = APIRouter(prefix="/personalities", tags=["personalities"])


@router.get("", response_model=list[PersonalityResponse])
def get_personalities() -> list[PersonalityResponse]:
    personalities = list_personalities()
    return [
        PersonalityResponse(
            id=item["id"],
            name=item["name"],
            description=item["description"],
        )
        for item in personalities
    ]


@router.get("/{personality_id}", response_model=PersonalityResponse)
def get_personality_by_id(personality_id: str) -> PersonalityResponse:
    personality = get_personality(personality_id)
    if personality["id"] != personality_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personality not found.",
        )
    return PersonalityResponse(
        id=personality["id"],
        name=personality["name"],
        description=personality["description"],
    )
