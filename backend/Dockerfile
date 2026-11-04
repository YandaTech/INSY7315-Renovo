# Base shared stage
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Development stage 
FROM base AS dev
COPY . .
EXPOSE 8000
# Migrate the database, then start the API
CMD ["sh", "-c", "python -m app.migrate && exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]

# Production stage 
FROM base AS prod
COPY . .
EXPOSE 8000
# Requests reach uvicorn through Caddy and nginx, so the TCP peer is always
# a proxy. --proxy-headers takes the visitor's IP from X-Forwarded-For, but
# only when the peer is on a Docker network (Docker's private address
# pools); the backend publishes no port, so nothing else can reach it.
# The login rate limit and the audit log rely on this IP.
ENV FORWARDED_ALLOW_IPS="172.16.0.0/12,192.168.0.0/16"
# Migrate the database, then start the API
CMD ["sh", "-c", "python -m app.migrate && exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips \"$FORWARDED_ALLOW_IPS\""]