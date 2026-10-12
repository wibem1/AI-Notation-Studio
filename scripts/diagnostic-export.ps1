param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Receipt,
    [string]$Destination = '',
    [string]$InitialDirectory = ''
)
$ErrorActionPreference = 'Stop'
$stagingPath = $null
function Get-StreamHash([string]$Path) {
    $stream = [IO.File]::OpenRead($Path)
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-', '') }
    finally { $sha.Dispose(); $stream.Dispose() }
}
function Write-Receipt($Value) {
    [IO.File]::WriteAllText($Receipt, (ConvertTo-Json -InputObject $Value -Compress), (New-Object Text.UTF8Encoding($false)))
}
try {
    $Source = [IO.Path]::GetFullPath($Source)
    if (-not [IO.File]::Exists($Source)) { throw 'Die vorbereitete Diagnosedatei fehlt.' }
    if (-not $Destination) {
        Add-Type -AssemblyName System.Windows.Forms
        $dialog = New-Object Windows.Forms.SaveFileDialog
        try {
            $dialog.Title = 'AI Notation Studio: Diagnose speichern unter'
            $dialog.Filter = 'JSON-Diagnose (*.json)|*.json|Alle Dateien (*.*)|*.*'
            $dialog.DefaultExt = 'json'
            $dialog.AddExtension = $true
            $dialog.OverwritePrompt = $true
            $dialog.FileName = [IO.Path]::GetFileName($Source)
            if ($InitialDirectory -and [IO.Directory]::Exists($InitialDirectory)) { $dialog.InitialDirectory = $InitialDirectory }
            if ($dialog.ShowDialog() -ne [Windows.Forms.DialogResult]::OK) {
                Write-Receipt @{status='cancelled'; source=$Source}
                exit 0
            }
            $Destination = $dialog.FileName
        } finally { $dialog.Dispose() }
    }
    $Destination = [IO.Path]::GetFullPath($Destination)
    if ([string]::Equals($Source, $Destination, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Die Zieldatei darf nicht die vorbereitete Quelldatei sein.'
    }
    $targetDirectory = [IO.Path]::GetDirectoryName($Destination)
    if (-not [IO.Directory]::Exists($targetDirectory)) { throw 'Der Zielordner existiert nicht.' }
    $stagingPath = [IO.Path]::Combine($targetDirectory, '.AI-Notation-Studio-' + [Guid]::NewGuid().ToString('N') + '.tmp')
    $inputStream = [IO.File]::OpenRead($Source)
    try {
        $outputStream = [IO.File]::Open($stagingPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
        try { $inputStream.CopyTo($outputStream, 81920); $outputStream.Flush($true) }
        finally { $outputStream.Dispose() }
    } finally { $inputStream.Dispose() }
    $hash = Get-StreamHash $Source
    if ((Get-StreamHash $stagingPath) -ne $hash) { throw 'Die Nachkontrolle der kopierten Datei ist fehlgeschlagen.' }
    if ([IO.File]::Exists($Destination)) { [IO.File]::Replace($stagingPath, $Destination, [NullString]::Value) }
    else { [IO.File]::Move($stagingPath, $Destination) }
    $stagingPath = $null
    if ((Get-StreamHash $Destination) -ne $hash) { throw 'Die Nachkontrolle der Zieldatei ist fehlgeschlagen.' }
    Write-Receipt @{status='saved'; source=$Source; target=$Destination; bytes=(Get-Item -LiteralPath $Destination).Length; sha256=$hash}
    exit 0
} catch {
    Write-Receipt @{status='error'; source=$Source; message=$_.Exception.Message}
    exit 1
} finally {
    if ($stagingPath -and [IO.File]::Exists($stagingPath)) { [IO.File]::Delete($stagingPath) }
}
