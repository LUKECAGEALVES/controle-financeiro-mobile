# Publicar o Mobile em HTTPS com GitHub Pages

O login Google direto no celular precisa de uma origem HTTPS. GitHub Pages é uma opção simples para a PWA estática.

## 1. Criar o repositório

1. No GitHub, crie um repositório, por exemplo `controle-financeiro-mobile`.
2. Pode deixá-lo público para usar GitHub Pages no plano gratuito. **Não coloque credenciais Desktop, tokens ou dados financeiros no repositório.**
3. Envie somente os arquivos da pasta mobile (`index.html`, `app.js`, `styles.css`, `manifest.json`, `sw.js`, `assets/...`).

## 2. Ativar Pages

1. Abra o repositório no GitHub.
2. Settings > Pages.
3. Em Build and deployment, escolha `Deploy from a branch`.
4. Selecione branch `main` e pasta `/ (root)`.
5. Salve.

O GitHub mostrará um endereço parecido com:

`https://SEU_USUARIO.github.io/controle-financeiro-mobile/`

A origem OAuth a cadastrar no Google Cloud é somente:

`https://SEU_USUARIO.github.io`

## 3. Google Cloud

No OAuth Client ID do tipo **Web application**, adicione em **Authorized JavaScript origins**:

`https://SEU_USUARIO.github.io`

Depois copie o Client ID e cole no Mobile em:

**Mais > Configurações e Backup > Google Web Client ID**

## 4. Importante

- O GitHub Pages hospeda apenas o código estático da PWA.
- Seus dados financeiros não são enviados ao repositório.
- Os dados sincronizados ficam no seu Google Drive, no arquivo do Controle Financeiro.
- Nunca envie `google_drive_credentials.json`, `google_drive_token.json` ou arquivos de backup com seus dados para o GitHub.
