# Atualizar/publicar o Mobile v0.6 no GitHub Pages

1. Extraia o ZIP.
2. No repositório `controle-financeiro-mobile`, use **Add file → Upload files**.
3. Envie o conteúdo desta pasta, mantendo `index.html`, `app.js`, `styles.css`, `manifest.json` e `sw.js` na raiz e `assets/` como pasta.
4. Faça commit diretamente na branch `main`.
5. Aguarde o GitHub Pages concluir o deploy.
6. Abra novamente o endereço HTTPS do aplicativo.

A v0.6 usa Service Worker network-first e um novo cache, então normalmente a atualização aparece sem precisar limpar manualmente os dados do site.

## Não publicar

Nunca envie credenciais Desktop, arquivos `client_secret*.json`, `credentials.json`, tokens OAuth ou backups contendo dados financeiros.

A origem OAuth no Google Cloud continua sendo apenas o domínio, por exemplo:

`https://SEU_USUARIO.github.io`
