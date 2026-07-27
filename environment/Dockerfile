# Sovereign Archimedes engine — local / compose (no Databricks, no private clones)
FROM python:3.10-slim-bookworm

WORKDIR /app

# Minimal system deps for shapely / geopandas wheels when needed
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

# Default: run package generation once, then serve FastAPI
CMD ["python3", "archimedes_engine.py"]
