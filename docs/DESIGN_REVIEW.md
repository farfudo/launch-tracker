# Rascunho — detalhe visual dos lançamentos

Estado: visual «Controlo de missão» aprovado pelo utilizador em 22 de outubro de 2026; push autorizado separadamente na mesma data. Esta é a variante predefinida fora da preview. A publicação depende dos serviços de alojamento após o push.

## Comparação local

A versão aprovada continua na porta 3100. O rascunho usa a porta 3200, imagens Docker e volume PostgreSQL próprios:

```sh
DEMO_DATABASE_PASSWORD=validation-only docker compose -f compose.preview.yaml up -d --build
```

A palavra-passe acima serve exclusivamente o ensaio local, cuja base não expõe uma porta ao exterior. O volume `launchskyline-preview_preview_data` é separado do volume da demonstração aprovada.

Exemplo para comparação:

- Controlo de missão: http://127.0.0.1:3200/launches/f6af629d-39b5-4f86-bc0c-f8776444a858?design=mission-control
- Cinemático: http://127.0.0.1:3200/launches/f6af629d-39b5-4f86-bc0c-f8776444a858?design=cinematic
- Compacto: http://127.0.0.1:3200/launches/f6af629d-39b5-4f86-bc0c-f8776444a858?design=compact

O seletor de variantes só aparece com `DESIGN_PREVIEW=true`. As datas, descrição, fonte e horários permanecem acessíveis nas três variantes. A linha da janela é uma representação dos horários previstos, não de telemetria ou progresso em tempo real.

## Imagens

A normalização prefere `rocket.configuration.image`; na ausência de uma imagem válida do veículo, usa `launch.image`, identificada como imagem associada à missão. Preserva URL, título, crédito, nome/link da licença e tipo da imagem. Valores ausentes e falhas de carregamento apresentam uma ilustração temática, sem a identificar como representação técnica do veículo.

O exemplo Falcon 9 usa a fotografia «Falcon 9 liftoff from LC-39A», crédito SpaceX, com a licença CC BY-NC 2.0 indicada pela Launch Library. A legenda informa que é uma fotografia de referência e pode corresponder a outra missão. A atribuição da fonte não é apresentada como garantia de autorização para uso comercial.

A migração `20261022_05` foi preparada para os metadados da imagem. Nesta revisão só pode ser aplicada à base isolada da preview. A base pública e a base da porta 3100 não devem ser alteradas antes da aprovação.

## Fluxo de aprovação

1. Mostrar a preview e as três opções ao utilizador.
2. Recolher aprovação do visual e eventuais ajustes.
3. Pedir autorização explícita para push da versão aprovada.
4. Só depois enviar para o GitHub, aplicar migrações públicas e preencher imagens por sincronização.

As preferências permanentes do utilizador também ficam registadas em `AGENTS.md`.
