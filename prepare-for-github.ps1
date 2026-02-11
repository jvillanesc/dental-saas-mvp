# ============================================
# Prepare Repository for GitHub
# Removes unnecessary files before initial commit
# ============================================

Write-Host "🧹 Cleaning repository for GitHub..." -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot

# Files to remove
$filesToRemove = @(
    "build.bat",
    "login.json",
    "login2.json",
    "sdd.rar",
    "package-lock.json"
)

$removedCount = 0

foreach ($file in $filesToRemove) {
    $filePath = Join-Path $rootPath $file
    if (Test-Path $filePath) {
        try {
            Remove-Item $filePath -Force
            Write-Host "✅ Removed: $file" -ForegroundColor Green
            $removedCount++
        } catch {
            Write-Host "⚠️  Could not remove: $file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⏭️  Not found: $file (already removed)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📊 Summary: Removed $removedCount file(s)" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Repository is now clean and ready for GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. git init" -ForegroundColor White
Write-Host "  2. git add ." -ForegroundColor White
Write-Host "  3. git commit -m 'feat: initial commit - Dental SaaS MVP'" -ForegroundColor White
Write-Host "  4. git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor White
Write-Host "  5. git branch -M main" -ForegroundColor White
Write-Host "  6. git push -u origin main" -ForegroundColor White
Write-Host ""
