
function isEmpty(object) {
	return object == null || (Object.keys(object).length === 0 && object.constructor === Object) || object == '';
}
 
function clearHidden(){
	chrome.storage.local.remove(['hide'],function(){
		var error = chrome.runtime.lastError;
		if (error)
			console.error(error);
	});
}

function isVersionLowerThan(version, versionToCheck){
	let versionSplit = version.split('.');
	let checkSplit = versionToCheck.split('.');
	
	if(versionSplit[0] < checkSplit[0])
		return true;
	else if(versionSplit[0] <= checkSplit[0] && versionSplit[1] < checkSplit[1])
		return true;
	else if(versionSplit[0] <= checkSplit[0] && versionSplit[1] <= checkSplit[1] && versionSplit[2] < checkSplit[2])
		return true;
	else if(versionSplit[0] <= checkSplit[0] && versionSplit[1] <= checkSplit[1] && versionSplit[2] <= checkSplit[2] && versionSplit[3] < checkSplit[3])
		return true;
	
	return false;
}
	
chrome.runtime.onInstalled.addListener(function(details){
	chrome.storage.local.get(['showBanner', 'underlineWords', 'version'], function(result){
		if(details.reason == "install"){
			if(isEmpty(result.showBanner))
				chrome.storage.local.set({'showBanner': true});		
			if(isEmpty(result.underlineWords))
				chrome.storage.local.set({'underlineWords': true});
			
			if(isEmpty(result.version))
				chrome.runtime.openOptionsPage();
			chrome.storage.local.set({'version': chrome.runtime.getManifest().version});
		}
	});
});

chrome.runtime.onStartup.addListener(function(){
	clearHidden();
});

chrome.runtime.onMessage.addListener(function(message) {
    switch (message.action) {
        case "openOptionsPage":
			chrome.runtime.openOptionsPage();
            break;
        default:
            break;
    }
});
