#!/bin/sh
SERVICE=${1:-backend}
docker compose exec -it "$SERVICE" sh
