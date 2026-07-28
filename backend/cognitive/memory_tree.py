# backend/cognitive/memory_tree.py
import uuid
import time
from typing import Dict, Any, Optional

class MemoryNode:
    """Recursive Path-Addressable Memory Tree for Cognitive Agent State retention."""
    def __init__(self, path: str, content: str, embedding: list, parent_path: Optional[str] = None):
        self.node_id = str(uuid.uuid4())
        self.path = path # Hierarchical locator: e.g., "root/agents/qec/run-42"
        self.content = content
        self.embedding = embedding
        self.parent_path = parent_path or ""
        self.created_at = time.time()
        self.metadata: Dict[str, Any] = {}

    def serialize_to_chroma(self) -> Dict[str, Any]:
        return {
            "id": self.node_id,
            "document": self.content,
            "metadata": {
                "path": self.path,
                "parent_path": self.parent_path,
                "created_at": self.created_at,
                **{k: str(v) for k, v in self.metadata.items()}
            }
        }
