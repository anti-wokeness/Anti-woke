# Auto-pack only works for Chrome for an unknown reason
$ZipNameChrome = "../Anti-Woke_Chrome.zip"

$ManifestName = "manifest.json"
$ManifestNameFirefox = "ff_manifest.json"

function ZipArchive() {
	Compress-Archive -Path $ManifestName, content/, icons/, woke.json, notWoke.json, background.js -DestinationPath $ZipNameChrome -CompressionLevel Optimal
}

if (Test-Path $ZipNameChrome) 
{
	Remove-Item $ZipNameChrome
}

#The manifest is named for chrome
if(Test-Path $ManifestNameFirefox){
	ZipArchive
}
else{
	Read-Host -Prompt 'Missing manifest.json file(s). There should be one manifest.json and one ff_manifest.json file in the root directory.'
}
