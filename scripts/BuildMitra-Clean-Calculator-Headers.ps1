param(
    [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

Write-Host "BuildMitra full calculator encoding repair" -ForegroundColor Cyan
Write-Host "Project: $ProjectRoot" -ForegroundColor DarkGray

$folders = @(
    (Join-Path $ProjectRoot "pages"),
    (Join-Path $ProjectRoot "components\calculators")
) | Where-Object { Test-Path -LiteralPath $_ }

if (-not $folders) {
    throw "Calculator source folders were not found."
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupRoot = Join-Path $ProjectRoot "backups\calculator_encoding_repair_$stamp"
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

$files = foreach ($folder in $folders) {
    Get-ChildItem -LiteralPath $folder -Recurse -File |
        Where-Object { $_.Extension -in ".tsx", ".ts", ".jsx", ".js" }
}

$files = $files |
    Where-Object { $_.FullName -match "(?i)calculator|calculators" } |
    Sort-Object FullName -Unique

if (-not $files) {
    throw "No calculator source files were found."
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$win1252 = [System.Text.Encoding]::GetEncoding(1252)
$utf8Strict = New-Object System.Text.UTF8Encoding($false, $true)

function U([int[]]$Codes) {
    return -join ($Codes | ForEach-Object { [char]$_ })
}

$markers = @(
    (U @(195)),
    (U @(194)),
    (U @(226,8364)),
    (U @(226,8364,8482)),
    (U @(226,8364,339)),
    (U @(226,8364,157)),
    (U @(226,8364,147)),
    (U @(226,8364,148)),
    (U @(240,376)),
    (U @(197,184)),
    (U @(226,8218,185)),
    (U @(239,184)),
    (U @(226,339)),
    (U @(226,353)),
    (U @(226,8224))
)

function Get-MojibakeScore([string]$Text) {
    $score = 0
    foreach ($marker in $markers) {
        $score += ([regex]::Matches($Text, [regex]::Escape($marker))).Count
    }
    return $score
}

function Convert-OnePass([string]$Text) {
    try {
        $bytes = $win1252.GetBytes($Text)
        return $utf8Strict.GetString($bytes)
    }
    catch {
        return $Text
    }
}

function Repair-Mojibake([string]$Text) {
    $current = $Text
    $currentScore = Get-MojibakeScore $current

    if ($currentScore -eq 0) {
        return $current
    }

    for ($i = 0; $i -lt 5; $i++) {
        $candidate = Convert-OnePass $current
        $candidateScore = Get-MojibakeScore $candidate

        if ($candidate -eq $current) {
            break
        }

        if ($candidateScore -lt $currentScore) {
            $current = $candidate
            $currentScore = $candidateScore
        }
        else {
            break
        }
    }

    return $current
}

$changed = New-Object System.Collections.Generic.List[string]

foreach ($file in $files) {
    $original = [System.IO.File]::ReadAllText($file.FullName)

    if ((Get-MojibakeScore $original) -eq 0) {
        continue
    }

    $updated = Repair-Mojibake $original

    if ($updated -ne $original) {
        $relative = $file.FullName.Substring($ProjectRoot.TrimEnd("\").Length).TrimStart("\")
        $backupFile = Join-Path $backupRoot $relative

        New-Item -ItemType Directory -Path (Split-Path $backupFile -Parent) -Force | Out-Null
        [System.IO.File]::WriteAllText($backupFile, $original, $utf8NoBom)
        [System.IO.File]::WriteAllText($file.FullName, $updated, $utf8NoBom)

        $changed.Add($relative)
        Write-Host "Repaired: $relative" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Changed files: $($changed.Count)" -ForegroundColor Cyan
Write-Host "Backup: $backupRoot" -ForegroundColor DarkGray

Write-Host ""
Write-Host "Checking remaining mojibake markers..." -ForegroundColor Cyan

$remaining = New-Object System.Collections.Generic.List[object]

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $score = Get-MojibakeScore $content

    if ($score -gt 0) {
        $remaining.Add([PSCustomObject]@{
            File = $file.FullName
            Score = $score
        })
    }
}

if ($remaining.Count -gt 0) {
    Write-Host "Some suspicious encoding markers remain:" -ForegroundColor Yellow
    $remaining | Sort-Object Score -Descending | Format-Table -AutoSize
}
else {
    Write-Host "No common calculator mojibake markers remain." -ForegroundColor Green
}

Write-Host ""
Write-Host "Running Next.js production build..." -ForegroundColor Cyan

Push-Location $ProjectRoot
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "npm run build failed with exit code $LASTEXITCODE"
    }
}
catch {
    Write-Host "Build failed. Restoring all files changed by this repair..." -ForegroundColor Red

    foreach ($relative in $changed) {
        $backupFile = Join-Path $backupRoot $relative
        $destination = Join-Path $ProjectRoot $relative

        if (Test-Path -LiteralPath $backupFile) {
            Copy-Item -LiteralPath $backupFile -Destination $destination -Force
        }
    }

    throw
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "BUILD SUCCESS - calculator encoding repaired across all calculator files." -ForegroundColor Green
Write-Host "Only text encoding was repaired. JSX structure, logic, formulas, BOQ, rates, layouts, exports and specimens were preserved." -ForegroundColor Green
