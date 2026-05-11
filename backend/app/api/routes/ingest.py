from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import tempfile
import shutil
import asyncio
import os
from app.services.pdf_reader import extract_pdf_pages
from app.services.chunker import chunk_text
from app.services.extraction import extract_knowledge_from_chunks
from app.database import db
from app.api.deps import get_current_user

router = APIRouter(
    prefix="/ingest", 
    tags=["Ingestión"], 
    dependencies=[Depends(get_current_user)])

CONCURRENCY_LIMIT = int(os.getenv("GROQ_CONCURRENCY_LIMIT", "5"))
semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)

async def process_chunk_safe(chunk: str, final_nodes: dict, all_relations: list):
    """
    Procesa un trozo de texto de forma segura y controlada.
    """
    async with semaphore:
        try:
            graph_data = await extract_knowledge_from_chunks(chunk)
            
            for node in graph_data.entities:
                unique_id = node.label.lower().replace(" ", "_")
                if unique_id not in final_nodes:
                    node.id = unique_id
                    final_nodes[unique_id] = node
            
            for rel in graph_data.relations:
                rel.source = rel.source_label.lower().replace(" ", "_")
                rel.target = rel.target_label.lower().replace(" ", "_")
                all_relations.append(rel)
        except Exception as e:
            print(f"Error procesando un trozo (chunk): {e}")

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Punto de entrada principal para subir y procesar PDFs.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF válido")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            shutil.copyfileobj(file.file, temp_pdf)
            temp_pdf_path = temp_pdf.name

        try:
            pages = extract_pdf_pages(temp_pdf_path)
            full_text = "\n".join([p.text for p in pages])
            chunks = chunk_text(full_text)

            final_nodes = {}
            all_relations = []

            tasks = [process_chunk_safe(chunk, final_nodes, all_relations) for chunk in chunks]
            await asyncio.gather(*tasks)

            nodes_list = list(final_nodes.values())

            try:
                await db.save_graph(nodes_list, all_relations)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error en la base de datos Neo4j: {str(e)}")

            return {
                "filename": file.filename,
                "status": "Success",
                "knowledge_graph": {
                    "nodes": nodes_list,
                    "edges": all_relations,
                }
            }

        finally:
            if os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error crítico en el sistema: {str(e)}")