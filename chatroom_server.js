//chatroom_server.js

var WebSocketServer = require("ws").Server;
var server = new WebSocketServer({port:3001});

var fs = require("fs");

var clients = [];
var usernames = [];
var all_messages = [];
var bannedWords = ["moist", "pamphlet", "tummy", "yummy", "gummi", "gummy", "vainglorious"];

console.log("Listening on port 3001.");

server.on("connection", function(ws) {

	clients.push(ws); // Add new client to clients array

	console.log("Clients connected: " + clients.length);

	// Send all current chat content to new client
	all_messages.forEach(function(message) {
		ws.send(JSON.stringify(message));
	});

	var newClientHash = {
		name : "Server",
		text : "Client connected."
	};

	// Advise all clients of new client connection.
	clients.forEach(function(client) {
		client.send(JSON.stringify(newClientHash));
	});

	// Update the all_messages array and the text file.
	all_messages.push(newClientHash);

	fs.writeFileSync("chat_app_api.txt", JSON.stringify({ messages : all_messages }));

	ws.on("close", function() { // When the user closes the connection
		var x = clients.indexOf(ws);
		clients.splice(x,1); // Remove her from the clients array
		console.log("User " + usernames[x] + " has disconnected.");
		console.log("Clients connected: " + clients.length);
		var exitingClientHash = {
			name : "Server",
			text : "User " + usernames[x] + " has disconnected."
		};

		// Advise all clients of client's disconnection
		clients.forEach(function(client) {
			client.send(JSON.stringify(exitingClientHash));
		});

		// Update the all_messages array and the text file.
		all_messages.push(exitingClientHash);

		fs.writeFileSync("chat_app_api.json", JSON.stringify({ messages : all_messages }));		

		// Remove user from list of current usernames
		usernames.splice(x,1);
	});

	ws.on("message", function(input) { // When the user enters a message
		var banhammer = false;
		var banMessage;
		processedInput = JSON.parse(input);
		var x = clients.indexOf(ws);
		usernames[x] = processedInput.name;

		// Check for banned word usage
		for (j=0; j<bannedWords.length; j++) {
			if (processedInput.text.toLowerCase().indexOf(bannedWords[j]) > -1) {
				banMessage = "Dropping the hammer on " + processedInput.name + " for using a banned word.";
				banhammer = true;
			}
		}
		if (banhammer === true) { 
			processedInput.name = "Server";
			processedInput.text = banMessage; 
		}

		console.log(processedInput.name + " : " + processedInput.text);
		var messageHash = {
			name : processedInput.name,
			text : processedInput.text
		};

		// Send new message (or ban message) to all clients.
		clients.forEach(function(client) {
			client.send(JSON.stringify(messageHash));
		});

		// Close connection of banned user.
		if (banhammer === true) { ws.close(); }

		// Add message to all_messages array and text file
		all_messages.push(messageHash);

		fs.writeFileSync("chat_app_api.txt", JSON.stringify({ messages : all_messages }));
	});

});