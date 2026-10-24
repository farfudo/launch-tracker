# Sincronização — diagnóstico e repetição limitada

## Incidente observado

A execução agendada GitHub `40112971248`, em 24 de outubro de 2026 às 16:44 UTC, falhou com `Unable to retrieve upcoming launches.` após cerca de 33 segundos na etapa de sincronização. O código antigo agrupa timeout, rede, HTTP e resposta inválida; não é possível concluir retroativamente qual ocorreu. É compatível com timeout, não prova um. A execução anterior `40095451192` importou 100 lançamentos; a leitura pública posterior conservava 109 registos e atualização `2026-10-24T12:48:55.472426Z`.

Este incidente usou `8211038`, anterior ao incremento de cache da interface `d0d8a98`. O push deste último foi entretanto confirmado para `main`; não se confunde esse envio com deploy confirmado ou sincronização da fonte.

## Rascunho local proposto

- Duas tentativas no máximo por sincronização elegível: pedido inicial e uma repetição após cinco segundos.
- Repetir apenas timeout, erro de transporte e HTTP 500/502/503/504 sem `Retry-After`.
- Não repetir imediatamente 429, outros estados HTTP, payload inválido ou uma resposta vazia. Uma lista vazia é rejeitada pelo serviço, preservando os dados anteriores.
- Se a fonte fornecer `Retry-After`, a sincronização termina e o mecanismo existente persiste a espera partilhada, respeitando o maior entre esse prazo e o intervalo mínimo. Não há um novo agendamento exato criado para esse instante: uma execução posterior ainda precisa de ocorrer.
- A repetição fica dentro da reserva persistida antes do pedido externo. Não se relança o workflow GitHub, não se contorna a proteção partilhada entre CLI/API e não se criam workflows recursivos.
- Registar número da tentativa, categoria segura, estado HTTP quando conhecido, duração e decisão de repetir. Nunca registar corpo da resposta, URL com parâmetros, mensagem bruta da exceção ou cabeçalho bruto. A CLI conserva saída de falha e código 1 depois de esgotar as tentativas.

## Exemplo de comportamento verificado com simulações

`timeout → esperar 5 segundos → resposta válida → importar`

`timeout → esperar 5 segundos → timeout → falhar, preservar dados e aguardar intervalo partilhado`

`429 / Retry-After → sem repetição imediata → espera persistida`

Não é uma nova interface visual. A preview funcional deste incremento são os testes locais com HTTP simulado e relógio/espera controlados: não fazem chamadas à Launch Library nem sincronizam produção.

Resultado: 52 testes da API passaram e a análise de estilo passou. Execução local em Python 3.13 com base SQLite em memória; a CI permanece configurada para Python 3.12. Os testes do bloqueio usam simulação e não comprovam concorrência real PostgreSQL. Foi observado um aviso de descontinuação do transporte do TestClient, sem falha de testes; não se alteraram dependências neste incremento. Web/E2E não repetidos porque não houve alteração da interface.

## Limites e opções

A recomendação é uma única repetição, não várias. Alternativa mais conservadora: apenas melhorar o diagnóstico e aguardar a próxima execução agendada. Uma terceira tentativa aumentaria pedidos e latência; não está implementada.

O timeout HTTP de 30 segundos é por operação de rede, não um orçamento absoluto de execução. Duas tentativas podem prolongar a operação; a suspensão do Render pode acrescentar espera. O Worker tem limite de 90 segundos e o workflow GitHub cinco minutos, que não foram alterados. Um timeout do chamador continua sem provar que a operação no servidor terminou; não relançar automaticamente o POST completo.

Sem alteração de agendamento, novas credenciais, migrações, sincronização real ou publicação. Regra aprovada pelo utilizador, com autorização apenas de commit local. Push/publicação continuam sujeitos a autorização separada; a regra ainda não está ativa em produção. A causa histórica exata permanece desconhecida.
