const three_dots = "...";
const ellipsis = "…";
const input_selector = "input[type='text'], input[type='search'],input:not([type]), textarea";
const editable_selector = "[contenteditable='true'], [contenteditable='plaintext'], [contenteditable='plaintext-only']";
var _enabled = true;

function Ripple(element) {
	var offset = $(element).caret('offset');

	this.width = offset.height * 2;
	this.height= offset.height * 2;
	this.top = offset.top - 0.5 * offset.height;
	this.left = offset.left - 0.5 * this.width;
	this.rippler = document.querySelector('#ellipsis-ripple');

	this._init();
}

Ripple.prototype._createElements = function() {
	return new Promise((resolve, reject) => {
		// Create ripple and add to page
		this.rippler = document.createElement('div');
		this.rippler.setAttribute('id', "ellipsis-ripple");
		this.rippler.setAttribute('aria-hidden', true);
		document.body.appendChild(this.rippler);

		//wait for the element to be ready
		setTimeout(() => resolve(), 50);
	})
}

Ripple.prototype._setUpRippler = function() {
	this.rippler.style.top = `${this.top}px`;
	this.rippler.style.left = `${this.left}px`;
	this.rippler.style.height = `${this.height}px`;
	this.rippler.style.width = `${this.width}px`;
	this.rippler.style.transform = "scale(0)";
	this.rippler.style.border = `${0.5 * this.width}px solid #d9da1a`;
	this.rippler.setAttribute('aria-hidden', false);
}

Ripple.prototype._ripple = function() {
	// Position ripple at cursor position
	this._setUpRippler()
	// Show ripple animation
	Promise.resolve()
	.then(() => {
		return new Promise((resolve, reject) => {
			this.rippler.style.transform = "scale(1)";
			this.rippler.addEventListener("transitionend", function(e){
				e.target.removeEventListener(e.type, arguments.callee);
				resolve();
			});
		})
	})
	.then(() => {
		return new Promise((resolve, reject) => {
			this.rippler.style["border-width"] = "0px";
			this.rippler.addEventListener("transitionend", function(e){
				e.target.removeEventListener(e.type, arguments.callee);
				resolve();
			});
		})
	})
	.then(() => {
		this.rippler.setAttribute('aria-hidden', true);
	});
}

Ripple.prototype._init = function() {
	Promise.resolve()
	.then(() => {
		if(this.rippler) {
		  return Promise.resolve();
		}
		return this._createElements();
	})
	.then(() => {
		this._ripple();
	});
}

function attachInputTextListener(input_element) {
	input_element.addEventListener("input", function(e) {
		if(!_enabled) {
			return;
		}
		var sourceText = e.target.value;
		if(sourceText.includes(three_dots)) {
			var cursorPosition = getCursorPosition(e.target);
			var firstDotPosition = sourceText.indexOf(three_dots);
			e.target.value = sourceText.replace(three_dots, ellipsis);
			if(cursorPosition != 0) {
				positionCursor(e.target, getNewCursorPosition(cursorPosition, firstDotPosition));
			}
			ellipsisInserted(e.target);
		}
  }, false);
}

function attachEditableTextListener(editable_element) {
	editable_element.addEventListener("input", function(e) {
		if(!_enabled) {
			return;
		}
		var sourceText;
		while((sourceText = e.target.textContent).includes(three_dots)) {
			var nodes = getNodesThatContain(e.target, three_dots);
			nodes.forEach(function(node) {
				var cursorPosition = getCursorPosition(node);
				var firstDotPosition = node.textContent.indexOf(three_dots);
				node.textContent = node.textContent.replace(three_dots, ellipsis);
				if(cursorPosition != 0) {
					positionCursor(node, getNewCursorPosition(cursorPosition, firstDotPosition));
				}
				ellipsisInserted(e.target);
			});
		}
  }, false);
}

function getNewCursorPosition(oldCursorPosition, firstDotPosition) {
	if(oldCursorPosition != 0) {
		if(oldCursorPosition > firstDotPosition) {
			if((oldCursorPosition - firstDotPosition) <= 3) {
				// Place cursor right after ellisis
				return firstDotPosition + 1;
			} else {
				// Place cursor in front on same character it used to be
				return oldCursorPosition - 2;
			}
		} else {
			// Cursor doesn't need to move
			return oldCursorPosition;
		}
	}
	return 0;
}

function getCursorPosition(element) {
	if("selectionStart" in element) {
		return element.selectionStart;
	} else {
		return getCaretPosition(element);
	}
}

function positionCursor(element, position) {
	if("selectionStart" in element) {
		element.selectionStart = position;
		element.selectionEnd = position;
	} else {
		_positionCursor(element, position);
	}
}

function getSpecificNodesFromNodes(nodes, selector) {
	return $(nodes).parent().find(selector).get();
	// This isn't the same as the jQuery version.
	// I can't seem to write it in pure js
	// return nodes.map((node) => {
	// 	return node.parentNode.querySelectorAll(selector);
	// });
}

function ellipsisInserted(element) {
	new Ripple(element);
	console.log("Ellipsis inserted");
}

// Get all elements made editable with contenteditable.
// The contenteditable property is inheritable
// and as a result any of the childeren could be the one containing
// the actual text stuff so some extra magic has to be done
var elements = document.querySelectorAll(editable_selector);
elements.forEach((element) => {
	attachEditableTextListener(element);
});
// get all editable inputs. No extra magic is needed for these
elements = document.querySelectorAll(input_selector);
elements.forEach((element) => {
	attachInputTextListener(element);
});

// Repeat for dynamicaly added input elements
insertionQ(input_selector).summary(function(new_nodes) {
	// Find the specific elements, and add listener
	var elements = getSpecificNodesFromNodes(new_nodes, input_selector);
	elements.forEach((element) => {
		// Attach listener to each editable element
		attachInputTextListener(element);
	});
});
// Repeat for dynamicaly added editable elements
insertionQ(editable_selector).summary(function(new_nodes) {
	// Find the specific elements, and add listener
	var elements = getSpecificNodesFromNodes(new_nodes, editable_selector);
	elements.forEach((element) => {
		// Attach listener to each editable element
		attachEditableTextListener(element);
	});
});

if(chrome && chrome.storage && chrome.storage.sync) {
	chrome.storage.sync.get({
		isPaused: false
	}, function(items) {
		_enabled = !items.isPaused;
	});
} else {
	console.log("no chrome.storage.sync")
}

if(chrome && chrome.storage && chrome.storage.onChanged) {
	chrome.storage.onChanged.addListener(function(changes, areaName) {
	  if(changes.isPaused){
			_enabled = !changes.isPaused.newValue;
		}
	});
} else {
	console.log("no chrome.storage.onChanged")
}
