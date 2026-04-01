"""Personality route — get and manage AI personality configurations."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.prompts import (
    get_personality,
    get_all_personalities,
    get_crisis_resources,
)

router = APIRouter(prefix="/personality", tags=["personality"])


class PersonalityResponse(BaseModel):
    """Response model for personality info."""
    id: str
    name: str
    description: str
    traits: dict[str, str]


class PersonalitiesListResponse(BaseModel):
    """Response model for all personalities."""
    personalities: list[PersonalityResponse]
    default: str


class CrisisResourcesResponse(BaseModel):
    """Response model for crisis resources."""
    resources: dict[str, dict[str, str]]


@router.get("/{personality_id}", response_model=PersonalityResponse)
async def get_personality_info(personality_id: str) -> PersonalityResponse:
    """Get information about a specific personality."""
    personality = get_personality(personality_id)
    if not personality:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Personality '{personality_id}' not found",
        )
    return PersonalityResponse(
        id=personality.id,
        name=personality.name,
        description=personality.description,
        traits=personality.traits,
    )


@router.get("", response_model=PersonalitiesListResponse)
async def list_personalities() -> PersonalitiesListResponse:
    """List all available personalities."""
    personalities_dict = get_all_personalities()
    personalities = [
        PersonalityResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            traits=p.traits,
        )
        for p in personalities_dict.values()
    ]
    return PersonalitiesListResponse(
        personalities=personalities,
        default="aria-empathetic",
    )


@router.get("/resources/crisis", response_model=CrisisResourcesResponse)
async def get_crisis_resources_endpoint() -> CrisisResourcesResponse:
    """Get crisis resources and help information."""
    return CrisisResourcesResponse(resources=get_crisis_resources())
