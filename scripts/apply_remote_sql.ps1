$sqlFiles = @(
    "scripts/fix_all_policies.sql",
    "scripts/add_admin_policies.sql"
)

$serviceRoleKey = "sb_secret_CSFp_jRaUe_YQ9EZ-tPi1g_67lZS6_y"
$projectRef = "mctcnnmtudksgzuzknjo"

foreach ($file in $sqlFiles) {
    $sql = Get-Content $file -Raw
    Write-Host "Applying: $file"
    
    $body = @{
        query = $sql
    } | ConvertTo-Json

    $response = curl.exe -s -X POST "https://api.supabase.com/v1/projects/$projectRef/database/query" `
        -H "Authorization: Bearer $serviceRoleKey" `
        -H "Content-Type: application/json" `
        -H "Accept: application/json" `
        -d $body

    Write-Host "Response: $response"
    Write-Host "---"
}
