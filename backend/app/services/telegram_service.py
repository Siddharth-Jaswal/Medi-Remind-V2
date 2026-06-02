import os
import httpx

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

async def send_telegram_message(chat_id: str, text: str) -> bool:
    """
    Sends a message to the specified Telegram chat ID.
    """
    if not TELEGRAM_BOT_TOKEN:
        print("Error: TELEGRAM_BOT_TOKEN is not set.")
        return False
        
    url = f"{TELEGRAM_API_URL}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown"
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"Failed to send Telegram message to {chat_id}: {e}")
            return False

import asyncio

async def poll_telegram_updates():
    """
    Background task to poll Telegram for messages and reply to /start with the Chat ID.
    """
    if not TELEGRAM_BOT_TOKEN:
        return
        
    url = f"{TELEGRAM_API_URL}/getUpdates"
    offset = None
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        while True:
            try:
                params = {"timeout": 20}
                if offset:
                    params["offset"] = offset
                    
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    
                    for result in data.get("result", []):
                        offset = result["update_id"] + 1
                        
                        message = result.get("message", {})
                        text = message.get("text", "")
                        chat_id = message.get("chat", {}).get("id")
                        
                        if chat_id and text.startswith("/start"):
                            reply_text = f"👋 Welcome to MediRemind!\n\nYour unique Chat ID is: `{chat_id}`\n\nPlease copy this ID and enter it in the web application to connect your account."
                            await send_telegram_message(str(chat_id), reply_text)
                            
            except httpx.ReadTimeout:
                pass # Normal for long polling
            except Exception as e:
                print(f"Telegram polling error: {e}")
                await asyncio.sleep(5)
                
            await asyncio.sleep(1)
