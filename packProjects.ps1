# Auto-pack only works for Chrome for an unknown reason
$ZipNameChrome = "../FreeSpeech_Chrome.zip"

$ManifestName = "manifest.json"
$ManifestNameFirefox = "manifest_firefox.json"
$ManifestNameChrome = "manifest_chrome.json"

function ZipArchive() {
	Compress-Archive -Path $ManifestName, content/, icons/, urlsToWarn.json, background.js -DestinationPath $ZipNameChrome -CompressionLevel Optimal
}

if (Test-Path $ZipNameChrome) 
{
	Remove-Item $ZipNameChrome
}

#The manifest is named for chrome
if(Test-Path $ManifestNameFirefox){
	ZipArchive
}
elseif(Test-Path $ManifestNameChrome){
	Rename-Item -Path $ManifestName -NewName $ManifestNameFirefox
	Rename-Item -Path $ManifestNameChrome -NewName $ManifestName
	ZipArchive
}
else{
	Read-Host -Prompt 'Missing manifest.json file(s). There should be one manifest.json and one manifest_firefox.json file in the root directory.'
}
