import os
import json
import logging
from neo4j import AsyncGraphDatabase
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

load_dotenv()

class GraphDB:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI")
        self.user = os.getenv("NEO4J_USER")
        self.password = os.getenv("NEO4J_PASSWORD")
        self.driver = None

    async def connect(self):
        if not self.driver:
            self.driver = AsyncGraphDatabase.driver(self.uri, auth=(self.user, self.password))
            logger.info("Conexión con Neo4j establecida correctamente.")

    async def init_db(self):
        async with self.driver.session() as session:
            await session.run("CREATE INDEX IF NOT EXISTS FOR (n:Entity) ON (n.id, n.user_id)")
            logger.info("Índice compuesto verificado.")

    async def close(self):
        if self.driver:
            await self.driver.close()
            logger.info("Conexión cerrada de forma segura.")
    
    async def get_graph_data(self, user_id: int):
        async with self.driver.session() as session:
            # 1. Recuperar el Grafo
            query_graph = """
                MATCH (n:Entity {user_id: $user_id})
                OPTIONAL MATCH (n)-[r:RELATED]->(m:Entity {user_id: $user_id}) 
                RETURN n, r, m
            """
            result_graph = await session.run(query_graph, user_id=user_id)
            nodes = {}
            edges = []

            async for record in result_graph:
                n, m, r = record["n"], record["m"], record["r"]
                if n and n["id"] not in nodes: nodes[n["id"]] = dict(n)
                if m and m["id"] not in nodes: nodes[m["id"]] = dict(m)
                if r:
                    edges.append({
                        "source": n["id"], "target": m["id"],
                        "type": r["original_type"], "evidence": r["evidence"]
                    })

            # 2. NUEVO: Recuperar el Set de Estudio (Document)
            query_doc = "MATCH (d:Document {user_id: $user_id}) RETURN d.summary AS summary, d.flashcards AS flashcards, d.quiz AS quiz"
            result_doc = await session.run(query_doc, user_id=user_id)
            
            summary = ""
            flashcards = []
            quiz = []
            
            async for record in result_doc:
                summary = record["summary"] or ""
                try:
                    # Volvemos a convertir el texto JSON a listas reales
                    flashcards = json.loads(record["flashcards"]) if record["flashcards"] else []
                    quiz = json.loads(record["quiz"]) if record["quiz"] else []
                except: pass

            return {
                "nodes": list(nodes.values()), 
                "edges": edges,
                "summary": summary,
                "flashcards": flashcards,
                "quiz": quiz
            }

    async def save_graph(self, nodes, edges, summary: str, flashcards: list, quiz: list, user_id: int):
        async with self.driver.session() as session:
            # (Lógica de guardar nodos)
            nodes_data = [{"id": n.id, "label": n.label, "type": n.type, "color": n.color, "summary": n.summary, "user_id": user_id} for n in nodes]
            await session.run("""
                UNWIND $nodes AS node_data
                MERGE (n:Entity {id: node_data.id, user_id: node_data.user_id})
                SET n.label = node_data.label, n.type = node_data.type, n.color = node_data.color, n.summary = node_data.summary
            """, nodes=nodes_data)

            # (Lógica de guardar relaciones)
            rels_data = [{"source": e.source, "target": e.target, "rel_type": e.type.upper().replace(" ", "_"), "original_type": e.type, "evidence": e.evidence, "user_id": user_id} for e in edges]
            await session.run("""
                UNWIND $rels AS rel_data
                MATCH (a:Entity {id: rel_data.source, user_id: rel_data.user_id})
                MATCH (b:Entity {id: rel_data.target, user_id: rel_data.user_id})
                MERGE (a)-[r:RELATED {type: rel_data.rel_type}]->(b)
                SET r.evidence = rel_data.evidence, r.original_type = rel_data.original_type
            """, rels=rels_data)

            # NUEVO: Guardar el Set de Estudio en un nodo especial "Document"
            # Convertimos las listas de objetos a texto (JSON) para guardarlas en la base de datos
            flashcards_json = json.dumps([dict(f) for f in flashcards])
            quiz_json = json.dumps([dict(q) for q in quiz])
            
            await session.run("""
                MERGE (d:Document {user_id: $user_id})
                SET d.summary = $summary, 
                    d.flashcards = $flashcards, 
                    d.quiz = $quiz, 
                    d.updated_at = datetime()
            """, user_id=user_id, summary=summary, flashcards=flashcards_json, quiz=quiz_json)
            
            logger.info(f"Guardado Set Completo para el usuario: {user_id}")

db = GraphDB()