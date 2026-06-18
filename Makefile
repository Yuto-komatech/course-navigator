SERVICE ?= backend

.PHONY: shell
shell:
	docker compose exec -it $(SERVICE) sh
