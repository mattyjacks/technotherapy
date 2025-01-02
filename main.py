from fastapi import FastAPI, HTTPException, Depends, Request, Security
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import Optional
import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="TechnoTherapy API")

# Security setup
API_KEY = "Matt"  # Your password
api_key_header = APIKeyHeader(name="X-API-Key")

async def get_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key"
        )
    return api_key

# CORS middleware configuration - allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

class TherapyMessage(BaseModel):
    message: str
    mood: Optional[str] = None
    context: Optional[str] = None

class JournalEntry(BaseModel):
    content: str
    mood: Optional[str] = None
    tags: Optional[list[str]] = None

@app.get("/")
async def read_root():
    return {"status": "healthy", "message": "Welcome to TechnoTherapy API"}

@app.post("/api/chat")
async def therapy_chat(message: TherapyMessage, api_key: str = Depends(get_api_key)):
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """You are an empathetic and supportive AI therapy assistant. 
                Your responses should be compassionate, non-judgmental, and focused on helping the user 
                process their thoughts and feelings. Never provide medical advice or diagnoses."""},
                {"role": "user", "content": message.message}
            ],
            temperature=0.7,
            max_tokens=300
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/journal")
async def create_journal_entry(entry: JournalEntry, api_key: str = Depends(get_api_key)):
    try:
        # Analyze sentiment using OpenAI
        sentiment_analysis = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Analyze the emotional tone and key themes of this journal entry. Provide a brief, supportive response."},
                {"role": "user", "content": entry.content}
            ],
            temperature=0.7,
            max_tokens=150
        )
        
        return {
            "analysis": sentiment_analysis.choices[0].message.content,
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/meditation")
async def get_meditation_prompt(api_key: str = Depends(get_api_key)):
    try:
        meditation = await openai.ChatCompletion.acreate(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Generate a calming, mindful meditation prompt for relaxation and mental well-being."},
                {"role": "user", "content": "Generate a short meditation prompt"}
            ],
            temperature=0.7,
            max_tokens=200
        )
        return {"prompt": meditation.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
