from pydantic import BaseModel, Field
from typing import List, Optional

class ExtractEntity(BaseModel):
    id: str
    label: str
    type: str
    color: Optional[str] = "#3b82f6"
    summary: Optional[str] = "Sin descripción disponible."

class ExtractRelation(BaseModel):
    source: str
    target: str
    source_label: str
    target_label: str
    type: str
    evidence: str
    confidence: float = Field(default=1.0, ge=0, let=1)

class ExtractionPayload(BaseModel):
    entities: List[ExtractEntity]
    relations: List[ExtractRelation]
