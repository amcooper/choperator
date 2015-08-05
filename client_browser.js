// client_browser.js

// The next two lines can have their commenting status toggled to cover local and server hosting.
var client = new WebSocket("ws://localhost:3001");
// var client = new WebSocket("ws://theadamcooper.com:3001");

var userName = "Anonymous user";
var userNameElement = document.getElementById("name_input");
var inputElement = document.getElementById("input_box");
var chatElement = document.getElementById("chat");
var ulElement = document.createElement("ul");
chatElement.appendChild(ulElement);
ulElement.style.listStyle = "none";

var addItem = function(inputText) {
	var newLiElement = document.createElement("li");
	newLiElement.innerHTML = inputText + "<br />";
	ulElement.appendChild(newLiElement);
	chatElement.scrollTop = chatElement.scrollHeight;
};

var hashPackage = function(input) {
	var displayText = input.toString().trim();

	// Magic words
	if (displayText === "(table flip)") { displayText = "(╯°□°）╯︵ ┻━┻"; }
	if (displayText.substr(0,5) === "/yell") {
		if (displayText === "/yell") {
			displayText = "AAARRGHH!";
		} else {
			displayText = displayText.substr(5).toUpperCase();
		}
	}

	//Special parsings
	displayText = displayText + " "; //This hack provides for detection of the end of the URL.
	if ((displayText.indexOf("http://") > -1) || (displayText.indexOf("https://") > -1)) {
		//Convert URL to <a href="URL">URL</a>
		var index01 = displayText.indexOf("http");
		var substrLength = displayText.substr(index01).indexOf(" ");
		var urlString = displayText.substr(index01, substrLength);
		//Image handling
		var extension = urlString.substr(urlString.length - 4);
		if ((extension === ".png") || (extension === ".bmp") || (extension === ".jpg") || (extension === ".gif")) {
			displayText = displayText.replace(urlString, "<img width=\"200px\" src=\"" + urlString + "\">");
		} else {
			displayText = displayText.replace(urlString, "<a href=\"" + urlString + "\">" + urlString + "</a>");
		}
	}

	var hash = {
		name : userName,
		text : displayText
	};
	var hashJSON = JSON.stringify(hash);
	return hashJSON;
};

// On Enter/Return keypress, send contents of input box to chat server
var keyvalidate = function(event) {
	if (event.keyCode === 13) { 
		var packaged = hashPackage(inputElement.value);
		client.send(packaged);
		inputElement.value = "";
	}
};

// Event listener for chat client input
client.addEventListener("open", function(event) {
	addItem("Connected.");
	client.addEventListener("message", function(event) {
		var hash = JSON.parse(event.data);
		addItem(hash.name + ": " + hash.text);
	});
});

// event listener for username
name_input.addEventListener('blur', function() {
	userName = this.value;
});

// Event listener for Enter/Return in input box
inputElement.addEventListener("keydown", keyvalidate);
