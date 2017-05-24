$extension = $app.Split('-')[1];

$confd = "$persist_dir\..\php\conf.d"

if ((test-path $confd)) {
    $confd = Convert-Path $confd
    Write-Output "Enabling extension $confd\ext-$extension.ini"
    # create ini file
    Write-Output "extension=$dir\php_$extension.dll" | Set-Content "$confd\ext-$extension.ini"
    # create uninstaller
    Write-Output "Remove-Item -Force -ErrorAction Ignore '$confd\ext-$extension.ini'" | Set-Content "$dir\uninstall.ps1"
}
else {
    Write-Host -f Yellow "PHP was not installed through scoop"
    Write-Host "You can activate it manually by adding 'extension=$dir\php_$extension.dll' to your php.ini"
}
