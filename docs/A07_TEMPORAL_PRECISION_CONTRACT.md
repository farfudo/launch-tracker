# A07 — evidência do contrato temporal LL2 2.3.0

27/10/2026. Pesquisa inicial documental, posteriormente complementada pelo único GET de configuração autorizado abaixo. Sem implementação ou sincronização.

## Fontes oficiais consultadas

- https://ll.thespacedevs.com/docs
- https://lldev.thespacedevs.com/docs
- https://lldev.thespacedevs.com/2.3.0/json — esquema OpenAPI 3.0.3, versão 2.3.0. O HTML da documentação aponta explicitamente para esta URL de esquema.

O esquema completo foi guardado temporariamente em /private/tmp/ll2-official-schema-2.3.0; hash SHA-256: 5d84073e36f109d89f4fca89063cdf935ecf0468c4871c1ba45fddbd6984038b. O extrato relevante está em A07_LL2_SCHEMA_EXCERPT.json. Na pesquisa inicial não foram consultados endpoints /launches/ nem /config/net_precisions/. A consulta posterior autorizada está registada abaixo.

## Confirmado

- NetPrecision é um objeto com id inteiro (único campo obrigatório), name e abbrev strings até 255 caracteres, description string até 2048. Nenhum destes campos contém enum, exemplos de valores ou catálogo de IDs.
- LaunchBasic, LaunchNormal e LaunchDetailed incluem net_precision como propriedade obrigatória, mas anulável, referenciando NetPrecision. Não é um inteiro isolado nem texto isolado neste esquema.
- A resposta de /launches/upcoming/ é paginada e polimórfica; response_mode mapeia list → LaunchBasic, normal → LaunchNormal, detailed → LaunchDetailed.
- O sincronizador existente usa /2.3.0/launches/upcoming/ com format=json, mode=detailed, ordering=net e limit. A sua normalização atual não preserva net_precision.
- /2.3.0/config/net_precisions/ declara uma lista paginada de NetPrecision (count/results, next/previous), limite máximo 100 segundo a descrição. A definição de resposta não inclui os registos reais.

## Evidência em falta — bloqueio explícito

A lista completa dos IDs, nomes, abreviaturas e descrições não está no OpenAPI obtido. Não foi possível confirmar IDs para instante, dia, mês, trimestre ou outras granularidades; estas categorias são objetivos de apresentação, não valores comprovados do fornecedor. Também não está confirmada a referência de calendário/fuso para uma data ampla. A existência de /config/net_precisions/ não revela o seu conteúdo. Não usar IDs de terceiros, ordem dos registos, estado Go/TBC/TBD/Hold, NET à meia-noite ou nomes presumidos para inventar o mapeamento.

Para desbloquear o mapeamento: é necessário um catálogo oficial publicado estaticamente ou uma resposta oficial já guardada de /2.3.0/config/net_precisions/ com todas as páginas e respetivas descrições. Uma eventual consulta ao endpoint de desenvolvimento requer autorização fora desta restrição de apenas documentação/esquemas.

## Contrato mínimo proposto após confirmação semântica

- Campo opcional/anulável na nossa API e persistência compatível; preservar objeto/id da fonte. Registos legados ou valores não reconhecidos continuam com precisão desconhecida, sem adivinhar pelo estado.
- Mapeamento por valores comprovados/documentados, sem pressupor que IDs são sequenciais. Preservar desconhecidos como desconhecidos.
- Instante explicitamente suportado: conversão UTC/local e countdown somente quando o estado A04 também o permite; nenhum estado terminal gera countdown. Exportação exata exige precisão adequada e os critérios existentes de calendário.
- Dia: mostrar apenas dia, mês e ano; mês: apenas mês e ano; trimestre: trimestre e ano. Nenhuma destas granularidades permite hora/minutos, countdown para um instante ou lembrete exato. A forma de extrair o período de NET exige confirmar a semântica oficial de referência; não converter um período pelo fuso do visitante.
- Precisão ausente ou desconhecida: aviso de precisão não confirmada, sem countdown/lembrete exato. Preservar avisos TBC/TBD/Hold e PT/EN/ES; não confundir precisão e estado operacional.
- Reutilizar a resposta de sincronização já existente, sem pedidos adicionais de configuração durante sync/render. Nenhuma mudança em A01–A05 ou infraestrutura nesta investigação.

## Consulta única autorizada — catálogo devolvido em 27/10/2026

A pesquisa pública não encontrou uma cópia oficial completa verificável. Efetuado exatamente um GET a `https://lldev.thespacedevs.com/2.3.0/config/net_precisions/`, sem parâmetros, redirects, retries ou paginação adicional. HTTP 200; Date do servidor: Tue, 27 Oct 2026 15:19:11 GMT. Foi escolhido o ambiente de desenvolvimento oficial para evitar consumir quota de produção. Nenhum endpoint /launches/ foi consultado.

Resposta: `count=17`, `results` contém **10** elementos, `previous=null`, `next=https://lldev.thespacedevs.com/2.3.0/config/net_precisions/?limit=10&offset=10`. O limite predefinido desta resposta foi 10; o catálogo completo não foi obtido. Não foi seguido next, respeitando o máximo de um pedido. Não inferir IDs em falta nem preencher valores por sequência. SHA-256 da resposta: `207ac9b0ff6e21282dc233ca5b08694ce95f17a488a979fdb4489c80fa8d9516`. Cópia temporária: `/private/tmp/a07-net-precisions-response.json`.

### Valores efetivamente devolvidos (descrições literais)

| ID | name | abbrev | description |
| --- | --- | --- | --- |
| 0 | Second | SEC | The T-0 is accurate to the second. |
| 1 | Minute | MIN | The T-0 is accurate to the minute. |
| 2 | Hour | HR | The T-0 is accurate to the hour. |
| 3 | Morning | AM | The T-0 is expected in the morning (local time). |
| 4 | Afternoon | PM | The T-0 is expected in the afternoon (local time). |
| 5 | Day | DAY | The T-0 is expected on the given day. |
| 7 | Month | M | The T-0 is expected in the given month. |
| 8 | Quarter 1 | Q1 | The T-0 is expected in the first quarter of the given year. |
| 9 | Quarter 2 | Q2 | The T-0 is expected in the second quarter of the given year. |
| 10 | Quarter 3 | Q3 | The T-0 is expected in the third quarter of the given year. |

### Mapeamento seguro a partir desta evidência

- **0 Second / SEC:** fonte declara precisão ao segundo; pode mostrar HH:mm:ss, converter o instante entre fusos e permitir countdown ao segundo/exportação pontual apenas se os estados A04 e critérios existentes também autorizarem. Precisão não significa garantia de lançamento no instante previsto.
- **1 Minute / MIN:** hora e minuto suportados, segundos não; mostrar HH:mm. Nunca inventar precisão ao segundo. Um eventual countdown só pode ser aproximado em minutos; exportação exata não é aprovada por esta pesquisa, pois a descrição não define um segundo de referência.
- **2 Hour / HR:** apenas hora suportada; ocultar minutos/segundos e não criar contagem/lembrete exatos. A descrição não define se NET é o início ou outro representante da hora; não fabricar esse intervalo.
- **3 Morning / AM e 4 Afternoon / PM:** períodos aproximados expressamente em hora local. Não definir fronteiras horárias artificiais nem converter a categoria para a manhã/tarde do visitante. Se o fuso local não estiver disponível, explicitar essa limitação.
- **5 Day / DAY:** apenas dia, mês e ano; sem hora, countdown ou lembrete pontual.
- **7 Month / M:** apenas mês e ano; sem dia/hora/countdown/lembrete pontual.
- **8 Q1, 9 Q2, 10 Q3:** primeiro, segundo e terceiro trimestre do ano indicado; preservar o trimestre declarado pela fonte, sem derivar outro trimestre pela conversão do instante NET.
- Para dia/mês/ano a descrição não especifica como NET codifica a referência de calendário/fuso. Não converter pelo fuso do visitante e não afirmar uma convenção UTC/local ainda não documentada. Preservar o período de origem apenas após confirmar essa convenção; até lá, fallback conservador.
- **IDs não observados, null ou dados antigos:** precisão desconhecida. Não inferir por estado, NET à meia-noite ou IDs adjacentes; sem countdown ou lembrete exato.

### Bloqueios restantes

1. Faltam sete registos do catálogo anunciado pelo servidor. Não consultar a página seguinte sem nova autorização; uma cópia oficial previamente guardada também pode completar a evidência.
2. A referência de calendário dos períodos amplos e a representação de NET para Hour/Minute não estão explicitadas nas descrições devolvidas. Fronteiras de Morning/Afternoon também não foram fornecidas.
3. Nenhuma alteração de código/API/migração foi implementada. O contrato estrutural detailed está confirmado pelo esquema; não se recorreu a lançamentos reais para inferir semântica.

## Confirmação final do catálogo — segunda página autorizada

Consulta em 27/10/2026; Date do servidor: Tue, 27 Oct 2026 15:22:06 GMT. A pesquisa pública não forneceu os sete registos completos verificáveis. Foi seguido exatamente o URL next guardado na primeira resposta: `https://lldev.thespacedevs.com/2.3.0/config/net_precisions/?limit=10&offset=10`. Um único GET adicional, HTTP 200, sem redirects, retries ou pedidos /launches/. Não foram inventados parâmetros. A resposta devolveu count=17, sete resultados e next=null. As duas páginas contêm 17 IDs distintos, correspondendo ao total anunciado. Portanto o catálogo do ambiente oficial lldev v2.3.0 está completo nesta consulta; não se fez consulta de produção.

Hash SHA-256 da segunda resposta: `6c1ac51e459eccf20a9efb039dedb905c754815e5628f8459cd5d9437dc374ec`. Cópia temporária: `/private/tmp/a07-net-precisions-page2.json`. Foram efetuados dois GET de configuração no total, em autorizações separadas. Os bloqueios de catálogo parcial descritos nas secções anteriores ficam superados por esta evidência.

### Catálogo completo confirmado — descrições literais

| ID | name | abbrev | description |
| --- | --- | --- | --- |
| 0 | Second | SEC | The T-0 is accurate to the second. |
| 1 | Minute | MIN | The T-0 is accurate to the minute. |
| 2 | Hour | HR | The T-0 is accurate to the hour. |
| 3 | Morning | AM | The T-0 is expected in the morning (local time). |
| 4 | Afternoon | PM | The T-0 is expected in the afternoon (local time). |
| 5 | Day | DAY | The T-0 is expected on the given day. |
| 6 | Week | WK | The T-0 is expected in the given week (starting on Monday according to ISO 8601). |
| 7 | Month | M | The T-0 is expected in the given month. |
| 8 | Quarter 1 | Q1 | The T-0 is expected in the first quarter of the given year. |
| 9 | Quarter 2 | Q2 | The T-0 is expected in the second quarter of the given year. |
| 10 | Quarter 3 | Q3 | The T-0 is expected in the third quarter of the given year. |
| 11 | Quarter 4 | Q4 | The T-0 is expected in the fourth quarter of the given year. |
| 12 | Year Half 1 | H1 | The T-0 is expected in the first half of the given year. |
| 13 | Year Half 2 | H2 | The T-0 is expected in the second half of the given year. |
| 14 | Year | Y | The T-0 is expected in the given year. |
| 15 | Fiscal Year | FY | The T-0 is expected in the given fiscal year of the launch country. |
| 16 | Decade | DEC | The T-0 is expected in the given decade. |

### Semântica e limites finais para A07

- 0/SEC, 1/MIN e 2/HR são precisões diferentes: segundo, minuto e hora respetivamente. Não mostrar segundos para MIN ou minutos/segundos para HR. Countdown de segundos e lembrete pontual exato só se justificam em SEC, sujeitos também ao estado operacional e restantes validações. A descrição não garante que a data prevista não mude.
- 3/AM e 4/PM são manhã e tarde explicitamente em hora local; as descrições não dão limites numéricos. Não inventar intervalos ou converter o nome do período pelo fuso do visitante.
- 5/DAY, 6/WK e 7/M são períodos de dia, semana e mês. WK começa à segunda-feira segundo ISO 8601, confirmado expressamente; não presumir domingo nem atribuir hora exata.
- 8/Q1, 9/Q2, 10/Q3 e 11/Q4 representam os quatro trimestres do ano indicado; 12/H1 e 13/H2 representam as duas metades do ano. Mostrar a granularidade declarada sem countdown ou lembrete pontual.
- 14/Y é ano; 15/FY é ano fiscal do país de lançamento; 16/DEC é década. Não converter FY para ano civil nem inventar o início do ano fiscal por país. Para DEC a descrição não estabelece convenção exata de fronteiras; não fabricar datas inicial/final.
- Para os períodos amplos, o catálogo não especifica como extrair a referência de calendário de NET (UTC, fuso local ou convenção de representação). Não deslocar dia/mês/semana/ano pelo fuso do visitante. Este ponto permanece em aberto para a implementação: preservar a etiqueta/precisão da fonte e usar fallback conservador quando a referência necessária não estiver demonstrada.
- null, valores não reconhecidos e registos legados mantêm precisão desconhecida. Estado Go/TBC/TBD/Hold não substitui net_precision. Estados terminais A04 não podem reativar countdown.

**Estado:** catálogo e estrutura do contrato confirmados; permanecem dúvidas de referência temporal dos períodos, representação de NET em precisões não instantâneas e convenções fiscal/década. Sem implementação, migração, sincronização ou publicação.

## Rascunho de implementação A07 — 27/10/2026

Implementação local adiciona JSON net_precision anulável, sem backfill, e mantém NET inalterado. SEC permite HH:mm:ss, MIN HH:mm, HR hora UTC sem minutos; HR não é convertido para o visitante. Apenas SEC permite contagem/exportação exatas e os estados A04 continuam a restringir essas ações. Para todos os períodos amplos, a UI limita-se à granularidade localizada e referência por confirmar; não extrai ano/mês/dia do instante representante cuja convenção não está documentada. Registos antigos/null/IDs desconhecidos não têm contagem/lembrete exatos. A07 não altera timestamps de observação/importação A05.

Antes de eventual publicação: aplicar a migração compatível 20261027_08 antes do código API que lê a coluna. O código anterior ignora a nova coluna. Não executar backfill/sync manual para obter precisão. Rollback operacional deve restaurar o código anterior antes de retirar a coluna; downgrade perde somente o novo metadado, não elimina lançamentos ou sync_control. Migração/rollback testados apenas em PostgreSQL local descartável; nenhuma operação de produção autorizada/executada.
