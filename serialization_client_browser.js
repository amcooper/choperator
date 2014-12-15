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
		var interText01 = displayText.substr(displayText.indexOf("http")); 
		console.log("interText01: " + interText01);
		var interText02 = interText01.substr(0,interText01.indexOf(" "));
		console.log("interText02: " + interText02);
		var interText03 = 
		//Check for images here.
		displayText = "<a href=\"" + interText02 + "\">" + interText02 + "</a> " + ;
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
