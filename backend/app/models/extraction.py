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

class Flashcard(BaseModel):
    front: str
    back: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: str

class ExtractionPayload(BaseModel):
    entities: List[ExtractEntity]
    relations: List[ExtractRelation]
    global_summary: str = ""
    flashcards: List[Flashcard] = []
    quiz: List[QuizQuestion] = []
