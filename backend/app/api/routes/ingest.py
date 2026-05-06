from fastapi import APIRouter, UploadFile, File
from app.services.pdf_reader import extract_pdf_pages
from app.models.ingest import PageText

router = APIRouter(prefix="/ingest", tags=["Ingestión"])

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Este es el buzón donde el usuario echa el PDF.
    """
    content = await file.read()

    pages = extract_pdf_pages(content)

    return {
        "filename": file.filename,
        "total_pages": len(pages),
        "content": pages
    }