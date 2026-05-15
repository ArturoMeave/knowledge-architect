import os
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv
from app.models.extraction import ExtractionPayload
from tenacity import retry, stop_after_attempt, wait_fixed

load_dotenv()

client = AsyncOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY")
)

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
async def extract_knowledge_from_chunks(chunk: str, level: str, tone: str, language: str, specs: str = ""):
    """
    Extrae conocimiento y un resumen narrativo personalizado.
    """
    
    level_instruction = {
        "1": "Conceptos fundamentales y definiciones claras.",
        "2": "Análisis profundo conectando causas y consecuencias.",
        "3": "Síntesis experta con terminología avanzada y relaciones complejas.",
    }.get(level, "2")

    tone_instruction = {
        "academic": "Lenguaje formal y estructurado de profesor universitario.",
        "friendly": "Analogías sencillas como un compañero de clase.",
        "simple": "Lenguaje muy simple y directo (ELI5)."
    }.get(tone, "academic")

    system_prompt = f"""
    Eres un experto en diseño de mapas mentales educativos. 
    Tu misión es transformar el texto en una estructura de árbol jerárquica.

    REGLA DE ERO: Responde con un JSON que defina:
    1. Un único nodo 'CENTRAL' (el tema principal).
    2. Varias ramas 'BRANCH' conectadas al centro.
    3. 'SUB_BRANCH' conectadas a las ramas.
    
    CADA NODO debe tener un campo 'summary' con una explicación detallada de ese punto específico.

    JSON FORMAT:
    {{
      "entities": [
        {{"id": "c1", "label": "Tema Central", "type": "CENTRAL", "summary": "..."}},
        {{"id": "b1", "label": "Rama 1", "type": "BRANCH", "summary": "..."}}
      ],
      "relations": [ {{"source": "c1", "target": "b1", "type": "contiene"}} ]
    }}
    """

    completion = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Analiza este texto: \n\n{chunk}"}
        ],
        response_format={"type": "json_object"}
    )

    raw_content = completion.choices[0].message.content
    data = json.loads(raw_content)

    # Validaciones de seguridad para que el sistema no rompa
    if "entities" not in data: data["entities"] = []
    if "relations" not in data: data["relations"] = []
    if "summary" not in data: data["summary"] = ""

    return ExtractionPayload(**data)