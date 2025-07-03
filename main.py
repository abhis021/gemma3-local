from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

# Enable CORS for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)

OLLAMA_API_URL = "http://localhost:11434/api/chat"

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    user_message = body.get("message", "")

    payload = {
        "model": "gemma3",
        "messages": [{"role": "user", "content": user_message}],
        "stream": False
    }

    response = requests.post(OLLAMA_API_URL, json=payload)
    response_data = response.json()
    return {"response": response_data.get("message", {}).get("content", "")}

