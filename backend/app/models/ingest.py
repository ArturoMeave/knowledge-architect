from pydantic import BaseModel

class PageText(BaseModel):
    page_number: int
    text: str