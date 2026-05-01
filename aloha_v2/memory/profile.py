import asyncio
from typing import Dict, Any, Optional
from ..config import config

class AlohaMemoryProfile:
    """
    Utilizes Google Cloud's native 'Memory Profiles' for stateful autonomous agents.
    Provides shared context that can be accessed by various agents in the ADK graph.
    """
    def __init__(self, backend_type: str = config.AGENT_MEMORY_BACKEND_TYPE):
        self.backend_type = backend_type
        # Simulating Vertex Managed Memory Store
        self._managed_store: Dict[str, Dict[str, Any]] = {}

    async def create_or_get_profile(self, user_id: str) -> str:
        """
        Creates or retrieves a native Memory Profile ID for a given user.
        """
        profile_id = f"vertex_profile_{user_id}"
        
        # Simulate network latency for Vertex AI Memory Bank API call
        await asyncio.sleep(0.2)
        
        if profile_id not in self._managed_store:
            self._managed_store[profile_id] = {
                "user_id": user_id,
                "context": {
                    "last_agent": None,
                    "escalation_required": False
                },
                "interaction_history": []
            }
            print(f"[{self.backend_type}] Created new memory profile: {profile_id}")
        else:
            print(f"[{self.backend_type}] Retrieved existing memory profile: {profile_id}")
            
        return profile_id

    async def get_context_from_memory(self, profile_id: str) -> Dict[str, Any]:
        """
        Retrieves context from memory. This context is shared between the SalesAgent 
        and TechnicalSupportAgent via the OrchestratorAgent.
        """
        await asyncio.sleep(0.1) # Simulate API call
        if profile_id in self._managed_store:
            print(f"[{self.backend_type}] Fetched context for {profile_id}")
            return self._managed_store[profile_id].get("context", {})
        raise ValueError(f"Profile {profile_id} does not exist in the Memory Bank.")

    async def update_memory_context(self, profile_id: str, updates: Dict[str, Any]) -> None:
        """
        Updates the shared memory context, allowing seamless handoffs (e.g., Sales -> Tech Support).
        """
        await asyncio.sleep(0.1)
        if profile_id in self._managed_store:
            self._managed_store[profile_id]["context"].update(updates)
            print(f"[{self.backend_type}] Updated context for {profile_id}: {updates}")
        else:
            raise ValueError(f"Profile {profile_id} does not exist.")
