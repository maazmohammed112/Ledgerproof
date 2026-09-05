# LedgerProof Local Development Launcher
Write-Host "Starting LedgerProof Frontend on http://localhost:3000..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\..\frontend"
npm run dev
