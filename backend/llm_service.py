import os
from openai import OpenAI
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()  # ✅ Make sure this runs

class LLMService:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY")  # ✅ Pass key directly
        )
    
    async def generate_response(
        self, 
        user_message: str, 
        system_prompt: str, 
        api_data: Optional[Dict[str, Any]] = None
    ) -> str:
        try:
            context = f"User message: {user_message}\n"
            
            if api_data and "error" not in api_data:
                context += f"API Data: {api_data}\n"
                context += "Please use this data to answer the user's question according to your personality."
            elif api_data and "error" in api_data:
                context += f"API Error: {api_data['error']}\n"
                context += "The API request failed, please respond accordingly."
            else:
                context += "No external data available, respond based on your knowledge."

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": context}
            ]

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            return f"I’m having trouble connecting to the language model. Error: {str(e)}"
