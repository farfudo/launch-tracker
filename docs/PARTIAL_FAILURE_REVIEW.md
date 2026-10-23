# Revisão local — falhas parciais

Rascunho sem push ou publicação. Preview isolada em http://127.0.0.1:3300/ usa apenas a API simulada local (porta 3301); dados de 2099 são fictícios.

- O calendário usa resultados independentes para lançamentos e opções de filtro. Falhas de filtros não apagam lançamentos válidos.
- Aviso traduzido em PT/EN/ES; pesquisa e filtros selecionados mantêm-se disponíveis. Valores selecionados são preservados mesmo quando ausentes das opções recebidas.
- Apenas HTTP 404 no detalhe ativa a página de não encontrado. Outros erros chegam à apresentação de erro temporário com opção de tentar novamente.
- O proxy de detalhes distingue 404 de 502.

Verificação: 52 testes unitários passaram; build de produção com TypeScript passou. Uma verificação TypeScript anterior encontrou um ficheiro duplicado gerado em `.next`; o build regenerou os tipos e terminou sem erro. Preview de produção isolada verificada no browser: calendário visível com filtros em 503 e detalhe 503 apresentado como indisponibilidade, não 404. Não foi simulada uma falha nos serviços públicos.

Opções para revisão: aviso discreto junto aos filtros (atual), cartão âmbar de aviso, ou recolher as opções indisponíveis mantendo a pesquisa. Qualquer alteração e push requerem confirmação separada.
