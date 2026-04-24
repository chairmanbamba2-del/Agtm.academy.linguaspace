@echo off
echo ========================================
echo   TEST PREVISUALISATION VITRINE AGTM
echo ========================================
echo.
echo Ce script va demarrer un serveur local pour tester
echo la nouvelle vitrine AGTM Digital Academy.
echo.
echo Appuyez sur une touche pour continuer...
pause > nul

REM Verifier si Python est installe
python --version > nul 2>&1
if errorlevel 1 (
    echo.
    echo ERREUR: Python n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Python 3.x
    echo.
    pause
    exit /b 1
)

REM Verifier si le port 8000 est utilise
netstat -ano | findstr :8000 > nul
if not errorlevel 1 (
    echo.
    echo ATTENTION: Le port 8000 est deja utilise
    echo.
    echo Processus utilisant le port 8000:
    netstat -ano | findstr :8000
    echo.
    echo Voulez-vous liberer le port ? (O/N)
    set /p choice=
    if /i "%choice%"=="O" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
            taskkill /F /PID %%a > nul 2>&1
        )
        echo Port 8000 libere.
        timeout /t 2 /nobreak > nul
    )
)

echo.
echo Demarrage du serveur sur http://localhost:8000...
echo.

REM Demarrer le serveur Python
start /B python -m http.server 8000

REM Attendre que le serveur demarre
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo   SERVEUR DEMARRE AVEC SUCCES !
echo ========================================
echo.
echo URLs de test:
echo.
echo 1. Page de test:      http://localhost:8000/test-preview.html
echo 2. Nouvelle vitrine:  http://localhost:8000/vitrine-new.html
echo 3. Ancienne vitrine:  http://localhost:8000/vitrine-old.html
echo 4. Preview structure: http://localhost:8000/vitrine-preview.html
echo 5. Dashboard:         http://localhost:8000/dashboard.html?marketing=1
echo.
echo ========================================
echo   INSTRUCTIONS DE TEST
echo ========================================
echo.
echo 1. Ouvrez votre navigateur
echo 2. Allez sur http://localhost:8000/test-preview.html
echo 3. Testez tous les liens
echo 4. Verifiez le responsive (redimensionnez la fenetre)
echo 5. Testez sur mobile (outils developpeur)
echo.
echo ========================================
echo   POUR ARRETER LE SERVEUR
echo ========================================
echo.
echo Appuyez sur Ctrl+C dans cette fenetre
echo OU fermez cette fenetre
echo.
echo Appuyez sur une touche pour ouvrir la page de test...
pause > nul

REM Ouvrir la page de test dans le navigateur par defaut
start http://localhost:8000/test-preview.html

echo.
echo Serveur en cours d'execution...
echo Appuyez sur Ctrl+C pour arreter
echo.

REM Garder la fenetre ouverte
pause > nul

REM Nettoyage a la sortie
taskkill /F /IM python.exe > nul 2>&1
echo Serveur arrete.
pause