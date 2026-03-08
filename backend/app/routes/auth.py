"""Authentication routes (sign-up / sign-in via Supabase)."""

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import SignUpRequest, SignInRequest, AuthResponse
from app.services.auth_service import sign_up, sign_in

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignUpRequest) -> AuthResponse:
    response = sign_up(body.email, body.password)
    session = getattr(response, "session", None)
    user = getattr(response, "user", None)

    if not session or not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sign-up failed. Please check your credentials.",
        )

    return AuthResponse(
        access_token=session.access_token,
        user_id=str(user.id),
    )


@router.post("/signin", response_model=AuthResponse)
async def signin(body: SignInRequest) -> AuthResponse:
    response = sign_in(body.email, body.password)
    session = getattr(response, "session", None)
    user = getattr(response, "user", None)

    if not session or not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    return AuthResponse(
        access_token=session.access_token,
        user_id=str(user.id),
    )
