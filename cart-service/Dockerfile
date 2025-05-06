# ─── Base Image ─────────────────────────────────
FROM python:3.10-slim
WORKDIR /app

# 1) Abhängigkeiten installieren (nur bei Änderungen in requirements.txt)
COPY requirements.txt .
RUN pip install --upgrade pip setuptools \
    && pip install --no-cache-dir -r requirements.txt

# 2) Applikationscode kopieren (wird bei jedem Build geupdated)
COPY . .

# 3) Port und EntryPoint
EXPOSE 8002
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
