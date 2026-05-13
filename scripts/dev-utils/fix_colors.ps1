$files = Get-ChildItem -Path "app", "components" -Include *.tsx, *.ts -Recurse
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $newContent = $content -replace '#1ed760', 'var(--gb-success)' `
                           -replace '#ff4b4b', 'var(--gb-danger)' `
                           -replace '#ffc107', 'var(--gb-warning)' `
                           -replace '#35d8ff', 'var(--gb-blue)' `
                           -replace '#ffb3b3', 'var(--gb-danger)' `
                           -replace '#0fa08a', 'var(--gb-copper)' `
                           -replace '#dbe7ff', 'var(--gb-cream)' `
                           -replace 'rgba\(255, 75, 75', 'rgba(226, 109, 90' `
                           -replace 'rgba\(30, 215, 96', 'rgba(103, 197, 135'

    if ($newContent -cne $content) {
        $utf8NoBom = New-Object System.Text.UTF8Encoding $False
        [System.IO.File]::WriteAllText($file.FullName, $newContent, $utf8NoBom)
        Write-Host "Updated: $($file.FullName)"
    }
}
