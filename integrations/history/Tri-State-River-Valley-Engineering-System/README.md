# PTDT v32 Sovereign Hydrodynamic Pipeline

This project implements a high-performance hydraulic modeling and regulatory package generation pipeline for Point Township Section 35.

## Architecture

- **Frontend/API Gateway**: React + Node.js (Vite/Express) running on port 3000.
- **Archimedes Engine**: Python (FastAPI) running on port 8000, handling fluid mechanics and regulatory artifact generation (PDF/JSON/CSV).

## Core Components

### Archimedes Engine (`archimedes_engine.py`)
The canonical source of truth for:
- **Hydraulic Simulations**: Manning's formula based open-channel velocity calculations.
- **Regulatory Compliance**: IDNR 312 IAC 10-5 compensatory storage enforcement (1.20x safety factor).
- **Artifact Generation**: PE Transmittal letters, No-Rise Certifications, and FEMA BCA data packages.

### Dashboard UI
A sophisticated real-time monitoring and control interface for managing the hydro pipeline and generating regulatory artifacts.

## Quick Start

### Local Development (Python Engine)
```bash
pip install -r requirements.txt
python archimedes_engine.py
```

### Local Development (Node Frontend)
```bash
npm install
npm run dev
```

### Docker Deployment
```bash
docker-compose up --build
```

## CI/CD
The project uses GitHub Actions for:
- **Node.js**: Linting and building the frontend.
- **Python**: Verifying the Archimedes engine core and regulatory dependencies.
- **Databricks**: CD pipeline for DLT asset bundle deployment.
