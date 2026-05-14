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
from app.models.user import User 

router = APIRouter(
    prefix="/ingest", 
    tags=["Ingestión"], 
    dependencies=[Depends(get_current_user)]
)

# LÍMITE DE CONCURRENCIA: Evita que enviemos demasiadas peticiones a la vez a Groq
CONCURRENCY_LIMIT = int(os.getenv("GROQ_CONCURRENCY_LIMIT", "5"))
semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)

async def process_chunk_safe(chunk: str, final_nodes: dict, all_relations: list):
    """
    Toma un trozo de texto, extrae el conocimiento con IA y lo guarda
    en los diccionarios temporales antes de ir a la base de datos.
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
async def upload_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """
    Recibe un PDF, lo procesa y guarda los resultados vinculados al usuario actual.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF válido")

    try:
        # 1. Creamos un archivo temporal para procesar el PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            shutil.copyfileobj(file.file, temp_pdf)
            temp_pdf_path = temp_pdf.name

        try:
            # 2. Extraemos texto y lo dividimos en trozos
            pages = extract_pdf_pages(temp_pdf_path)
            full_text = "\n".join([p.text for p in pages])
            chunks = chunk_text(full_text)
            
            final_nodes = {}
            all_relations = []

            # 3. Procesamos los trozos en paralelo
            tasks = [process_chunk_safe(chunk, final_nodes, all_relations) for chunk in chunks]
            await asyncio.gather(*tasks)

            nodes_list = list(final_nodes.values())

            # 4. Guardamos en Neo4j usando el ID del usuario para mantener la privacidad
            try:
                await db.save_graph(nodes_list, all_relations, user_id=current_user.id)
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
            # Limpieza: Borramos el archivo temporal
            if os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error crítico en el sistema: {str(e)}")

@router.get("/files")
async def get_processed_files(current_user: User = Depends(get_current_user)):
    """
    Devuelve la lista de archivos que el usuario ha procesado.
    """
    # Por ahora devolvemos este ejemplo para que la Library del front no de errores.
    # Más adelante, esto leerá de una tabla 'Documents' en tu base de datos SQL.
    return [
        {
            "id": "1", 
            "name": "Documento_Procesado.pdf", 
            "size": "2.4 MB", 
            "date": "Hoy", 
            "status": "Processed",
            "nodes": 42
        }
    ]