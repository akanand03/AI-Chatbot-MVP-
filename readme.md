# 🤖 AI Chatbot MVP

<img width="1625" height="793" alt="Screenshot 2025-08-04 at 12 05 13 PM" src="https://github.com/user-attachments/assets/a8d90bb2-e075-4100-a27a-ea854a0fe34e" />


A customizable AI chatbot with personality system and live API integrations for weather, crypto, and news data.

## ✨ Features

- **🎭 Customizable Personalities**: Change bot behavior via system prompts
- **🌤️ Weather Integration**: Real-time weather data via wttr.in API
- **₿ Crypto Prices**: Live cryptocurrency prices from CoinGecko
- **📰 News Headlines**: Latest news from multiple sources
- **🎯 Smart Intent Detection**: Automatic routing to appropriate APIs
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **⚡ Real-time Status**: Connection monitoring and error handling

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone and setup:**
```bash
git clone https://github.com/akanand03/AI-Chatbot-MVP-.git
cd chatbot-mvp
```

2. **Backend setup:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your OpenAI API key
```

3. **Run the application:**
```bash
# Terminal 1 - Backend
cd backend && python main.py

# Terminal 2 - Frontend  
cd frontend && python -m http.server 3000
```

4. **Open in browser:**
```
http://localhost:3000
```

## 🎯 Demo

Try these example queries:

**Weather:** "What's the weather in Delhi?"  
**Crypto:** "What's Bitcoin's price?"  
**News:** "Give me today's headlines"  

**Personality Examples:**
- "You are a sarcastic crypto expert"
- "You are a British weather reporter with humor"
- "You are a zen master who speaks in riddles"

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS) ←→ FastAPI Backend ←→ External APIs
                               ├── OpenAI GPT-3.5
                               ├── Weather API  
                               ├── CoinGecko API
                               └── News API
```

### Tech Stack
- **Backend**: FastAPI, Python, OpenAI API
- **Frontend**: Vanilla HTML/CSS/JavaScript  
- **APIs**: wttr.in, CoinGecko, NewsAPI
- **Deployment**: Vercel/Railway ready

## 📁 Project Structure

```
chatbot-mvp/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── api_handlers.py      # External API integrations
│   ├── llm_service.py       # OpenAI integration
│   ├── requirements.txt     # Dependencies
│   └── .env                 # Environment variables
└── frontend/
    ├── index.html           # Main interface
    ├── style.css            # Responsive styling
    └── script.js            # App logic
```

## 🔧 Configuration

### Environment Variables (.env)
```env
OPENAI_API_KEY=your_openai_key_here
NEWS_API_KEY=optional_news_key
OPENWEATHER_API_KEY=optional_weather_key
```

### API Endpoints
- `POST /api/chat` - Send message and get response
- `POST /api/system-prompt` - Update bot personality
- `GET /api/system-prompt` - Get current personality
- `GET /docs` - API documentation (FastAPI auto-generated)

## 🌐 Deployment

### Option 1: Vercel + Railway
- **Frontend**: Deploy to Vercel (automatic from GitHub)
- **Backend**: Deploy to Railway with environment variables

### Option 2: Local Network
```bash
# Backend
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend  
python -m http.server 3000 --bind 0.0.0.0
```

## 🧪 Testing

**Manual Testing Checklist:**
- [ ] Basic chat functionality
- [ ] System prompt updates  
- [ ] Weather API integration
- [ ] Crypto price fetching
- [ ] News headlines
- [ ] Error handling (disconnect backend)
- [ ] Mobile responsiveness
- [ ] Connection status indicators

## 🚀 Production Enhancements

For scaling to production:
- [ ] User authentication & sessions
- [ ] Database for conversation history
- [ ] Rate limiting & API quotas
- [ ] Enhanced NLP for intent detection
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Monitoring & analytics

## 🎯 Key Features Demonstrated

- **Full-stack Development**: Backend API + Frontend interface
- **API Integration**: Multiple external service integrations
- **Error Handling**: Graceful failures and user feedback
- **Responsive Design**: Mobile-first approach
- **Modern UI/UX**: Glassmorphism, animations, status indicators
- **Code Quality**: Modular architecture, clean separation of concerns

## 📝 API Examples

### Chat Request
```json
POST /api/chat
{
  "message": "What's the weather in Mumbai?",
  "system_prompt": "You are a helpful assistant"
}
```

### Response
```json
{
  "response": "The weather in Mumbai is currently 28°C with partly cloudy skies...",
  "intent": "weather"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have questions or need help:
- Check the [API documentation](http://localhost:8000/docs) when running
- Review the console logs for debugging
- Ensure all environment variables are set correctly

---

**Built with ❤️ for startup hiring challenges**
