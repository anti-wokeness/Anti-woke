
chrome.storage.local.get(['version'], function(result){
	document.getElementById('versionDivFreedom').textContent = 'Version: ' + result.version;
});

chrome.storage.local.get(['lastSync'], function(result){
	const  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	
	let displayString = '';
	let lastSynchSplit = result.lastSync?.split('/');	
	if(!isEmpty(lastSynchSplit) && lastSynchSplit.length > 1)
	{
		lastSynchSplit[1] = months[parseInt(lastSynchSplit[1] - 1)];
		displayString = lastSynchSplit.join('-');
	}
	
	if(isEmpty(displayString)){
		let todaySplit = getTodayFormatted().split('/');	
		todaySplit[1] = months[parseInt(todaySplit[1]) - 1];
		displayString = todaySplit.join('-');
	}
	
	document.getElementById('synchDivFreedom').textContent = 'Last updated: ' + displayString;
});

document.getElementById('buttonFreedom').addEventListener('click', function(){
	if(confirm('Are you sure you want to clear all saved data?')){
		chrome.storage.local.remove(['whitelist', 'underlineWhitelist', 'hide', 'lastSync', 'urlsToWarn'], function(){
			let error = chrome.runtime.lastError;
			if (error)
				console.error(error);
			
			let message = document.getElementById('hiddenFreedom');
			message.textContent = 'Data cleared';
			message.style.cssText = 'display: block;';
			
			document.getElementById('whitelistDivFreedom').style.cssText = 'display: none;';
		});
		chrome.storage.local.set({'showBanner': true, 'underlineWords': true}, function() {});
	}
});

function makeHeaderElement(text, parentElement){
	let headerElement = document.createElement('div');
	headerElement.innerText = text;
	headerElement.classList.add('headerElementFreedom');
	return headerElement;
}

function addItemElement(itemName, parentElement, removeItemKey){
	let elementParent = document.createElement('div');
	elementParent.classList.add('itemElementParentFreedom');
	elementParent.id = itemName;
	
	let elementSpan = document.createElement('span');
	elementSpan.classList.add('itemElementFreedom');
	elementSpan.innerText = itemName;

	const button = createButton('Remove', ['buttonBaseFreedom', 'buttonRedFreedom'], function(){
		removeItem(removeItemKey, itemName);
		let child = document.getElementById(itemName);
		let parent = child.parentElement;
		child.remove();
		
		if(parent.childElementCount <= 0)
			parent.remove()
	});
	
	elementParent.appendChild(button);	
	elementParent.appendChild(elementSpan);
	parentElement.appendChild(elementParent);
}

function addListItemElement(item, parentElement){
	let elementParent = document.createElement('li');
	elementParent.classList.add('itemListElementParentFreedom');
	elementParent.id = item.name;
	
	let element1 = document.createElement('ul');
	element1.classList.add('itemListElementFreedom');
	element1.classList.add('limitWidthFreedom');
	element1.innerText = item.name;
	
	let element2 = document.createElement('ul');
	element2.classList.add('itemListElementFreedom');
	
	let div = document.createElement('span');
	div.textContent = item.text;
	element2.appendChild(div);
	element2.appendChild(getSourceText(item));
	
	elementParent.appendChild(element1);
	elementParent.appendChild(element2);	
	parentElement.appendChild(elementParent);
}

document.getElementById('searchFieldFreedom').addEventListener('keyup', function(){
  let liElements = document.getElementById('itemsDivFreedom').firstChild.getElementsByTagName('li');

  for (let i = 0; i < liElements.length; i++) {
    const content = liElements[i].getElementsByTagName('ul')[0];
    const txtValue = content.textContent || content.innerText;
	
    if (txtValue.toUpperCase().indexOf(this.value.toUpperCase()) > -1)
		liElements[i].style.display = 'flex';
    else
		liElements[i].style.display = 'none';
  }
});

async function main(result){
	if(isEmpty(result.urlsToWarn))
		result.urlsToWarn = await getUrlsToWarnBackup();
	
	const whitelistDiv = document.getElementById('whitelistDivFreedom');	
	const underlineWhitelist = [].concat(result.underlineWhitelist).filter(function(x) { return x !== undefined; })
	const whitelistURLs = [].concat(result.whitelist).filter(function(x) { return x !== undefined; });
	const tempHiddenURLs = [].concat(result.hide).filter(function(x) { return x !== undefined; });
		
	if(!isEmpty(underlineWhitelist))
	{
		let headerElement = makeHeaderElement('Not underlining words:', whitelistDiv);
		for(item in underlineWhitelist)
			addItemElement(underlineWhitelist[item], headerElement, 'underlineWhitelist');
		whitelistDiv.appendChild(headerElement);
	}
	if(!isEmpty(whitelistURLs))
	{
		let headerElement = makeHeaderElement('Not showing banner at:', whitelistDiv);
		for(item in whitelistURLs)
			addItemElement(whitelistURLs[item], headerElement, 'whitelist');
		whitelistDiv.appendChild(headerElement);
	}
	if(!isEmpty(tempHiddenURLs))
	{
		let headerElement = makeHeaderElement('Temporarily not showing banner at:', whitelistDiv);
		for(item in tempHiddenURLs)
			addItemElement(tempHiddenURLs[item], headerElement, 'hide');
		whitelistDiv.appendChild(headerElement);
	}
		
	let flattenedUrlsToWarn = flattenUrlsToWarn(result.urlsToWarn);
	flattenedUrlsToWarn.sort(function(a,b) {return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0);} );
	const itemsDiv = document.getElementById('itemsDivFreedom');
	
	let headerListElement = document.createElement('li');
	headerListElement.innerText = 'Websites';
	headerListElement.classList.add('headerListElementFreedom');

	for(item in flattenedUrlsToWarn)
		addListItemElement(flattenedUrlsToWarn[item], headerListElement);
	
	itemsDiv.appendChild(headerListElement);
}

chrome.storage.local.get(['lastSync', 'urlsToWarn', 'whitelist', 'underlineWhitelist', 'hide'], function(result){
	if(isDateInPast(result.lastSync)) 
	{
		fetch('https://api.npoint.io/284bf5ccecabbad9c324')
		.then(response => response.json())
		.then(urlsToWarnJson => {
			chrome.storage.local.set({'lastSync': getTodayFormatted(), 'urlsToWarn': urlsToWarnJson});
			result.urlsToWarn = urlsToWarnJson;
			main(result);
		}).catch(err => {
			console.log('Failed to fetch urlsToWarn: ' + err);
			main(result);
		});
	}
	else {
		main(result);
	}
});
