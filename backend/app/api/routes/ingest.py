from fastapi import APIRouter, UploadFile, File
from app.services.pdf_reader import extract_pdf_pages
from app.services.chunker import chunk_text
from app.services.extraction import extract_knowledge_from_chunks
from app.models.extraction import ExtractionPayload
from app.database import db

router = APIRouter(prefix="/ingest", tags=["Ingestión"])

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    content = await file.read()

    pages = extract_pdf_pages(content)

    full_text = "\n".join([p.text for p in pages])

    chunks = chunk_text(full_text)

    final_nodes= {}
    all_relations = []

    for chunk in chunks[:3]:
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

    nodes_list = list(final_nodes.values())
    db.save_graph(nodes_list, all_relations)

    return{
        "filename": file.filename,
        "knowledge_graph": {
            "nodes": list(final_nodes.values()),
            "edges": all_relations,
        }
    }

