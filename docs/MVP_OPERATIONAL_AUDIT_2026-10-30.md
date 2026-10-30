# Verificação operacional do MVP — 30 de outubro de 2026

Auditoria de leitura ao código publicado (`0b6d84d`), GitHub Actions, Render, Vercel e Neon. Não foram alteradas configurações, executadas sincronizações, limpezas, migrations, restauros, commits ou deploys nesta auditoria. Horas em UTC, iguais à hora de Lisboa nesta data.

## Resultado

O produto está acessível e o feedback/admin foi validado nesta sessão, mas faltam garantias operacionais para considerar o MVP sólido. Prioridades: retenção executável e monitorizada; verificação automática após deploy; recuperação ensaiada; monitorização da atualização dos dados e dos erros funcionais.

| Área | Verificado | Lacuna / ação proposta |
|---|---|---|
| Disponibilidade | Web `/`, `/explore-space`, `/admin/login`: HTTP 200. API `/health`: 200. | Definir health check no Render e distinguir processo vivo de ligação à base funcional. |
| Autorização | API `/admin/feedback` e web `/api/admin/feedback`: HTTP 401 sem credenciais. Web admin usa `no-store` e `noindex, nofollow`. | Manter estes controlos no teste após deploy; não usar credenciais reais nos testes públicos. |
| Após deploy | CI de `0b6d84d` passou; contém testes API/PostgreSQL/worker/web, build e jornadas com fixtures. | Não existe workflow pós-deploy: os dois workflows encontrados são CI e Sync launches. CI verde não valida env vars nem disponibilidade do deployment real. |
| Atualização | 123 lançamentos em cache; `stale=false`; atualização mais recente às 16:04:40. | Agendamento configurado como horário, mas as últimas execuções observadas têm intervalos de várias horas. Não assumir SLA horário. |
| Alertas | Render herda notificações de falha do workspace. | Campo Health Check Path vazio. Alertas Vercel apresentam upgrade para Pro; não foi confirmado monitor externo para 5xx, falhas funcionais ou cache atrasada. |
| Retenção | Código elimina contactos/digest após 30 dias, feedback após 180 dias, contadores e sessões expirados. | Não foi encontrado agendamento no GitHub, Render Production ou Vercel; existência do código não comprova execução diária. |
| Recuperação | Neon production, plano Free: histórico de recuperação de 6 horas. | Painel mostra “No snapshots, no schedule set”. Não há ensaio de restauro comprovado nem backup independente confirmado. |

## 1. Verificação após deploy

Workflow [CI validado](https://github.com/farfudo/launch-tracker/actions/runs/40916647060). As integrações dos fornecedores fazem deploy por commit; o workflow CI não testa automaticamente o deployment público resultante. Os redeploys por alteração de variáveis também precisam dessa verificação.

Proposta de verificação de leitura: páginas críticas com conteúdo esperado; `/health`; `/api/v1/data-status` com cache não vazia; respostas administrativas 401 sem sessão e cabeçalhos privados; formulário público sem criar mensagens de teste em cada deploy. Um POST vazio deve devolver 422 e não 503. Um envio real deve ser uma verificação separada e autorizada, com recibo e conferência no painel.

Na fase anterior desta sessão houve um único envio técnico autorizado, sem nome/email, com recibo `bc5fcf4b-ba89-47fc-924c-ac8ee25e0371`, confirmado no painel como Novo. Não se repetiu esse envio nesta auditoria.

## 2. Atualização dos lançamentos

[Estado público dos dados](https://launch-tracker-ie09.onrender.com/api/v1/data-status): 123 registos, última atualização `2026-10-30T16:04:40.462401Z`, `stale=false` no momento da leitura.

[Última execução observada](https://github.com/farfudo/launch-tracker/actions/runs/41086431837): schedule às 16:03:47; registo confirma `Imported 100 launches`, `ll2_requests=1`, resultado success. Não foi lançada nova sincronização.

As execuções anteriores observadas em 30/10 ocorreram às 08:48 e 02:02; todas passaram. A variável pública `SYNC_ENABLED=true` existe; o workflow prevê `23 * * * *`. Os intervalos observados, incluindo cerca de 7h15 entre 08:48 e 16:03, excedem a frequência pretendida. A causa destes atrasos não foi determinada nesta auditoria. O estado atual do Worker Cloudflare não foi inspecionado, pelo que não se lhe atribui esta atualização nem se afirma que esteja ativo/inativo.

Limitação do indicador: `last_updated_at` usa o máximo de `Launch.source_updated_at`, e stale é calculado após seis horas. Não é uma medição completa do sucesso/abrangência de cada sincronização nem prova de frescura de todos os registos. Recomenda-se acompanhar separadamente hora de conclusão, resultado, volume e atraso; sem aumentar pedidos LL2 para fazer monitorização.

## 3. Alertas e health checks

Render → serviço launch-tracker → Settings: notificações “Use workspace default (Only failure notifications)”; Health Check Path sem valor. A configuração confirma a opção, mas a entrega de emails não foi ensaiada.

`/health` responde apenas `{"status":"ok"}`: comprova que o processo responde, não testa a base nem o feedback. `/api/v1/data-status` exercitou leitura da base nesta auditoria.

Vercel → Settings → Alerts mostra “Get Alerts for Your Projects” e “Upgrade to Pro”. Não foi comprado plano ou instalado serviço. Não foi encontrado no código publicado um sistema dedicado de alertas de aplicação. Isto não prova ausência de serviços externos configurados fora dos painéis consultados.

Recomendação: monitorizar disponibilidade web/API, 5xx, falhas de envio e atraso de cache; usar eventos genéricos sem mensagens, nomes, emails, cookies ou segredos. Testar também a entrega do alerta e definir quem atua. Não é necessário começar por um serviço pago sem avaliar as opções existentes.

## 4. Retenção e recuperação

O módulo `services/api/app/feedback_retention.py` existe, mas não corre no arranque: `start.sh` executa migrations e uvicorn. A limpeza deve ser uma tarefa própria diária.

Âmbito da procura de agendamento: GitHub tem apenas `ci.yml` e `sync-launches.yml`; Render Production apresenta apenas um serviço web, sem Cron Job; Vercel Cron Jobs apresenta o ecrã inicial de configuração sem tarefas listadas. Não se consultaram agendadores externos desconhecidos nem se verificaram registos antigos por SQL. Assim, a eliminação prometida no formulário não está operacionalmente comprovada e deve ser prioridade.

[Neon Backup & Restore](https://console.neon.tech/app/projects/restless-queen-87157043/branches/br-sweet-surf-zavjk7tg/restore): janela de histórico 6 horas; “No snapshots, no schedule set”; agendamento de snapshots pede upgrade. Não se clicou em Restore, Preview data, Create ou upgrade. O histórico oferecido pelo fornecedor não substitui um ensaio de recuperação nem confirma backup independente.

Próximo ensaio proposto: definir perda de dados e tempo de recuperação aceitáveis, preparar destino isolado, restaurar sem tocar em production, verificar schema e contagens/funcionalidades sem divulgar contactos, e documentar os tempos e o procedimento. Qualquer criação de recurso, exportação de dados, custo, limpeza ou restauro requer âmbito e autorização próprios.

## Ordem sugerida

1. Agendar e monitorizar a retenção diária, começando por uma avaliação de impacto de leitura e testes isolados; não executar apagamentos às cegas em produção.
2. Acrescentar verificação automática após deploy e health check adequado, preservando o fluxo atual.
3. Confirmar o mecanismo primário de sync e alertar sobre atraso, sem syncs manuais de diagnóstico nem pedidos LL2 extra.
4. Definir backups e realizar um restauro isolado; testar a chegada dos alertas operacionais.

Esta auditoria não modifica a aplicação nem implementa essas propostas. A recuperação real, a entrega de notificações, o agendador externo Cloudflare e a execução histórica da retenção continuam sem validação completa.
