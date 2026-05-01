import os
from typing import Optional

class Config:
    """
    Configuration for Aloha V2.
    Reads from environment variables with sensible defaults.
    """
    GOOGLE_CLOUD_PROJECT_ID: Optional[str] = os.getenv("GOOGLE_CLOUD_PROJECT_ID", "aloha-project")
    GOOGLE_CLOUD_REGION: Optional[str] = os.getenv("GOOGLE_CLOUD_REGION", "us-central1")
    ALOHA_ENV: str = os.getenv("ALOHA_ENV", "dev")
    AGENT_MEMORY_BACKEND_TYPE: str = os.getenv("AGENT_MEMORY_BACKEND_TYPE", "vertex_managed")

config = Config()
