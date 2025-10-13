# Set environment variables and build
$env:HOME = "C:\Users\Usuario"
$env:USERPROFILE = "C:\Users\Usuario"

Write-Host "Building Anchor project..." -ForegroundColor Green
anchor build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBuild successful! ✓" -ForegroundColor Green
} else {
    Write-Host "`nBuild failed with exit code: $LASTEXITCODE" -ForegroundColor Red
}
