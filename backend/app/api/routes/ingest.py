from fastapi import APIRouter, UploadFile, File, HTTPException # Añadimos HTTPException
from app.services.pdf_reader import extract_pdf_pages
from app.services.chunker import chunk_text
from app.services.extraction import extract_knowledge_from_chunks
from app.database import db

router = APIRouter(prefix="/ingest", tags=["Ingestión"])

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        content = await file.read()
        pages = extract_pdf_pages(content)
        full_text = "\n".join([p.text for p in pages])
        chunks = chunk_text(full_text)

        final_nodes = {}
        all_relations = []

        for chunk in chunks:
            try:
                graph_data = extract_knowledge_from_chunks(chunk)
                
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
                print(f"Error procesando un chunk: {e}")
                continue 

        nodes_list = list(final_nodes.values())

        try:
            db.save_graph(nodes_list, all_relations)
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

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error crítico en el sistema: {str(e)}")