# A01 — diagnóstico da atualização pública atrasada

Data: 26/10/2026. Repositório analisado: `main`, commit `609cb4a6e7e61314b32d00642e49364bc855b6d2`.

Âmbito: investigação e proposta. Sem alterações ao código, cron, variáveis, segredos ou produção; sem sincronizações manuais, deploy, commit ou push. Este relatório é o único novo documento desta investigação. Todos os horários da linha temporal estão em UTC, incluindo os eventos Cloudflare cuja interface também apresenta horas locais.

## Conclusão

**A configuração de operação está incompleta: não existe atualmente um agendamento no Worker que deveria assumir o papel principal. O único agendamento periódico efetivamente confirmado é o GitHub, configurado no código como recurso, e as suas execuções registadas têm intervalos de várias horas.**

No intervalo crítico de hoje não encontrei execuções GitHub falhadas ou ignoradas: não existem execuções registadas acessíveis entre a conclusão da importação das 07:57 e a criação da execução das 15:19. Nos jobs observados, o runner começou poucos segundos depois de a execução ser criada. Logo, o atraso observado não é explicado por uma fila de runner já criada, pelo tempo de importação, pelo cooldown ou por um erro de gravação nesses jobs.

Isto identifica a falha operacional e a camada onde surge o intervalo. **Não prova a causa interna da geração esparsa dos eventos GitHub**: carga da plataforma, eventos descartados ou outro comportamento do agendador não podem ser discriminados pelos registos disponíveis. Não é correto afirmar que se demonstrou um incidente específico do GitHub.

Durante a investigação houve recuperação espontânea: a execução automática `40348139037` importou 100 lançamentos e a API passou a `last_updated_at=2026-10-26T15:20:07.038970Z`, `stale=false`, mantendo 112 registos. Não foi ação desta investigação; não demonstra resolução da pontualidade.

## 1. Fluxo atual e mecanismos possíveis

```text
GitHub Actions: schedule / workflow_dispatch
    → runner Python → python -m app.sync
    → PostgreSQL: verificar lock, reserva e idade
    → GET Launch Library 2 (até 100 lançamentos)
    → PostgreSQL: upsert + resultado de controlo

Cloudflare Worker: handler scheduled
    → POST HTTPS protegido na FastAPI/Render
    → o mesmo sync_cache e PostgreSQL
    → o mesmo GET LL2 e upsert
    [Atualmente não há Cron Trigger configurado]

Visitante → Next.js/cache pública → GET FastAPI → PostgreSQL
    [Este percurso não inicia sincronização LL2]
```

| Entrada | Capacidade no código | Estado efetivamente verificado |
| --- | --- | --- |
| GitHub `schedule` | `23 * * * *`, ramo principal; job condicionado a `SYNC_ENABLED=true` | Workflow ativo, variável `true`, repositório público não arquivado/não desativado, ramo padrão `main`. Há execuções `schedule`, mas não pontualidade horária. |
| GitHub `workflow_dispatch` | Manual; não depende de `SYNC_ENABLED` | Disponível no ficheiro. Não acionado. Histórico distingue estas execuções das agendadas. |
| CLI `python -m app.sync` | Pode ser chamada num ambiente com acesso à base | Usada pelo GitHub. Nenhuma CLI de produção executada nesta investigação. Não há um temporizador interno na CLI. |
| FastAPI `POST /api/v1/launches/sync` | Exige token; sem configuração responde indisponível, credencial inválida responde 401 | Chave de token configurada no Render, sem ler o valor. Autenticação comprovadamente funcionou no teste Cloudflare de 23/10; não foi repetida hoje. |
| Cloudflare `scheduled` | Faz um único POST, timeout de 90 s, sem repetição do POST; distingue importação/skip/falha | Worker publicado, versão ativa `62974619-7686-47e4-a5f7-486314d1e174`, **sem Cron Triggers**. Não está ativo como agendador periódico. |
| Cloudflare HTTP `fetch` | Devolve 405; não chama `runSync` | GET público devolveu 405 e `Scheduled synchronization only.`. Isto confirma apenas a resposta HTTP, não um agendamento. |
| Arranque/deploy da API | Script de arranque aplica migrações e inicia Uvicorn; código atual não importa LL2 no startup | Nenhum mecanismo de sync no arranque encontrado no código inspecionado. Deploy não é sincronização. |
| Next.js/visitas/cache | Lê os dados persistidos e revalida a sua cópia | Não faz POST de sync nem contacta LL2 para importar. |

Não encontrei outro agendador no repositório. Não foi efetuado inventário de todos os possíveis serviços externos à conta/projeto; não se pode excluir uma chamada administrativa fora dos mecanismos observados.

### Configuração e versões verificadas

- O blob remoto do workflow corresponde exatamente ao local: `0054bedf618a891ecf84cec03fcb3f77aaca71ad`.
- GitHub usa `SYNC_MIN_INTERVAL_SECONDS=5400` (90 min), `timeout-minutes=5`, `cancel-in-progress=false` e grupo `sync-launches-production`.
- Render indica serviço Docker **Free** e último commit publicado `a85b38f`. Não há diferenças entre esse commit e `609cb4a` nos ficheiros de sincronização/repositório/cliente comparados.
- Na página de ambiente Render há chaves `DATABASE_URL` e `SYNC_TOKEN`; a chave `SYNC_MIN_INTERVAL_SECONDS` não está configurada e não há grupos de ambiente disponíveis para ligar. Não foram lidos valores secretos. Com o código e Dockerfile inspecionados, o intervalo aplicável ao serviço é o predefinido **2700 s/45 min**.
- Cloudflare tem o segredo com valor encriptado, logs/invocation logs/persistência ativos e sampling de logs a 100%. Não se abriu o valor do segredo. A secção de triggers mostra literalmente **“No cron triggers configured”**, sem queue consumers.
- A configuração efetiva contradiz o papel descrito no comentário “Fallback only” do workflow: o recurso existe, mas o principal não tem agendamento.

## 2. Linha temporal observada

As execuções seguintes são `event=schedule`. “Importou 100” vem da saída da CLI, não apenas do estado verde do workflow.

| Data | Run GitHub | Execução criada | Log de resultado | Resultado |
| --- | --- | --- | --- | --- |
| 23/10 | `40010855039` | 19:22:06 | 19:22:37 | 100 importados |
| 24/10 | `40112971248` | 16:44:41 | 16:45:28 | Falha com mensagem antiga genérica; categoria não recuperável desse log |
| 24/10 | `40125999826` | 19:35:35 | 19:36:12 | 100 importados |
| 24/10 | `40139243735` | 22:35:51 | 22:36:30 | 100 importados |
| 25/10 | `40150226931` | 01:20:13 | 01:20:46 | 100 importados |
| 25/10 | `40169194973` | 06:28:19 | 06:28:59 | 100 importados |
| 25/10 | `40194079429` | 12:39:32 | 12:40:06 | 100 importados |
| 25/10 | `40214892040` | 17:06:55 | 17:07:29 | 100 importados |
| 25/10 | `40227733571` | 19:47:59 | 19:48:32 | 100 importados |
| 25/10 | `40241317400` | 22:40:42 | 22:41:17 | 100 importados |
| 26/10 | `40254015262` | 01:23:56 | 01:24:32 | 100 importados |
| 26/10 | `40288944017` | 07:56:54 | 07:57:40 | 100 importados |
| 26/10 | `40348139037` | 15:19:10 | 15:20:08 | 100 importados |

Intervalos entre criações de execuções: 6 h 11 min 13 s em 25/10; 6 h 32 min 58 s na manhã de 26/10; **7 h 22 min 16 s** entre as duas últimas. Entre timestamps de importação na API de hoje: **7 h 22 min 27,396 s**.

### Separar agendamento, runner, importação e API

| Marco | Execução `40288944017` | Execução `40348139037` |
| --- | --- | --- |
| Criada / run_started_at | 07:56:54 | 15:19:10 |
| Job no runner iniciado | 07:56:57 | 15:19:13 |
| Etapa Refresh launch cache | 07:57:07–07:57:40 | 15:19:26–15:20:08 |
| Timestamp público de importação | 07:57:39.643240 | 15:20:07.038970 |
| Log Imported | 07:57:40.364 | 15:20:08.467 |

A espera visível até o job começar é cerca de três segundos em ambos. As etapas de importação demoraram aproximadamente 33 e 42 segundos; esses tempos não separam consulta LL2, parsing, acesso à base ou gravações. Não atribuo a diferença a um timeout/retry sem o respetivo registo.

Consulta dirigida da API GitHub no intervalo `2026-10-26T07:57:44Z..2026-10-26T15:19:09Z`: `total_count=0`. Não havia runs queued, failed ou skipped acessíveis nesse intervalo. Registos eventualmente eliminados não são recuperáveis por esta consulta. O campo `created_at` não revela qual instante nominal do cron originou a execução; por isso não se atribui arbitrariamente a execução das 15:19 a um slot específico.

### Estado público e teste Cloudflare

- Auditoria anterior, 26/10 às 14:37Z: 112 registos, atualização 07:57:39.643240Z, `stale=true`.
- Nova leitura HTTP, 26/10 às 15:21:55Z: 112 registos, atualização 15:20:07.038970Z, `stale=false`.
- Os tempos e o log da nova CLI corroboram fortemente a escrita na base que a API serve. A contagem não crescer não indica falha: o upsert atualiza registos existentes e preserva os restantes.
- Teste Cloudflare antigo: cron temporário `0 20 23 10 *`, versão `62974619`, `run_id=fb75fbe5-8000-4753-a19a-4f553b1bfe1f`. Log `started` às **20:00:09.772Z** e `completed` às **20:00:10.586Z**. Resultado: `imported=0`, `skipped=true`, `reason=recently_updated`; runtime `outcome=ok`. É sucesso de invocação/autenticação, **não importação nova**. O cron já não está configurado.
- A vista Cloudflare dos últimos três dias apresentou esse teste e o GET de leitura desta investigação, sem uma sequência horária regular. Não se extrapola para eventos fora da janela/retidos pelo serviço.
- Render, pesquisa por `/api/v1/launches/sync`, últimas 24 h: **No matching logs**. Evidência complementar de ausência de chamadas HTTP observáveis, não prova universal de ausência de tráfego ou de rejeições antes do Render. A CLI GitHub escreve diretamente na base e não deve aparecer como POST nesses logs.

## 3. Causas confirmadas, hipóteses e evidência em falta

| Classificação | Conclusão | Evidência / limite |
| --- | --- | --- |
| Confirmada | O Worker principal não tem agendamento ativo | Configuração autenticada de produção: No cron triggers configured. Handler publicado, por si só, não agenda nada. |
| Confirmada | Os runs GitHub visíveis não ocorrem de hora a hora | Histórico completo acessível consultado, intervalos acima e filtro do intervalo crítico com zero runs. |
| Confirmada | Jobs recentes conseguem importar e a API vê a atualização | CLI Imported 100 e timestamp público temporalmente compatível. Não há indício de avaria persistente da gravação nesses runs. |
| Confirmada | Não são skips da CLI que explicam o intervalo crítico | Os últimos resultados analisados são importações; não há execuções no intervalo para o serviço poder decidir saltar. |
| Confirmada | O workflow não está desativado agora | state=active, SYNC_ENABLED=true, main padrão, atividade recente. A regra de inatividade de 60 dias não explica um repositório ativo criado há poucos dias. Não reconstrói todo o histórico de configurações. |
| Confirmada no código, não causa provada do intervalo | Um sucesso do fallback impõe 90 min de espera também ao principal | O mesmo `interval` controla elegibilidade, reserva e cooldown de sucesso; row partilhada na base. |
| Hipótese compatível | Atrasos/descartes de eventos no agendador GitHub | Documentação admite-os; não há telemetria interna para atribuir o incidente a uma causa específica. |
| Não demonstrada | 429/Retry-After recente, falha LL2 ou lock prolongado causaram o buraco de hoje | Não existem logs de runs nesse buraco; HTTP Worker sem cron. Estado completo atual de `sync_control` não foi consultado diretamente na base. |
| Não demonstrada | Cold start Render originou o intervalo GitHub | Runner GitHub → LL2/Neon não passa pelo Render. Cold start é relevante para Worker → API e frontend, não explica a falta de criação de runs GitHub. |
| Não demonstrada | Falha Neon impediu importações no intervalo | Não há execuções observadas que o comprovem; importações adjacentes chegaram à API. Uma falha transitória não é excluída em absoluto. |

A [documentação GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule) admite atrasos sob carga e eventual descarte. O minuto 23 já evita o início da hora; simplesmente escolher outro minuto não constitui solução demonstrada para estas lacunas. Nenhum evento nominal original foi reconstruído a partir de suposições.

O [Render Free](https://render.com/docs/free#spinning-down-on-idle) suspende serviços sem tráfego e pode demorar a iniciar. O plano Free foi confirmado na interface, mas não se conclui que todo o atraso de um pedido tenha essa origem. Não se recomenda trocar de plano para resolver um agendador GitHub que não iniciou.

## 4. O que significam tentativa, sucesso, alteração e frescura

| Conceito | Representação atual | Limitação |
| --- | --- | --- |
| Disparo de agendamento | Run GitHub criado / evento scheduled Cloudflare | Não é sinónimo de pedido LL2 nem de importação. |
| Última tentativa admitida à fonte | `sync_control.last_attempt_at` | Atualizado ao reservar uma tentativa. Uma entrada que recebe skip não atualiza esse campo. Não é “último disparo”. |
| Próxima tentativa permitida | `sync_control.next_attempt_at` | Limite persistido, não uma tarefa agendada para esse instante. Requer nova invocação posterior. |
| Último resultado admitido | `sync_control.outcome`: attempting/success/failed | Singleton sem histórico/origem; falha posterior substitui success. Pode conservar attempting se o processo morrer. |
| Último sucesso | Sem campo dedicado; inferido de logs e timestamps de lançamentos | Após falha, last_attempt já não informa quando ocorreu o último sucesso. |
| Última importação visível | `max(Launch.source_updated_at)` → `last_updated_at` | O upsert escreve hora local de importação mesmo se valores recebidos forem iguais. Não é timestamp de alteração da LL2. |
| Última alteração real dos valores | Não registada separadamente | Imported 100 não significa 100 missões modificadas. Sem comparação/histórico não se conhece a última alteração semântica. |
| Frescura pública | Sem data ou idade da importação > 21600 s → stale | Global; não prova que cada registo retido esteja atualizado. |
| Cópia frontend | checkedAt e revalidação de 300 s | Confirma leitura da nossa API, não sincronização LL2. O limite de seis horas da cópia é uma política separada. |

Não consultei valores de produção de `sync_control`, ligação de base, tokens ou outros segredos. Não invento último `outcome`, `next_attempt_at` ou origem que o endpoint público não expõe.

### Adequação de stale

Seis horas é aceitável como indicação de degradação grave, mas demasiado permissivo como único sinal para um objetivo horário. Hoje o atraso só se tornou stale após várias oportunidades previstas sem atualização.

Proposta, separada da correção do agendamento:

- Expectativa operacional: atualização aproximadamente horária, não telemetria em tempo real.
- Aviso/alerta de atraso após **duas horas sem sucesso**, com margem para execução e recuperação; valor a validar após observação real.
- Manter as **seis horas** como degradação grave/compatibilidade inicial, sem alterar silenciosamente o significado do contrato existente.
- Erro de sync e atraso não são o mesmo estado: uma tentativa falhada com dados de 15 minutos ainda permite servir dados recentes; ausência de tentativas com dados de cinco horas precisa de aviso mesmo sem job vermelho.
- Monitorização deve observar último sucesso e idade independentemente do agendador principal. Um workflow verde com skip não zera a idade. Não criar nesta etapa outro cron de sincronização apenas para monitorizar.

## 5. Concorrência, orçamento e riscos operacionais

### Proteções corretas a preservar

1. Grupo de concorrência GitHub serializa runs desse workflow, sem cancelar uma importação em curso. Não coordena sozinho com HTTP/Cloudflare.
2. `pg_try_advisory_xact_lock` coordena os dois caminhos que usam a mesma base; recusa motores sem PostgreSQL.
3. Sob lock são verificadas a reserva e a idade; a reserva é confirmada **antes** da rede. Durante a consulta externa, outra ligação vê a espera persistida, mesmo após libertar o lock transacional.
4. Sucesso publica lançamentos e outcome na mesma transação de upsert. Falha preserva dados anteriores e guarda espera; resposta vazia é recusada.
5. Uma única repetição do GET LL2 para timeout/rede/500/502/503/504 sem Retry-After. 429, payload inválido e diretivas Retry-After não são repetidos imediatamente. Não há repetição automática do POST Worker.
6. Worker rejeita redirecionamentos para não reenviar credenciais; GET público não sincroniza. Segredo Worker não dá acesso à base.

### Limites e defeito de política identificado

**A configuração mistura dois conceitos:** “o fallback só deve atuar se os dados tiverem mais de 90 minutos” e “todos os processos devem aguardar 90 minutos após esta tentativa”.

Exemplo derivado do código: GitHub importa às 15:20 com intervalo 5400; guarda uma reserva de sucesso até aproximadamente 16:50. Um principal com intervalo 45 min que tente às 16:17 lê essa reserva e ignora a execução, mesmo que a sua própria política já permitisse tentar. Se só corre à hora certa, pode esperar até 17:17. Isto não demonstra que aconteceu hoje e não explica as 7 h sem runs; é um risco real ao ativar o principal.

**Correção proposta:** separar o mínimo global de consulta (45 min) da idade mínima de elegibilidade específica do fallback (90 min). Não criar dois locks nem permitir que o fallback contorne a reserva. Retry-After continua a prevalecer sobre ambos.

Outros limites:

- O lock não fica mantido durante a rede; a proteção é uma reserva com prazo. Se uma tarefa sobreviver extraordinariamente para além desse prazo, pode haver sobreposição. Não é exactly-once nem lock permanente.
- O timeout HTTP de 30 s é por operação; não representa um teto absoluto de duração total. Workflow tem teto de cinco minutos; o Worker espera 90 s, mas desistir no cliente não comprova cancelamento no servidor.
- Render Free pode consumir parte relevante desses 90 s antes de a API executar a consulta LL2. O teste Cloudflare antigo saiu por dados recentes e não valida uma importação completa após cold start. É necessário testar esse orçamento de ponta a ponta; se ficar curto, propor um ajuste limitado de espera, nunca uma terceira tentativa ou repetição cega do POST.
- Reserva persistida após crash evita tempestade de tentativas, mas pode deixar dados antigos até uma invocação posterior. Não limpar a reserva como primeira reação.
- O GitHub como fallback continua best effort. Mesmo um limiar de 90 min e um cron pontual horário só daria uma oportunidade entre 90 e aproximadamente 150 min, antes de somar atrasos do fornecedor. Não prometer recuperação automática aos 90 min exatos.
- HTTP e CLI só se coordenam se usarem a mesma base. A correlação observada sustenta esse percurso; não foram comparados valores secretos de conexão.
- Publicação manual do Worker sem configuração versionada favorece deriva entre “existe código”, “foi publicado” e “tem cron ativo”. Há risco de reinstalar o código sem restaurar o trigger correto.

### Testes executados e alcance

Nesta investigação passaram **42 testes** de serviço/CLI/cliente LL2, com Python 3.12 e SQLite em memória, mocks de lock/rede; e **26 testes Node** do Worker com respostas simuladas. Sem chamadas de teste reais à LL2. Aviso conhecido Starlette/httpx, sem dependências instaladas.

Os testes PostgreSQL existentes verificam lock entre sessões, reserva persistida durante espera de rede e Retry-After observável noutra ligação. O seu código foi revisto; não foram repetidos contra uma base nesta investigação. Não afirmo validação nova de PostgreSQL nem autenticação real nova do Worker.

## 6. Solução recomendada

**Reutilizar o Worker existente como principal horário; conservar GitHub como recurso por idade. Sem aumentar para 15/5 minutos, sem novo serviço e sem keep-alive.**

Configuração-alvo proposta, ainda não aplicada:

| Elemento | Alvo |
| --- | --- |
| Cloudflare | Um único cron regular horário, por exemplo `17 * * * *` UTC. O minuto é uma escolha operacional proposta, não uma correção mágica de carga. |
| API HTTP | Manter mínimo global 2700 s, sem trocar segredos. Continuar a reservar antes da fonte. |
| GitHub | Manter cron `23 * * * *`; elegível como fallback após 5400 s desde último sucesso/importação, mas com o mesmo cooldown global 2700 s. |
| Worker publicado | Cotejar versão ativa e ficheiro do repositório; confirmar aceitação de todos os skips, incluindo retry_wait. Publicar só se houver diferença necessária e após autorização própria. O teste histórico confirma recently_updated, não todos os ramos. |
| Observação | Correlacionar evento/run_id → resultado → API pública; importação e skip explícitos. Não repetir operações manualmente para “forçar verde”. |

Em regime saudável pretende-se uma importação por hora, com um GET LL2 normal por importação e, apenas nas falhas transitórias selecionadas, a segunda tentativa já existente. O fallback deve normalmente sair sem contactar LL2. Esta política restaura o objetivo horário anterior; não aumenta a cadência-alvo nem pressupõe quota ilimitada ou autorização para contornar limites.

Não há garantia de pontualidade absoluta em nenhum scheduler. A conclusão de A01 exige também observação por vários ciclos, não apenas adicionar o cron ou ver uma execução verde.

### Alternativas consideradas

| Alternativa | Decisão e motivo |
| --- | --- |
| Manter só GitHub e corrigir o cron textual | Insuficiente: ficheiro remoto já corresponde ao local e está ativo; lacunas reais persistem. Pode manter-se se o utilizador aceitar explicitamente atrasos de várias horas. |
| Mudar apenas o minuto 23 | Não há evidência de que resolva. Já está fora do início da hora referido pela documentação como período mais carregado. |
| Aumentar runs para cada 5/15 min | Rejeitado nesta fase: multiplica oportunidades/custo de runners e não resolve ausência do principal nem garante disparos. |
| Cloudflare chamar workflow_dispatch do GitHub | Não preferido: mais credenciais/acesso e outro salto, preserva a dependência de arranque do runner. O caminho HTTP já existe e teve autenticação/skip válidos. |
| Render pago/Cron pago ou novo serviço externo | Adiar: exigiria custo/serviço adicional sem prova de necessidade. Não resolve por si só disparos GitHub ausentes. |
| Sincronizar ao visitar a página/arrancar serviço | Rejeitado: acopla visitas/deploy à quota e aumenta risco de simultaneidade e latência. |
| Reexecutar automaticamente POST/workflow após timeout | Rejeitado: o servidor pode continuar a operação; já existe repetição limitada do GET dentro da reserva. |
| Aumentar stale para deixar de mostrar aviso | Rejeitado: oculta a consequência, não atualiza os dados. |
| Apagar sync_control ou remover lock/cooldown | Rejeitado: contorna a proteção, não faz aparecer eventos no scheduler. |

## 7. Alterações necessárias, separadas por incremento

### A01.1 — menor incremento corretivo recomendado

Um objetivo único: **ter um principal horário efetivamente ativo e verificável, com fallback que não prolonga o cooldown do principal**.

1. `sync_service.py`: separar parâmetro de idade mínima do fallback do intervalo global partilhado; valores validados; preservar transações, lock e Retry-After. Permitir comportamento anterior quando a opção nova não está configurada.
2. `sync-launches.yml`: manter o cron atual; usar mínimo global de 45 min e parâmetro separado de elegibilidade do fallback de 90 min. Não alterar segredos ou destino.
3. Testes do serviço/PostgreSQL: sequência fallback → principal com políticas diferentes, simultaneidade e falhas sem consulta duplicada.
4. Cotejo do contrato da versão Worker publicada; só corrigir/publicar se necessário. Não alterar o timeout/retry nem o formato dos logs sem motivo.
5. Após preview de testes, aprovação de código e autorizações próprias de publicação/configuração: configurar **apenas um** cron horário no Worker. Observar execuções naturais, sem sync manual.
6. Documentar configuração não secreta esperada, versão, cron e papéis. Atualizar PROJECT_EVOLUTION/TASKS apenas na implementação aprovada.

Sem migração de base neste incremento. Apenas ligar um cron seria menos trabalho, mas deixaria o conflito conhecido dos 90 min e uma validação incompleta da coordenação; por isso não é a correção sustentável recomendada.

### A01.2 — acompanhamento operacional, separado

Depois do principal validado: distinguir último sucesso/última tentativa no estado operacional, registar origem e categoria segura e definir alerta de atraso. O modelo atual não conserva histórico de sucessos ou origem suficiente. Acrescentar campos persistentes só com migração e revisão próprias; preservar contrato público existente. Não abrir neste lote precisão temporal, arquivo histórico ou outros assuntos da auditoria.

## 8. Testes e critérios de aceitação

### Antes de produção

- Nenhum teste unitário chama LL2 ou lê segredos reais.
- Dois processos simultâneos, mesma base PostgreSQL isolada: apenas um inicia GET; outro recebe skip apropriado.
- Sucesso do fallback com dados antigos; tentativa seguinte do principal após 45 min não fica bloqueada por uma reserva artificial de 90 min.
- Fallback com sucesso recente dentro de 90 min: zero chamadas LL2, sem atualizar o timestamp da importação.
- 429/Retry-After numérico/data: reserva partilhada respeitada por HTTP e CLI; sem repetição imediata.
- Falha após as duas tentativas transitórias: dados preservados, outcome de falha e cooldown; sem retry do POST completo.
- Resposta vazia, payload inválido e erro de configuração não substituem dados válidos.
- Worker trata imported, recently_updated, in_progress e retry_wait; cada execução tem um início e um resultado correlacionados e nenhum token/corpo arbitrário nos logs.
- Ensaio isolado de atraso de arranque + duração máxima prevista das duas tentativas GET: verificar se o orçamento atual de 90 s é suficiente e como se distingue timeout do chamador de sucesso posterior no servidor. Se exigir ajuste, incluí-lo explicitamente na revisão antes de ativar o cron; não prometer recuperação em produção com base no teste antigo de skip.
- Configuração-alvo sem mais de um cron regular no Worker; horários/documentação em UTC.

### Após publicação/configuração aprovadas

- Confirmar versão ativa e cron na interface, sem clicar em teste/manual sync.
- No primeiro slot naturalmente elegível, exigir `source=cloudflare-worker`, `phase=started`, mesmo run_id em `completed`, `imported>0`, `skipped=false`. Um skip não cumpre este critério de importação.
- API pública deve avançar para um timestamp compatível com esse resultado; consultar GitHub no mesmo período para evitar atribuição só pela coincidência de datas.
- Se o cooldown herdado ainda estiver ativo, um skip inicial pode ser correto. Esperar o próximo slot natural; não apagar a reserva para acelerar a prova.
- Confirmar pelo menos três ciclos horários consecutivos e depois rever 24 h: intervalos, falhas, skips e orçamento de GETs. Estes números são critérios propostos, não resultados já obtidos nem garantia estatística de disponibilidade.
- Em funcionamento saudável, GitHub deve sair por dados recentes sem atualizar o timestamp nem acrescentar consultas LL2.
- Não desligar o principal em produção para testar fallback sem autorização adicional. Exercitar a falha em PostgreSQL/serviços simulados; validar um caso real apenas se ocorrer naturalmente ou for depois autorizado.
- A situação não fica encerrada apenas porque `stale=false` uma vez. É necessário confirmar o principal e a cadência ao longo dos ciclos.

## 9. Rollback proposto

Registar previamente: Worker ativo `62974619-7686-47e4-a5f7-486314d1e174`, ausência atual de cron regular, workflow/intervalo atual 5400, API com mínimo predefinido 2700. Nunca guardar valores de segredos em snapshots de revisão.

Se houver chamadas repetidas, falhas de autenticação ou comportamento não previsto após ativação:

1. Remover **somente** o cron exato criado neste incremento e confirmar ausência; não apagar Worker, token ou dados.
2. Ter em conta a propagação da alteração Cloudflare: pode demorar até cerca de 15 min segundo a documentação. Não assumir interrupção instantânea de uma invocação já em curso.
3. Se houve mudança de código Worker, restaurar a versão anterior explicitamente registada, sem executar sync de ensaio.
4. Reverter o ajuste do workflow/serviço para o commit anterior autorizado, mantendo o fallback original; isso recupera o comportamento antigo, não elimina os atrasos conhecidos.
5. Não fazer downgrade da base nem limpar `sync_control`: não há migração no A01.1 e o cooldown/Retry-After deve sobreviver. Aguardar reserva/tarefa existente antes de qualquer decisão operacional.
6. Consultar logs e estado público antes de propor nova tentativa. Rollback não restaura horários que a fonte entretanto tenha alterado nem deve eliminar lançamentos válidos.

Nenhuma destas ações de rollback foi executada ou está autorizada por este relatório. Futura implementação continua sujeita a aprovação, e push/publicação/configuração requerem as confirmações aplicáveis.

## Evidência e referências

- Código: `.github/workflows/sync-launches.yml`; `services/api/app/sync.py`, `sync_service.py`, `repositories.py`, `models.py`, `schemas.py`, `clients/launch_library.py`; `infra/cloudflare/sync-worker.mjs`; testes correspondentes.
- [Execução nova 40348139037](https://github.com/farfudo/launch-tracker/actions/runs/40348139037), [40288944017](https://github.com/farfudo/launch-tracker/actions/runs/40288944017), [40254015262](https://github.com/farfudo/launch-tracker/actions/runs/40254015262), [falha antiga 40112971248](https://github.com/farfudo/launch-tracker/actions/runs/40112971248).
- [Estado público da API](https://launch-tracker-ie09.onrender.com/api/v1/data-status). É mutável: timestamps da consulta estão registados no relatório.
- [Cloudflare Settings do Worker](https://dash.cloudflare.com/77b41821e1c25c42e70db46a26b5122c/workers/services/view/nextrocketlaunch-sync/production/settings), [Deployments](https://dash.cloudflare.com/77b41821e1c25c42e70db46a26b5122c/workers/services/view/nextrocketlaunch-sync/production/deployments), [Observability](https://dash.cloudflare.com/77b41821e1c25c42e70db46a26b5122c/workers/services/view/nextrocketlaunch-sync/production/observability/events) — acesso autenticado, sem segredos copiados.
- [Render Logs](https://dashboard.render.com/web/srv-dbcu932fngtc73b1vj20/logs), intervalo de 24 h e consulta do endpoint indicados acima.
- [GitHub — schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [GitHub — concurrency](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#concurrency), [Cloudflare — Cron Triggers, UTC, histórico e propagação](https://developers.cloudflare.com/workers/configuration/cron-triggers/), [Render Free](https://render.com/docs/free#spinning-down-on-idle).

**Estado final desta investigação:** causa operacional identificada e proposta preparada; aplicação e configurações inalteradas. A01 permanece aberto até uma implementação aprovada e validação da cadência.
