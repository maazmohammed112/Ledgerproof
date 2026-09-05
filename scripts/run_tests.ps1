# Run LedgerProof Unit Tests
Write-Host "Executing LedgerProof Test Suite..." -ForegroundColor Green
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
$env:PYTHONPATH = "$PSScriptRoot\.."
python -m pytest "$PSScriptRoot\..\tests" -v
