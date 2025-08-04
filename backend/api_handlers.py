import requests
import json
from typing import Optional, Dict, Any
import os

class APIHandlers:
    def __init__(self):
        self.news_api_key = os.getenv("NEWS_API_KEY")
        self.openweather_api_key = os.getenv("OPENWEATHER_API_KEY")
    
    async def get_weather(self, location: str = "Delhi") -> Dict[str, Any]:
        """Get weather data using wttr.in API (no key required)"""
        try:
            url = f"https://wttr.in/{location}?format=j1"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                current = data["current_condition"][0]
                
                return {
                    "location": location,
                    "temperature": current["temp_C"],
                    "condition": current["weatherDesc"][0]["value"],
                    "humidity": current["humidity"],
                    "wind_speed": current["windspeedKmph"]
                }
            else:
                return {"error": "Weather data not available"}
                
        except Exception as e:
            return {"error": f"Weather API error: {str(e)}"}
    
    async def get_crypto_price(self, crypto: str = "bitcoin") -> Dict[str, Any]:
        """Get cryptocurrency price using CoinGecko API"""
        try:
            url = f"https://api.coingecko.com/api/v3/simple/price?ids={crypto}&vs_currencies=usd,inr&include_24hr_change=true"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if crypto in data:
                    crypto_data = data[crypto]
                    return {
                        "crypto": crypto.capitalize(),
                        "price_usd": crypto_data.get("usd", 0),
                        "price_inr": crypto_data.get("inr", 0),
                        "change_24h": crypto_data.get("usd_24h_change", 0)
                    }
            
            return {"error": "Cryptocurrency data not available"}
            
        except Exception as e:
            return {"error": f"Crypto API error: {str(e)}"}
    
    async def get_news(self) -> Dict[str, Any]:
        """Get latest news headlines"""
        try:
            # Using a free news API that doesn't require key for demo
            url = "https://api.currentsapi.services/v1/latest-news?language=en&apiKey=demo"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                headlines = []
                
                for article in data.get("news", [])[:5]:  # Get top 5 headlines
                    headlines.append({
                        "title": article.get("title", ""),
                        "description": article.get("description", "")[:100] + "..."
                    })
                
                return {"headlines": headlines}
            else:
                # Fallback with mock data if API fails
                return {
                    "headlines": [
                        {"title": "Tech Industry News", "description": "Latest developments in technology sector..."},
                        {"title": "Market Updates", "description": "Financial markets showing positive trends..."}
                    ]
                }
                
        except Exception as e:
            return {"error": f"News API error: {str(e)}"}
