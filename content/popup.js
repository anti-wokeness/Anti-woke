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
	element2.classList.add('limitFlexWidth2Freedom');
	
	let div = document.createElement('span');
	div.textContent = item.text;
	element2.appendChild(div);
	element2.appendChild(getSourceText(item));
	
	elementParent.appendChild(element1);
	elementParent.appendChild(element2);	
	parentElement.appendChild(elementParent);
}

function setUpFromList(json, itemsDiv){
	let flattenedUrlsToWarn = flattenUrlsToWarn(json);
	flattenedUrlsToWarn.sort(function(a,b) {return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0);} );
	
	headerListElement = document.createElement('li');
	headerListElement.classList.add('headerListElementFreedom');
	
	for(item in flattenedUrlsToWarn)
	{
		let flatItem = flattenedUrlsToWarn[item];
		if(!flatItem.duplicate){
			addListItemElement(flatItem, headerListElement);
		}
	}
	itemsDiv.appendChild(headerListElement);
}

function resetSearch(){
	let liElements = itemsDivWoke.firstChild.getElementsByTagName('li');
	
	let displayable = 0;
	for (let i = 0; i < liElements.length; i++) {
		liElements[i].style.display = 'block';
		displayable++;
	}

	synchDiv.textContent =  displayable + ' searchable results';
	if(displayable <= 40)
		headerListElement.classList.remove('hiddenFreedom');
	else
		headerListElement.classList.add('hiddenFreedom');
}

let searchField;
let synchDiv;
let itemsDivWoke;
let headerListElement;

async function main(result){
	searchField = document.getElementById('searchFieldFreedom');
	synchDiv = document.getElementById('synchDivFreedom');
	itemsDivWoke = document.getElementById('itemsDivFreedom');
	
	searchField.addEventListener('keyup', function(){
		let liElements = document.getElementById('itemsDivFreedom').firstChild.getElementsByTagName('li');
		
		let displayable = 0;
		for (let i = 0; i < liElements.length; i++) {
			const content = liElements[i].getElementsByTagName('ul')[0];
			const txtValue = content.textContent || content.innerText;
			
			if((similarity(txtValue, this.value) > 0.5) || (txtValue.toUpperCase().indexOf(this.value.toUpperCase()) > -1))
			{
				liElements[i].style.display = 'inline-block';
				displayable++;
			}
			else
				liElements[i].style.display = 'none';
		}

		synchDiv.textContent =  displayable + ' searchable results';
		if(displayable <= 40)
			headerListElement.classList.remove('hiddenFreedom');
		else
			headerListElement.classList.add('hiddenFreedom');
	});
	
	if(isEmpty(result.woke))
		result.woke = await getBackup('woke.json');
	
	setUpFromList(result.woke, itemsDivWoke);
	resetSearch();
}

chrome.storage.local.get(['lastSync', 'woke'], function(result){
	if(isDateInPast(result.lastSync)) 
	{
		const urls = [getWokeUrl()];
		Promise.all(
			urls.map(url => fetch(url).then(json => json.json()))
		).then(data => {
			chrome.storage.local.set({'lastSync': getTodayFormatted(), 'woke': data[0]});
			result.woke = data[0];
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
