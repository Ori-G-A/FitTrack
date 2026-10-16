$ErrorActionPreference = 'Stop'
$workspacePath = Split-Path $PSScriptRoot
$reportPath = Join-Path $workspacePath 'test-results/clean-install.log'
New-Item -ItemType Directory -Path (Split-Path $reportPath) -Force | Out-Null
$cleanPath = Join-Path ([IO.Path]::GetTempPath()) ('FitTrack-sdd-clean-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $cleanPath | Out-Null
"Copia limpia: $cleanPath" | Set-Content -LiteralPath $reportPath
foreach ($copyPath in @('package.json','pnpm-lock.yaml','pnpm-workspace.yaml','.node-version','vite.config.js','index.html','vercel.json','src','preview','test','test-support','scripts','browser-tests','playwright.config.js')) {
  Copy-Item -LiteralPath (Join-Path $workspacePath $copyPath) -Destination $cleanPath -Recurse
}
New-Item -ItemType Directory -Path (Join-Path $cleanPath 'supabase') | Out-Null
Copy-Item -LiteralPath (Join-Path $workspacePath 'supabase/migrations') -Destination (Join-Path $cleanPath 'supabase') -Recurse
$steps = @(@('install','--frozen-lockfile'), @('test'), @('build'))
foreach ($step in $steps) {
  "Comando: pnpm --dir COPIA $($step -join ' ')" | Tee-Object -FilePath $reportPath -Append
  & pnpm --dir $cleanPath @step 2>&1 | Tee-Object -FilePath $reportPath -Append
  if ($LASTEXITCODE -ne 0) { throw "Checkpoint falló ($LASTEXITCODE): $($step -join ' ')" }
}
'Instalación, suite y build de copia limpia: OK' | Tee-Object -FilePath $reportPath -Append
