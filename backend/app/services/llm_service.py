import httpx
import json
import os
import base64
from typing import List, Dict, Any

LLM_SERVICE_URL = os.getenv("LLM_SERVICE_URL", "http://localhost:1234/v1/chat/completions")
LLM_API_KEY = os.getenv("LLM_API_KEY", "lm-studio")
LLM_MODEL = os.getenv("LLM_MODEL", "local-model")

prompt_message = """
Extract the medicines from this prescription. 
CRITICAL: Do NOT include any <think> tags. Do NOT output any reasoning, thinking process, or explanations.
Output ONLY the raw JSON array immediately, starting with '[' and ending with ']'.
Do not use markdown formatting or code blocks like ```json.
Each object must have exactly these keys:
- "name" (string): the name of the medicine
- "dosage" (string): the dosage (e.g., "625mg", "1 Tablet")
- "food_relation" (string): e.g., "After Food", "Before Food", "Empty Stomach"
- "duration_days" (integer): number of days, default to 5 if not explicitly mentioned.
"""

async def extract_medicines_from_image(image_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
    """
    Sends the image to the LLM Gateway (OpenAI Compatible) and extracts structured JSON.
    """
    # Base64 encode the image
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": LLM_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt_message
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "temperature": 0.1,
        "max_tokens": 4096
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(LLM_SERVICE_URL, json=payload, headers=headers)
        
        if response.status_code != 200:
            print(f"LLM API Error: {response.text}")
            response.raise_for_status()
            
        result = response.json()
        
        # Extract response from standard OpenAI format
        try:
            llm_text = result["choices"][0]["message"]["content"].strip()
        except (KeyError, IndexError):
            print(f"Unexpected response format: {result}")
            raise Exception("Failed to parse response format from LLM API")
        
        # Clean up any reasoning tags (e.g. from Qwen/DeepSeek)
        import re
        llm_text = re.sub(r"<think>.*?</think>", "", llm_text, flags=re.DOTALL).strip()
        
        # Clean up any potential markdown if the LLM ignores instructions
        if llm_text.startswith("```json"):
            llm_text = llm_text[7:]
        if llm_text.startswith("```"):
            llm_text = llm_text[3:]
        if llm_text.endswith("```"):
            llm_text = llm_text[:-3]
            
        llm_text = llm_text.strip()
        
        # Aggressively extract the JSON array even if there is surrounding garbage
        json_match = re.search(r'\[.*\]', llm_text, flags=re.DOTALL)
        if json_match:
            llm_text = json_match.group(0)
        
        try:
            medicines = json.loads(llm_text)
            if not isinstance(medicines, list):
                if isinstance(medicines, dict) and "medicines" in medicines:
                    medicines = medicines["medicines"]
                else:
                    medicines = []
            return medicines
        except json.JSONDecodeError as e:
            print(f"Failed to decode JSON from LLM: {llm_text}")
            raise Exception(f"Failed to parse LLM response as JSON: {e}")
