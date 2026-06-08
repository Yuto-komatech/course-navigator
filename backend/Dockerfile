FROM ghcr.io/astral-sh/uv:0.5.24-debian-slim

ENV UV_COMPILE_BYTECODE=1 PYTHONUNBUFFERED=1

WORKDIR /app

ENV PATH="/app/.venv/bin:$PATH"

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

COPY . .
CMD ["uv", "run", "python", "app.py"]

