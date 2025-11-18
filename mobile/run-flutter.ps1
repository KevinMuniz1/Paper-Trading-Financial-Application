# Script to run Flutter with clean build
Write-Host "Killing Java/Gradle processes..." -ForegroundColor Yellow
taskkill /F /IM java.exe 2>$null
taskkill /F /IM gradle.exe 2>$null

Write-Host "Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "Removing build directory..." -ForegroundColor Yellow
if (Test-Path build) {
    Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "IMPORTANT: Make sure OneDrive sync is PAUSED!" -ForegroundColor Red
Write-Host "Right-click OneDrive icon -> Pause syncing -> 2 hours" -ForegroundColor Red
Write-Host "==================================================`n" -ForegroundColor Cyan

Write-Host "Starting Flutter in 5 seconds..." -ForegroundColor Green
Write-Host "Press Ctrl+C now if OneDrive is not paused!" -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Running Flutter..." -ForegroundColor Green
flutter run
