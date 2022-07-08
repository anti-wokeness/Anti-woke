
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
