@echo off
setlocal
cd /d "%~dp0"

echo ===============================================
echo Controle Financeiro Mobile - v0.3
echo ===============================================
echo.
echo Abra no computador: http://localhost:8080
echo.
echo Para abrir no celular na mesma rede:
echo 1. Execute ipconfig em outra janela.
echo 2. Veja o Endereco IPv4 do computador.
echo 3. No celular abra http://SEU_IP:8080
echo.
echo Pressione Ctrl+C para encerrar.
echo.
python -m http.server 8080 --bind 0.0.0.0
endlocal
