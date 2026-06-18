@echo off
set SERVICE=%1
if "%SERVICE%"=="" set SERVICE=backend

docker compose exec -it %SERVICE% sh
