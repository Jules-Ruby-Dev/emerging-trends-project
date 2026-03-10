"""Supabase authentication helpers."""

from supabase import create_client, Client
from app.config import get_settings

_DEV_USER_ID = "dev-user-local"
_DEV_TOKEN = "dev-token"


def get_supabase_client() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_supabase_admin_client() -> Client:
    """Service-role client — use only for server-side operations."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


class _DevSession:
    access_token = _DEV_TOKEN


class _DevUser:
    id = _DEV_USER_ID


class _DevResponse:
    session = _DevSession()
    user = _DevUser()


def sign_up(email: str, password: str) -> object:
    if get_settings().dev_mode:
        return _DevResponse()
    client = get_supabase_client()
    return client.auth.sign_up({"email": email, "password": password})


def sign_in(email: str, password: str) -> object:
    if get_settings().dev_mode:
        return _DevResponse()
    client = get_supabase_client()
    return client.auth.sign_in_with_password({"email": email, "password": password})


def get_user_from_token(access_token: str) -> object | None:
    """Validate a JWT and return the user payload, or None if invalid."""
    if get_settings().dev_mode:
        return _DevUser()
    client = get_supabase_admin_client()
    try:
        response = client.auth.get_user(access_token)
        return response.user
    except Exception:
        return None
