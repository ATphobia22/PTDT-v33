# Optional `backend/` stack

The **canonical** regulatory path is root `archimedes_engine.py` + root `requirements.txt` + `environment/Dockerfile`.

`backend/` is an **optional** expanded FastAPI layout (plugins, OpenMI stubs, routers). It is **not** required for:

- CI python-engine job  
- Archimedes health on :8000  
- Draft PDF package generation  

Use `backend/` only when intentionally developing extended services. Install with `backend/requirements.txt` in a separate venv.
