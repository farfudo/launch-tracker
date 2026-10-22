# Favoritos — versão aprovada

Em 22 de outubro de 2026, o utilizador aprovou estrela com texto nos cartões e no detalhe e autorizou separadamente o push para o GitHub.

## Critérios de aceitação

- Guardar/remover um lançamento no calendário e no detalhe sem ativar a navegação do cartão.
- Manter a seleção após recarregar o navegador; refletir alterações entre separadores da mesma origem.
- Filtrar «Os meus favoritos» em combinação com pesquisa, agência e veículo. Os parâmetros de filtro ficam na URL; os identificadores favoritos não são enviados à API.
- Apresentar textos em português, inglês e espanhol e indicar quando não há favoritos ou não há correspondências com os resultados atuais.
- Informar uma falha de escrita no armazenamento sem apresentar a seleção como guardada.

## Decisão técnica

`localStorage`, chave `launchskyline_favorites_v1`, guarda apenas identificadores. A API, Neon e as migrações não mudam. `useSyncExternalStore` mantém componentes coerentes e evita ler APIs do navegador durante a apresentação inicial do servidor. A lista consulta até 100 lançamentos da cache em vez dos anteriores 20; a API mantém o limite de 100. O filtro dos favoritos é feito no navegador sobre esses resultados.

Não existe histórico de missões guardado pelo favorito: lançamentos fora da cache/resposta atual não aparecem na lista, mas o identificador não é apagado. Sem contas, os favoritos não acompanham o utilizador entre dispositivos, navegadores ou origens (a preview 3200 é distinta do site público). Limpar dados do site elimina-os; navegação privada pode não os preservar.

## Opções a rever na preview

1. **Proposta implementada:** estrela com texto «Guardar favorito»/«Guardado», nos cartões e no detalhe, e duas vistas no calendário.
2. Estrela sem texto visível, mantendo nome acessível — mais discreta, menos explícita.
3. Favoritos apenas no detalhe — cartões mais limpos, mas exige abrir cada lançamento.

## Verificação

28 testes da interface passaram e a compilação de produção passou. Os seis novos testes cobrem dados malformados, persistência após remontagem, remoção, escrita bloqueada, atualização entre separadores e lista filtrada. A verificação manual no browser complementa os testes. Os cenários de armazenamento privado dependem das regras do navegador, não de garantias da aplicação.

O push desta funcionalidade foi autorizado. As alterações documentais anteriores sobre fiabilidade continuam separadas e por aprovar, não sendo incluídas neste envio. A sincronização automática permanece sob acompanhamento; favoritos não resolve esse ponto.
