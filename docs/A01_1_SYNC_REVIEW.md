# A01.1 — revisão local (26/10/2026)

Base: `A01_SYNC_DIAGNOSIS_2026-10-26.md`. Sem commit, push, deploy, sincronização real ou configuração de produção alterada.

Após revisão, o utilizador autorizou commit e push em 26/10/2026. Esta autorização permite os deploys automáticos associados ao push, mas não ativa o cron Cloudflare. Os resultados de CI/deploy e o orçamento real de 90 s continuam por confirmar; a ativação do cron exige aprovação separada.

## Configuração esperada

| Processo | SYNC_MIN_INTERVAL_SECONDS | SYNC_FALLBACK_MIN_AGE_SECONDS |
| --- | --- | --- |
| API/Render, chamada pelo Worker | 2700 ou omisso | **Omisso**, herda 2700 |
| CLI GitHub, incluindo dispatch | 2700 | 5400 |
| Worker | Não utiliza | Não utiliza |

O intervalo global mantém os limites 900–86400 segundos. A nova variável aceita valores entre esse intervalo e 86400; configuração inválida falha antes do lock/rede. Omiti-la preserva o comportamento anterior, incluindo um intervalo global de 5400.

Ordem preservada: lock PostgreSQL → reserva existente → idade dos dados → reserva durável antes da rede → consulta → gravação. Skip não escreve reservas/timestamps. O fallback elegível aos 90 min reserva apenas 45 min após sucesso/falha; Retry-After superior prevalece globalmente. Reservas antigas não são encurtadas. Sem migração nova. Cron GitHub, serialização, segredo e timeout de cinco minutos intactos.

`stale` mantém seis horas; `last_updated_at` continua a indicar importação, não alteração semântica. A01.1 não corrige sozinho a ausência de cron principal.

## Worker

Código de execução inalterado: POST único, destino fixo, redirects recusados, token e timeout 90 s. Contrato aceita importação positiva ou skip in_progress/recently_updated/retry_wait. Novo teste verifica 90000 ms, sinal de cancelamento, erro sanitizado correlacionado e ausência de repetição, com fetch/abort simulados. Não prova cancelamento no servidor.

Não aumentar timeout sem medição: arranque lento + dois pedidos LL2 + pausa de retry + base podem exceder 90 s. Timeout por operação não é orçamento global. Falta validar importação naturalmente elegível em produção; perante timeout, cruzar logs/base antes de repetir.

## Verificação

- API: 67 testes, incluindo 22 de sync; sem pedidos reais LL2.
- PostgreSQL 17.11 isolado: 12 testes (5 de integração e 7 de proteção), esquemas descartáveis/migrações reais, sem Neon.
- Worker: 27 testes Node. Ruff e git diff --check sem erros.
- Fronteiras 89:59/90:00 e 44:59/45:00, falhas/Retry-After numérico/data, configuração inválida, contrato anterior, reservas herdadas, concorrência entre sessões fallback/principal e skip sem escrita cobertos.
- Aviso preexistente Starlette/httpx, sem dependências alteradas.
- Dificuldade: base temporária inicial SQL_ASCII devolvia bytes na versão do servidor (cinco erros de preparação). Recriar apenas a base descartável em UTF-8 resolveu-os; aplicação não precisou de ajuste.

## Ativação/aceitação — por autorizar

1. Publicar API/workflow coordenadamente após aprovação e confirmar variáveis da tabela. Não definir fallback no Render; sem migração nova.
2. Confirmar contrato da versão ativa Worker, incluindo retry_wait, sem substituir desnecessariamente. Diagnóstico recomenda um único cron principal horário `17 * * * *` UTC, mantendo GitHub `23 * * * *` como fallback. Criar cron exige autorização própria; não foi criado.
3. Observar slots naturais: mesmo run_id started/completed, importação positiva e atualização pública compatível; cruzar GitHub para atribuir causalidade. Skip não comprova importação. Esperar reservas herdadas sem as apagar.
4. Exigir três ciclos horários consecutivos e rever 24 h: principal importa, fallback saudável ignora sem GET LL2, sem duplicados no período protegido; rever duração/falhas/429. Fallback real apenas se ocorrer naturalmente ou em ensaio autorizado, sem desligar o principal para forçar prova.
5. A01 permanece aberto até comprovar cadência/orçamento; a mudança não garante pontualidade GitHub nem disponibilidade externa.

## Rollback

Mediante autorização, remover somente o cron principal eventualmente criado, confirmar ausência e considerar propagação/invocações em curso. Restaurar código/configuração anterior: GitHub intervalo 5400 sem nova variável; API intervalo 2700/omisso. Worker não mudou. Não apagar sync_control, dados/segredos nem fazer downgrade. Recupera comportamento anterior, incluindo atrasos conhecidos; não desfaz importações concluídas.
