//serialization_client_browser.js

var client = new WebSocket("ws://localhost:3000");

// var bodyElement = document.querySelector("body");

var userName = "Anonymous user";
var userNameElement = document.getElementById("name_input");
var inputElement = document.getElementById("input_box");
var bodyElement = document.querySelector("body");
var ulElement = document.createElement("ul");
bodyElement.appendChild(ulElement);
ulElement.style.listStyle = "none";

var addItem = function(inputText) {
	var newLiElement = document.createElement("li");
	newLiElement.innerHTML = inputText;
	var firstLiElement = ulElement.firstChild;
	ulElement.insertBefore(newLiElement,firstLiElement);
};

var hashPackage = function(input) {
	var displayText = input.toString().trim();

	if (userNameElement.value !== "") { userName = userNameElement.value; }

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
	if ((displayText.indexOf("http://") > -1) || (displayText.indexOf("https://") > -1)) {
		//Convert URL to <a href="URL">URL</a>
		var index01 = displayText.indexOf("http");
		var index02 = displayText.substr(index01).indexOf(" ");
		var urlString = displayText.substr(index01, index02);
		//Image handling
		var extension = urlString.substr(urlString.length - 4);
		if ((extension === ".png") || (extension === ".bmp") || (extension === ".jpg")) {
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

var keyvalidate = function(event) {
	if (event.keyCode === 13) { 
		var packaged = hashPackage(inputElement.value);
		client.send(packaged);
		inputElement.value = "";
	}
};

client.addEventListener("open", function(event) {
	// debugger;
	addItem("Connected.");
	client.addEventListener("message", function(event) {
		var hash = JSON.parse(event.data);
		addItem(hash.name + ": " + hash.text);
	});
});

inputElement.addEventListener("keydown", keyvalidate);
