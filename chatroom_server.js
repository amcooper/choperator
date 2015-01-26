//chatroom_server.js

var WebSocketServer = require("ws").Server;
var server = new WebSocketServer({port:3000});

var fs = require("fs");

var clients = [];
var usernames = [];
var all_messages = [];
var bannedWords = ["moist", "pamphlet", "tummy", "yummy", "gummi", "gummy"];

console.log("Listening on port 3000.");

server.on("connection", function(ws) {

	clients.push(ws);

	console.log("Clients connected: " + clients.length);

	all_messages.forEach(function(message) {
		ws.send(JSON.stringify(message));
	});

	var newClientHash = {
		name : "SERVER",
		text : "Client connected."
	};

	clients.forEach(function(client) {
		client.send(JSON.stringify(newClientHash));
	});

	all_messages.push(newClientHash);

	fs.writeFileSync("chat_app_api.txt", JSON.stringify({ messages : all_messages }));

	ws.on("close", function() {
		var x = clients.indexOf(ws);
		clients.splice(x,1);
		console.log("User " + usernames[x] + " has disconnected.");
		console.log("Clients connected: " + clients.length);
		var exitingClientHash = {
			name : "SERVER",
			text : "User " + usernames[x] + " has disconnected."
		};

		clients.forEach(function(client) {
			client.send(JSON.stringify(exitingClientHash));
		});

		all_messages.push(exitingClientHash);

		fs.writeFileSync("chat_app_api.json", JSON.stringify({ messages : all_messages }));		

		usernames.splice(x,1);
	});

	ws.on("message", function(input) {
		var banhammer = false;
		processedInput = JSON.parse(input);
		var x = clients.indexOf(ws);
		usernames[x] = processedInput.name;
		for (j=0; j<bannedWords.length; j++) {
			if (processedInput.text.toLowerCase().indexOf(bannedWords[j]) > -1) {
				var banMessage = "Dropping the hammer on " + processedInput.name + " for using a banned word.";
				banhammer = true;
			}
		}

		if (banhammer === true) { 
			processedInput.name = "SERVER";
			processedInput.text = banMessage; 
		};
		console.log(processedInput.name + " : " + processedInput.text);
		var messageHash = {
			name : processedInput.name,
			text : processedInput.text
		};

		clients.forEach(function(client) {
			client.send(JSON.stringify(messageHash));
		});

		if (banhammer === true) { ws.close() };

		all_messages.push(messageHash);

		fs.writeFileSync("chat_app_api.txt", JSON.stringify({ messages : all_messages }));
	});

});