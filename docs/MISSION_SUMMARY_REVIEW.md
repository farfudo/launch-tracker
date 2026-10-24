# Resumo lateral e página completa — revisão local

## Distinção proposta

O painel do calendário passa a «Resumo da missão»: nome, agência/veículo, estado, data na hora do visitante e local de lançamento. Conserva transmissão colapsada quando disponível, favorito e o acesso «Ver detalhes completos». Mantém avisos de cache, carregamento e erro com nova tentativa; não esconde a antiguidade dos dados por simplificar a apresentação.

A página completa conserva descrição integral, plataforma, janela de lançamento, três referências horárias, fontes por entidade, calendário e partilha. Estes elementos são retirados apenas do painel, não da aplicação. Um texto curto explica onde encontrar a informação adicional, em PT/EN/ES.

Em móvel, mantém-se o comportamento atual: o cartão abre diretamente a página completa e o painel lateral não aparece. A simplificação é de apresentação, não uma redução do payload da API: o painel ainda consulta o detalhe para obter local e transmissões. Não se promete melhoria de rede por remover componentes visuais.

## Opções para revisão

- Recomendada: resumo com transmissão colapsada e favorito, mantendo acesso rápido à cobertura.
- Mais minimalista: retirar também a transmissão e deixar apenas o botão para a página completa.
- Informação adicional: incluir uma frase de descrição, sem duplicar o texto integral.

Preview local com missões fictícias no calendário aprovada pelo utilizador, que autorizou apenas commit local. A aplicação pública não foi alterada; push permanece sujeito a autorização separada.

Verificação: 78 testes web e build passaram; quatro percursos E2E desktop/móvel passaram, incluindo ausência de descrição/fontes no painel e presença na página completa. Captura do painel desktop revista visualmente. Backend não alterado nem testes API repetidos neste incremento.
