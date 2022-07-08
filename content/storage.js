
function storeItem(storageKey, saveItem, hideBackgroundElement){
	chrome.storage.local.get([storageKey], function(result) {
		let array = [];
		if(!isEmpty(result))
			array = result[storageKey];
		
		array.unshift(saveItem);

		let jsonObj = {};
		jsonObj[storageKey] = array;
	  
		chrome.storage.local.set(jsonObj, function() {
			if(hideBackgroundElement)
				document.getElementById('backgroundElementFreedom').style.display = 'none';
		});
	});
}

function removeItem(storageKey, itemText){	
	chrome.storage.local.get([storageKey], function(result) {
		if(!isEmpty(result))
		{
			let array = [];
			for(let resultItem in result)
			{				
				for(let item in result[resultItem])
				{
					const itemContent = result[resultItem][item];					
					if(itemContent.toString() != itemText)
						array.push(itemContent);
				}
				break;
			}
			let jsonObj = {};
			jsonObj[storageKey] = array;		
			chrome.storage.local.set(jsonObj);
		}
	});
}

function whitelistItem(storageKey, itemText, hideBackgroundElement){
	storeItem(storageKey, itemText, hideBackgroundElement);
}

async function getUrlsToWarnBackup(){	
	return await fetch(chrome.runtime.getURL('urlsToWarn.json'))
	.then(response => response.json())
	.then(json => {
		return json;
	});
}
