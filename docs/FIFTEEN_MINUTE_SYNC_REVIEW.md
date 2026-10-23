# Proposta local — sincronização de 15 minutos

Estado: rascunho para revisão. Nenhum cron público, variável de produção, migração pública, commit, push ou deploy foi alterado nesta etapa. O teste temporário do Worker já autorizado é independente.

## Política proposta

- Principal Cloudflare: frequência de 15 minutos, a definir só após validação do Worker; API com `SYNC_MIN_INTERVAL_SECONDS=900`.
- GitHub: conserva o cron horário, mas o rascunho do workflow define `SYNC_MIN_INTERVAL_SECONDS=5400`; não consulta a fonte se houve uma importação bem-sucedida nos últimos 90 minutos.
- Compatibilidade: sem configuração nova, a API conserva o intervalo de 2700 segundos. Não se ativou a política adaptativa de 5 minutos.
- Um pedido LL2 por tentativa (até 100 missões). Quatro por hora é um orçamento teórico, não uma garantia de quota exclusiva por IP ou de pontualidade. Não contornar limites por mudança de IP.

## Funcionamento e prévia dos resultados

1. A tarefa adquire o lock transacional PostgreSQL já existente.
2. Consulta a reserva persistente e a idade da última atualização. Se não puder tentar, devolve skip sem contactar LL2.
3. Guarda `last_attempt_at`, `next_attempt_at` e `outcome=attempting` na tabela singleton `sync_control` ANTES da rede. O commit liberta o lock, mas outra tarefa encontra a reserva e não duplica o pedido.
4. Sucesso publica os dados e o resultado de controlo na mesma transação. Falha preserva os lançamentos e mantém uma espera persistente.
5. `Retry-After` numérico ou HTTP-date prolonga a espera, nunca a reduz abaixo do intervalo. Falta de cabeçalho, valor inválido ou erro genérico mantém pelo menos esse intervalo.

Exemplos verificáveis nos testes:

| Situação | Resultado |
| --- | --- |
| Importação autorizada e dados válidos | `imported=100, skipped=false` |
| Dados recentes | `skipped=true, reason=recently_updated` |
| Reserva ou espera após erro | `skipped=true, reason=retry_wait` |
| Lock ocupado | `skipped=true, reason=in_progress` |
| 429 com Retry-After 3600 | Falha da tarefa; nova tentativa bloqueada por pelo menos uma hora |
| Processo termina depois da reserva | Reserva permanece; evita repetição imediata, sem garantir sucesso do pedido |

O tempo desde o fim de uma tentativa e a imprecisão dos agendadores podem reduzir a frequência real. Não existe garantia de atualização exata a cada 15 minutos. A reserva expira: uma tarefa extraordinariamente bloqueada por mais de um intervalo poderá sobrepor-se a outra; o cliente normal tem timeout de rede de 30 segundos, mas isto não é uma garantia absoluta de duração total. Não foi introduzida fila nem exatamente-uma-vez.

## Verificação realizada

- 32 testes API passaram; Ruff passou.
- 26 testes Node do Worker passaram, incluindo reconhecimento de `retry_wait`.
- Migração `20261023_07` aplicada e revertida em SQLite temporário e PostgreSQL 16 isolado. Duas sessões PostgreSQL confirmaram exclusão do lock, reserva visível durante fornecedor simulado, sucesso e persistência da espera após falha/Retry-After. Ensaio pontual, não integrado no CI.
- Nenhuma chamada real a LL2; não foram usados segredos de produção.
- Advertência preexistente de depreciação Starlette/httpx nos testes; não foi alterada a dependência nesta tarefa.

## Ordem de ativação por aprovar

1. Validar a migração e a coordenação em PostgreSQL isolado; confirmar resultado do teste real da correção do Worker.
2. Publicar primeiro o Worker que reconhece `retry_wait`, sem cron. A versão atualmente publicada pode rejeitar esse novo resultado como inválido.
3. Aprovar commit/push e publicar backend com a migração, mantendo inicialmente o intervalo atual. Não executar migração manual em produção sem autorização.
4. Aprovar separadamente a configuração da API a 900 segundos e cron principal de 15 minutos; confirmar workflow GitHub com espera de 90 minutos.
5. Observar importação/skip/429 e idade dos dados antes de considerar 5 minutos.

Alternativas: manter uma hora, adotar 30 minutos (mais margem), ou os 15 minutos propostos. Esta proposta não inclui alteração visual da aplicação.
