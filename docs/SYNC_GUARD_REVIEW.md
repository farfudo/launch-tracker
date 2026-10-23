# Sincronização protegida — rascunho para aprovação

O utilizador aprovou o intervalo mínimo de 45 minutos e autorizou separadamente o push desta proteção. A ativação do Worker e alterações aos agendadores continuam pendentes de validação da API publicada.

O Worker `nextrocketlaunch-sync` permanece Hello World: sem token, Cron Trigger ou acesso à base. Não foi feita publicação, sincronização pública ou alteração ao agendamento existente nesta etapa.

## Proposta implementada localmente

HTTP e CLI partilham `sync_cache`, evitando que a proteção cubra só o Worker e deixe o GitHub de fora. Um bloqueio transacional PostgreSQL é adquirido antes de verificar a cache e consultar a fonte. Se outro processo o possuir, a execução retorna sem esperar nem consumir quota. O commit publica os dados e liberta o bloqueio; falhas fazem rollback.

Dados atualizados há menos de 45 minutos impedem nova consulta. É um mínimo após sucesso, não um agendamento, uma garantia de pontualidade ou um histórico persistente de tentativas. Falhas da fonte não registam sucesso: uma tentativa futura pode voltar a consultar. Não há tentativas automáticas em ciclo. Uma resposta vazia não apaga a cache e é tratada como falha.

O endpoint mantém a exigência de `SYNC_TOKEN` e `X-Sync-Token`; sem token configurado continua desativado. O token nunca deve ser enviado no chat, incluído numa URL, no código ou em logs. O Worker futuro receberá apenas o segredo de sincronização, não a ligação ao Neon.

Resposta de preview contratual, sem fazer pedidos públicos:

```json
{"imported": 0, "skipped": true, "reason": "in_progress"}
```

```json
{"imported": 0, "skipped": true, "reason": "recently_updated"}
```

```json
{"imported": 100, "skipped": false, "reason": null}
```

Os campos novos são aditivos. A tarefa CLI escreve o motivo quando ignora uma execução. Não é necessária migração de estrutura; o bloqueio é nativo do PostgreSQL. A sincronização protegida recusa outros motores em vez de dar uma falsa garantia entre processos; os testes lógicos SQLite substituem explicitamente a aquisição do bloqueio.

## Verificação

Testes lógicos: bloqueio ocupado sem consultar fornecedor, sucesso, cache recente, cache antiga, falha com rollback/repetição posterior e resposta vazia preservando dados. Teste separado com duas ligações ao PostgreSQL da preview confirmou que a segunda não adquire o bloqueio enquanto a primeira o mantém e consegue adquiri-lo após rollback. Este teste verifica o mecanismo real; não simula dois deploys públicos.

## Decisões e próximos passos

- Proposta: 45 minutos de mínimo; alternativa: 60 minutos, com possível salto de uma execução se houver pequenos atrasos.
- Após aprovação e push separado, validar a versão da API antes de guardar qualquer token no Render/Cloudflare.
- Só então preparar o código do Worker, teste controlado autorizado e Cron Trigger. O GitHub como fallback de dados antigos terá um limiar próprio (por exemplo, 90 minutos) a implementar e testar na etapa seguinte; o mínimo comum de 45 minutos não constitui esse fallback.
- Sem ativar dois agendadores novos antes de confirmar que ambos usam esta versão protegida.
