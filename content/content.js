
function isExactMatch(navigatedUrl, itemText){
	return new RegExp(`\\b${itemText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`).test(navigatedUrl);
}

function urlMatch(navigatedUrl, checkItem){
	if(checkItem.includes('|')){
		const splitValue = checkItem.split('|');	
		
		for(item in splitValue)
			if(!isExactMatch(navigatedUrl, splitValue[item].toLowerCase()))
				return false;
		
		return true;
	}	
	return isExactMatch(navigatedUrl, checkItem.toLowerCase());
}

function createLink(url, urlText){
	let urlLink = document.createElement('a');
	urlLink.className = 'urlLinkFreedom';
	urlLink.setAttribute('href', 'http://www.' + url);
	urlLink.textContent = urlText;
	return urlLink;
};

function trimUrl(itemText){
	if(itemText.includes('www.'))
		itemText = itemText.substring(4);
	return itemText;
}

function createWarningBanner(warningElement, item){
	let style = 'background: #850e0c; text-align: center; padding: 10px; z-index: 9999999999; position: absolute; right: 10px; left: 10px; top: 10px; white-space: pre-line; line-height: 20px; letter-spacing: normal; font-style: normal; text-transform: none;';
	if(!isEmpty(item.styling))
		style += item.styling;

	let backgroundElement = document.createElement('div');
	backgroundElement.id = 'backgroundElementFreedom';
	backgroundElement.style = style;
	backgroundElement.appendChild(warningElement);
		
	let buttonElement = document.createElement('div');
	buttonElement.classList.add('buttonElementFreedom');
	
	let urlLocation = trimUrl(window.location.hostname);
	let buttonWhitelist = createButton('Never show on ' + urlLocation, ['buttonWhiteFreedom'], function(){ whitelistItem('whitelist', urlLocation, true); });
	buttonElement.appendChild(buttonWhitelist);
	
	let spanSpacer = document.createElement('span');
	spanSpacer.classList.add('spanSpacerFreedom');
	buttonElement.appendChild(spanSpacer);
	
	let buttonHide = createButton('Hide temporarily', ['buttonWhiteFreedom'], function(){ whitelistItem('hide', urlLocation, true); });
	buttonElement.appendChild(buttonHide);
	
	let buttonOptions = document.createElement('img');
	buttonOptions.classList.add('optionsIconFreedom');
	buttonOptions.id = 'optionsFreedom';
	buttonOptions.src = chrome.runtime.getURL("content/options_white.png");
	buttonOptions.onclick = function () {
		chrome.runtime.sendMessage({"action": "openOptionsPage"});
	};
	
	buttonElement.appendChild(buttonOptions);	
	backgroundElement.appendChild(buttonElement);
	window.document.body.insertBefore(backgroundElement, window.document.body.firstChild);	
}

function showBannerItem(flattenedUrlsToWarn, result){
	
	const whitelistURLs = [].concat(result.whitelist, result.hide).filter(function(url) { 
		return url !== undefined && urlMatch(window.location.href, url.toString()); 
	});
	
	if(!isEmpty(whitelistURLs))
		return;
	
	for(flattenedItem in flattenedUrlsToWarn){
		const item = flattenedUrlsToWarn[flattenedItem];
		if(!isEmpty(item.urlMatch) && urlMatch(window.location.href, item.urlMatch.toString())){
			
			let warningElement = document.createElement('div');
			warningElement.classList.add('warningLabelFreedom');
			
			let explanationDiv = document.createElement('div');
			explanationDiv.appendChild(document.createTextNode('Warning: '));
			explanationDiv.appendChild(getExplanationText(item, false));
			warningElement.appendChild(explanationDiv);
			
			if(!isEmpty(item.linkUrl) && !isEmpty(item.linkText))
			{
				let spanAlternative = document.createElement('div');
				spanAlternative.textContent = ' An alternative to ' + item.name + ' is ';
				spanAlternative.appendChild(createLink(item.linkUrl, item.linkText));
				warningElement.appendChild(spanAlternative);
			}
			
			if(window.navigator.brave === undefined || window.navigator.brave.isBrave.name !== 'isBrave')
			{
				let reminderDiv = document.createElement('div');
				reminderDiv.appendChild(document.createTextNode('Remember to use an add-blocker extension or the '));
				reminderDiv.appendChild(createLink('brave.com', 'Brave'));
				reminderDiv.appendChild(document.createTextNode(' browser which has a built-in add-blocker.'));
				warningElement.appendChild(reminderDiv);
			}
			
			createWarningBanner(warningElement, item);
			break;
		}
	}
}

async function main(result){
	if(isEmpty(result.urlsToWarn))
		result.urlsToWarn = await getUrlsToWarnBackup();
	
	const flattenedUrlsToWarn = flattenUrlsToWarn(result.urlsToWarn);
	
	if(result.underlineWords){
		const underlineWhitelist = result.underlineWhitelist?.filter(function(item) { return item !== undefined; });
		let flattenedUrlsForUnderline = flattenedUrlsToWarn;
		if(!isEmpty(underlineWhitelist))
			flattenedUrlsForUnderline = flattenedUrlsToWarn.filter(function(item) { return !underlineWhitelist.includes(item.name) });
		
		underlineWords(flattenedUrlsForUnderline, result);
	}
	
	if(result.showBanner)
		showBannerItem(flattenedUrlsToWarn, result);
}

chrome.storage.local.get(['lastSync', 'urlsToWarn', 'whitelist', 'underlineWhitelist', 'hide', 'showBanner', 'underlineWords'], function(result){
	if(!result.underlineWords && !result.showBanner)
		return;
	
	if(isDateInPast(result.lastSync, 2))
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
