# Worker de sincronização — revisão local de diagnóstico

Revisão A01.1 (26/10/2026): execução do Worker inalterada. Contrato verificado inclui skip `retry_wait`, além de `in_progress` e `recently_updated`. 27 testes simulados passaram, incluindo argumento de timeout 90000 ms, aborto sanitizado e ausência de novo POST. Esse teste não comprova que 90 s chegam para cold start + importação real, nem que desconexão cancela o servidor. API deverá usar intervalo global 2700/sem override; só GitHub define idade mínima 5400. Ativação/configuração e validação natural continuam pendentes: `docs/A01_1_SYNC_REVIEW.md`. As secções abaixo preservam o histórico dos ensaios.

Ficheiro para o editor Cloudflare: `sync-worker.mjs`. Testes locais, sem rede ou token real:

```sh
node --test infra/cloudflare/sync-worker.test.mjs
```

O segredo `SYNC_TOKEN` é configurado diretamente no serviço; nunca copiar o valor para código/Git/chat. O destino HTTPS é fixo e redirecionamentos são rejeitados. Pedidos públicos ao Worker devolvem 405, não sincronizam. Apenas o handler agendado faz um POST, com limite de 90 segundos para acomodar o arranque do Render, sem repetições automáticas. Um timeout não demonstra se o servidor terminou ou não a operação; verificar os registos e a cache antes de uma nova tentativa.

Resultados esperados: importação ou skip (`in_progress` / `recently_updated`). A revisão local regista `source=cloudflare-worker`, `run_id`, `scheduled_at` e `phase=started`, seguidos de `completed` com importados/skip/motivo ou `failed` com erro genérico. Exceções e corpos de resposta não são registados. A proteção entre processos reside no PostgreSQL da API, não no Worker.

## Estado comprovado em 23 de outubro de 2026

- A versão anterior `c32d5571` foi publicada com aprovação, sem Cron Trigger; o endereço público devolveu 405.
- Foi clicado uma vez o teste Schedule do editor, que mostrou GET `__scheduled`, sem resultado explícito. Isso não comprova execução do handler.
- A atualização pública `2026-10-23T10:16:36.402706Z` coincidiu com a execução GitHub Actions `39937872392`, evento schedule, cujo registo confirmou `Imported 100 launches.`. Não atribuir essa atualização ao Worker.
- Esta revisão de diagnóstico é apenas local; não foi publicada nem enviada para GitHub.

## Critérios para o próximo teste

### Correção de compatibilidade de redirecionamentos (rascunho)

O segundo teste, versão `c10d43fc`, executou às 15:20 de Lisboa com `transport_failed`, run_id `d52af566-c8ee-456b-a689-ecffc6d9c4dd`. O cron `20 14 23 10 *` foi removido e o acompanhamento eliminado. A API continuava com atualização 10:16:36Z; não foi observada uma nova importação.

Reprodução local com Miniflare/workerd `1.20260730.1`: `new Request(..., {redirect: "error"})` lança `TypeError: Invalid redirect value`, antes de qualquer tráfego. `manual` é aceite. Os testes Node anteriores não detetaram isto porque o fetch simulado não construía um Request no runtime Workers.

A revisão atual usa `redirect: "manual"` e rejeita explicitamente qualquer 3xx com `redirect_rejected`. Não segue Location, não reenvia o token e não regista o destino. 25 testes Node passaram. O código completo foi também exercitado em Miniflare: resposta simulada 200 deu started/completed; 302 deu started/failed com redirect_rejected; um único pedido simulado em cada caso, sem rede externa. Isto corrige um defeito reproduzido de compatibilidade; a validação com a API real e os segredos reais continua pendente. Nenhuma publicação ou nova sincronização foi executada nesta revisão.

Referência: https://developers.cloudflare.com/workers/runtime-apis/request/ — consultar também as limitações de redirect do runtime. A documentação consultada apresentou versões divergentes sobre `error`; a reprodução no workerd foi a evidência decisiva.

### Revisão local após o teste real falhado

O cron de 23/10 executou a versão `192a45a0` e registou `sync_failed` (run_id `ff0e34ce-3879-4dbf-808f-dfc2abc8fd67`), com wall time de 2 ms. O cron temporário foi removido e guardado. A pesquisa dos logs Render por `/sync` nas quatro horas que abrangem o teste não encontrou resultados; isto é evidência limitada, não prova absoluta de ausência de pedido. A causa original continua por confirmar.

A revisão atual, ainda não publicada, preserva apenas categorias controladas: `configuration_invalid`, `request_setup_failed`, `transport_failed`, `http_error` (com código HTTP), `invalid_json`, `invalid_result` e `internal_error`. Não regista mensagens arbitrárias, token, comprimento do token, headers ou corpos de resposta. Configuração e preparação do pedido são distinguidas antes do envio. Os testes simulam cada categoria, verificam zero pedidos em falhas de preparação e ausência de repetição nas restantes.

Prévia de falha: `source=cloudflare-worker phase=failed error=http_error http_status=401`, associada ao mesmo `run_id` do início. Um 401 indicaria rejeição de autenticação, não comprova por si só qual configuração está errada. Um erro de transporte não distingue automaticamente DNS, TLS, cancelamento ou timeout.

1. Aprovar e publicar a revisão, ainda sem cron. Publicação e push exigem confirmações separadas.
2. Autorizar separadamente uma única execução real. Se for necessário um Cron Trigger temporário, aprovar previamente o horário UTC exato e a remoção após a primeira ocorrência; não criar um cron periódico como substituto silencioso de um teste único.
3. Procurar `started` e `completed` com o mesmo `run_id` no runtime Cloudflare. `completed` com skip é uma execução válida, mas não uma importação nova. `failed` ou ausência de resultado não valida o teste.
4. Comparar com a API pública e execuções GitHub, sem inferir causalidade apenas pela hora. Um timeout pode deixar o pedido da API em execução: consultar antes de repetir.
5. Só após validação e nova aprovação ativar o horário regular (proposta: minuto 17 UTC). Ajustar o GitHub para fallback por idade dos dados numa alteração separada, com aprovação e testes. O mínimo comum de 45 minutos não implementa sozinho esse fallback.

Os testes Node verificam a lógica com respostas simuladas, incluindo os pares de registos de sucesso, skip e falha. Não constituem prova de execução no runtime Cloudflare ou de autenticação com os segredos reais. Nenhuma sincronização ou publicação é executada pelos testes.
