from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded from environment / .env."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    app_name: str = "Online Tech Uganda API"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str = "postgresql+psycopg://onlinetech:onlinetech@localhost:5432/onlinetech"

    # Security
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60
    # Shared key required for admin write operations (create/update/delete products)
    admin_api_key: str = ""

    # CORS — comma separated origins
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    # Email (Resend)
    resend_api_key: str = ""
    email_from: str = "Online Tech Uganda <noreply@onlinetech.ug>"
    contact_inbox: str = "onlinetech@gmail.com"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
