# Revalidação da cache — correção local proposta

## Evidência e limites do diagnóstico

A validação pública em `docs/PUBLIC_DEPLOY_REVIEW.md` confirmou falhas TimeoutError em list, filters e status, com cópias de cerca de 20:06 UTC ainda servidas depois de 20:21 UTC. Uma leitura pública adicional de pesquisa, que não usa a cache persistente da lista, respondeu HTTP 200 em 1,224 segundos e apresentou missões. Assim, o percurso normal pode funcionar enquanto a revalidação falha; não foi demonstrada indisponibilidade contínua da API nem identificada uma causa única.

O timeout de leitura anterior era de 20 segundos, inferior ao atraso de arranque já observado. O trabalho assíncrono também deve ser acompanhado pelo ciclo de vida da função. Não se afirma que a ausência de `after` era a causa comprovada: Next.js já tem mecanismos internos para revalidação. A alteração reforça explicitamente esse acompanhamento e o orçamento da leitura.

## Alterações do rascunho

- Registar a mesma tarefa de leitura/validação em `after`, sem iniciar um segundo pedido. O servidor acompanha a tarefa depois da resposta; falha continua a rejeitar a carga da cache, preservando o resultado anterior.
- Leituras usadas pela cache têm timeout de 55 segundos. Pedidos diretos normais, incluindo pesquisa filtrada, conservam 20 segundos. A cache vazia de uma vista comum pode agora esperar até 55 segundos; é um compromisso explícito, não uma promessa de primeira visita instantânea.
- Páginas inicial/detalhe e endpoint de detalhe declaram `maxDuration=60`, reservando margem para terminar a leitura. Não se alteram planos, segredos ou configuração no dashboard.
- Logs seguros de categoria da entrada, sucesso/falha, duração e categoria de erro. Não incluir corpo de resposta, credenciais, cabeçalhos ou mensagem bruta da exceção nos novos logs. Erros internos do framework podem continuar a gerar registos próprios.
- Mantêm-se revalidação de cinco minutos, validação de payload, idade original da fonte e limite de seis horas desde a última leitura válida. Sem keep-alive periódico, POST de sync ou repetição automática de GET adicionada neste incremento.

O aumento de orçamento não torna a API mais rápida e uma falha superior a 55 segundos continua possível. Prolonga a execução da função quando a origem está lenta; permanece sujeito aos limites e quotas do alojamento. O carregamento do painel no navegador conserva o seu limite independente, podendo oferecer nova tentativa antes de uma leitura sem cache terminar.

## Referências consultadas

- Documentação completa instalada do Next.js 16.4.2: `after`, `unstable_cache` e `maxDuration`.
- `after` acompanha trabalho após resposta usando o mecanismo de ciclo de vida da plataforma: https://nextjs.org/docs/app/api-reference/functions/after
- Limites Vercel dependem do modo de execução; 60 segundos não exige exceder o limite Hobby documentado, mesmo sem Fluid: https://vercel.com/docs/functions/limitations

## Verificação e revisão

Testes unitários verificam tarefa registada, mesmo pedido reutilizado, orçamento separado e ausência de mensagem bruta nos novos logs. Ensaio Next compilado usa API fictícia com 35 segundos de atraso para verificar atualização real da missão após resposta rápida guardada; atraso de 65 segundos para testar falha após o orçamento; depois 503, payload inválido e recuperação. Não confundir esse ensaio local com validação no Vercel.

Opção recomendada: acompanhar explicitamente a tarefa e orçamento de 55 segundos para leituras da cache. Alternativa conservadora: manter 20 segundos e investigar primeiro com apenas instrumentação, sabendo que não acomoda o atraso já observado. A correção pública só poderá ser confirmada depois de aprovação e envio, observando checkedAt avançar e ausência de novos timeouts nas mesmas condições.

Sem alteração visual nova, migração, sincronização manual, commit ou push neste rascunho. A preview existente da cache continua a usar apenas dados fictícios. A investigação não foi apresentada como causa histórica definitivamente resolvida.

## Resultado dos ensaios

80 testes web, build e quatro percursos E2E desktop/móvel passaram. Ensaio real Next compilado: calendário/detail guardados em 24/20 ms durante atraso de 35 segundos; resposta nova confirmada depois desse atraso. Com API simulada a 65 segundos, leitura de cache limitada a 55 segundos, resposta guardada manteve-se disponível; 503 e payload inválido não a apagaram, e recuperação posterior foi confirmada. Exemplos de leituras durante 503: 44/19 ms. São tempos locais, não uma medição de Vercel.

Testes unitários usam um substituto de `after` para verificar registo e reutilização da promise; o ensaio compilado executa o `after` real do Next local. Nenhum deles reproduz integralmente o ciclo de vida Vercel. Resta observar a revalidação pública após autorização de envio. A preview foi reposta em 3300 com fonte fictícia normal e TTL de cinco segundos, apenas para revisão; o padrão público proposto continua 300 segundos. API backend não alterada/testes PostgreSQL não repetidos nesta ronda.

## Confirmação pública após aprovação e envio

Push `a91dc50` confirmado; CI `40130910748` passou integralmente e Vercel publicou o commit em produção. Revalidação observada sem mudar TTL: cópias verificadas às 20:41:40–41 UTC foram devolvidas rapidamente no pedido após cinco minutos (792 ms); leitura 57 segundos depois trouxe cópias verificadas às 20:46:47.538Z/679Z/938Z (669 ms). As três horas novas eram posteriores às antigas, confirmando renovação de lista, filtros e estado neste ciclo real.

Não foi provocado cold start nem falha em produção. O resultado não garante todas as condições futuras nem isola qual das alterações eliminou os sintomas nesta execução. Este registo posterior ao push permanece local até ao próximo commit autorizado.

Runtime Logs confirmaram o ciclo: list success em 949 ms, filters success em 695 ms e status success em 558 ms, às 21:46:47 WEST. No intervalo filtrado deste deployment havia 11 registos informativos, zero warnings e zero errors. Ausência de erros é limitada à janela consultada, não uma garantia permanente.
