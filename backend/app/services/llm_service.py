import httpx
import json
import os
from typing import List, Dict, Any

LLM_GATEWAY_URL = os.getenv("LLM_SERVICE_URL", "http://localhost:8000/vision")

prompt_message = """
Extract the medicines from this prescription. 
Return ONLY a valid JSON array of objects, without any markdown formatting, no code blocks like ```json, and no extra text.
Each object must have exactly these keys:
- "name" (string): the name of the medicine
- "dosage" (string): the dosage (e.g., "625mg", "1 Tablet")
- "food_relation" (string): e.g., "After Food", "Before Food", "Empty Stomach"
- "duration_days" (integer): number of days, default to 5 if not explicitly mentioned.
"""

async def extract_medicines_from_image(image_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
    """
    Sends the image to the LLM Gateway and extracts structured JSON.
    """
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Create form data matching the LLM Gateway README
        files = {
            "image": (filename, image_bytes, "image/jpeg")
        }
        data = {
            "message": prompt_message,
            "stream": "false"
        }
        
        response = await client.post(LLM_GATEWAY_URL, data=data, files=files)
        response.raise_for_status()
        
        result = response.json()
        llm_text = result.get("response", "").strip()
        
        # Clean up any potential markdown if the LLM ignores instructions
        if llm_text.startswith("```json"):
            llm_text = llm_text[7:]
        if llm_text.startswith("```"):
            llm_text = llm_text[3:]
        if llm_text.endswith("```"):
            llm_text = llm_text[:-3]
            
        llm_text = llm_text.strip()
        
        try:
            medicines = json.loads(llm_text)
            if not isinstance(medicines, list):
                # Fallback if it wrapped it in an object
                if isinstance(medicines, dict) and "medicines" in medicines:
                    medicines = medicines["medicines"]
                else:
                    medicines = []
            return medicines
        except json.JSONDecodeError as e:
            print(f"Failed to decode JSON from LLM: {llm_text}")
            raise Exception(f"Failed to parse LLM response as JSON: {e}")
