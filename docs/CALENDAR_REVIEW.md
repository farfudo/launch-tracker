# Adicionar ao calendário — proposta local

Botão no painel selecionado e na página completa, em PT/EN/ES. Um menu nativo acessível oferece Google Calendar (novo separador) e download .ics para importação em Apple Calendar/Outlook. Nenhum evento é criado sem ação posterior no calendário do utilizador. Sem contas, permissões, scripts externos, nova API ou migração.

Critério conservador: estado Go/Go for launch, datas com fuso e janela válida que inclua NET. A API não guarda net_precision: esta regra não garante precisão absoluta, mas exclui TBD/TBC e dados incompletos. Exporta apenas a hora prevista como evento pontual, sem inventar duração nem alarmes. UTC preserva o instante nos diferentes fusos. O aviso explica que é uma cópia sem atualizações automáticas. UID estável não garante deduplicação em todos os clientes.

ICS segue RFC 5545: CRLF, escaping TEXT, folding UTF-8 a 75 octetos, UID/DTSTAMP/DTSTART e estado TENTATIVE. Referência: https://www.rfc-editor.org/rfc/rfc5545.html. Google usa URL TEMPLATE, sem integração autenticada. Compatibilidade com aplicações externas exige confirmação na importação; não foi criado qualquer evento externo.

Opções para revisão: (1) proposta conservadora atual; (2) permitir também TBC com aviso reforçado; (3) acrescentar net_precision à persistência antes de alargar disponibilidade. Produção preservada; sem commit/push nesta fase.

Verificação: 46 testes frontend passaram; lint e build passaram. Testes cobrem elegibilidade, UTC, escaping/injeção, folding Unicode, UID, links e estado desativado. Preview reconstruída apenas na porta 3200; menu confirmado no painel desktop e na página completa em smartphone de 390px, sem overflow horizontal. Não foi testada importação real em contas de calendário externas.
