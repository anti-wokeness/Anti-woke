
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
	document.getElementById('updatedDivFreedom').textContent = 'Last updated: ' + displayString;
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
	element1.classList.add('limitWidth1');
	element1.innerText = item.name;
	
	if(!isEmpty(item.searchNames)){
		for(let i = 0; i < item.searchNames.length; i++)
		{
			let element3 = document.createElement('div');
			element3.innerText = item.searchNames[i];
			element3.style.display = 'none';
			element1.appendChild(element3);
		}
	}
	
	let element2 = document.createElement('ul');
	element2.classList.add('itemListElementFreedom');
	element2.classList.add('limitWidth2');
	
	let div = document.createElement('span');
	div.textContent = item.text;
	element2.appendChild(div);
	element2.appendChild(getSourceText(item));
	
	elementParent.appendChild(element1);
	elementParent.appendChild(element2);	
	parentElement.appendChild(elementParent);
}

function DisplayNotWoke(){
	itemsDivNotWoke.style.display = 'block';
	itemsDivWoke.style.display = 'none';
	resetSearch();
}
function DisplayWoke(){
	itemsDivNotWoke.style.display = 'none';
	itemsDivWoke.style.display = 'block';
	resetSearch();
}

function setUpFromList(json, itemsDiv){
	let flattenedUrlsToWarn = flattenUrlsToWarn(json);
	flattenedUrlsToWarn.sort(function(a,b) {return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0);} );
	
	let headerListElement = document.createElement('li');
	headerListElement.classList.add('headerListElementFreedom');
	
	for(item in flattenedUrlsToWarn)
	{
		let flatItem = flattenedUrlsToWarn[item];
		if(!flatItem.duplicate)
			addListItemElement(flatItem, headerListElement);
	}
	itemsDiv.appendChild(headerListElement);
}

function resetSearch(){
	let liElements;
	if(itemsDivWoke.style.display === 'block')
		liElements = itemsDivWoke.firstChild.getElementsByTagName('li');
	else
		liElements = itemsDivNotWoke.firstChild.getElementsByTagName('li');
	
	let displayable = 0;
	for (let i = 0; i < liElements.length; i++) {
		liElements[i].style.display = 'block';
		displayable++;
	}

	searchField.value = '';
	synchDiv.textContent = displayable + ' searchable results.';
}

function openTab(evt, name, woke) {
	var i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName('tabcontent');
	for (i = 0; i < tabcontent.length; i++) 
		tabcontent[i].style.display = 'none';
		
	tablinks = document.getElementsByClassName('tablinks');
	for (i = 0; i < tablinks.length; i++) 
		tablinks[i].className = tablinks[i].className.replace(' active', '');
	
	let elem = document.getElementById(name);
	elem.style.display = 'block';
	evt.currentTarget.className += ' active';
	
	if(woke)
		DisplayWoke();
	else
		DisplayNotWoke();
}

let searchField;
let synchDiv;
let itemsDivWoke;
let itemsDivNotWoke;

async function main(result){
	synchDiv = document.getElementById('synchDivFreedom');
	itemsDivWoke = document.getElementById('itemsDivWoke');
	itemsDivNotWoke = document.getElementById('itemsDivNotWoke');
	searchField = document.getElementById('searchFieldFreedom');
	
	document.getElementById('wokeButton').addEventListener('click', function (evt) { openTab(evt, 'woke', true); } );
	document.getElementById('notWokeButton').addEventListener('click', function (evt) { openTab(evt, 'notWoke'); } );
	
	searchField.addEventListener('keyup', function(){
		let liElements;
		if(itemsDivWoke.style.display === 'block')
			liElements = itemsDivWoke.firstChild.getElementsByTagName('li');
		else
			liElements = itemsDivNotWoke.firstChild.getElementsByTagName('li');

		let displayable = 0;
		for (let i = 0; i < liElements.length; i++) {
			const content = liElements[i].getElementsByTagName('ul')[0];
			const txtValue = content.textContent || content.innerText;
			
			if((similarity(txtValue, this.value) > 0.5) || (txtValue.toUpperCase().indexOf(this.value.toUpperCase()) > -1))
			{
				liElements[i].style.display = 'block';
				displayable++;
			}
			else
				liElements[i].style.display = 'none';
		}
		
		synchDiv.textContent = displayable + ' searchable results.';
	});

	if(isEmpty(result.woke))
		result.woke = await getBackup('woke.json');
	if(isEmpty(result.notWoke))
		result.notWoke = await getBackup('notWoke.json');
	
	setUpFromList(result.woke, itemsDivWoke);
	setUpFromList(result.notWoke, itemsDivNotWoke);
	resetSearch();
	document.getElementById('wokeButton').click();	
	
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
}

chrome.storage.local.get(['lastSync', 'woke', 'notWoke', 'whitelist', 'underlineWhitelist', 'hide'], function(result){
	if(isDateInPast(result.lastSync)) 
	{
		const urls = [getWokeUrl(), getNotWokeUrl()];
		Promise.all(
			urls.map(url => fetch(url).then(json => json.json()))
		).then(data => {
			chrome.storage.local.set({'lastSync': getTodayFormatted(), 'woke': data[0], 'notWoke': data[1]});
			result.woke = data[0];
			result.notWoke = data[1];
			main(result);
		}).catch(err => {
			console.log('Failed to fetch json: ' + err);
			main(result);
		});
	}
	else {
		main(result);
	}
});