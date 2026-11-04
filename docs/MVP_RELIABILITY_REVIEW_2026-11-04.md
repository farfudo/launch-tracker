# Fiabilidade MVP — rascunho 4/11/2026

Branch codex/mvp-api-reliability; sem commit/push/deploy. Dados públicos só consultados por leitura; simulação com API fictícia na porta 3302 e web 3345.

## Evidência operacional

Monitores 41689856475 (3/11 18:02) e 41616071446 (3/11 10:03): API process passou, database/cache freshness falhou. Syncs 41688955938 (17:56) e 41613557849 (09:45) foram skipped/retry_wait, zero pedidos LL2. Sync 41859411857 (4/11 15:36) também retry_wait. Portanto sucesso do workflow não prova atualização. Não se demonstrou que a API estivesse indisponível nesses dois casos; o sinal foi frescura. Falha de API em 1/11 continua sem causa comprovada. Atrasos do cron observados, sem garantia horária; não se modificaram intervalos, limites LL2 ou thresholds para esconder falhas.

## Reprodução e correção confirmada

Teste novo executado antes da alteração: clicar retry com navigator.onLine=false chamou router.refresh uma vez e apresentou estado de procura. Teste falhou como esperado. Corrigido CacheNotice para manter aviso quando offline, não chamar onRetry/router.refresh e voltar a verificar em eventos online/offline. Mantém limite de seis tentativas e cleanup dos listeners/timer. Dados e metadados de origem não são certificados como recentes por recuperar a ligação. PT/EN/ES existentes reutilizados.

Baseline: 18 testes de cache/frescura passaram. Após correção: 19 testes, TypeScript e ESLint direcionado passaram. Teste inclui retry offline e recuperação por evento online. Sem enfraquecer testes existentes.

## Prévia e limites

API fictícia foi desligada após carregar a lista: missões guardadas permanecem visíveis e a frescura fica não confirmada. Inspeção 390/1440 e loading local; screenshots documentam apresentação, não prova de cold start real Render. Sem NET, countdown, favoritos ou sincronização alterados.

Opções para revisão: manter mensagem existente de frescura não confirmada (implementado) ou futuro texto específico de ligação offline. Para a causa operacional, próximo diagnóstico é ler a razão que criou blocked_until/retry_wait no serviço primário; não contornar o backoff nem forçar LL2. Não está resolvida a origem dos bloqueios nem o SLA do scheduler.
