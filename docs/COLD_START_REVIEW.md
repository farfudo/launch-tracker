# Arranque após inatividade

## Resultado da investigação de 24 de outubro de 2026

A interface depende atualmente de pedidos diretos à API em cada visita. `apps/web/lib/api.ts` usa `cache: no-store` e um limite de 20 segundos em todos os endpoints. Guardar dados no PostgreSQL protege contra falhas da fonte Launch Library, mas não permite ao Next.js apresentar esses dados enquanto a própria API está a iniciar.

Medições feitas deste computador, por HTTPS, com três pedidos de leitura sequenciais:

| Pedido | HTTP | Primeiro byte | Tempo total |
| --- | --- | --- | --- |
| API data-status primeira leitura | 200 | 34,866 s | 34,866 s |
| Página inicial pública depois dessa leitura | 200 | 1,255 s | 3,430 s |
| API data-status repetida | 200 | 0,776 s | 0,776 s |

São amostras, não percentis nem garantia de desempenho. O primeiro pedido já tinha acordado a API antes de medir a página; portanto, o tempo da página não mede uma visita com API adormecida. Não se desligou nenhum serviço para forçar um arranque frio. Os tempos incluem rede, alojamento, aplicação e acesso à base, sem permitir separar cada parcela. O primeiro pedido excedeu em quase 15 segundos o limite da interface.

Render documenta que uma instância Free pode adormecer após 15 minutos sem tráfego e demorar cerca de um minuto a iniciar. Os resultados são compatíveis com essa explicação, mas não provam isoladamente que todo o atraso foi causado pelo Render ou pelo Neon. Não foram lidos segredos, mudadas configurações nem iniciadas sincronizações.

## Proposta local recomendada

Acrescentar cache dos dados públicos no servidor Next.js, com revalidação em segundo plano. Não guardar a página personalizada inteira em cache pública: idioma, cookies e favoritos devem continuar separados dos dados partilháveis.

1. Começar pelas vistas comuns de próximos lançamentos/histórico, opções de filtro, estado dos dados e detalhes de missão. Normalizar as chaves e limitar o âmbito para não criar uma entrada ilimitada para cada texto de pesquisa.
2. Propor revalidação após cinco minutos. Com dados guardados, devolver a última resposta válida sem bloquear a página no arranque da API. Não confundir esse intervalo com a frequência de sincronização Launch Library.
3. Separar hora da consulta e hora original dos dados. Recalcular a idade ao apresentar; não reutilizar indefinidamente um booleano stale guardado antes de a cache envelhecer.
4. Não substituir dados válidos por erros, JSON inválido ou uma lista vazia inventada após falha. Uma resposta vazia legítima continua diferente de indisponibilidade. Preservar a distinção entre 404 de missão e falha temporária.
5. Definir validade máxima e aviso explícito para dados antigos. Proposta inicial de revisão: até seis horas para apresentação de recurso com aviso, sem prometer frescura. Após o limite, explicar indisponibilidade e oferecer nova tentativa. Datas e estados continuam sujeitos a alterações mesmo antes desse limite.
6. Confirmar o comportamento em produção compilada com API fictícia lenta e indisponível. A escolha concreta da primitiva de cache fica condicionada a esse ensaio: o Next.js instalado suporta fetch com revalidação; Cache Components exigiria uma migração mais ampla que não é necessária apenas para esta otimização.

Não basta aumentar o timeout para 60 segundos: permitiria esperar mais, não responder mais depressa. Não se propõem pings para impedir a suspensão, mudança de plano, novas credenciais ou uma cópia da base no navegador.

## Limitações importantes

- Sem uma cópia válida prévia, a primeira consulta ou uma chave nova ainda precisa da API. A cache pode ser removida pelo alojamento; não é uma cópia de segurança.
- A implementação deve testar os detalhes do destaque e o estado dos dados: deixar um único pedido obrigatório sem cache pode manter a página bloqueada.
- O histórico e os próximos lançamentos dependem do relógio. Uma fotografia antiga não pode anunciar descolagem confirmada nem manter uma missão passada como próximo lançamento sem aviso/tratamento.
- Uma simples cache fetch não comprova atualização da página já aberta ou aviso de falha em segundo plano. Estes comportamentos exigem verificação específica; não os declarar entregues por configurar um TTL.
- Consultas diretas Next.js → Neon eliminariam um salto, mas duplicariam responsabilidades e exigiriam acesso adicional à base. Não são a primeira escolha neste incremento.

## Critérios de aceitação do próximo rascunho

- Com cache preenchida e API a demorar 35 segundos, os dados guardados aparecem antes da resposta da API; medir o tempo no mesmo ambiente em vez de prometer um valor público fixo.
- Falha 503, timeout ou JSON inválido não apaga a última resposta válida dentro do limite de recurso.
- Recuperação substitui os dados antigos por uma resposta válida, sem ciclos rápidos ou cliques duplicados.
- Pesquisa, período, missão e origem da API não partilham entradas erradas; idioma e favoritos não vazam entre visitantes.
- Hora e idade dos dados, cache vazia, cache expirada, 404 e mudança de período são testados.
- Documentar diferenças entre cache local, plataforma pública e navegador. Sem deploy, sincronização ou push antes da revisão e aprovação.

## Opções para decisão

- Recomendada: cinco minutos de revalidação, recurso limitado e indicação transparente da idade.
- Mais frequente: um minuto, com mais leituras da nossa API; não atualiza a fonte externa mais depressa.
- Mais conservadora: quinze minutos, com menos leituras mas maior atraso potencial na apresentação.

## Referências

- Render Free e arranque após inatividade: https://render.com/docs/free#spinning-down-on-idle
- Cache de dados e revalidação Next.js: https://nextjs.org/docs/app/guides/caching-without-cache-components
- Fetch no servidor: https://nextjs.org/docs/app/api-reference/functions/fetch
- Também consultada a documentação incluída na versão Next.js 16.4.2 instalada no projeto.

## Rascunho implementado e verificado

Cache de dados públicos no servidor com `unstable_cache`, compatível com a configuração Next.js instalada, sem migração para Cache Components. Revalidação proposta: 300 segundos. As vistas comuns, filtros disponíveis, estado e detalhes usam entradas separadas por origem e argumentos. Pesquisas e filtros aplicados continuam a consultar a API diretamente: evita-se apresentar resultados incompletos filtrando apenas os primeiros 100 lançamentos guardados, ou criar chaves ilimitadas para texto livre.

O destaque inicial já não espera pelo pedido adicional de detalhe; apresenta o resumo da lista e carrega o painel depois. Respostas são validadas antes de entrarem na cache. Erros, timeout e payload inválido não substituem respostas válidas. Um 404 legítimo de detalhe é guardado por cinco minutos; uma falha 503 não é tratada como missão inexistente.

A interface distingue a verificação da sua cópia da atualização original da fonte. A cópia deixa de ser utilizável numa nova leitura após seis horas desde a última consulta válida; isto não garante que a fonte tenha menos de seis horas. A idade da fonte é calculada separadamente. Uma página já aberta não é automaticamente apagada ao atingir esse limite. Missões cujo horário já passou são retiradas da lista de próximos na leitura.

Com página visível e ligação disponível, o aviso pode voltar a consultar a interface a cada dez segundos após o prazo de revalidação, até seis tentativas por conjunto de metadados. Depois oferece nova tentativa manual, sem afirmar que uma falha foi confirmada. O painel de missão usa nova tentativa manual para preservar a seleção do visitante. Não há pings de manutenção da API nem tarefas quando o site está fechado.

Verificação local final: 75 testes, compilação de produção e quatro percursos E2E desktop/móvel passaram. Um ensaio adicional com Next.js compilado e API fictícia confirmou calendário em 25 ms e detalhe em 20 ms perante atraso de 35 segundos; dados preservados perante 503 e payload inválido e substituídos após recuperação. São medições locais, não uma promessa de tempos no Vercel. O teste usa uma origem local nova por execução para não reutilizar cache de outro ensaio. O limite de seis horas e as atualizações do aviso têm testes unitários; não se esperaram seis horas reais.

Preview: `/preview/cache`, apenas com `DESIGN_PREVIEW=true`, usa dados fictícios e revalidação acelerada de cinco segundos. Continua a existir espera numa cache vazia, numa pesquisa sem cache ou após remoção da cache pelo alojamento. A persistência e os tempos reais no Vercel ainda precisam de validação após aprovação e publicação.

Estado: preview aprovada pelo utilizador, com autorização apenas de commit local e intervalo padrão de cinco minutos. Push e publicação não autorizados. Sem deploy, migração ou sincronização de produção neste incremento.
