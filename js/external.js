/*
* +WilsonPage
* http://stackoverflow.com/q/5951886/2057884
* http://jsfiddle.net/wPYMR/2/
*/
function getCaretPosition(editableDiv) {
    var caretPos = 0, containerEl = null, sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            if (range.commonAncestorContainer.parentNode == editableDiv) {
                caretPos = range.endOffset;
            }
        }
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        if (range.parentElement() == editableDiv) {
            var tempEl = document.createElement("span");
            editableDiv.insertBefore(tempEl, editableDiv.firstChild);
            var tempRange = range.duplicate();
            tempRange.moveToElementText(tempEl);
            tempRange.setEndPoint("EndToEnd", range);
            caretPos = tempRange.text.length;
        }
    }
    return caretPos;
}

/*
* +Kai Noack
* http://stackoverflow.com/a/29418265/2057884
* modified by Olumide
*/
function getNodesThatContain(dom, text) {
    var textNodes = $(dom).parent().find(":contains('" + text + "')")
      .contents().filter(
          function() {
           return this.nodeType == 3
             && this.textContent.indexOf(text) > -1;
    });
    return textNodes.parent().get();
};

/*
* +Tim Down
* http://stackoverflow.com/a/24117242/2057884
*/
function _positionCursor(dom, position) {
    var textNode = dom.firstChild;
    var range = document.createRange();
    range.setStart(textNode, position);
    range.setEnd(textNode, position);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}
