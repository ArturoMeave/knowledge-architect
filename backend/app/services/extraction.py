import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from app.models.extraction import ExtractionPayload
from tenacity import retry, stop_after_attempt, wait_fixed

load_dotenv()

client = OpenAI(
    base_url = "https://api.groq.com/openai/v1",
    api_key= os.getenv("GROQ_API_KEY")
)

SYSTEM_PROMPT = """
Eres un experto en extraer grafos de conocimiento. 
Tu misión es identificar entidades y cómo se relacionan a partir del texto.

REGLA DE ORO: Responde ÚNICAMENTE con un JSON que use estas llaves exactas:
{
  "entities": [
    {"id": "1", "label": "Nombre del Concepto", "type": "Tipo", "color": "#hex"}
  ],
  "relations": [
    {
      "source": "1", 
      "target": "2", 
      "source_label": "Nombre del Concepto Origen", 
      "target_label": "Nombre del Concepto Destino", 
      "type": "relación", 
      "evidence": "frase del texto", 
      "confidence": 1.0
    }
  ]
}
"""

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def extract_knowledge_from_chunks(text_chunk: str) -> ExtractionPayload:
    """
    Envia un trozo de texto a Groq para convertirlo en un mapa mental excelente.
    """
    completion = client.chat.completions.create(
        model= "llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Analiza este texto y extrae el grafo: {text_chunk}"}
        ],
        response_format={"type": "json_object"}
    )

    raw_content = completion.choices[0].message.content
    data = json.loads(raw_content)

    if "entities" not in data: data["entities"] = []
    if "relations" not in data: data["relations"] = []

    return ExtractionPayload(**data)