Write-Host "=== PREPARATION DU DOSSIER DE DEPLOIEMENT ===" -ForegroundColor Cyan
$src = "c:\Users\ibrah\Desktop\AGTM ACADEMY DESIGN\AGTM_DIGITAL_ACADEMY_Premium"
$dst = "$src\DEPLOY"

# Nettoyage + création structure
if(Test-Path $dst) { Remove-Item $dst -Recurse -Force }
@("app","app\icons","app\data","app\netlify\functions","docs","database","migration","rapports") | ForEach-Object {
    New-Item -ItemType Directory -Path "$dst\$_" -Force | Out-Null
}

Write-Host "`n1) APPLICATION PRINCIPALE (dashboard.html + PWA)" -ForegroundColor Green
Copy-Item "$src\dashboard.html" "$dst\app\" -Force
Copy-Item "$src\index.html" "$dst\app\" -Force
Copy-Item "$src\manifest.json" "$dst\app\" -Force
Copy-Item "$src\sw.js" "$dst\app\" -Force
Copy-Item "$src\offline.html" "$dst\app\" -Force
Copy-Item "$src\package.json" "$dst\app\" -Force
Copy-Item "$src\pedagogy-content.js" "$dst\app\" -Force
Copy-Item "$src\netlify.toml" "$dst\app\" -Force
Copy-Item "$src\auth_callback.html" "$dst\app\" -Force
Copy-Item "$src\login.html" "$dst\app\" -Force
Copy-Item "$src\inscription.html" "$dst\app\" -Force
Copy-Item "$src\diagnostic.html" "$dst\app\" -Force
Copy-Item "$src\english_corner.html" "$dst\app\" -Force
Write-Host "  -> OK"

Write-Host "`n2) FORMULAIRES ADMIN" -ForegroundColor Green
Copy-Item "$src\devoir_form.html" "$dst\app\" -Force
Copy-Item "$src\evaluation_form.html" "$dst\app\" -Force
Copy-Item "$src\pointage_form.html" "$dst\app\" -Force
Copy-Item "$src\recrutement_form.html" "$dst\app\" -Force
Write-Host "  -> OK"

Write-Host "`n3) ICONES & DATA" -ForegroundColor Green
Copy-Item "$src\icons\*" "$dst\app\icons\" -Force
Copy-Item "$src\data\*" "$dst\app\data\" -Force
Write-Host "  -> OK"

Write-Host "`n4) FONCTIONS NETLIFY" -ForegroundColor Green
Copy-Item "$src\netlify\functions\*" "$dst\app\netlify\functions\" -Force
Write-Host "  -> OK"

Write-Host "`n5) DOCUMENTATION" -ForegroundColor Green
Copy-Item "$src\guide_utilisation.html" "$dst\docs\" -Force
Copy-Item "$src\presentation_agtm_digital_academy.html" "$dst\docs\" -Force
Copy-Item "$src\README.md" "$dst\docs\" -Force
Copy-Item "$src\DEPLOYMENT.md" "$dst\docs\" -Force
Copy-Item "$src\deployment-guide.md" "$dst\docs\" -Force
Write-Host "  -> OK"

Write-Host "`n6) BASE DE DONNEES (Scripts SQL)" -ForegroundColor Green
Copy-Item "$src\Migration SQL Supabase\*" "$dst\database\" -Force
Write-Host "  -> OK"

Write-Host "`n7) MIGRATIONS SPECIFIQUES" -ForegroundColor Green
Copy-Item "$src\Migration SQL Supabase\supabase_MIGRATION_v46_recommandations_finales.sql" "$dst\migration\v46_recommandations_finales.sql" -Force
Copy-Item "$src\Migration SQL Supabase\supabase_MIGRATION_v45_resilience_cache.sql" "$dst\migration\v45_resilience_cache.sql" -Force
Copy-Item "$src\Migration SQL Supabase\supabase_MIGRATION_v44_part2_cache.sql" "$dst\migration\" -Force
Copy-Item "$src\Migration SQL Supabase\supabase_MIGRATION_v44_part1_listening.sql" "$dst\migration\" -Force
Copy-Item "$src\Migration SQL Supabase\supabase_RLS_security.sql" "$dst\migration\" -Force
Write-Host "  -> OK"

Write-Host "`n8) RAPPORTS D'AUDIT" -ForegroundColor Green
Copy-Item "$src\RAPPORT_AUDIT_FINAL_CONSOLIDE.html" "$dst\rapports\" -Force
Copy-Item "$src\RAPPORT_RECOMMANDATIONS_FINALES.html" "$dst\rapports\" -Force
Copy-Item "$src\RAPPORT_DIAGNOSTIC_COMPLET_AGTM.html" "$dst\rapports\" -Force
Copy-Item "$src\RAPPORT_CORRECTIONS_IA_APPLIQUEES.md" "$dst\rapports\" -Force
Copy-Item "$src\RAPPORT_OPTIMISATION_RESILIENCE.html" "$dst\rapports\" -Force
Copy-Item "$src\RAPPORT_AUDIT_FINANCE_RH.html" "$dst\rapports\" -Force
Write-Host "  -> OK"

Write-Host "`n=== RECAPITULATIF ===" -ForegroundColor Yellow
$files = Get-ChildItem -Recurse $dst | Where-Object { -not $_.PSIsContainer }
$totalSize = ($files | Measure-Object -Property Length -Sum).Sum
Write-Host ("Fichiers: " + $files.Count + " | Taille totale: " + ("{0:N2} MB" -f ($totalSize/1MB)))

Write-Host "`n=== STRUCTURE ===" -ForegroundColor Cyan
Get-ChildItem $dst -Recurse | Where-Object { $_.PSIsContainer } | ForEach-Object {
    $count = (Get-ChildItem $_.FullName | Where-Object { -not $_.PSIsContainer }).Count
    Write-Host ("  " + $_.FullName.Substring($dst.Length+1) + " ($count fichiers)")
}
