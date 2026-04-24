# Script pour démarrer le serveur de test et ouvrir la prévisualisation
Write-Host "🚀 Démarrage du serveur de test AGTM..." -ForegroundColor Green

# Vérifier si Python est installé
$pythonCheck = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCheck) {
    Write-Host "❌ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer Python ou ajouter python.exe au PATH" -ForegroundColor Yellow
    exit 1
}

# Vérifier si le port 8000 est disponible
$portCheck = Test-NetConnection -ComputerName localhost -Port 8000 -WarningAction SilentlyContinue
if ($portCheck.TcpTestSucceeded) {
    Write-Host "⚠️  Le port 8000 est déjà utilisé" -ForegroundColor Yellow
    Write-Host "Arrêt du processus utilisant le port 8000..." -ForegroundColor Yellow
    Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Démarrer le serveur Python en arrière-plan
Write-Host "📡 Démarrage du serveur HTTP sur http://localhost:8000..." -ForegroundColor Cyan
$serverProcess = Start-Process python -ArgumentList "-m", "http.server", "8000" -WindowStyle Hidden -PassThru

# Attendre que le serveur démarre
Write-Host "⏳ Attente du démarrage du serveur..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Tester si le serveur répond
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/test-preview.html" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Serveur démarré avec succès !" -ForegroundColor Green
} catch {
    Write-Host "❌ Le serveur ne répond pas" -ForegroundColor Red
    Write-Host "Erreur : $_" -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

# Ouvrir la page de test dans le navigateur par défaut
Write-Host "🌐 Ouverture de la page de test dans le navigateur..." -ForegroundColor Cyan
Start-Process "http://localhost:8000/test-preview.html"

# Afficher les informations de test
Write-Host "`n📋 INFORMATIONS DE TEST" -ForegroundColor Magenta
Write-Host "======================" -ForegroundColor Magenta
Write-Host "URL de test : http://localhost:8000/test-preview.html" -ForegroundColor White
Write-Host "Nouvelle vitrine : http://localhost:8000/vitrine-new.html" -ForegroundColor White
Write-Host "Ancienne vitrine : http://localhost:8000/vitrine-old.html" -ForegroundColor White
Write-Host "Prévisualisation : http://localhost:8000/vitrine-preview.html" -ForegroundColor White
Write-Host "Dashboard : http://localhost:8000/dashboard.html?marketing=1" -ForegroundColor White

Write-Host "`n🔧 COMMANDES UTILES" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
Write-Host "Arrêter le serveur : Stop-Process -Id $($serverProcess.Id)" -ForegroundColor White
Write-Host "Vérifier le serveur : Test-NetConnection -ComputerName localhost -Port 8000" -ForegroundColor White
Write-Host "Logs du serveur : Get-Process -Id $($serverProcess.Id)" -ForegroundColor White

Write-Host "`n🎯 POINTS À VÉRIFIER" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "1. Design system (polices, couleurs)" -ForegroundColor White
Write-Host "2. Responsive (mobile, tablette, desktop)" -ForegroundColor White
Write-Host "3. Navigation (liens internes)" -ForegroundColor White
Write-Host "4. Liens vers dashboard" -ForegroundColor White
Write-Host "5. Animations et interactions" -ForegroundColor White
Write-Host "6. Performance de chargement" -ForegroundColor White

Write-Host "`n⚠️  Pour arrêter le serveur, fermez cette fenêtre ou exécutez :" -ForegroundColor Red
Write-Host "Stop-Process -Id $($serverProcess.Id)" -ForegroundColor Red

# Garder le script en cours d'exécution
Write-Host "`n🔄 Serveur en cours d'exécution..." -ForegroundColor Green
Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Yellow
try {
    while ($true) {
        Start-Sleep -Seconds 10
        # Vérifier périodiquement que le serveur tourne toujours
        if (-not (Get-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue)) {
            Write-Host "❌ Le serveur s'est arrêté" -ForegroundColor Red
            break
        }
    }
} finally {
    # Nettoyage à la sortie
    if (Get-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue) {
        Stop-Process -Id $serverProcess.Id -Force
        Write-Host "🛑 Serveur arrêté" -ForegroundColor Green
    }
}