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

# Ollama API base URL
OLLAMA_API_BASE = "http://localhost:11434"
current_model = "llama3.2"  # default model

@app.get("/models")
def list_models():
    try:
        response = requests.get(f"{OLLAMA_API_BASE}/api/tags")
        response.raise_for_status()
        models = response.json().get("models", [])
        return {"models": [m["name"] for m in models]}
    except Exception as e:
        return {"error": str(e), "models": []}

@app.get("/current-model")
def get_current_model():
    return {"model": current_model}

@app.post("/set-model")
async def set_model(request: Request):
    global current_model
    data = await request.json()
    model = data.get("model")
    if model:
        current_model = model
        return {"message": f"Model set to {current_model}"}
    return {"error": "No model specified"}

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    user_message = body.get("message", "")

    payload = {
        "model": current_model,
        "messages": [{"role": "user", "content": user_message}],
        "stream": False
    }

    try:
        response = requests.post(f"{OLLAMA_API_BASE}/api/chat", json=payload)
        response.raise_for_status()
        response_data = response.json()
        return {"response": response_data.get("message", {}).get("content", "")}
    except Exception as e:
        return {"error": str(e)}
