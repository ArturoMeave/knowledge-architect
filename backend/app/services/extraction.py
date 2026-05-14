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
    Extrae conocimiento personalizado según el nivel, tono e instrucciones del estudiante.
    """
    
    level_instruction = {
        "1": "Proporciona conceptos fundamentales y definiciones claras.",
        "2": "Proporciona un análisis profundo conectando causas y consecuencias.",
        "3": "Crea una síntesis experta con terminología avanzada y relaciones complejas.",
    }.get(level, "2")

    tone_instruction = {
        "academic": "Usa un lenguaje formal, técnico y estructurado como un profesor de universidad.",
        "friendly": "Explica de forma cercana, usando analogías sencillas como un compañero de clase.",
        "simple": "Explica como si tuviera 5 años (ELI5), usando el lenguaje más simple y al grano posible."
    }.get(tone, "academic")

    system_prompt = f"""
    Eres un experto en pedagogía y extracción de grafos de conocimiento. 
    Tu misión es identificar entidades y relaciones a partir del texto y generar un resumen visual.

    INSTRUCCIONES DE PERSONALIZACIÓN:
    - Idioma de respuesta: {language}
    - Nivel de profundidad: {level_instruction}
    - Tono de la explicación: {tone_instruction}
    - Especificaciones adicionales: {specs}

    REGLA DE ORO: Responde ÚNICAMENTE con un JSON que use estas llaves exactas:
    {{
      "entities": [
        {{"id": "unique_id", "label": "Concepto", "type": "Tipo", "color": "#hex"}}
      ],
      "relations": [
        {{
          "source": "id_origen", 
          "target": "id_destino", 
          "source_label": "Nombre Origen", 
          "target_label": "Nombre Destino", 
          "type": "tipo_relacion", 
          "evidence": "cita_del_texto", 
          "confidence": 1.0
        }}
      ]
    }}
    """

    completion = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Analiza este texto y extrae el conocimiento: \n\n{chunk}"}
        ],
        response_format={"type": "json_object"}
    )

    raw_content = completion.choices[0].message.content
    data = json.loads(raw_content)

    # Aseguramos que las llaves existan para evitar errores de validación
    if "entities" not in data: data["entities"] = []
    if "relations" not in data: data["relations"] = []

    return ExtractionPayload(**data)