# Revisão UI — 24 de outubro de 2026

## Âmbito

Inspeção de leitura do site público após `a91dc50`: página inicial, seleção/resumo e detalhe real de Long March 8A, em português, tema claro, viewport desktop 1280×720 e viewport estreito 390×844. A simulação estreita não equivale a um ensaio num dispositivo físico. Tamanho temporário reposto no fim. Sem alterações de código, preferências permanentes, dados, publicação ou sincronização. Não constitui auditoria completa de acessibilidade, contraste ou todos os estados/idiomas.

## Prioridade alta — clareza e ações úteis

1. **Aproximar calendário e primeira missão do início.** No móvel, o destaque e os contadores ocupam praticamente o primeiro ecrã; ainda há várias camadas de controlos antes do primeiro resultado. Reduzir altura/texto do hero no móvel e compactar filtros. Conservar imagem e identidade espacial, com acesso direto ao calendário.
2. **Não promover ações sem conteúdo.** O detalhe consultado apresenta «Ver aqui 0», apesar de não existir vídeo. Ocultar o CTA ou mostrar uma mensagem neutra «Transmissão ainda não disponibilizada», sem o destaque laranja de uma ação disponível.
3. **Título identificável e data principal.** Resumo/detalhe mostram apenas «Unknown Payload», perdendo o nome Long March 8A visível na lista. Preservar veículo ou título completo quando o nome da missão é genérico. No detalhe, apresentar primeiro hora do visitante e estado; UTC e restantes referências ficam claramente identificados como informação adicional. Hoje a data fica abaixo de favorito/calendário/duas ações de partilha, sobretudo no móvel.

## Prioridade média — densidade e consistência

4. **Uma barra de descoberta mais clara.** Atualmente coexistem período, Sobre estes dados, seis chips de agência, pesquisa, Mais filtros, Limpar/Aplicar, Todos/Favoritos. Proposta: período + pesquisa + botão Filtros com contagem; chips ativos removíveis; favoritos como um único controlo consistente. Não retirar opções de pesquisa, apenas reorganizar. No móvel, input deve aproveitar a largura disponível; neste ensaio era estreito dentro do cartão.
5. **Cartões com hierarquia estável.** Nomes longos de agência e contagens DD/HH/MM/SS competem com título/data. Abreviatura apenas quando conhecida, com nome completo acessível; não inventar siglas. Contagem completa reservada à próxima missão/selecionada, restantes com texto compacto. Unificar tamanhos de favorito, alinhamento de fotografia, espaçamentos e área clicável. Segundos em todas as linhas são ruído visual, não valor obrigatório.
6. **Reordenar o detalhe.** Sequência proposta: título/veículo → estado/data → transmissão quando existir → resumo e factos → janela/fusos → fontes. A secção de fontes ocupa atualmente espaço antes da descrição/horários. Na missão observada, três de quatro cartões de fontes estavam vazios; mostrar apenas links existentes e uma explicação compacta para ausências, sem sugerir informação disponível onde não há.

## Acabamentos

- Juntar a ação nativa e copiar num menu «Partilhar», mantendo alternativa de cópia quando necessário. Atualmente são dois botões no topo.
- Remover a segunda marca do detalhe: o cabeçalho global já identifica a aplicação.
- Melhorar legibilidade dos metadados e alvos de toque dos chips; não declarar conformidade WCAG sem medição própria.
- Tornar «Fonte atualizada» a informação de confiança principal. «Cópia da interface verificada» pode estar nos detalhes técnicos em estado saudável; avisos de dados antigos/falha devem continuar visíveis. O resumo observado tinha cópia anterior à do calendário e uma mensagem de resposta não confirmada: explicar o estado sem sugerir uma falha técnica comprovada apenas porque passou o TTL.
- Carregamento contextual: ao abrir um detalhe, apareceu «A carregar lançamentos / A preparar o calendário espacial». Usar «A carregar missão» e, idealmente, uma estrutura de espera correspondente ao detalhe. Manter o foguetão, os textos acessíveis e movimento reduzido.

## Incremento recomendado

Primeiro lote local: compactar hero/filtros no móvel, melhorar título/data do detalhe, corrigir CTA de vídeo vazio e fontes sem conteúdo. Apresentar comparação antes/depois em desktop e móvel, incluindo missão com e sem vídeo/fontes. Num segundo lote, rever contagens/ações de partilha e consistência dos controlos. Novas funcionalidades e mudanças de identidade não são necessárias para esta revisão.

Alternativa mais conservadora: corrigir apenas «Ver aqui 0» e título genérico. Alternativa mais ampla: reorganizar toda a barra de filtros e detalhe no mesmo rascunho, com maior superfície de regressão.

Não implementado: diagnóstico e proposta apenas. Sem testes de código repetidos porque não houve mudança funcional. Qualquer implementação futura requer preview, aprovação e autorização separada de push.
