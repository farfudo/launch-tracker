# Auditoria breve publicada — 4/11/2026

Leitura/interações no site público, desktop 1440x900 e mobile 390x844, PT, light/dark. Favorito adicionado e removido, tema reposto no fim; nenhum feedback enviado, evento de calendário criado, partilha transmitida ou código modificado. Não é auditoria exaustiva PT/EN/ES/acessibilidade/performance.

## Prioridades

P1: Navegação da lista filtrada Falcon para USSF-432 (/launches/54d471e8-695c-4fa7-a3cf-dbd8b389e8ae) terminou em erro de carregamento; botão Tentar novamente não recuperou na observação. Erro observado, causa por diagnosticar: não afirmar link morto permanente. Mensagem usa plural lançamentos no detalhe e não oferece ligação explícita de regresso à lista.
P1: Resultados Falcon incluem Starlink Group 15-21 e NROL-195, data 30/11/2026 sem hora e estado Data por definir, com countdown dias/horas/minutos/segundos. Comportamento alinhado com pedido anterior do utilizador de mostrar segundos, mas recomenda-se rever linguagem/precisão para evitar falsa certeza; não alterado nesta auditoria.
P2 mobile: cabeçalho cerca de 200px, destaque cerca de 400px e atividade ocupam primeiro ecrã inteiro; lista abaixo. Propor destaque compacto mobile e estatísticas numa linha ou recolhidas, sem redesenhar desktop.
P2 desktop: aviso de cache ocupa bloco estreito ao lado do título, com várias linhas; propor linha de estado abaixo do título com última verificação acessível no (i), mantendo aviso de falha visível.
P2 calendário: ícone abre modal com título e segundo botão Adicionar ao calendário; só depois mostra Google/.ics e parágrafo longo. Propor opções imediatamente visíveis no modal, aviso curto e explicação expansível. Não foi exportado evento nem validado ficheiro/conta externa.
P3: miniatura Ceres-2 contém foguete horizontal minúsculo/cortado; propor object-fit contain específico para ilustrações ou fallback consistente; não tratar a imagem ilustrativa como fotografia real. Créditos Unknown expostos no destaque podem ser traduzidos/contextualizados.

## O que funcionou

Pesquisar Falcon aplicou q na URL e apresentou resultados correspondentes; filtros recolhem no mobile. Favorito mudou estado imediatamente e o filtro favoritos mostrou a missão certa; removido no fim. Calendário mostrou opções e aviso de evento provisório/cópia estática. Temas light/dark legíveis na inspeção, sem medição formal WCAG. Botões de ações separados do link do cartão; usar calendário/favorito não navegou ao detalhe. Play só observado em missões com vídeo; não se iniciou reprodução externa. Partilha não foi executada. Countdown atualiza visualmente.
