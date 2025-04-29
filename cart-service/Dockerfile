# ─── Builder ─────────────────────────────────
FROM python:3.10-slim AS builder
WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip setuptools \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

# ─── Runtime ─────────────────────────────────
FROM python:3.10-slim
WORKDIR /app

# Nur die Libs und den App-Code kopieren
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /app /app

EXPOSE 8002
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
