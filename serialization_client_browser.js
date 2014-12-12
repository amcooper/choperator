//serialization_client_browser.js

var client = new WebSocket("ws://localhost:3000");

// var bodyElement = document.querySelector("body");

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
	var hash = {
		name : "Hildebrand",
		text : input.toString().trim()
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
