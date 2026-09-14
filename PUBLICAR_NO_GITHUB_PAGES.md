# Publicar a v0.9.0 no GitHub Pages

Para evitar arquivos duplicados no celular, prefira o pacote separado:

`Controle_Financeiro_Mobile_v0_8_0_GitHub_Pages_LIMPO.zip`

Ele contém somente os **10 arquivos necessários ao site**:

- `index.html`
- `styles.css`
- `app.js`
- `fgts-calculator.js`
- `parity-core.js`
- `parity-pages.js`
- `sw.js`
- `manifest.json`
- `assets/icon-192.png`
- `assets/icon-512.png`

## Passos

1. Extraia o ZIP limpo no celular.
2. No repositório `controle-financeiro-mobile`, use **Add file → Upload files**.
3. Envie os 8 arquivos da raiz uma única vez.
4. Mantenha os dois ícones dentro da pasta `assets/`.
5. Faça commit na branch `main`.
6. Aguarde o GitHub Pages concluir o deploy.
7. Confirme no cabeçalho **Mobile v0.9.0**.

Não envie o próprio ZIP para o repositório. Os arquivos de documentação, Java, testes e `.bat` do pacote completo também não são necessários para o GitHub Pages.

Se o navegador mantiver versão antiga, feche/reabra o PWA ou limpe apenas o cache do site.
