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
You are a Knowledge Management Expert.
Your task is to analyze the provided text and extract key information into a structured JSON format.
Focus on identifying:
- Core concepts
- Important names
- Definitions
- Key dates or timeframes
- Relevant numerical data
- Critical processes or relationships
The output must strictly follow the JSON structure defined by the schema.
Do not include explanations, conversational text, or markdown.
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

    return ExtractionPayload(**data)