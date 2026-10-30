# Ride Together — revisão local do rodapé

Prévia: <http://127.0.0.1:3345/>. O servidor local está iniciado; abre a página manualmente e vai até ao rodapé. O bloqueio da revisão automática impediu a inspeção pelo agente e não foi contornado. A versão pública ainda não inclui este incremento.

## Versão implementada

Após “Desenvolvido por farfudo · Código-fonte”:

> Outros projetos · Ride Together — passeios em grupo ↗

Um botão (i), junto ao link, apresenta o contexto: “Uma app em desenvolvimento para organizar passeios em grupo, partilhar a localização durante o passeio e receber alertas quando alguém se afasta.” Reutiliza `InfoDisclosure`: hover, foco/teclado e toque, fecho por Escape ou clique fora. O texto não ocupa uma linha permanente no rodapé. A apresentação completa está em [README do Ride Together](ride-together/README.md).

Ligação: <https://ride-together-app.vercel.app/>. Abre em novo separador e mantém a navegação principal focada no NextRocketLaunch.

| Idioma | Texto |
|---|---|
| PT | Outros projetos · Ride Together — passeios em grupo ↗ |
| EN | Other projects · Ride Together — group rides ↗ |
| ES | Otros proyectos · Ride Together — paseos en grupo ↗ |

## Opções de apresentação

1. **Atual, recomendada:** nome com descrição curta; explica o destino sem ocupar uma secção promocional.
2. **Mais compacta:** “Outros projetos · Ride Together ↗”; ocupa menos espaço mas não explica o tema.

## Verificação

Dois testes de traduções, seis testes existentes dos componentes de informação, ESLint dos ficheiros alterados e TypeScript passaram. O utilizador observou a prévia local e aprovou a versão com (i). Não houve inspeção visual pelo agente em 1440/390 px e modos claro/escuro devido ao bloqueio da revisão automática; não há screenshots nem prova desse conjunto de dimensões/temas. A ligação usa os padrões existentes de cores/foco, `target=_blank`, `rel=noopener noreferrer` e alvo mínimo de 44 px. O URL público foi observado a funcionar na investigação anterior, mas não se iniciou passeio nem se pediu localização.

Validação pré-push concluída: 165 testes unitários/componentes e build passaram; após instalar o Chromium em falta no ambiente, as suites restantes passaram com 70 testes E2E (8 skips condicionais existentes) e 6 testes Starship. Não foram alterados nem enfraquecidos testes. O utilizador aprovou a prévia e autorizou commit/push na branch isolada; merge e deploy não estão autorizados.
