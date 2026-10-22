# Launch Tracker

Uma aplicação web para descobrir e acompanhar lançamentos espaciais em todo o mundo.

O primeiro objetivo é um MVP de portefólio: calendário global, pesquisa e filtros, e páginas de detalhe com estado, data prevista e fontes oficiais. Alertas, transmissões e telemetria ficam para fases posteriores.

## Estrutura

- `apps/web` — interface Next.js com TypeScript
- `services/api` — API FastAPI e integração futura com Launch Library 2
- `docs` — decisões e planeamento do produto
- `tests` — testes de integração e apoio transversal

## Começar localmente

Pré-requisitos: Node.js LTS e Python 3.12 ou mais recente.

```sh
# Base de dados (opcional nesta primeira etapa; necessária no incremento de persistência)
docker compose up -d postgres

# Interface
cd apps/web
npm install
npm run dev

# Noutro terminal, API
cd services/api
python -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

A interface ficará disponível em `http://localhost:3000`; a documentação da API em `http://localhost:8000/docs`.

Consulte [SPEC.md](SPEC.md) para o âmbito e [docs/TASKS.md](docs/TASKS.md) para as próximas tarefas.

## Demonstração Docker

A interface e a API também têm imagens Docker. O ensaio isolado, as variáveis necessárias e os passos de publicação estão em [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
