param(
  [Parameter(Mandatory=$true)]
  [string[]]$Branches
)

Write-Host "=== GearBeat Sprint Finish Checker ===" -ForegroundColor Cyan

git fetch origin

$dangerPatterns = @(
  "^app/api/",
  "^supabase/",
  "migration",
  "\.sql$",
  "\.env",
  "payment",
  "tap",
  "moyasar",
  "hyperpay",
  "auth",
  "route\.ts$",
  "actions\.ts$"
)

$codePatterns = @(
  "^app/",
  "^components/",
  "^lib/",
  "^mobile/",
  "^package\.json$",
  "^package-lock\.json$",
  "^next\.config",
  "^middleware\.ts$",
  "^tsconfig\.json$"
)

foreach ($branch in $Branches) {
  Write-Host "`n===================================" -ForegroundColor Cyan
  Write-Host "Checking branch: $branch" -ForegroundColor Yellow
  Write-Host "===================================" -ForegroundColor Cyan

  git checkout $branch

  if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to checkout branch: $branch" -ForegroundColor Red
    exit 1
  }

  $filesFromMain = git diff --name-only origin/main...HEAD
  $workingFiles = git status --porcelain | ForEach-Object {
    if ($_.Length -ge 4) { $_.Substring(3) }
  }

  $allFiles = @($filesFromMain + $workingFiles) | Where-Object { $_ -ne "" } | Sort-Object -Unique

  if (-not $allFiles -or $allFiles.Count -eq 0) {
    Write-Host "No changes found on branch: $branch" -ForegroundColor Green
    continue
  }

  Write-Host "`nChanged files:" -ForegroundColor Cyan
  $allFiles | ForEach-Object { Write-Host "- $_" }

  $dangerFiles = @()
  $codeFiles = @()

  foreach ($file in $allFiles) {
    foreach ($pattern in $dangerPatterns) {
      if ($file -match $pattern) {
        $dangerFiles += $file
        break
      }
    }

    foreach ($pattern in $codePatterns) {
      if ($file -match $pattern) {
        $codeFiles += $file
        break
      }
    }
  }

  if ($dangerFiles.Count -gt 0) {
    Write-Host "`n!!! BLOCKED: Sensitive files detected on $branch !!!" -ForegroundColor Red
    $dangerFiles | Sort-Object -Unique | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    Write-Host "`nManual review required. Nothing pushed." -ForegroundColor Red
    exit 1
  }

  $status = git status --porcelain

  if ($status) {
    Write-Host "`nUncommitted changes found. Creating local commit..." -ForegroundColor Yellow
    git add .
    git commit -m "$branch final changes"

    if ($LASTEXITCODE -ne 0) {
      Write-Host "Commit failed on $branch" -ForegroundColor Red
      exit 1
    }
  } else {
    Write-Host "`nNo uncommitted changes." -ForegroundColor Green
  }

  if ($codeFiles.Count -gt 0) {
    Write-Host "`nCode/UI files detected. Running npm build..." -ForegroundColor Yellow
    npm run build

    if ($LASTEXITCODE -ne 0) {
      Write-Host "`nBuild failed on branch: $branch. Nothing pushed." -ForegroundColor Red
      exit 1
    }

    Write-Host "Build passed on $branch." -ForegroundColor Green
  } else {
    Write-Host "`nDocs-only/non-code branch. Skipping build." -ForegroundColor Green
  }

  Write-Host "`nPushing branch: $branch" -ForegroundColor Yellow
  git push -u origin $branch

  if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed on branch: $branch" -ForegroundColor Red
    exit 1
  }

  Write-Host "Pushed successfully: $branch" -ForegroundColor Green
}

Write-Host "`n=== Sprint finish completed. All safe branches checked and pushed. ===" -ForegroundColor Green