# Manutenção das dependências — revisão local

O CI do commit `9eda5ce` terminou com sucesso na execução `39850268191`, incluindo a nova etapa de testes no browser.

## Alterações propostas

- Vitest atualizado de 3.2.7 para 5.0.5. Consultado o guia de migração oficial: https://vitest.dev/guide/migration/.
- Removida a opção antiga `--minWorkers`; mantido um trabalhador de teste.
- README passa a exigir Node 22.12+ na linha 22 ou 24+, compatível com os requisitos desta atualização. O CI usa a linha 22 e Docker usa node:22-alpine.
- Sem mudanças funcionais/visuais, alterações à API ou publicação.

## Auditoria e limites

Antes: oito alertas (dois críticos, cinco altos, um moderado). Depois: cinco altos; nenhum crítico ou moderado. `npm audit --omit=dev` reporta zero alertas, o que não constitui garantia geral de segurança.

Restam avisos na cadeia `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`. A versão mais recente de braces consultada no npm é 3.0.3, ainda abrangida pelo aviso. A correção automática sugerida exige baixar eslint-config-next para 14.2.35, incompatível com a linha 16 usada no projeto. Não aplicámos `audit fix --force`, não ocultámos avisos nem substituímos pacotes por versões inventadas. Os cinco avisos são dependências relacionadas, não cinco falhas independentes na aplicação pública.

Recomendação: aprovar a atualização validada do Vitest e manter os avisos restantes explicitamente pendentes de uma correção compatível. Uma migração alternativa do lint seria uma tarefa separada, com revisão própria.

O utilizador aprovou e autorizou o push deste incremento. Os cinco alertas da cadeia de lint continuam explicitamente pendentes. A validação local passou: 49 testes, dois percursos E2E e compilação de produção.
