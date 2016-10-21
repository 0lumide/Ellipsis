const three_dots = "...";
const ellipsis = "…";
const input_selector = "input[type='text'], input:not([type]), textarea";
const editable_selector = "[contenteditable='true']";

function attachInputTextListener(input_dom) {
	input_dom.addEventListener("input", function(e) {
		var sourceText = $(e.target).val();
		if(sourceText.includes(three_dots)) {
			var cursorPosition = e.target.selectionStart;
			var firstDotPosition = sourceText.indexOf(three_dots);
			$(e.target).val(sourceText.replace(three_dots, ellipsis));
			if(cursorPosition != 0) {
				positionCursor(e.target, getNewCursorPosition(cursorPosition, firstDotPosition));
			}
			ellipsisInserted(e.target);
		}
  }, false);
}

function attachEditableTextListener(editable_dom) {
	editable_dom.addEventListener("input", function(e) {
		var sourceText = $(e.target).text();
		if(sourceText.includes(three_dots)) {
			$(getNodesThatContain(e.target, three_dots)).each(function() {
				var cursorPosition = getCaretPosition(this);
				var firstDotPosition = $(this).text().indexOf(three_dots);
				$(this).text(sourceText.replace(three_dots, ellipsis));
				if(cursorPosition != 0) {
					positionCursor(this, getNewCursorPosition(cursorPosition, firstDotPosition));
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

function positionCursor(dom, position) {
	if("selectionStart" in dom) {
		dom.selectionStart = position;
		dom.selectionEnd = position;
	} else {
		_positionCursor(dom, position);
	}
}

function getDomsFromNodes(dom_nodes, selector) {
	return $(dom_nodes).parent().find(selector).get();
}

function ellipsisInserted(dom) {
	console.log("Ellipsis inserted");
}

// Get all doms made editable with contenteditable.
// The contenteditable property is inheritable
// and as a result any of the childeren could be the one containing
// the actual text stuff so some extra magic has to be done
$(editable_selector).each(function() {
	// Attach listener to each editable dom element
	attachEditableTextListener(this);
});
// get all editable input doms. No extra magic is needed for these
$(input_selector).each(function() {
	// Attach listener to each input dom element
	attachInputTextListener(this);
});

// Repeat for dynamicaly added input dom elements
insertionQ(input_selector).summary(function(new_nodes) {
	// Find the specific dom elements, and add listener
	$(getDomsFromNodes(new_nodes, input_selector)).each(function(){
		attachInputTextListener(this);
	});
});
// Repeat for dynamicaly added editable dom elements
insertionQ(editable_selector).summary(function(new_nodes) {
	// Find the specific dom elements, and add listener
	$(getDomsFromNodes(new_nodes, editable_selector)).each(function(){
		attachEditableTextListener(this);
	});
});
