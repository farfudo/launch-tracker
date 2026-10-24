# PostgreSQL real na CI — revisão local

## Objetivo

Complementar os testes rápidos SQLite com as garantias específicas do PostgreSQL: migrações reais, advisory lock entre sessões, reserva persistida durante pedido externo, preservação dos dados e Retry-After. Sem alterar a sincronização da aplicação nem usar Neon.

## Isolamento

Novo job `PostgreSQL migrations and synchronization` em `.github/workflows/ci.yml`, com serviço PostgreSQL 17, utilizador/base dedicados e credenciais exclusivamente de ensaio. Health check aguarda prontidão; o GitHub elimina o serviço no final. Sem secrets de produção ou volumes persistentes.

Os testes exigem `POSTGRES_TEST_URL`, sem fallback para `DATABASE_URL`. Aceitam apenas driver `postgresql+psycopg`, host loopback, utilizador `launch_test`, base `launch_tracker_test` e URL sem parâmetros adicionais. Cada teste de integração cria um schema aleatório próprio, aplica Alembic e elimina apenas esse schema no final. Estes limites reduzem o risco de atingir outro alvo; não transformam uma base de produção local com esse nome numa base segura. Usar exclusivamente a instância descartável dedicada.

O import da aplicação usa `DATABASE_URL=sqlite://`; subprocessos Alembic recebem explicitamente o destino de ensaio e o search_path do schema. Sem `Base.metadata.create_all` para preparar PostgreSQL: a cadeia de migrações tem de funcionar realmente.

## Casos verificados

1. Upgrade inicial completo, repetição de upgrade sem perda de dados, downgrade da última migração e novo upgrade preservando uma missão e os links JSON. Não é ensaio de reversão de todas as migrações.
2. Duas sessões reais: uma mantém advisory lock e a outra recebe `in_progress`, sem chamar o fornecedor; após rollback o lock fica disponível.
3. Primeira sincronização aguarda um fornecedor simulado numa thread; segunda sessão observa a reserva já persistida e não faz outro pedido. A primeira termina e a base regista sucesso.
4. Falha 429 simulada: missão e timestamp anteriores preservados, estado failed e Retry-After persistidos e observáveis numa sessão nova; nova chamada respeita `retry_wait`.
5. Testes de segurança rejeitam hosts externos, base/utilizador diferentes, driver alternativo e parâmetros de ligação adicionais.

Não são testes de carga, de todas as interleavings possíveis, recuperação após crash ou concorrência entre múltiplos servidores reais. As falhas de rede do fornecedor são simuladas; não se fazem pedidos à Launch Library.

## Reprodução local

Com Python 3.12, dependências `.[dev]` e PostgreSQL 17 descartável já iniciado na porta local de ensaio:

```sh
cd services/api
python -m ruff check app tests tests_postgres
DATABASE_URL=sqlite:// \
POSTGRES_TEST_URL=postgresql+psycopg://launch_test:local_test_only@127.0.0.1:55441/launch_tracker_test \
python -m pytest tests tests_postgres -q
```

Sem `POSTGRES_TEST_URL`, a bateria de integração falha em vez de passar silenciosamente. Os testes unitários normais continuam a correr sem PostgreSQL. As credenciais acima são exemplos locais descartáveis, não credenciais da aplicação pública.

## Revisão e publicação

Este incremento não muda a interface. A demonstração funcional são os resultados locais e a configuração do job. Recomenda-se manter SQLite rápido e PostgreSQL num job separado; alternativa: concentrar as duas baterias num único job, mas torna o diagnóstico menos claro.

Estrutura aprovada e push autorizado pelo utilizador, incluindo o resumo lateral anterior `c7774bc`. O job só pode ser declarado validado remotamente depois de a nova CI terminar. Não foi executada sincronização ou migração de produção.

## Resultado local

65 testes passaram: 54 existentes, quatro integrações com PostgreSQL real e sete verificações de destino. Ruff 0.17.2 passou; Python 3.12.15 e PostgreSQL 17 num contentor descartável loopback, sem volumes. A estrutura YAML foi lida com sucesso e o job identificado; isto não substitui a execução no GitHub. Confirmados zero schemas `test_*` depois dos testes; contentor exclusivo encerrado e removido. Fica apenas o código dos ensaios, não os dados temporários.

O aviso já conhecido do TestClient permanece não bloqueante. Não houve alterações web, pelo que testes web/build/E2E não foram repetidos neste incremento. A base em produção não foi consultada ou modificada. O roadmap local foi atualizado mas mantém-se excluído do envio.
