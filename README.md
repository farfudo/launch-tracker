# NextRocketLaunch

Aplicação web de portefólio para descobrir e acompanhar lançamentos espaciais. Anteriormente Launch Tracker / LaunchSkyline; o repositório conserva o nome `launch-tracker`.

[Demonstração pública](https://launch-tracker-beryl.vercel.app/) · [Documentação da API](https://launch-tracker-ie09.onrender.com/docs)

Para acompanhar os commits, decisões, dificuldades encontradas e soluções, consultar a [evolução técnica e histórico explicado](docs/PROJECT_EVOLUTION.md), preparada como apoio à apresentação do projeto.

## Funcionalidades

- Calendário global, pesquisa e filtros por agência/veículo; contagem decrescente para a data prevista, não telemetria.
- Detalhes de missão, veículo, local, plataforma, janela e estado, com cores e texto.
- Favoritos neste navegador, sem conta ou sincronização entre dispositivos.
- Português, inglês e espanhol; descrições externas mantidas no idioma original.
- Horários UTC, do local de lançamento e do visitante, incluindo horário de verão.
- Imagens com crédito/licença e ilustração de recurso quando indisponíveis.
- «Watch here» com opções colapsadas, ligadas a canais oficiais ou independentes; disponibilidade de direto não garantida.
- Adicionar ao calendário; modo claro predefinido e opção escura com preferência persistida.
- Em revisão local: «Descobertas», um hub compacto com laboratório visual de motores, materiais e reabastecimento, guia Artemis em página própria e biblioteca de fontes oficiais; não é um feed automático de notícias. Pesquisa e limites em `docs/DISCOVERIES_REDESIGN.md`.

Os dados vêm da Launch Library 2 e são guardados em PostgreSQL. A sincronização agendada é independente de visitas/deploys. Datas podem mudar; a interface mostra a hora de atualização. O alojamento gratuito da API pode demorar a iniciar após inatividade. Alertas automáticos e telemetria ainda não estão implementados.

## Arquitetura

```text
Visitante → Next.js / TypeScript (Vercel) → FastAPI / Python (Render) → PostgreSQL (Neon)
GitHub Actions → Launch Library 2 → dados normalizados no PostgreSQL
```

- `apps/web`: interface e testes de componentes/browser.
- `services/api`: API, normalização, persistência, migrações e testes.
- `.github/workflows`: validação e sincronização.
- `docs`: decisões, operações e aprendizagem.

## Desenvolvimento local

Pré-requisitos: Node.js 22.12+ (linha 22) ou 24+, Python 3.12+, Docker com Compose.

Na raiz:

```sh
docker compose up -d postgres
```

Num terminal para a API:

```sh
cd services/api
python3 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Noutro terminal para a interface:

```sh
cd apps/web
npm ci
npm run dev
```

Interface: `http://localhost:3000`. API: `http://localhost:8000/docs`. PostgreSQL local: porta 5433. Para preencher a base **local**, executar `python -m app.sync` em `services/api`, com o ambiente virtual ativo e respeitando os limites da fonte. Sem sincronização, o calendário pode estar vazio.

`DATABASE_URL` configura a base da API; `API_BASE_URL` configura a API usada pelo servidor Next.js. Nunca guardar credenciais no Git nem usar a base pública para ensaios. A configuração Docker local contém credenciais de desenvolvimento, não adequadas a produção.

## Testes

API, em `services/api`, com o ambiente virtual ativo:

```sh
python -m pip install -e '.[dev]'
python -m ruff --version
python -m ruff check app tests
DATABASE_URL=sqlite:// python -m pytest
```

Usar Python 3.12, como na CI. Ruff está fixado em 0.17.2 e as regras estão explícitas no `pyproject.toml`; reinstalar as dependências de desenvolvimento ao atualizar o projeto evita usar uma versão global diferente. Os testes acima usam SQLite em memória, sem sincronizar a fonte ou aceder à base de produção; não substituem ensaios de concorrência PostgreSQL.

A bateria adicional `tests_postgres` usa exclusivamente uma base descartável local, com schemas isolados e migrações Alembic reais. O job dedicado da CI inicia PostgreSQL 17 sem segredos de produção. Para executar localmente, consultar [a revisão dos testes PostgreSQL](docs/POSTGRES_CI_REVIEW.md). Nunca apontar estes testes ao Neon: criam e removem apenas os schemas de ensaio na base dedicada.

Interface, em `apps/web`:

```sh
npm test
npm run build
```

### Percurso completo no browser (E2E)

```sh
cd apps/web
npm ci
npx playwright install chromium
npm run build
npm run test:e2e
```

Playwright inicia uma API fictícia na porta 3301 e uma compilação de produção do Next.js na 3300, ambas em `127.0.0.1`. As portas têm de estar livres; não reutiliza servidores existentes. Não precisa de Docker, Neon, credenciais ou chamadas à Launch Library. Recursos externos do browser são bloqueados.

O percurso corre em Chromium desktop e móvel: pesquisa/filtros → missão → favorito persistido → opções de transmissão → idioma persistido → tema persistido → remover favorito. Os dados fictícios incluem duas missões estáveis. Isto valida a interface com um contrato simulado, **não substitui** os testes da API/base real nem a verificação de produção. Não cobre todos os browsers ou toda a acessibilidade.

Relatório: `npx playwright show-report`. Evidência em `test-results/` e `playwright-report/`, ignorada pelo Git. O CI está preparado para executar os percursos e guardar relatórios; a nova etapa no GitHub só poderá ser validada depois do push.

## Publicação e colaboração

Consultar [DEPLOYMENT.md](docs/DEPLOYMENT.md) para Docker e alojamento. A sincronização usa `NEON_DATABASE_URL` (segredo) e `SYNC_ENABLED=true` (variável). A execução automática `39809464415` importou 100 lançamentos; isso não garante pontualidade de futuras execuções.

Fluxo: rascunho local → testes/preview → aprovação → confirmação separada para push. As integrações Vercel/Render podem publicar automaticamente após um push.

[Especificação](SPEC.md) · [Tarefas](docs/TASKS.md) · [Diário de aprendizagem](docs/LEARNING_LOG.md)
