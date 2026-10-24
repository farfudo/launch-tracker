# Cartões e controlos — pontos 5–6, rascunho local

O lote anterior foi aprovado e guardado em `01ed45b`, sem push. Este segundo lote é uma proposta independente para revisão.

## Alterações

- Primeiro lançamento da vista e missão selecionada conservam contagem completa. Outros lançamentos elegíveis mostram intervalo aproximado, localizado, sem segundos; estados por confirmar mantêm a indicação de incerteza e histórico continua sem countdown.
- O indicador compacto atualiza a cada minuto, o completo a cada segundo. Ambos limpam o temporizador ao desmontar; a data exata continua visível separadamente. «≈» evita apresentar o arredondamento como hora precisa. A contagem não confirma descolagem nem constitui telemetria.
- Metadados de agência/veículo ocupam uma linha com reticências e nome completo no atributo title; nome acessível do link preserva conteúdo. Título limita-se visualmente a duas linhas, com texto completo acessível e disponível na página completa. Sem inventar siglas.
- Favoritos com altura mínima uniforme de 44 px, espaçamento, tamanho de texto e foco visível consistentes.
- Um único controlo expansível «Partilhar missão» revela partilha/cópia. Mantém menu nativo quando suportado, alternativa de clipboard/manual, cancelamento e proteção contra ações duplicadas. Escape fecha e devolve foco ao controlo. É uma divulgação nativa, não um menu ARIA customizado.

## Revisão

Recomendação: manter a contagem completa apenas no primeiro/selecionado e partilha colapsada. Alternativas: retirar toda a contagem secundária (ficando apenas a data), ou manter as duas ações de partilha visíveis. Preview local com dados fictícios; sem mudança de produção, novo commit ou push deste lote.

Verificação: 92 testes web e build passaram; seis percursos E2E desktop/móvel passaram, com verificações de divulgação/fecho por Escape e existência de contagem compacta. Temporizador e limpeza do indicador compacto testados com relógio simulado; cancelamento e alternativas de partilha existentes continuam testados. Preview manual em PT a 1280×900 e 390×844, tamanho temporário reposto. Não houve partilha de mensagens reais nem alteração de API/DB; testes backend não repetidos. O lote continua sem commit e sem aprovação visual final.
