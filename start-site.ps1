$nodeDirectory = Join-Path $PSScriptRoot 'work\tools\node-v24.18.0-win-x64'

if (-not (Test-Path -LiteralPath (Join-Path $nodeDirectory 'node.exe'))) {
    Write-Error '未找到项目专用 Node.js 环境。'
    exit 1
}

$env:Path = "$nodeDirectory;$env:Path"
& (Join-Path $nodeDirectory 'node.exe') (Join-Path $PSScriptRoot 'work\preview-server.mjs')
