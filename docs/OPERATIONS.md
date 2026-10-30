# Operação do MVP — rascunho para revisão

Este incremento não muda o frontend, as regras Launches/A07, favoritos, os pedidos LL2 ou a infraestrutura ativa. Nenhum workflow de produção é ativado apenas por publicar este rascunho: as variáveis de opt-in têm de ser configuradas depois da revisão. O workflow de ensaio usa apenas PostgreSQL descartável no runner, sem segredos de produção.

## Verificação após deploy e monitorização

Executar `python scripts/verify-production.py` para verificar páginas críticas, processo API, leitura da base/cache, recusa 401 e cabeçalhos privados dos endpoints administrativos, e validação do feedback público. `--freshness` também reprova cache superior a seis horas. Os destinos HTTPS são fixos; não são aceites URLs de eventos, tokens, parâmetros de destino ou redirecionamentos. Corpos, cabeçalhos e exceções nunca são escritos nos logs. HTTP 200 com página vazia não passa.

O único POST é `{}` para `/api/feedback`, sem Idempotency-Key: deve devolver 422 antes de qualquer inserção ou consumo de rate bucket. Não envia feedback real, não tenta login nem chama `/sync` ou a LL2.

O workflow `Production readiness` verifica após um evento GitHub `deployment_status` success com ambiente `Production`. Como este projeto não apresentou eventos de deployment na consulta GitHub, também arranca depois de CI bem-sucedido na `main` e aguarda até quatro minutos pelo check Vercel do mesmo commit. Em execução manual/agendada verifica também frescura. Usa apenas o código de `main`, sem descarregar artifacts nem executar código de PRs. Deploys independentes do Render e redeploys por variáveis podem exigir execução manual. Não é um bloqueio de publicação nem um mecanismo de rollback automático.

Para ativar, depois de aprovação e revisão dos destinos, definir no repositório `OPERATIONS_CHECKS_ENABLED=true`. Sem isso, todos os jobs de produção ficam ignorados, incluindo os manuais. O cron previsto é ao minuto 41; atrasos do GitHub continuam possíveis. Este monitor partilha essa limitação com o fallback de sync, por isso não garante alerta horário quando o GitHub atrasa ambos. Não se alterou a cadência de sync nem se ativou o Worker Cloudflare.

As falhas aparecem como workflow failure. Configurar e testar notificações GitHub para o responsável; não afirmar que chega email antes desse teste. Para independência do GitHub, decidir e aprovar um monitor externo que consulte os mesmos endpoints, sem criar feedback, copiar credenciais ou aumentar consultas LL2. Não foi adicionado fornecedor nem plano pago.

### Health check Render

Após aprovação: serviço `launch-tracker` → Settings → Health Checks → Health Check Path: `/health`. Não alterar comando Docker, secrets, PostgreSQL ou LL2. O endpoint verifica processo vivo; a leitura da base é verificada separadamente por `/api/v1/data-status`. Um endpoint de readiness dedicado pode ser uma evolução, sem confundir liveness com disponibilidade do fornecedor externo.

## Retenção diária

CLI em `services/api` com o ambiente da base pretendida:

```sh
python -m app.feedback_retention          # apenas avaliação: nunca apaga/redige
python -m app.feedback_retention --apply  # aplica a política; irreversível sem recuperação
```

Resumo contém apenas quantidades: feedback a eliminar (>180 dias), registos sobreviventes a redigir (>30 dias), contadores expirados e sessões expiradas. Os limites exatos de 30/180 dias são preservados. A avaliação não faz commit e não é uma prévia congelada: dados podem mudar antes da aplicação. A limpeza é transacional; o estado só é declarado aplicado depois de commit bem-sucedido. Não altera lançamentos.

**Alteração intencional de CLI:** o comando antigo sem argumentos deixa de apagar dados. Atualizar qualquer agendador externo existente para `--apply` apenas após revisão. As funções existentes usadas pelos testes mantêm o comportamento.

Ativação em duas fases, sem executar agora:

1. Rever política, destino Neon, contagens previstas e capacidade de recuperação. Criar/rever o ambiente GitHub `production-maintenance` e as proteções disponíveis no plano. O nome do ambiente no YAML, por si só, não configura aprovação obrigatória.
2. Confirmar `NEON_DATABASE_URL` no secret manager, sem o mostrar em logs. O workflow reutiliza o segredo existente; não é necessário colocar credenciais no frontend.
3. Definir `FEEDBACK_RETENTION_ENABLED=true` e executar manualmente com `apply=false`. Rever só as contagens e o resultado. Não é necessário `FEEDBACK_RETENTION_APPLY` para esta avaliação.
4. Aprovar especificamente a limpeza e executar manualmente com `apply=true`. Só depois definir `FEEDBACK_RETENTION_APPLY=true` para o agendamento diário 04:17 UTC. Sem esta segunda variável, o job agendado não executa.
5. Confirmar diariamente sucesso, hora e contagens; configurar notificações de falha e responsável. Serialização impede sobreposição de jobs deste workflow, não de comandos externos.

Para pausar: `FEEDBACK_RETENTION_APPLY=false` impede novos agendamentos de limpeza; `FEEDBACK_RETENTION_ENABLED=false` impede também novos jobs manuais. Não desfaz execuções concluídas ou em curso. Reposição de dados exige um restauro planeado, não recriação de contactos apagados.

## Backup e ensaio de recuperação

Neon foi observado com seis horas de histórico, sem snapshots/agendamento. Não foram criados backups de produção nem alterados planos. O esquema principal é PostgreSQL 18; o novo ensaio usa essa mesma versão. O restante CI PostgreSQL 17 existente foi preservado.

`Isolated PostgreSQL recovery drill` cria schema por Alembic num PostgreSQL 18 descartável, insere um único feedback fictício sem contactos, faz `pg_dump`, restaura numa segunda base e verifica conteúdo e revisão Alembic. Não consulta o Neon, não recebe secrets de produção e não publica o dump como artifact. Demonstra o mecanismo quando executado; não prova recuperação a partir de um backup real do fornecedor. Não foi possível executar Docker local nesta sessão; o workflow precisa de passar antes de considerar este ensaio validado.

Antes de escolher backups reais, decidir:

- **Opção A — histórico/snapshots Neon:** rever janela, condições/custo e aprovar a configuração diretamente no fornecedor; não pressupor que seis horas bastam.
- **Opção B — backup independente cifrado:** definir destino privado, cifragem, frequência, retenção, permissões e responsável antes de exportar qualquer dado. Não guardar dumps de feedback em artifacts públicos ou no Git.

Para o primeiro ensaio real: obter autorização para a cópia, restaurar para destino isolado, impedir acesso público e envio de mensagens, validar schema/contagens/funcionalidades sem imprimir dados pessoais, invalidar sessões administrativas copiadas e impedir reutilização dos seus tokens, medir tempo/perda de dados e eliminar a cópia segundo a política aprovada. Nunca ensaiar substituindo `production`.

Objetivos de perda máxima e tempo de recuperação continuam por escolher. Sem destino, autorização e ensaio real, não declarar a recuperação de produção garantida.

## Prévia e opções de revisão

- Monitor: só manual inicialmente, ou manual + eventos após deploy + cron (recomendado depois de testar notificações).
- Retenção: avaliação manual primeiro, depois aplicação manual aprovada e finalmente agendamento diário.
- Recuperação: escolher A ou B acima; o ensaio com dados fictícios pode correr independentemente dessa decisão.

Os testes offline exercitam as falhas detetadas na auditoria, e os testes de retenção usam apenas a fixture SQLite isolada. A verificação pública do script é de leitura, exceto o POST vazio inválido. Nenhuma prova de teste fictício é apresentada como backup de produção.

### Prévia executada nesta revisão

Base SQLite em memória, com três feedbacks fictícios de 10, 31 e 181 dias:

```text
feedback_to_delete: 1
feedback_to_redact: 1
expired_rate_buckets: 0
expired_sessions: 0
Registos preservados após avaliação: 3
```

O modo de avaliação foi executado e deixou os três registos intactos. Testes separados confirmam a aplicação explícita e os limites de idade, sem dados de produção. A verificação real de produção passou os nove controlos, incluindo frescura, respostas administrativas 401 e validação 422 sem inserção. A suite API passou 119 testes; a suite operacional, seis. O ensaio PostgreSQL de recuperação continua pendente por indisponibilidade do Docker local; não se apresenta esse ensaio como aprovado.
