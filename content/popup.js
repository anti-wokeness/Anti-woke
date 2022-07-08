
const checkbox1 = document.getElementById('checkbox1Freedom');
const checkbox2 = document.getElementById('checkbox2Freedom');

chrome.storage.local.get(['showBanner', 'underlineWords'], function(result){
	checkbox1.checked = result.showBanner;
	checkbox2.checked = result.underlineWords;
});

document.getElementById('buttonPopup').addEventListener('click', function(){
	chrome.tabs.create({url: chrome.runtime.getURL('content/whitelistedElements.html')})
});
checkbox1.addEventListener('change', (event) => {
	chrome.storage.local.set({'showBanner': event.currentTarget.checked}, function(){});
})
checkbox2.addEventListener('change', (event) => {
	chrome.storage.local.set({'underlineWords': event.currentTarget.checked}, function(){});
})
document.getElementById('optionsFreedom').addEventListener('click', function(){
	chrome.runtime.openOptionsPage()
});

function addListItemElement(item, parentElement){	
	let elementParent = document.createElement('li');
	elementParent.classList.add('itemListElementParentFreedom');
	elementParent.id = item.name;
	
	let element1 = document.createElement('ul');
	element1.classList.add('itemListElementFreedom');
	element1.classList.add('limitFlexWidth1Freedom');
	element1.innerText = item.name;
	
	let element2 = document.createElement('ul');
	element2.classList.add('itemListElementFreedom');
	element2.classList.add('limitFlexWidth2Freedom');
	
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
	
	let displayable = [];
	
	for (let i = 0; i < liElements.length; i++) {
		const content = liElements[i].getElementsByTagName('ul')[0];
		const txtValue = content.textContent || content.innerText;
	 
		if (txtValue.toUpperCase().indexOf(this.value.toUpperCase()) > -1)
		{
			liElements[i].style.display = 'inline-block';
			displayable.push(liElements[i]);
		}
		else
			liElements[i].style.display = 'none';
	}

	synchDivFreedom.textContent =  displayable.length + ' searchable results';
	if(displayable.length <= 40)
		headerListElement.classList.remove('hiddenFreedom');
	else
		headerListElement.classList.add('hiddenFreedom');
});

let headerListElement = document.createElement('li');
let synchDivFreedom = document.getElementById('synchDivFreedom');
async function main(result){	
	if(isEmpty(result.urlsToWarn))
		result.urlsToWarn = await getUrlsToWarnBackup();
	
	const whitelistDiv = document.getElementById('whitelistDivFreedom');
	
	let flattenedUrlsToWarn = flattenUrlsToWarn(result.urlsToWarn);
	flattenedUrlsToWarn.sort(function(a,b) {return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0);} );
	const itemsDiv = document.getElementById('itemsDivFreedom');
	
	headerListElement.classList.add('headerListElementFreedom');
	headerListElement.classList.add('hiddenFreedom');
	
	for(item in flattenedUrlsToWarn)
		addListItemElement(flattenedUrlsToWarn[item], headerListElement);
	
	itemsDiv.appendChild(headerListElement);
	synchDivFreedom.textContent =  flattenedUrlsToWarn.length + ' searchable results';
}

chrome.storage.local.get(['lastSync', 'urlsToWarn'], function(result){
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
