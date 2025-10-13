# Set all required environment variables
[System.Environment]::SetEnvironmentVariable("HOME", "C:\Users\Usuario", "Process")
[System.Environment]::SetEnvironmentVariable("USERPROFILE", "C:\Users\Usuario", "Process")

# Verify they're set
Write-Host "HOME = $env:HOME" -ForegroundColor Yellow
Write-Host "USERPROFILE = $env:USERPROFILE" -ForegroundColor Yellow

# Add Solana to PATH
$env:PATH = "C:\Users\Usuario\.local\share\solana\install\active_release\bin;C:\Users\Usuario\.cargo\bin;$env:PATH"

Write-Host "`nStarting build..." -ForegroundColor Green
Write-Host "This may take 5-10 minutes on first build..." -ForegroundColor Cyan

# Run anchor build
& anchor build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Build completed successfully!" -ForegroundColor Green
    Write-Host "`nNext step: Deploy to devnet" -ForegroundColor Cyan
} else {
    Write-Host "`n✗ Build failed" -ForegroundColor Red
    Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
}
