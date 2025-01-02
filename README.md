# TechnoTherapy

This is a therapy project that combines technology and healing, leveraging artificial intelligence to provide supportive therapeutic interactions.

## Features
- AI-powered therapeutic conversations using OpenAI's GPT models
- Real-time mood tracking and analysis
- Guided meditation and mindfulness exercises
- Journal entries with sentiment analysis
- Progress visualization and insights

## Technology Stack
- Backend: Python FastAPI with Uvicorn
- Frontend: HTML5, CSS3, JavaScript
- AI: OpenAI API
- Hosting: Cloudflare Pages (frontend) and Cloudflare Workers (backend)

## Getting Started
1. Clone this repository
2. Set up your OpenAI API key in the environment variables
venv/Scripts/activate
3. Install dependencies: `pip install -r requirements.txt`
4. Run locally: `uvicorn main:app --reload`

## Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key
- `ENVIRONMENT`: Development/Production

## License
Do Whatever You Want. I Don't Care.