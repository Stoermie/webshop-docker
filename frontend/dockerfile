# frontend/Dockerfile

# ─── Builder ─────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit --no-fund

COPY . ./
RUN npm run build

# ─── Dev (Hot‑Reload) ─────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app

# Build‑Artefakte und node_modules übernehmen
COPY --from=builder /app /app

# Umgebungsvariablen für sauberen Dev‑Output
ENV CHOKIDAR_USEPOLLING=true \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NODE_OPTIONS=--no-deprecation

CMD ["npm", "start"]

# ─── Production (Nginx) ──────────────────────
FROM nginx:stable-alpine AS production
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*
COPY --from=builder /app/build ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
