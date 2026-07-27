.PHONY: engine ui install-py install-node package health compose-up compose-down check-navd88 ci-package

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
