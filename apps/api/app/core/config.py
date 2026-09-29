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

    # Marketplace: vendors pay a flat subscription and we take nothing from a
    # sale. Kept as a setting so a commission could be reinstated per-tenant,
    # but it is zero and the sell page promises that.
    platform_commission_rate: float = 0.0

    # Where uploaded CVs are stored (relative to the API working directory).
    upload_dir: str = "uploads"

    # CORS — comma separated origins
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    # Email (Resend)
    resend_api_key: str = ""
    email_from: str = "Online Tech Uganda <noreply@onlinetech.ug>"
    contact_inbox: str = "onlinetechug@gmail.com"
    # Email (Gmail SMTP) — preferred when set; delivers to any recipient.
    gmail_user: str = "onlinetechug@gmail.com"
    gmail_app_password: str = ""

    # WhatsApp alerts to the owner (CallMeBot). Both blank = no WhatsApp sent;
    # email still goes out either way.
    owner_whatsapp_phone: str = ""
    owner_whatsapp_api_key: str = ""

    # Keep the product table in step with the shop front. The API pulls this
    # feed on startup and hourly, so publishing the site is the only step
    # needed after a price change. Blank URL or false = never sync.
    catalog_feed_url: str = "https://www.onlinetechug.com/api/catalog"
    course_feed_url: str = "https://www.onlinetechug.com/api/courses-feed"
    catalog_sync_enabled: bool = True

    # Printed on every message we send a customer, so they can call and
    # confirm rather than wait and wonder.
    company_phone: str = "+256 756 839 270"
    company_phone_alt: str = "+256 760 547 211"

    # The live classroom. Video, audio, screen sharing and recording need a
    # media server and TURN; we own who may enter the room, not the call
    # itself. "jitsi" on the public server works with no account; point
    # live_class_domain at 8x8.vc or your own Jitsi to get recording.
    live_class_provider: str = "jitsi"
    live_class_domain: str = "meet.jit.si"

    # Online payments (Flutterwave) — MTN + Airtel + cards. Empty = disabled.
    flutterwave_secret_key: str = ""
    flutterwave_public_key: str = ""
    # Public site URL used to build the payment redirect (success) URL.
    site_url: str = "https://www.onlinetechug.com"

    # Online payments (Pesapal API 3.0) — MTN, Airtel & cards (Uganda). Empty = disabled.
    # An order is marked paid ONLY after Pesapal's IPN/GetTransactionStatus reports
    # "Completed" — never on redirect back to the site.
    pesapal_consumer_key: str = ""
    pesapal_consumer_secret: str = ""
    pesapal_env: str = "live"  # "live" or "sandbox"
    # Optional: a pre-registered IPN id. If empty, the app registers one on first use.
    pesapal_ipn_id: str = ""
    # Public base URL of THIS API (used to build the IPN callback Pesapal calls).
    api_public_url: str = "https://api.onlinetechug.com"

    # Web Push (VAPID) — browser notifications for offers & new stock.
    # Empty = push disabled; the storefront then never asks for permission.
    vapid_public_key: str = ""
    vapid_private_key: str = ""
    vapid_subject: str = "mailto:onlinetechug@gmail.com"

    # Automatic daily campaign EMAIL. Off by default — customers found it too
    # much mail. Push notifications are unaffected, and the owner can still send
    # a campaign by hand from the admin.
    campaign_auto_email: bool = False

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
