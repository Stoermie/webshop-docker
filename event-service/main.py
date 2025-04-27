# event_bus/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI(title="Event Bus")

# CORS, damit Frontend (falls nötig) und alle Services posten dürfen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

# Liste der Service-Endpunkte, die wir benachrichtigen wollen
SERVICE_ENDPOINTS = [
    "http://catalog-service:8000/events",
    "http://customer-service:8001/events",
    "http://cart-service:8002/events",
    "http://order-service:8003/events",
]

@app.post("/events")
async def receive_event(request: Request):
    """
    Empfängt ein Event und leitet es an alle Microservices weiter.
    """
    event = await request.json()
    async with httpx.AsyncClient() as client:
        for url in SERVICE_ENDPOINTS:
            try:
                # fire-and-forget
                await client.post(url, json=event, timeout=5.0)
            except Exception as e:
                # Fehler beim Senden darf den Bus nicht stoppen
                print(f"⚠️ Fehler beim Senden an {url}: {e}")
    return {"status": "OK"}
