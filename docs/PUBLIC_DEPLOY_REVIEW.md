# Validação pública após ecb412b — 24 de outubro de 2026

## Método e âmbito

Consultas de leitura: estado GitHub/Vercel, dashboard Render, GET da página, API data-status e detalhe, e registos da sincronização já concluída. Sem deploy, sincronização manual, alteração de ambiente, invalidação forçada de cache ou interrupção de serviços. GETs normais podem iniciar a revalidação prevista pela aplicação.

## Publicação confirmada

- Vercel: deployment `dpl_FMc7RwwgabPmpCDe72DRPY9AcpRr`, Ready, Production, domínio `launch-tracker-beryl.vercel.app`, commit `ecb412b`.
- Render: cabeçalho do serviço indica último commit publicado `ecb412b` e Live (`dep-dbegu9ijnfac73dr1l50`). Não se usou a lista histórica antiga para inferir a versão atual.
- HTML público inclui resumo «Mission at a glance» e aviso de cópia da interface.
- Endpoint de detalhe público respondeu com categoria `agency` em mission_links, comprovando contrato novo para a missão consultada. Não prova cobertura de todos os lançamentos.
- O visual laranja expandido `38d8569` continua apenas local e não faz parte desta publicação.

## Medições e atualização dos dados

Interface consultada antes da API, HTTP 200: primeiro byte 1,193 s, total 1,487 s. Leituras posteriores: 0,309/0,455 s e 0,447/0,624 s (primeiro byte/total, arredondados). API data-status HTTP 200 em 1,921 s: 110 registos, last_updated_at `2026-10-24T19:36:11.164595Z`, stale false.

A execução agendada GitHub `40125999826`, iniciada às 19:35:35 UTC, terminou com sucesso; o registo declara `Imported 100 launches.` às 19:36:12 UTC. O estado público é temporalmente compatível com essa importação. A execução falhada anterior permanece identificada como `40112971248`; não se voltou a executá-la.

Não foi comprovada suspensão anterior da API, pelo que estes tempos não constituem um teste controlado de arranque a frio ou uma garantia de desempenho.

## Falha concreta encontrada na revalidação

As três leituras da interface conservaram checkedAt `20:06:29.613Z`, `20:06:24.627Z` e `20:06:20.869Z`, com prazo declarado de 300 segundos, apesar de serem observadas por volta de 20:21–20:23 UTC. O detalhe guardado também devolveu checkedAt `20:04:10.363Z`. A hora da fonte e a hora da cópia são coisas distintas.

Nos Runtime Logs do Vercel, para o deployment confirmado, observaram-se erros `TimeoutError: The operation was aborted due to timeout` ao revalidar as entradas list/upcoming, filters e status, às 21:21:59 e 21:22:50 no fuso exibido pelo dashboard (WEST). O cliente da API tem limite de 20 segundos. A página continuou disponível com dados guardados, mas não se confirmou renovação da cópia.

Conclusão: preservação/rapidez da resposta guardada observadas; recuperação/revalidação pública ainda não validada, com falhas concretas nos registos. A leitura direta rápida feita do computador não prova que o percurso Vercel → Render estivesse disponível nas mesmas condições. Os registos não permitem atribuir a causa exclusivamente ao cold start, Render, rede, Neon ou ciclo de vida da função Vercel.

## Próximo passo recomendado

Investigar e corrigir o percurso de revalidação, mantendo dados guardados, limite de idade e ausência de keep-alive artificial. Reproduzir o problema em ensaio isolado e obter aprovação antes de qualquer alteração/publicação. Não avançar para novos filtros como se a recuperação estivesse concluída.

Sem mudança funcional, commit ou push nesta validação; registos adicionados localmente. Não foram repetidos testes unitários por não haver mudança de código.
