@echo off
setlocal
cd /d "%~dp0"

echo ===============================================
echo Controle Financeiro Mobile - v0.6
echo ===============================================
echo.
echo Abra no computador: http://localhost:8080
echo.
echo Para abrir no celular na mesma rede:
echo 1. Execute ipconfig em outra janela.
echo 2. Veja o Endereco IPv4 do computador.
echo 3. No celular abra http://SEU_IP:8080
echo.
echo Observacao: o login Google OAuth deve ser testado pelo endereco HTTPS do GitHub Pages.
echo.
echo Pressione Ctrl+C para encerrar.
echo.

where py >nul 2>&1
if not errorlevel 1 (
  py -m http.server 8080 --bind 0.0.0.0
  goto :fim
)

where python >nul 2>&1
if not errorlevel 1 (
  python -m http.server 8080 --bind 0.0.0.0
  goto :fim
)

echo [ERRO] Python nao foi encontrado. Instale o Python ou use o GitHub Pages.
pause

:fim
endlocal
