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
    Transforma un trozo de texto en un SET DE ESTUDIO COMPLETO (Mapa, Resumen, Flashcards, Quiz).
    """
    
    level_instruction = {
        "1": "Nivel Básico: Conceptos clave y definiciones directas.",
        "2": "Nivel Intermedio: Análisis detallado con causas y consecuencias.",
        "3": "Nivel Avanzado: Síntesis profunda para nivel universitario/experto."
    }.get(level, "2")

    system_prompt = f"""
    Eres el motor de una plataforma EdTech de alto nivel. 
    Tu misión es transformar el texto proporcionado en un SET DE ESTUDIO COMPLETO.

    INSTRUCCIONES DE PERSONALIZACIÓN:
    - Idioma: {language}
    - Nivel: {level_instruction}
    - Tono: {tone}
    - Notas extra: {specs}

    DEBES GENERAR UN JSON EXACTO QUE INCLUYA ESTAS 5 SECCIONES:
    1. 'entities': Nodos jerárquicos ('CENTRAL', 'BRANCH', 'SUB_BRANCH') con un 'summary' detallado para cada uno.
    2. 'relations': Conexiones lógicas entre los nodos.
    3. 'global_summary': Un resumen escrito estructurado en bullet points HTML (<ul><li>...</li></ul>).
    4. 'flashcards': Mínimo 4 tarjetas de doble cara (front/back) para ayudar a memorizar.
    5. 'quiz': Mínimo 3 preguntas de autoevaluación con 4 opciones y la respuesta correcta.

    ESTRUCTURA OBLIGATORIA DEL JSON (No uses markdown, solo el JSON puro):
    {{
      "entities": [ {{"id": "c1", "label": "Tema Central", "type": "CENTRAL", "summary": "..."}} ],
      "relations": [ {{"source": "c1", "target": "b1", "type": "contiene", "evidence": "..."}} ],
      "global_summary": "<ul><li>Punto fundamental 1...</li></ul>",
      "flashcards": [ {{"front": "Pregunta o término", "back": "Respuesta o definición"}} ],
      "quiz": [ {{"question": "Pregunta de prueba", "options": ["Opción A","Opción B","Opción C","Opción D"], "correct_answer": "Opción correcta exacta", "explanation": "Por qué es correcta"}} ]
    }}
    """

    completion = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Genera el Set de Estudio para este texto: \n\n{chunk}"}
        ],
        response_format={"type": "json_object"}
    )

    raw_content = completion.choices[0].message.content
    data = json.loads(raw_content)

    # Validaciones de seguridad: Si la IA olvida algo, le ponemos una lista vacía para no romper el programa
    for key in ["entities", "relations", "flashcards", "quiz"]:
        if key not in data: 
            data[key] = []
    if "global_summary" not in data: 
        data["global_summary"] = ""

    return ExtractionPayload(**data)