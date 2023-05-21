
function isEmpty(object) {
	return object == null || (Object.keys(object).length === 0 && object.constructor === Object) || object == '';
}

function isDateInPast(dateString, daysInPast = 0){
	if(isEmpty(dateString))
		return true;
	
	const date = dateString.split('/');
	const today = getTodayFormatted(daysInPast).split('/');
	
	if(today[2] > date[2])
		return true;
	else if(today[1] > date[1] && today[2] >= date[2])
		return true;
	else if(today[0] > date[0] && today[1] >= date[1] && today[2] >= date[2])
		return true;
	
	return false;
}

function getTodayFormatted(daysInPast = 0){
	const today = new Date();
	today.setDate(today.getDate() - daysInPast);
	const dd = String(today.getDate()).padStart(2, '0');
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const yyyy = today.getFullYear();
	return dd + '/' + mm + '/' + yyyy;
}

function flattenUrlsToWarn(urlsToWarn){	
	let flattened = [];
	for(url in urlsToWarn){
		let item = urlsToWarn[url];
		flattened.push(item);
		
		for(otherName in item.otherNames)
		{
			let itemCopy = Object.assign({}, item);
			itemCopy.name = item.otherNames[otherName];
						
			if(item.name.toLowerCase() != itemCopy.name.toLowerCase())
				flattened.push(itemCopy);
		}
		
		for(child in item.children){
			const itemChild = item.children[child];
			
			if(isEmpty(itemChild.sources))
				itemChild.sources = item.sources;
			
			if(isEmpty(itemChild.text)){
				let childText = item.childText;
				if(childText.includes('{1}'))
					childText = childText.replace('{1}', itemChild.name);
				if(childText.includes('{2}'))
					childText = childText.replace('{2}', item.text);
				itemChild.text = childText;
			}
			
			for(otherName in itemChild.otherNames)
			{
				let itemCopy = Object.assign({}, itemChild);
				itemCopy.name = itemChild.otherNames[otherName];
							
				if(itemCopy.name.toLowerCase() != itemChild.name.toLowerCase())
					flattened.push(itemCopy);
			}

			if(item.name.toLowerCase() != itemChild.name.toLowerCase())
				flattened.push(itemChild);
		}
		item.children = null;
	}
	return flattened;
}

function createButton(text, btnClasses, buttonCallback){
	let button = document.createElement('div');
	button.classList.add('buttonBaseFreedom');
	
	for(btnclass in btnClasses)
		button.classList.add(btnClasses[btnclass]);

	button.textContent = text;
	button.addEventListener('click', function(){
		buttonCallback();
	});
	return button;
}

function getSourceText(item){
	let sourceHolder = document.createElement('span');
	
	if(!isEmpty(item.sources))
	{
		sourceHolder.textContent = ' (';
		
		const sources = item.sources.split(',');
		for(let i = 0; i < sources.length; i++){
			let source = document.createElement('a');
			source.className = 'urlLinkSmallFreedom';
			source.setAttribute('target', '_blank');
			source.setAttribute('href', sources[i]);
			source.textContent = 'source';
			
			sourceHolder.appendChild(source);
			
			if((i + 1) < sources.length)
				sourceHolder.appendChild(document.createTextNode(', '));
		}
		sourceHolder.appendChild(document.createTextNode(')'));
	}
	return sourceHolder;
}

function getExplanationText(item, spaceInStart = true){
	let span = document.createElement('span');
	
	if(spaceInStart)
	{
		let spanSpacer = document.createElement('span');
		spanSpacer.className = 'spanSpacerFreedom';
		span.appendChild(spanSpacer);
	}
	
	let spanText = document.createElement('span');
	spanText.textContent = item.text;
	spanText.appendChild(getSourceText(item));
	span.appendChild(spanText);
	
	return span;
}

const whitelistButtonId = 'whitelistButtonFreedom';
function createExpandingButton(text, buttonCallback){
	let buttonContainer = document.createElement('div');
	buttonContainer.classList.add('buttonExpandingFreedom');
	
	let button = document.createElement('div');
	button.classList.add('buttonExpandingContentFreedom');
	button.id = whitelistButtonId;
	button.addEventListener('click', function(){
		buttonCallback();
	});
	button.appendChild(document.createTextNode('Never highlight the word'));
	button.appendChild(document.createElement('br'));
	
	let itemText = document.createElement('span');
	itemText.style.cssText = 'font-weight: bold;';
	button.appendChild(itemText);
	
	buttonContainer.appendChild(button);
	return buttonContainer;
}

function whitelistUnderlinedItem(){
	const item = document.getElementById(tooltipTextId);
	const itemName = item.getAttribute('data-item');
	whitelistItem('underlineWhitelist', itemName, false);
	item.style.display = 'none !important';
	location.reload();
}

function updateUnderlineElementText(){
	const item = document.getElementById(tooltipTextId);
	const itemName = item.getAttribute('data-item');	
	let button = document.getElementById(whitelistButtonId);
	button.firstChild.textContent = 'Never highlight the word';
	button.lastChild.textContent = itemName;
}

const tooltipTextId = 'tooltipHoverTextFreedom';
function getOrCreateTooltip(){	
	let tooltipTextElement = document.getElementById(tooltipTextId);
	if (!isEmpty(tooltipTextElement))
		return tooltipTextElement;
	
	tooltipTextElement = document.createElement('span');
	tooltipTextElement.classList.add('tooltipFreedom');
	tooltipTextElement.id = tooltipTextId;
	
	let tooltipArrow = document.createElement('span');
	tooltipArrow.classList.add('arrowFreedom');
	tooltipArrow.setAttribute('data-popper-arrow', '');
	tooltipTextElement.appendChild(tooltipArrow);
	
	let button = createExpandingButton('', function(){ whitelistUnderlinedItem(); });
	button.addEventListener('mouseenter', function(e) { updateUnderlineElementText(); });
	tooltipTextElement.appendChild(button);
	
	let textElement = document.createElement('text');	
	tooltipTextElement.appendChild(textElement);	
	
	window.document.body.insertBefore(tooltipTextElement, window.document.body.firstChild);
	
	return tooltipTextElement;
}

function showTooltip(selectorId, popperInstance, tooltipText, item) {
	const tooltip = document.getElementById(selectorId);
		
	tooltip.childNodes[2].textContent = '';
	tooltip.childNodes[2].appendChild(tooltipText);
	
	tooltip.setAttribute('data-show', '');
	tooltip.setAttribute('data-item', item.name);
	
	popperInstance.setOptions({
		modifiers: [{ name: 'eventListeners', enabled: true }],
	});
	popperInstance.update();
}

const sleep = ms => new Promise(res => setTimeout(res, ms));
async function hideTooltip(selector, popperInstance) {
	await sleep(100);	
	const lastElement = $(':hover').last();
	if(lastElement.closest('.tooltipFreedom').length || lastElement.closest('.tooltipHoverFreedom').length)
		return;
		
	const tooltip = document.getElementById(selector);
	tooltip.removeAttribute('data-show');
	tooltip.removeAttribute('data-item');

	popperInstance.setOptions({
		modifiers: [{ name: 'eventListeners', enabled: false }],
	});
}

function getBodyNodes(){
	return Array.prototype.slice.call(document.querySelectorAll('body, body *:not(script):not(style):not(noscript)'))
	.map(function(elem){
		return Array.prototype.slice.call(elem.childNodes);
	})
	.reduce(function(nodesA, nodesB){
		return nodesA.concat(nodesB);
	})
	.filter(function(node){
		return node.nodeType === document.TEXT_NODE && node.textContent.trim().length > 0;
	});
}

function sanitize(str) {
	return str.replace(/[`’]/g,"'");
}

function underlineWords(flattenedUrlsToWarn){
	let nodeNumber = 0;
	let containedItems = [];
	getBodyNodes().filter(function(node){ 
		return flattenedUrlsToWarn.filter(function(item) {
			let nodeText = sanitize(node.textContent);
			let itemName = sanitize(item.name);
			item.name = itemName;
			
			if(item.ignoreCase != undefined){
				nodeText = nodeText.toLowerCase();
				itemName = itemName.toLowerCase();
			}
			
			const newItem = nodeText.indexOf(itemName) > -1 && !containedItems.includes(item);
			
			if(newItem)
				containedItems.push(item);
			return newItem;
		});
	}).forEach(function(node){
		let regexItems = [];
		let regexes = [];
		let regexStrings = '';
		let nodeText = sanitize(node.textContent);
		
		for(containedItem in containedItems)
		{
			const item = containedItems[containedItem];
			let itemName = item.name;
			let regexArgument = 'u';
			
			if(item.ignoreCase != undefined)
				regexArgument += 'i';
			
			const regexString = '((?<!\\p{Alpha})' + item.name + '(?!\\p{Alpha}))';
			const regex = new RegExp(regexString, regexArgument);
			
			if(regex.test(nodeText))
			{
				regexes.push(regex);
				regexItems.push(item);
				
				if(regexStrings != '')
					regexStrings += '|';
				regexStrings += regexString;
			}
		}
		
		const nodeContentSplit = nodeText.split(new RegExp(regexStrings, 'ui')).filter(i => !isEmpty(i) && i.length > 1);
		let parentNode = document.createElement('text');
		let tooltipHoverElements = [];
		let hoverItems = [];
		
		for(nodeContent in nodeContentSplit){
			const nodeCount = parentNode.children.length;
			const nodeItem = nodeContentSplit[nodeContent];
			
			for(let i = 0; i < regexItems.length; i++)
			{
				if(regexes[i].test(nodeItem))
				{
					let tooltipHoverElement = document.createElement('text');
					tooltipHoverElement.textContent = nodeItem;
					tooltipHoverElement.classList.add('tooltipHoverFreedom');
					tooltipHoverElement.id = 'HoverFreedom' + '-' + (nodeNumber++);
					
					parentNode.appendChild(tooltipHoverElement);
					tooltipHoverElements.push(tooltipHoverElement);
					hoverItems.push(regexItems[i]);
					break;
				}
			}
			if(nodeCount == parentNode.children.length)
				parentNode.appendChild(document.createTextNode(nodeItem));
		};
		
		if(!isEmpty(tooltipHoverElements))
		{
			node.replaceWith(parentNode);
			const tooltipTextElement = getOrCreateTooltip();
			for(let i = 0; i < tooltipHoverElements.length; i++){
				const item = hoverItems[i];
				const hoverSelector = tooltipHoverElements[i];
				const tooltipDisplayText = getExplanationText(item);
				const popper = Popper.createPopper(hoverSelector, tooltipTextElement);
				
				$('#' + hoverSelector.id).mouseenter( function(e) {
					showTooltip(tooltipTextElement.id, popper, tooltipDisplayText, item);
				});
				$('#' + hoverSelector.id).mouseleave( function(e) {
					hideTooltip(tooltipTextElement.id, popper);
				});
				$('#' + tooltipTextElement.id).mouseleave( function(e) {
					hideTooltip(tooltipTextElement.id, popper);
				});
			}
		}
	});
	containedItems = [];
}

function setStyles(){
	let styles = `	
	.buttonBaseFreedom {
		background-color: transparent;
		border: 1px solid white;
		border-radius: 5px;
		color: white;
		cursor: pointer;
		padding: 5px 10px;
		font-size: 14px;
		font-family: arial;
		transition: all 200ms ease-in-out;
		display: inline-block;
		width: max-content;
		font-weight: normal;
	}
	.buttonWhiteFreedom:hover {
		background: white;
		color: black;
		border: 1px solid black;
		box-shadow: 0 0 5px 2px white;
	}
	.buttonWhiteFreedom:active {
		box-shadow: 0 0 10px 4px white;
	}
	.buttonRedFreedom {
		border: 1px solid black;
		color: black;
		padding: 2px 5px;
		font-size: 12px;
	}
	.buttonRedFreedom:hover {
		box-shadow: 0 0 5px 1px #850e0c;
	}
	.buttonRedFreedom:active {
		box-shadow: 0 0 10px 2px #850e0c;
	}
	.buttonBlackFreedom {
		border: 1px solid black;
		color: black;
	}
	.buttonBlackFreedom:hover {
		box-shadow: 0 0 5px 1px black;
	}
	.buttonBlackFreedom:active {
		box-shadow: 0 0 10px 2px black;
	}
	
	.optionsIconFreedom{
		height: 15px;
		position: absolute;
		right: 2px;
		top: 2px;
		cursor: pointer;
		border-radius: 8px;
	}
	.optionsIconFreedom:hover{
		box-shadow: 0 0 5px 1px #999999;
	}
	.optionsIconFreedom:active{
		box-shadow: 0 0 10px 1px #999999;
	}
	
	.buttonExpandingFreedom {
		position: absolute;
		width: 16px;
		height: 16px;
		border-radius: 15px;
		overflow: hidden;
		cursor: pointer;
		background: white;
		color: black;
		border: 1px solid white;
		transition: all 200ms;
		box-sizing: content-box !important;
	}
	.buttonExpandingFreedom:hover {
		width: 220px;
		height: auto;
		padding: 2px 5px;
		border-radius: 5px;
		border: 1px solid black;
		box-shadow: 0 0 5px 2px white;
	}
	.buttonExpandingFreedom:active {
		box-shadow: 0 0 10px 4px white;
	}
	.buttonExpandingFreedom:hover .buttonExpandingContentFreedom {
		left: 0px;
	}
	.buttonExpandingContentFreedom {
		width:220px;
		left:49px;
		position: relative;
	}
	.buttonExpandingContentFreedom:before {
		content: '?';
		font-size: 16px;
		position: absolute;
		right: 253px;
		width: 16px;
		text-align: center;
		border-radius: 15px;
		color: white;
		background-color: #850e0c;
		line-height: 16px; 
	}


	.toggleFreedom {
		display: none;
	}
	.toggleTextFreedom{
		font-size: 14px;
	}
	.toggleButtonFreedom{
		display: inline-block;
		width: 35px;
		height: 25px;
		line-height: 25px;
		cursor: pointer;
		text-align: center;
		font-size: 13px;
	}
	.toggleFreedom + .toggleButtonFreedom {
		transition: all 200ms ease;
		perspective: 100px;
		font-family: arial;
	}
	.toggleFreedom + .toggleButtonFreedom:hover:after, .toggleFreedom + .toggleButtonFreedom:hover:before{
		box-shadow: 0 0 5px 1px black;
	}
	.toggleFreedom + .toggleButtonFreedom:after, .toggleFreedom + .toggleButtonFreedom:before {
		display: inline-block;
		transition: all 400ms ease;
		width: 100%;
		height: 100%;
		font-weight: bold;
		color: white;
		position: absolute;
		top: 0;
		left: 0;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		border-radius: 5px;
	}
	.toggleFreedom + .toggleButtonFreedom:after {
		content: attr(data-tg-on);
		transform: rotateY(-180deg);
		background: #02A44A;
	}
	.toggleFreedom + .toggleButtonFreedom:before {
		background: #850e0c;
		content: attr(data-tg-off);
	}
	.toggleFreedom + .toggleButtonFreedom:active:before {
		transform: rotateY(-20deg);
		box-shadow: 0 0 10px 2px black;
	}
	.toggleFreedom:checked + .toggleButtonFreedom:before {
		transform: rotateY(180deg);
	}
	.toggleFreedom:checked + .toggleButtonFreedom:after {
		transform: rotateY(0);
		background: #02A44A;
	}
	.toggleFreedom:checked + .toggleButtonFreedom:active:after {
		transform: rotateY(20deg);
		box-shadow: 0 0 10px 2px black;
	}


	.urlLinkFreedom{
		color:#FFEE00 !important; 
		font-weight: bold;
	}
	.urlLinkSmallFreedom{
		color:#FFEE00 !important; 
		font-size: 12px;
	}
	.spanSpacerFreedom{
		width: 25px; 
		display: inline-block; 
	}
	.warningLabelFreedom{
		color: white; 
		font-family: arial;
		font-size: 16px;
		font-weight: normal;
	}
	.buttonElementFreedom{
		margin-top: 10px;
		display: inline-block;
	}
	
	.tooltipHoverFreedom {
		border-bottom: 1px dotted #850e0c;
		margin-bottom: 0 !important;
		display: inline-block;
	}
	.tooltipHoverFreedom:hover{
		cursor: pointer;
	}		
	.tooltipFreedom {
		display: none !important;
		font-family: arial;
		font-size: 16px;
		width: 300px;
		min-height: 0 !important;
		background-color: #850e0c;
		color: #fff;
		border-radius: 5px;
		font-weight: normal;
		padding: 5px;
		z-index: 100000;
		white-space: initial;
		text-align: center;
		line-height: 20px; 
		font-style: normal;
		text-transform: none;
		letter-spacing: normal;
		cursor: default;
	}
	.tooltipFreedom[data-show] {
		display: block !important;
	}
	.tooltipFreedomText {
		margin-left: 10%;
	}

	.arrowFreedom {
		margin-bottom: 0;
		visibility: hidden;
	}
	.arrowFreedom,
	.arrowFreedom::before {
		position: absolute;
		width: 8px;
		height: 8px;
		background: inherit;
	}
	.arrowFreedom::before {
		visibility: visible;
		content: '';
		transform: rotate(45deg);
	}

	.tooltipFreedom[data-popper-placement^='top'] > .arrowFreedom {
		bottom: -4px;
	}
	.tooltipFreedom[data-popper-placement^='bottom'] > .arrowFreedom {
		top: -4px;
	}
	.tooltipFreedom[data-popper-placement^='left'] > .arrowFreedom {
		right: -4px;
	}
	.tooltipFreedom[data-popper-placement^='right'] > .arrowFreedom {
		left: -4px;
	}`;
	
	let styleSheet = document.createElement('style');
	styleSheet.type = 'text/css';
	styleSheet.innerText = styles;
	document.head.appendChild(styleSheet);
}

setStyles();
		