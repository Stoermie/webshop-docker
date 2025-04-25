FROM python:3.10-slim

WORKDIR /app

# 1) Requirements kopieren und installieren
COPY requirements.txt ./
RUN pip install --upgrade pip setuptools \
 && pip install --no-cache-dir -r requirements.txt \
 && pip install httpx

# 2) Restlichen Code kopieren
COPY . .

# 3) Port freigeben
EXPOSE 8003

# 4) Server starten
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003", "--reload"]
