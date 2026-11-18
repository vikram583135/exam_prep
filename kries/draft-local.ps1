param([Parameter(Mandatory)][int]$Topic,[Parameter(Mandatory)][string]$Notes,[Parameter(Mandatory)][string]$Output)
$ErrorActionPreference='Stop'
$prior=$env:OPENAI_API_KEY
try {
 if (-not $prior) {
  $cipher=(Get-Content -Raw -LiteralPath (Join-Path $env:LOCALAPPDATA 'KRIES-Practice/authoring.dpapi')).Trim()
  $env:OPENAI_API_KEY=[pscredential]::new('authoring',(ConvertTo-SecureString $cipher)).GetNetworkCredential().Password
 }
 Push-Location $PSScriptRoot
 try { node draft.mjs $Topic $Notes $Output; if ($LASTEXITCODE) { throw 'Authoring failed' } } finally { Pop-Location }
} finally { $env:OPENAI_API_KEY=$prior }
