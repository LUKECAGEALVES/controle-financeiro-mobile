# Google Drive — Mobile v0.6

A v0.6 usa Google Identity Services + Google Drive API com o escopo `drive.file` e compartilha o mesmo arquivo versionado do Windows v6.19.

## Requisitos

- Google Drive API ativada;
- OAuth Client ID do tipo Web application;
- PWA publicada em HTTPS;
- mesma conta Google usada no Windows;
- origem do GitHub Pages cadastrada em **Authorized JavaScript origins**.

## Configuração

1. Abra **Mais → Configurações e Backup**.
2. Cole apenas o **Google Web Client ID** terminado em `.apps.googleusercontent.com`.
3. Salve.
4. Abra **Mais → Google Drive**.
5. Toque em **Conectar Google Drive**.

Nunca coloque o `client_secret` no app mobile.

## Primeira sincronização

Se o celular ainda não possui checkpoint e já existe uma base no Drive, a v0.6 baixa automaticamente somente quando não há alterações locais pendentes. Se houver alterações locais, a sincronização para e exige uma decisão manual: **Baixar do Drive** ou **Enviar celular**.

## Conflitos

Quando nuvem e celular mudaram desde o último checkpoint, o automático pausa. Reautenticar ou salvar as configurações não limpa o conflito. Resolva conscientemente usando um dos botões manuais; depois o automático volta ao normal.

## Backup local

Ao restaurar um JSON local, o app pausa a sincronização automática. Isso impede que um backup antigo seja publicado no Drive poucos segundos depois sem revisão. Confira os dados e escolha manualmente **Enviar celular** para publicar o backup ou **Baixar do Drive** para descartá-lo.

## Teste local

`http://192.168.x.x:8080` continua útil para testar interface, mas a autenticação Google no celular deve ser usada no endereço HTTPS publicado.
