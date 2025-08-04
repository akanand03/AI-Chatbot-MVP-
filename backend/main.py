from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from api_handlers import APIHandlers
from llm_service import LLMService

load_dotenv()

app = FastAPI(title="AI Chatbot MVP", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
api_handlers = APIHandlers()
llm_service = LLMService()

# Global system prompt storage (in production, use a database)
current_system_prompt = "You are a helpful AI assistant."

class ChatRequest(BaseModel):
    message: str
    system_prompt: Optional[str] = None

class SystemPromptRequest(BaseModel):
    system_prompt: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        global current_system_prompt
        
        # Update system prompt if provided
        if request.system_prompt:
            current_system_prompt = request.system_prompt
        
        user_message = request.message.lower()
        
        # Intent detection and API calling
        api_response = None
        intent = detect_intent(user_message)
        
        if intent == "weather":
            location = extract_location(request.message)
            api_response = await api_handlers.get_weather(location)
        elif intent == "crypto":
            crypto = extract_crypto(request.message)
            api_response = await api_handlers.get_crypto_price(crypto)
        elif intent == "news":
            api_response = await api_handlers.get_news()
        
        # Generate response using LLM
        response = await llm_service.generate_response(
            user_message=request.message,
            system_prompt=current_system_prompt,
            api_data=api_response
        )
        
        return {"response": response, "intent": intent}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/system-prompt")
async def update_system_prompt(request: SystemPromptRequest):
    global current_system_prompt
    current_system_prompt = request.system_prompt
    return {"message": "System prompt updated successfully"}

@app.get("/api/system-prompt")
async def get_system_prompt():
    return {"system_prompt": current_system_prompt}

def detect_intent(message: str) -> str:
    """Simple intent detection based on keywords"""
    weather_keywords = ["weather", "temperature", "forecast", "climate", "rain", "sunny", "cloudy"]
    crypto_keywords = ["bitcoin", "btc", "ethereum", "eth", "crypto", "cryptocurrency", "price"]
    news_keywords = ["news", "headlines", "latest", "today", "current events"]
    
    if any(keyword in message for keyword in weather_keywords):
        return "weather"
    elif any(keyword in message for keyword in crypto_keywords):
        return "crypto"
    elif any(keyword in message for keyword in news_keywords):
        return "news"
    else:
        return "general"

def extract_location(message: str) -> str:
    """Extract location from message"""
    # Simple extraction - in production, use NLP
    words = message.split()
    common_locations = ["delhi", "mumbai", "bangalore", "london", "paris", "tokyo", "new york"]
    
    for word in words:
        if word.lower() in common_locations:
            return word
    
    return "Delhi"  # Default location

def extract_crypto(message: str) -> str:
    """Extract cryptocurrency from message"""
    message_lower = message.lower()
    if "bitcoin" in message_lower or "btc" in message_lower:
        return "bitcoin"
    elif "ethereum" in message_lower or "eth" in message_lower:
        return "ethereum"
    else:
        return "bitcoin"  # Default crypto

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)