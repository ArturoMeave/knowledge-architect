import os
from neo4j import AsyncGraphDatabase
from dotenv import load_dotenv

load_dotenv()

class GraphDB:
    def __init__(self):
        self.driver = AsyncGraphDatabase.driver(
            os.getenv("NEO4J_URI"),
            auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
        )

    async def close(self):
        await self.driver.close()
    
    async def init_db(self):
        async with self.driver.session() as session:
            await session.run("CREATE INDEX IF NOT EXISTS FOR (n:Entity) ON (n.id)")
    
    async def get_graph_data(self):
        async with self.driver.session() as session:
            result = await session.run("MATCH (n)-[r]->(m) RETURN n, r, m")
            records = await result.data()
            nodes = {}
            edges = []

            for record in records:
                n = record["n"]
                if n["id"] not in nodes:
                    nodes[n["id"]] = {
                        "id": n["id"],
                        "label": n["label"],
                        "type": n["type"],
                        "color": n["color"],
                    }
                m = record["m"]
                if m["id"] not in nodes:
                    nodes[m["id"]] ={
                        "id": m["id"],
                        "label": m["label"],
                        "type": m["type"],
                        "color": m["color"],
                    }
                r = record["r"]
                edges.append({
                    "source": n["id"],
                    "target": m["id"],
                    "type": r["original_type"], # Usamos el nombre legible
                    "evidence": r["evidence"],
                    "confidence": r["confidence"]
                })
            return {"nodes": list(nodes.values()), "edges": edges}

    async def save_graph(self, nodes, edges):
        async with self.driver.session() as session:
            for node in nodes:
                await session.run("""
                    MERGE (n:Entity {id: $id})
                    SET n.label = $label, n.type = $type, n.color = $color
                """, id=node.id, label=node.label, type=node.type, color=node.color)

            for edge in edges:
                await session.run("""
                    MATCH (a:Entity {id: $source})
                    MATCH (b:Entity {id: $target})
                    MERGE (a)-[r:RELATED {type: $rel_type}]->(b)
                    SET r.evidence = $evidence, r.confidence = $confidence, r.original_type = $original_type
                """, 
                source=edge.source, 
                target=edge.target, 
                rel_type=edge.type.upper().replace(" ", "_"),
                original_type=edge.type,
                evidence=edge.evidence, 
                confidence=edge.confidence)

db = GraphDB()