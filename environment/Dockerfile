# Sovereign Archimedes engine — local / compose (no Databricks, no private clones)
FROM python:3.10-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgeos-c1v5 \
    libproj25 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

# Fast health: do not block startup on PDF package generation.
# Generate packages via: python -c "from archimedes_engine import generate_unified_regulatory_package; ..."
# or POST /api/v1/package/generate
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD curl -sf http://127.0.0.1:8000/api/v1/health || exit 1

CMD ["uvicorn", "archimedes_engine:app", "--host", "0.0.0.0", "--port", "8000"]
