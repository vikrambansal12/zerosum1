Get-ChildItem -Path 'e:\zerosum_clone\zerosumtechnologies.com' -Filter '*.html' -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'opacity:0', 'opacity:1'
    $content = $content -replace 'transform:translateY\([^)]*\)', ''
    $content = $content -replace 'transform:translateX\([^)]*\)', ''
    $content = $content -replace 'transform:scale\(0\)', ''
    Set-Content -Path $_.FullName -Value $content -NoNewline
    Write-Host ("Fixed: " + $_.FullName)
}
