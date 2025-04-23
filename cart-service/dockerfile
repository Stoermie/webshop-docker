# Beispiel: catalog-service/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# 1) Abhängigkeiten installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2) Quellcode kopieren
COPY . .

# 3) Dev‑Server mit Hot‑Reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002", "--reload"]
