# Rascunho — próximos lançamentos e histórico

Sem migração, sincronização, publicação ou push nesta etapa. A importação mantém o âmbito da fonte upcoming; não passámos a importar um arquivo histórico externo.

- API: parâmetro `period=upcoming|past|all`, predefinição `all` para preservar clientes anteriores. UTC: `net >= agora` em próximos e `net < agora` em histórico. Próximos por data crescente, histórico decrescente, desempate por identificador. Filtros e limite aplicados na base, antes de devolver resultados.
- Interface: predefinição próximos; navegação entre períodos preserva pesquisa, agência, veículo e vista de favoritos. Aplicar/limpar filtros e chips preservam período. Idiomas PT/EN/ES.
- O destaque continua a mostrar a próxima missão futura, mesmo no histórico. A ação “próximos” leva efetivamente à vista futura. Não há contagem decrescente nos cartões históricos.
- Histórico significa data prevista ultrapassada, não descolagem confirmada. Limitado aos 100 registos correspondentes mais recentes guardados; dados e estados antigos podem não ter sido atualizados pela fonte. Não é arquivo completo. As opções de filtro continuam a abranger toda a cache.

Verificação: 28 testes API e Ruff passaram; 53 testes web passaram; build de produção passou. Quatro percursos E2E (dois cenários em desktop e móvel) passaram com API simulada, incluindo troca de período e preservação de pesquisa. API e migrações públicas não foram usadas nos testes. A suite API usa SQLite, não constitui nova validação PostgreSQL.

Preview isolada: http://127.0.0.1:3300/?period=past#launch-calendar com uma missão fictícia de 2020 e duas futuras de 2099. Alternativas de apresentação: separadores no calendário (atual), páginas independentes, ou histórico recolhido. Preferimos separadores para reutilizar filtros e contexto.

Publicação futura: validar primeiro o backend com o novo parâmetro, antes de disponibilizar o frontend que depende dele. Um backend antigo ignora parâmetros desconhecidos e não garante separação por período. Pedir aprovação de preview e confirmação separada de push; coordenar os deploys para evitar essa janela.
