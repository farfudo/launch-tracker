# Revisão local — primeiro percurso E2E

Estado: versão aprovada, com push autorizado pelo utilizador em 22 de outubro de 2026. Não há alterações funcionais ou visuais à aplicação pública; a nova etapa CI só será validada no GitHub após o envio.

## Entrega

- Um percurso completo, executado em dois perfis Chromium: desktop e móvel.
- Servidor de dados fictícios só de leitura na porta 3301, Next.js compilado na porta 3300, ambos em loopback. Sem credenciais, base pública ou consultas à Launch Library.
- Verifica pesquisa e filtros, seleção/detalhe, favorito persistido e removido, opções de transmissão fechadas/abertas por clique e teclado, idioma persistido e tema claro predefinido mesmo com sistema escuro.
- Configuração CI preparada com instalação do browser, execução e evidência retida sete dias. O resultado no GitHub ainda não está validado: exige push aprovado.
- README revisto para NextRocketLaunch e funcionalidades efetivamente existentes, incluindo instalação, testes e limitações.

## Evidência local

49 testes de componentes/unidade passaram; compilação de produção passou; os dois percursos E2E passaram. O primeiro ensaio revelou seletores ambíguos e uma espera de navegação em falta no teste. Corrigimos os seletores pelo painel e nível de título e aguardamos a URL, sem pausas fixas nem mudanças no produto para satisfazer o teste.

Relatórios locais ignorados pelo Git: `apps/web/playwright-report/` e `apps/web/test-results/`. Correr `npm run test:e2e` em `apps/web` depois de `npm run build`; consultar o README.

A auditoria npm nesta revisão reportou oito alertas em dependências de desenvolvimento, incluindo ferramentas de teste/lint. `npm audit --omit=dev` não reportou vulnerabilidades. Não foi aplicado `audit fix --force`; a atualização das ferramentas e revalidação constitui uma tarefa separada. Ausência de alertas na auditoria não equivale a garantia de segurança.

## Opções de aprovação

1. **Recomendada:** incluir este percurso desktop/móvel e o README no próximo push aprovado.
2. Manter o E2E só local, adiando o passo adicional no CI.
3. Alargar depois a Firefox/WebKit e a testes com a API/PostgreSQL reais; não estão cobertos por este primeiro percurso.
