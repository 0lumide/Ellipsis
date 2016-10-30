function PausePlay() {
  this.status = document.querySelector('#status');
  this.button = document.querySelector("#button");
  this._init();
}

PausePlay.prototype._init = function() {
  this.button.addEventListener("click", () => {
    var pause = !button.classList.contains("play");
    if(pause) {
      this._pause();
    } else {
      this._play();
    }
    if(this.toggleListener) {
      this.toggleListener(pause);
    }
  });
}

PausePlay.prototype._pause = function() {
  this.button.classList.add("play");
  this.status.textContent = "Ellipsis is paused";
}

PausePlay.prototype._play = function() {
  this.button.classList.remove("play");
  this.status.textContent = "Ellipsis is enabled";
}

PausePlay.prototype.addToggleListener = function(callback) {
  this.toggleListener = callback;
}

function restore_options() {
  if(chrome && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get({
      isPaused: false
    }, function(items) {
      if(items.isPaused) {
        pausePlay._pause();
      } else {
        pausePlay._play();
      }
    });
  } else {
  	console.log("no chrome.storage.sync")
  }
}

var pausePlay;
document.addEventListener('DOMContentLoaded', () => {
  pausePlay = new PausePlay();
  restore_options();
  pausePlay.addToggleListener(function(isPaused){
    if(chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({"isPaused": isPaused}, function() {
        console.log('Settings saved');
      });
    } else {
    	console.log("no chrome.storage.sync")
    }
  });
});
