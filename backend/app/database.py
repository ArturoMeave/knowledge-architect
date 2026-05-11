import os
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
            query = """
                MATCH (n:Entity {user_id: $user_id})-[r]->(m:Entity {user_id: $user_id}) 
                RETURN n, r, m
            """
            result = await session.run(query, user_id=user_id)
            nodes = {}
            edges = []

            async for record in result:
                n, m, r = record["n"], record["m"], record["r"]
                if n["id"] not in nodes: nodes[n["id"]] = dict(n)
                if m["id"] not in nodes: nodes[m["id"]] = dict(m)

                edges.append({
                    "source": n["id"],
                    "target": m["id"],
                    "type": r["original_type"],
                    "evidence": r["evidence"],
                    "confidence": r["confidence"]
                })
            return {"nodes": list(nodes.values()), "edges": edges}

    async def save_graph(self, nodes, edges, user_id: int):
        async with self.driver.session() as session:
            nodes_data = [{"id": n.id, "label": n.label, "type": n.type, "color": n.color, "user_id": user_id} for n in nodes]
            await session.run("""
                UNWIND $nodes AS node_data
                MERGE (n:Entity {id: node_data.id, user_id: node_data.user_id})
                SET n.label = node_data.label, n.type = node_data.type, n.color = node_data.color
            """, nodes=nodes_data)

            rels_data = [
                {
                    "source": e.source,
                    "target": e.target,
                    "rel_type": e.type.upper().replace(" ", "_"),
                    "original_type": e.type,
                    "evidence": e.evidence,
                    "confidence": e.confidence,
                    "user_id": user_id
                } for e in edges
            ]
            await session.run("""
                UNWIND $rels AS rel_data
                MATCH (a:Entity {id: rel_data.source, user_id: rel_data.user_id})
                MATCH (b:Entity {id: rel_data.target, user_id: rel_data.user_id})
                MERGE (a)-[r:RELATED {type: rel_data.rel_type}]->(b)
                SET r.evidence = rel_data.evidence, 
                    r.confidence = rel_data.confidence, 
                    r.original_type = rel_data.original_type
            """, rels=rels_data)
            logger.info(f"Guardado masivo completado:{user_id}: {len(nodes)} nodos.")

db = GraphDB()