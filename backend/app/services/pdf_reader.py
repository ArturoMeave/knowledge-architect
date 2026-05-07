import pdfplumber
from PyPDF2 import PdfReader
from app.models.ingest import PageText

def extract_pdf_pages(file_path: str) -> list[PageText]:
    pages = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for i, page in enumerate(pdf.pages):
                pages.append(PageText(page_number=i+1, text=(page.extract_text() or "").strip()))
    except: pass
    if not any(p.text for p in pages):
        reader = PdfReader(file_path)
        pages = [PageText(page_number=i+1, text=(p.extract_text() or "").strip()) for i, p in enumerate(reader.pages)]
    return pages