.PHONY: engine ui install-py install-node package health compose-up compose-down check-navd88 ci-package docker-build docker-verify-archimedes docker-verify

install-py:
	python3 -m pip install -r requirements.txt

install-node:
	npm ci

engine: install-py
	python3 archimedes_engine.py

package: install-py
	python3 -c "from archimedes_engine import generate_unified_regulatory_package; import json; print(json.dumps(generate_unified_regulatory_package('05_final_portal_package'), indent=2))"

check-navd88:
	python3 python/navd88_hard_check.py 05_final_portal_package/bca_elevation_data.json

health:
	curl -sS http://127.0.0.1:8000/api/v1/health | python3 -m json.tool

ui: install-node
	npm run dev

compose-up:
	docker compose up --build

compose-down:
	docker compose down

ci-package: install-py
	python3 -c "from archimedes_engine import generate_unified_regulatory_package, ArchimedesEngine; e=ArchimedesEngine(); assert e.base_flood_elevation_ft==375.0; r=generate_unified_regulatory_package('ci_package_out'); assert r['status']=='success'; print('OK', r['checksum'][:16])"
	python3 python/navd88_hard_check.py ci_package_out/bca_elevation_data.json

docker-build:
	@if grep -qi databricksruntime environment/Dockerfile; then echo "FAIL: slim Dockerfile required"; exit 1; fi
	docker build -f environment/Dockerfile -t archimedes-engine:local .
	docker build -t web-app:local .

docker-verify-archimedes: docker-build
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
	docker compose config -q
	@echo "compose config OK"
