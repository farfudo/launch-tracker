# Revisão visual — rascunho local

Alteração solicitada após revisão estética, sem commit, push ou publicação.

- Cabeçalho: removidos atalhos redundantes Lançamentos/Favoritos; mantém marca ligada ao início, tema e idioma.
- Idioma: PT/EN/ES visível; seletor nativo conserva nomes completos, label acessível e teclado. Alvos de controlo com pelo menos 44 px de altura.
- Calendário: períodos apresentados como navegação com sublinhado e aria-current; filtros por agência conservam chips; favoritos continuam no calendário.
- Destaque reduzido em ecrãs até 800 px; indicadores resumidos aos números de missões/agências.
- Explicações longas recolhidas em “Sobre estes dados”, disponíveis nos três idiomas.
- Detalhe conserva cartões e estado destacado; elimina repetição de agência, veículo e local no hero. A navegação de regresso mantém-se.
- Rodapé inicial com perfil GitHub farfudo e ligação separada ao repositório, sem widgets, rastreio ou email. Ligações externas com noopener/noreferrer.

Verificação: 53 testes unitários, build e quatro percursos E2E desktop/móvel passaram. Percursos verificam ausência da navegação redundante, código de idioma e URLs GitHub. Preview usa dados fictícios isolados na porta 3300. Não constitui auditoria completa de acessibilidade.

Opções de revisão: sublinhado para períodos (atual) versus controlo segmentado; autoria textual (atual) versus ícone acompanhado de texto. Evitar ícone isolado sem nome acessível.
