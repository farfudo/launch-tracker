# Vídeos e ligações das missões — revisão local

## Fonte e recolha

O esquema oficial da Launch Library 2.3.0 disponibiliza `vid_urls` e `info_urls` no serializer `LaunchDetailed`, mas não em `LaunchNormal`. A sincronização usa agora `mode=detailed`, mantendo um único pedido por execução e o tratamento de 429 sem repetições automáticas. Não há consultas ao fornecedor durante a navegação.

O timeout do pedido de sincronização passa de 10 para 30 segundos, para acomodar a resposta detalhada maior. O timeout da interface para a nossa API mantém-se nos 20 segundos existentes.

Referências: https://ll.thespacedevs.com/2.3.0/schema/ e https://github.com/TheSpaceDevs/Tutorials/blob/main/announcements/LL_230_changelog.md

As ligações de vídeo preservam URL, título, publisher/source, prioridade, início/fim e o campo `live` quando fornecido como booleano. A flag de direto global da missão não é propagada a todos os vídeos. Só são aceites URLs HTTPS sem credenciais, com deduplicação por URL. As ligações informativas têm a mesma validação; nenhuma é rotulada automaticamente como oficial, porque a fonte também inclui cobertura independente.

## Interface

- O destaque mostra «Ver transmissão» apenas quando existe uma ligação de vídeo válida; identifica o domínio e abre num novo separador.
- O painel e a página completa mostram vídeos e ligações da missão com a respetiva origem.
- Os estados são explicitamente relativos à última atualização: «Indicado em direto na última atualização», «Agendado na última atualização» ou «Ligação de vídeo disponível».
- O início de um vídeo nunca é inferido pela hora de lançamento. Ausência de URL é apresentada como ausência nos dados em cache, não como prova de que não existe transmissão.
- Data da última consulta e aviso de disponibilidade variável acompanham os links. Não são carregados players, scripts ou embeds externos.
- Textos disponíveis em português, inglês e espanhol.

## Publicação

Migração aditiva `20261022_06`: duas colunas JSON (`streams`, `mission_links`) com listas vazias por defeito. Registos existentes continuam válidos. A próxima sincronização com o novo código preenche os campos; uma URL removida na fonte é removida da cache após uma sincronização bem-sucedida.

Aplicar a migração antes de iniciar a API e o sincronizador novos. A interface tolera a ausência dos novos campos durante a transição. O arranque da API já executa Alembic, mas deve confirmar-se o sucesso no alojamento. Nenhuma migração, sincronização ou publicação de produção foi executada durante esta implementação.

## Verificação

41 testes da interface e 22 da API passaram, assim como lint e build. Cobrem URLs inválidas, credenciais, duplicados, metadados em falta, flags de direto malformadas, modo detailed num único pedido, persistência/remoção dos links e estados da interface sem inventar uma transmissão.

A migração foi aplicada na base local da preview. A primeira sincronização com timeout de 10 segundos falhou sem modificar a cache. Uma resposta real de 100 lançamentos foi obtida e validada: 5 missões com vídeo e 8 com ligações informativas. Essa mesma resposta foi importada apenas na preview, sem um novo pedido ao fornecedor. Foi confirmado o vídeo do destaque e as ligações do painel; não foi acionado playback nem uma publicação externa.

O commit público `369a040` e os controlos de botão responsivo e filtro com carregamento foram confirmados no site público antes desta alteração.
