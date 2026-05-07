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
            await session.run("CREATE INDEX IF NOT EXISTS FOR (n:Entity) ON (n.id)")
            logger.info("Índices de base de datos verificados.")

    async def close(self):
        if self.driver:
            await self.driver.close()
            logger.info("Conexión cerrada de forma segura.")
    
    async def get_graph_data(self):
        async with self.driver.session() as session:
            result = await session.run("MATCH (n:Entity)-[r]->(m:Entity) RETURN n, r, m")
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

    async def save_graph(self, nodes, edges):
        async with self.driver.session() as session:
            nodes_data = [{"id": n.id, "label": n.label, "type": n.type, "color": n.color} for n in nodes]
            await session.run("""
                UNWIND $nodes AS node_data
                MERGE (n:Entity {id: node_data.id})
                SET n.label = node_data.label, n.type = node_data.type, n.color = node_data.color
            """, nodes=nodes_data)

            rels_data = [
                {
                    "source": e.source,
                    "target": e.target,
                    "rel_type": e.type.upper().replace(" ", "_"),
                    "original_type": e.type,
                    "evidence": e.evidence,
                    "confidence": e.confidence
                } for e in edges
            ]
            await session.run("""
                UNWIND $rels AS rel_data
                MATCH (a:Entity {id: rel_data.source})
                MATCH (b:Entity {id: rel_data.target})
                MERGE (a)-[r:RELATED {type: rel_data.rel_type}]->(b)
                SET r.evidence = rel_data.evidence, 
                    r.confidence = rel_data.confidence, 
                    r.original_type = rel_data.original_type
            """, rels=rels_data)
            logger.info(f"Guardado masivo completado: {len(nodes)} nodos.")

db = GraphDB()