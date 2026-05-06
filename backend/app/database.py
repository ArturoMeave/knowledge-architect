import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

class GraphDB:
    def __init__(self):
        # Creamos la conexión oficial con la nube
        self.driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI"),
            auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
        )

    def close(self):
        self.driver.close()

    def save_graph(self, nodes, edges):
        with self.driver.session() as session:
            # 1. Guardar Nodos: Si no existe lo crea, si existe lo actualiza (MERGE)
            for node in nodes:
                session.run("""
                    MERGE (n:Entity {id: $id})
                    SET n.label = $label, n.type = $type, n.color = $color
                """, id=node.id, label=node.label, type=node.type, color=node.color)

            # 2. Guardar Relaciones: Conecta los puntos
            for edge in edges:
                session.run("""
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

# Instancia global para usar en las rutas
db = GraphDB()