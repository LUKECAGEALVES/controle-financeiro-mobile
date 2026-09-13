# Google Drive — Mobile v0.4

A v0.4 contém conexão real com a Google Drive API usando Google Identity Services e o escopo `drive.file`.

## Requisitos

- Google Drive API ativada no Google Cloud;
- OAuth Client ID do tipo Web application;
- PWA publicada em HTTPS;
- mesma conta Google usada no aplicativo Windows.

## Configuração

1. No Google Cloud, crie um OAuth Client ID do tipo **Web application** no mesmo projeto usado pelo Windows.
2. Cadastre a origem HTTPS da PWA em **Authorized JavaScript origins**.
3. No app: **Mais > Configurações e Backup**.
4. Cole o **Google Web Client ID** e salve.
5. Abra **Mais > Google Drive**.
6. Toque em **Conectar Google Drive**.

## Primeira sincronização

Se o PC já contém seus dados principais, faça primeiro no Windows:

**Configurações > Google Drive > Enviar este PC**

Depois no celular use:

**Google Drive > Baixar do Drive**

## Teste local

O endereço `http://192.168.x.x:8080` continua funcionando para testar interface e dados locais, mas o login Google direto no navegador requer HTTPS. Para o uso final, publique esta pasta em GitHub Pages ou outra hospedagem HTTPS.
