from io import BytesIO
import pdfplumber
from PyPDF2 import PdfReader
from app.models.ingest import PageText

def extract_pdf_pages(content: bytes) -> list[PageText]:
    pages = []
    try:
        with pdfplumber.open(BytesIO(content)) as pdf:
            for index, page in enumerate(pdf.pages):
                text = (page.extract_text() or "").strip()
                pages.append(PageText(page_number=index + 1, text=text))
    except Exception:
        pass

    if not any(p.text for p in pages):
        reader = PdfReader(BytesIO(content))
        pages = [
            PageText(page_number=i + 1, text=(page.extract_text() or ""). strip())
            for i, page in enumerate(reader.pages)
        ]

    return pages