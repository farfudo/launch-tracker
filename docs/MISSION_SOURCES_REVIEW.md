# Websites e fontes de missão — revisão local

## Âmbito

Secção «Explorar fontes» no detalhe completo e no painel da missão, com quatro categorias: agência, foguetão, local de lançamento e missão/carga útil. Fontes deixam de estar escondidas no menu de transmissões. Ligações ausentes são assinaladas, sem procurar nem inventar um endereço a partir do nome.

O importador lê `launch_service_provider.info_url`, `rocket.configuration.info_url`, `pad.info_url`, e os `info_urls` da missão e do lançamento. Não utiliza `wiki_url` ou o endereço técnico da API como website oficial. «Missão e carga útil» não comprova que exista uma página individual da carga útil: apresenta apenas os links disponíveis da missão/lançamento.

Pesquisa de referência: esquema LL2 2.3.0 já consultado localmente e exemplos públicos do fornecedor em https://lldev.thespacedevs.com/2.3.0/launcher_configurations/?format=api&ordering=-name . Estes campos indicam websites mas não certificam oficialidade ou disponibilidade. Por isso, a interface diz «Websites indicados pela Launch Library 2», mostra o domínio de destino e não atribui uma etiqueta «oficial». Não foram verificados manualmente todos os destinos nem efetuados pedidos aos websites através do backend.

## Arquitetura e segurança

Reutiliza `mission_links`, coluna JSON já existente, com categoria opcional. Contratos antigos sem categoria continuam na secção de missão. Não há migração nem novo pedido por entidade ao fornecedor. Registos já guardados só recebem categorias novas quando uma sincronização normal os atualizar depois da publicação; não foi feita sincronização de produção neste incremento.

HTTPS obrigatório; endereços com credenciais ou esquemas executáveis são rejeitados. A interface volta a validar, elimina repetições por categoria, mostra domínio e abre em novo separador com `noopener noreferrer`. HTTPS não garante a legitimidade de um site. Não se adicionaram embeds ou carregamento automático de páginas externas.

## Preview e opções

Preview local `/launches/e2e-falcon`, com links `example.com` fictícios, não websites oficiais. Mostra três categorias preenchidas e local sem ligação, para rever ambos os estados. A API fictícia foi reposta sem atraso artificial; o ensaio anterior de lentidão está documentado separadamente.

Opção escolhida: cartões discretos por categoria, com domínio visível e mensagem quando falta informação. Foram apresentadas alternativas de lista compacta ou divulgação colapsada. Após revisão da preview, o utilizador autorizou commit e push. Resultado do envio e dos deploys a confirmar separadamente.

## Verificação

77 testes web, build de produção, 54 testes da API e análise de estilo passaram. Quatro percursos E2E desktop/móvel passaram, incluindo novas verificações de destino, nova aba e ausência de website. Testes do backend confirmam categoria preservada pelo armazenamento e resposta HTTP, compatibilidade com links antigos e rejeição de endereço executável. Testes de interface confirmam deduplicação, tradução e estado sem link. API testada em Python 3.13 com SQLite em memória; sem verificação de produção/PostgreSQL nesta ronda. Aviso de descontinuação do TestClient já conhecido permanece. Preview observada no browser com os cartões e estado ausente; não se abriram destinos externos fictícios.
