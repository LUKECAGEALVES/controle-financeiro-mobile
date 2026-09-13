# Google Drive — Mobile v0.7

O Mobile v0.7 usa o mesmo arquivo `controle_financeiro_sync.json` da versão Windows v7.2.

- Use somente o OAuth Client ID do tipo **Aplicativo da Web** no mobile.
- Nunca coloque `client_secret` no código, GitHub ou navegador.
- A origem JavaScript autorizada deve corresponder ao domínio do GitHub Pages.
- A sincronização automática respeita revisão/hash e interrompe em caso de conflito.
- Os botões manuais permanecem disponíveis para recuperação e resolução de conflito.

O formato sincronizado inclui coleções financeiras, históricos, cenários, categorias, regras, conciliações e dados administrativos consultáveis necessários para a paridade funcional.
