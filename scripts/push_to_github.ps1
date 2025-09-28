Param(
    [Parameter(Mandatory = $false)]
    [string]$RemoteUrl = "https://github.com/anmolxlight/notespro2.git",

    [Parameter(Mandatory = $false)]
    [string]$Branch = "main",

    [Parameter(Mandatory = $false)]
    [string]$UserName,

    [Parameter(Mandatory = $false)]
    [string]$UserEmail
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Arguments
    )
    & git $Arguments
}

Write-Host "==> Ensuring we are at the repository root" -ForegroundColor Cyan
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "==> Checking git installation" -ForegroundColor Cyan
Invoke-Git "--version" | Out-Null

if (-not (Test-Path ".git")) {
    Write-Host "==> Initializing new git repository" -ForegroundColor Cyan
    Invoke-Git "init" | Out-Null
}

Write-Host "==> Setting default branch to '$Branch'" -ForegroundColor Cyan
Invoke-Git "config init.defaultBranch $Branch" | Out-Null

Write-Host "==> Staging all changes" -ForegroundColor Cyan
Invoke-Git "add -A" | Out-Null

$hasCommits = $false
try {
    Invoke-Git "rev-parse --verify HEAD" | Out-Null
    $hasCommits = $true
} catch {
    $hasCommits = $false
}

if ($UserName) { Invoke-Git "config user.name \"$UserName\"" | Out-Null }
if ($UserEmail) { Invoke-Git "config user.email \"$UserEmail\"" | Out-Null }

if ($hasCommits) {
    Write-Host "==> Creating commit if there are staged changes" -ForegroundColor Cyan
    & git diff --cached --quiet
    $hasStagedChanges = $LASTEXITCODE -ne 0
    if ($hasStagedChanges) {
        Invoke-Git "commit -m \"chore: update\"" | Out-Null
    } else {
        Write-Host "==> No changes to commit" -ForegroundColor DarkGray
    }
} else {
    Write-Host "==> Creating initial commit" -ForegroundColor Cyan
    Invoke-Git "commit -m \"chore: initial commit\"" | Out-Null
}

Write-Host "==> Ensuring current branch is '$Branch'" -ForegroundColor Cyan
$currentBranch = (& git rev-parse --abbrev-ref HEAD).Trim()
if ($currentBranch -ne $Branch) {
    Invoke-Git "branch -M $Branch" | Out-Null
}

Write-Host "==> Configuring remote 'origin' => $RemoteUrl" -ForegroundColor Cyan
$remoteExists = $false
try {
    & git remote get-url origin | Out-Null
    $remoteExists = $true
} catch {
    $remoteExists = $false
}

if ($remoteExists) {
    Invoke-Git "remote set-url origin $RemoteUrl" | Out-Null
} else {
    Invoke-Git "remote add origin $RemoteUrl" | Out-Null
}

Write-Host "==> Pushing to origin/$Branch" -ForegroundColor Cyan
Invoke-Git "push -u origin $Branch"

Write-Host "==> Done" -ForegroundColor Green


