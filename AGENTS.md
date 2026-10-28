# LaunchSkyline collaboration workflow

The user requires a review and explicit approval workflow from 22 October 2026 onward.

- Prepare changes as a local draft and show a working preview before treating them as approved.
- Present a few concrete design or feature adjustment options with the preview.
- Preserve the current public deployment while the draft is under review.
- Ask for explicit confirmation before each GitHub push. Design approval does not by itself authorize a push.
- Do not trigger deployments, production migrations, production syncs, or change the public app for an unapproved draft.
- Local implementation, isolated preview migrations, tests, and read-only research are allowed while preparing the draft.
- Explain decisions and verification in Portuguese, consistent with the user's learning goals.

## Verificação antes de push web
Antes de cada push com alterações web, executar `npm run check:push` em `apps/web`: testes completos de componentes/unidades, build e ambas as suites de navegador usadas pelo CI. Testes direcionados não substituem esta verificação final. Instalar Chromium com `npx playwright install chromium` se necessário. Resolver falhas sem desativar testes; alterações posteriores à validação exigem rever os checks afetados.
