# Controle Financeiro Mobile v0.6

A v0.6 é uma revisão de qualidade da PWA e da sincronização automática com o mesmo Google Drive usado pelo aplicativo Windows v6.19.

## Melhorias principais

- sincronização automática com revisão + hash local/remoto;
- validação do pacote da nuvem antes de substituir dados locais;
- primeira sincronização protege alterações locais e pode exigir escolha manual;
- conflitos continuam pausados até resolução manual;
- reautenticar no Google ou alterar o intervalo não apaga um conflito pendente;
- tentativa de renovação silenciosa do token Google quando possível;
- sincronização ao voltar para o app, ao recuperar internet e por intervalo;
- cache PWA `network-first`, reduzindo o risco de ficar preso em versão antiga após atualização no GitHub Pages;
- data local correta (sem avançar um dia por causa de UTC no Brasil);
- datas de parcelas com tratamento correto de fim de mês;
- importação CSV com campos entre aspas, SHA-256 e bloqueio de arquivo/identificador duplicado;
- regras de classificação do Windows reaproveitadas no CSV mobile;
- movimentações suportam impacto no orçamento e transferência própria;
- históricos de metas, dívidas e investimentos preservados;
- backup restaurado pausa o automático até você decidir qual versão deve prevalecer;
- Client ID do Google é validado antes de salvar;
- atualização do GitHub Pages não exige mais limpar cache manualmente na maioria dos casos.
- o código público não contém nome, salário, dívidas ou outros exemplos financeiros pessoais; instalação nova começa vazia.

## Sincronização automática

Alterações locais entram em uma fila e normalmente são enviadas alguns segundos depois. O app também verifica revisões novas em intervalos de 30 s, 1 min, 2 min ou 5 min, ao voltar para a tela e ao recuperar conexão.

A sincronização automática funciona enquanto a PWA está aberta/ativa. O navegador pode suspender tarefas quando o app fica fechado ou em segundo plano por muito tempo. Quando o token OAuth expirar, o app tenta renová-lo silenciosamente; se o Google exigir interação, use **Conectar Google Drive**.

## Segurança

O mobile usa somente o OAuth Client ID web. Nunca coloque `client_secret`, `credentials.json`, token OAuth ou backups financeiros no GitHub.

## Publicação

Substitua os arquivos do repositório GitHub Pages pelos desta versão. O `index.html` deve ficar na raiz. O Service Worker usa o cache `financeiro-mobile-v6` e política network-first para buscar a versão atualizada quando houver internet.
