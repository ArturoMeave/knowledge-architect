from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
import tempfile
import shutil
import asyncio
import os
from typing import Optional
from app.services.pdf_reader import extract_pdf_pages
from app.services.chunker import chunk_text
from app.services.extraction import extract_knowledge_from_chunks
from app.database import db
from app.api.deps import get_current_user
from app.models.user import User 

router = APIRouter(
    prefix="/ingest", 
    tags=["Ingestión"], 
    dependencies=[Depends(get_current_user)]
)

CONCURRENCY_LIMIT = int(os.getenv("GROQ_CONCURRENCY_LIMIT", "5"))
semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)

# NUEVO: Añadimos las listas de summaries, flashcards y quiz como parámetros
async def process_chunk_safe(chunk: str, final_nodes: dict, all_relations: list, global_summaries: list, all_flashcards: list, all_quiz: list, level: str, tone: str, language: str, specs: str):
    async with semaphore:
        try:
            graph_data = await extract_knowledge_from_chunks(chunk, level, tone, language, specs)
            
            # 1. Guardar Nodos
            for node in graph_data.entities:
                unique_id = node.label.lower().replace(" ", "_")
                if unique_id not in final_nodes:
                    node.id = unique_id
                    final_nodes[unique_id] = node
            
            # 2. Guardar Relaciones
            for rel in graph_data.relations:
                rel.source = rel.source_label.lower().replace(" ", "_")
                rel.target = rel.target_label.lower().replace(" ", "_")
                all_relations.append(rel)
                
            # 3. NUEVO: Guardar el Set de Estudio
            if graph_data.global_summary:
                global_summaries.append(graph_data.global_summary)
            if graph_data.flashcards:
                all_flashcards.extend(graph_data.flashcards)
            if graph_data.quiz:
                all_quiz.extend(graph_data.quiz)
                
        except Exception as e:
            print(f"Error procesando un trozo: {e}")

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    level: str = Form("2"),
    tone: str = Form("academic"),
    language: str = Form("es"),
    specs: Optional[str] = Form(""),
    current_user: User = Depends(get_current_user)
):
    allowed_types = ["application/pdf", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Formato no soportado")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name

        try:
            pages = extract_pdf_pages(temp_path)
            full_text = "\n".join([p.text for p in pages])
            chunks = chunk_text(full_text)
            
            # Preparando las "bolsas" para guardar los datos
            final_nodes = {}
            all_relations = []
            global_summaries = []
            all_flashcards = []
            all_quiz = []

            # Lanzamos la IA
            tasks = [process_chunk_safe(chunk, final_nodes, all_relations, global_summaries, all_flashcards, all_quiz, level, tone, language, specs) for chunk in chunks]
            await asyncio.gather(*tasks)

            nodes_list = list(final_nodes.values())
            # Unimos todos los resúmenes en uno solo con saltos de línea HTML
            final_summary = "<br><br>".join(global_summaries)

            # Enviamos TODO el Set Completo a la base de datos
            await db.save_graph(nodes_list, all_relations, final_summary, all_flashcards, all_quiz, user_id=current_user.id)

            return {
                "filename": file.filename,
                "status": "Success",
                "config": {"level": level, "tone": tone, "language": language}
            }
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error crítico: {str(e)}")

@router.get("/files")
async def get_processed_files(current_user: User = Depends(get_current_user)):
    return [{"id": "1", "name": "Documento_Ejemplo.pdf", "status": "Processed"}]