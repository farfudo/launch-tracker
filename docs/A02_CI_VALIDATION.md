# A02 — validação isolada pela CI

Branch autorizada: `codex/a02-e2e-validation`. Base: `b5791d7ce9c45ede1878f0071a4aba5aaa62230a`.

## Isolamento

Worktree separado. Copiados apenas os dois testes A02; alterações A01 e documentos locais no checkout original preservados. Sem PR, merge, push para main, deploy, sync ou mudança de configuração de produção.

`apps/web/vercel.json` desativa Git deployments apenas para esta branch, desde o primeiro commit remoto. Root Directory Vercel confirmado como apps/web; outras branches não são desativadas. Render confirmado com Branch main, Root Directory services/api, Auto-Deploy On Commit e PR Previews Off. Não alterar configurações globais dos fornecedores.

Referência: https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled

## Execução autorizada

Somente `ci.yml`, evento workflow_dispatch e ref desta branch. Alteração temporária do job web: instalação limpa e build de produção necessário ao Playwright; E2E history/discoveries sem retries; lint; unitários; E2E completos sem retries. Artefactos existentes de falha continuam disponíveis. Não levar este ajuste temporário de pipeline ou a exclusão Vercel para main.

Outros jobs CI mantêm PostgreSQL descartável, SQLite e mocks do Worker. A CI não usa NEON_DATABASE_URL/SYNC_TOKEN, não chama Sync launches, deploy hooks ou APIs de produção. Sync launches tem apenas schedule e dispatch próprios; não é iniciado por push da branch nem pelo dispatch de ci.yml. Os agendamentos normais A01 continuam independentemente.

## Estado

Rascunho preparado com autorização explícita de commit/push da branch e execução manual da CI, condicionados à confirmação das proteções acima. Resultado da CI e ausência de deploy devem ser verificados após o envio; não são inferidos do push. Sem validação local completa devido ao bloqueio de carregamento de dependências já documentado; não repetir esse diagnóstico neste worktree.

## Falha adicional observada na CI

Na execução 40397552395, os testes A02 passaram; a suite E2E completa falhou em `info-disclosure.spec.ts` no Chromium mobile: o seletor encontrou dois painéis, um com ID gerado no cliente e outro com ID do HTML inicial. O componente `InfoDisclosure` produz um `<div>` dentro de um `<span>` e, neste caso, dentro de `<strong>`, estrutura HTML inválida. A duplicação observada pode estar relacionada com correção do HTML pelo browser e hidratação; a causa exata da duplicação requer confirmação. Não limitar o seletor para esconder o problema. Investigar e corrigir a estrutura e hidratação no próximo incremento A03/A14, validando teclado, toque e ponteiro. Não se alterou o componente nesta branch A02.

A execução 40428560414 repete a CI isolada existente; os testes A02 são executados antes da suite completa. O teste específico InfoDisclosure não tem etapa individual neste workflow e integra a suite completa.
