import json
from pathlib import Path

import firebase_admin
from firebase_admin import credentials

from app.config import get_settings

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_initialized = False


def init_firebase() -> None:
    global _initialized
    if _initialized or firebase_admin._apps:
        return

    settings = get_settings()

    if settings.service_account_key:
        cred_dict = json.loads(settings.service_account_key)
        cred = credentials.Certificate(cred_dict)
    elif settings.google_application_credentials:
        cred_path = Path(settings.google_application_credentials)
        if not cred_path.is_absolute():
            cred_path = _BACKEND_ROOT / cred_path
        cred = credentials.Certificate(str(cred_path))
    else:
        default_path = _BACKEND_ROOT / "serviceAccountKey.json"
        cred = credentials.Certificate(str(default_path))

    firebase_admin.initialize_app(cred)
    _initialized = True
