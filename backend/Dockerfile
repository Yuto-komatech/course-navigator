FROM ghcr.io/astral-sh/uv:python3.14-alpine

ENV UV_COMPILE_BYTECODE=1 PYTHONUNBUFFERED=1
ENV UV_PROJECT_ENVIRONMENT=/backend_app/.venv

WORKDIR /backend_app

ENV PATH="/backend_app/.venv/bin:$PATH"

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

COPY . .
CMD ["tail", "-f", "/dev/null"]

