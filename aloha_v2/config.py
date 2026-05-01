import os
from typing import Optional

class Config:
    """
    Configuration for Aloha V2.
    Reads from environment variables for secure and flexible deployment.
    """
    GOOGLE_CLOUD_PROJECT_ID: str = os.getenv("GOOGLE_CLOUD_PROJECT_ID", "aipyram-web")
    GOOGLE_CLOUD_REGION: str = os.getenv("GOOGLE_CLOUD_REGION", "us-central1")
    
    # Environment: 'dev' or 'prod'
    ALOHA_ENV: str = os.getenv("ALOHA_ENV", "dev")
    
    # Google Cloud Agent Memory Bank Integration
    AGENT_MEMORY_BACKEND_TYPE: str = os.getenv("AGENT_MEMORY_BACKEND_TYPE", "vertex_managed")
    
    # Other potential configs
    VERTEX_AI_MODEL: str = os.getenv("VERTEX_AI_MODEL", "gemini-1.5-pro-preview-0409")

config = Config()
