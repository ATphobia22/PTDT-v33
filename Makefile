# =============================================================================
# TRI-STATE FAMILY ENGINEERING SYSTEM (PTDT v32 / TUCKER OS)
# Master Monorepo Orchestration Makefile
# Anchor Node: 13101 Bonebank Road, Point Township, Posey County, Indiana
#
# Mapped from Master Monorepo Integration PDF → LIVE repo paths only.
# Canonical engine: archimedes_engine.py (not 02_mathematical_core/* stubs)
# =============================================================================

.PHONY: all init-infra backend frontend engine ui test clean package vault-backup \
	ci-gate install-py install-node health compose-up compose-down check-navd88 \
	ci-package docker-build docker-verify-archimedes docker-verify

# Default: infra (optional) + package hard gate + NAVD88 check
all: package ci-gate

# -----------------------------------------------------------------------------
# 1. Initialize Sovereign Edge Infrastructure (Redis LangCache & ChromaDB)
# -----------------------------------------------------------------------------
init-infra:
	@echo "[+] Initializing Sovereign Edge Infrastructure (Redis & ChromaDB)..."
	docker compose -f workspace/archimedes_console/infra/docker-compose.yml up -d
	@echo "[+] Redis :6379 | Chroma host :8001"

# -----------------------------------------------------------------------------
# 2. Python Sovereign Mathematical Core & FastAPI Backend (port 8000)
# -----------------------------------------------------------------------------
install-py:
	python3 -m pip install -r requirements.txt

backend: engine

engine: install-py
	@echo "[+] Starting PTDT v32 Sovereign Core & FastAPI Gateway on port 8000..."
	python3 archimedes_engine.py

# -----------------------------------------------------------------------------
# 3. Compile Unified Regulatory PDF & BCA Evidence Package
# -----------------------------------------------------------------------------
package: install-py
	@echo "[+] Compiling Certified LOMA, No-Rise PDF, and BCA JSON Bundles..."
	python3 -c "from archimedes_engine import generate_unified_regulatory_package; import json; print(json.dumps(generate_unified_regulatory_package('05_final_portal_package'), indent=2))"

# -----------------------------------------------------------------------------
# 4. Continuous Integration Hard Gates & NAVD 88 Datum Verification
# -----------------------------------------------------------------------------
ci-gate: install-py
	@echo "[+] Executing CI Hard Gates & NAVD 88 Vertical Datum Verification..."
	python3 -c "from archimedes_engine import generate_unified_regulatory_package, ArchimedesEngine; e=ArchimedesEngine(); assert e.base_flood_elevation_ft==375.0; assert e.lowest_adjacent_grade_ft==377.2; r=generate_unified_regulatory_package('ci_package_out'); assert r['status']=='success'; print('Package OK', r['checksum'][:16])"
	python3 python/navd88_hard_check.py ci_package_out/bca_elevation_data.json
	@echo "[+] ci-gate PASSED"

ci-package: ci-gate

check-navd88:
	python3 python/navd88_hard_check.py 05_final_portal_package/bca_elevation_data.json

# -----------------------------------------------------------------------------
# 5. Physical Vault Backup & Cryptographic Receipt Sealing
# -----------------------------------------------------------------------------
vault-backup:
	@echo "[+] Executing Sovereign Vault Backup & SHA-256 Sealing..."
	python3 archimedes_console/deploy_and_backup.py

# -----------------------------------------------------------------------------
# 6. Frontend (React / Vite dashboard)
# -----------------------------------------------------------------------------
install-node:
	npm ci

frontend: ui

ui: install-node
	@echo "[+] Starting dashboard on port 3000..."
	npm run dev

# -----------------------------------------------------------------------------
# 7. Docker / Compose
# -----------------------------------------------------------------------------
compose-up:
	docker compose up --build

compose-down:
	docker compose down

health:
	curl -sS http://127.0.0.1:8000/api/v1/health | python3 -m json.tool

docker-build:
	@if grep -qi databricksruntime environment/Dockerfile; then echo "FAIL: slim Dockerfile required"; exit 1; fi
	docker build -f environment/Dockerfile -t archimedes-engine:local .
	docker build -t web-app:local .

docker-verify-archimedes:
	@if grep -qi databricksruntime environment/Dockerfile; then echo "FAIL: slim Dockerfile required"; exit 1; fi
	docker build -f environment/Dockerfile -t archimedes-engine:local .
	-docker rm -f archimedes-local-verify 2>/dev/null || true
	docker run -d --name archimedes-local-verify -p 8000:8000 archimedes-engine:local
	@for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do \
		if curl -sf http://127.0.0.1:8000/api/v1/health >/tmp/archimedes_health.json 2>/dev/null; then \
			cat /tmp/archimedes_health.json; \
			grep -q ONLINE /tmp/archimedes_health.json; \
			echo "docker-verify-archimedes OK"; \
			docker stop archimedes-local-verify; \
			exit 0; \
		fi; \
		echo "waiting $$i"; sleep 2; \
	done; docker logs archimedes-local-verify; docker stop archimedes-local-verify; exit 1

docker-verify: docker-verify-archimedes
	docker build -t web-app:local .
	docker compose config -q
	@echo "docker-verify OK"

# -----------------------------------------------------------------------------
# 8. Tests / Clean
# -----------------------------------------------------------------------------
test: ci-gate
	@echo "[+] Core regulatory + datum gates only (no Databricks DLT)"

clean:
	@echo "[+] Cleaning temporary caches and build artifacts..."
	rm -rf .venv __pycache__ .pytest_cache ci_package_out
	rm -f 05_final_portal_package/*.tmp 2>/dev/null || true
	-docker compose -f workspace/archimedes_console/infra/docker-compose.yml down 2>/dev/null || true
	-docker compose down 2>/dev/null || true
