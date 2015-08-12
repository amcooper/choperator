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

	// Broadcast message to all clients
	var broadcast = function(hash) {
		clients.forEach(function(client) {
			client.send(JSON.stringify(hash));
		});
	};

	// Add message to message array
	var pushMessage = function(hash) {
		all_messages.push(hash);
	};

	// Add message to external file
	var fileMessage = function(msgArray) {
		fs.writeFileSync("chat_app_api.json",JSON.stringify({ messages : msgArray }));
	};

	// New message handling suite
	var newMessageHandler = function(hash) {
		broadcast(hash);
		pushMessage(hash);
		fileMessage(all_messages); //asynch?
	};

	// Ill Chatbot
	var ill_chatbot = function() {
		var chatbot_name = "Ill Chatbot";
		var utterance_array = [
			"More than I imagined.", 
			"Oops sorry; that wasn't meant for you",
			"Say what?",
			"Less of an issue.", 
			"I think it was in June or July.", 
			"Can't remember.", 
			"Well you know what they say.", 
			"I don't think I can reasonably be held responsible for that.", 
			"Well bless your heart." 
		];

		var index = Math.floor(Math.random() * utterance_array.length);

		newMessageHandler({
			name: chatbot_name,
			text: utterance_array[index]
		});
	};

	clients.push(ws); // Add new client to clients array

	console.log("Clients connected: " + clients.length);

	// Send all current chat content to new client
	all_messages.forEach(function(message) {
		ws.send(JSON.stringify(message));
	});

	newMessageHandler({
		name : "Server",
		text : "Client connected."
	});

	ws.on("close", function() { // When the user closes the connection
		var x = clients.indexOf(ws);
		clients.splice(x,1); // Remove her from the clients array
		console.log("User " + usernames[x] + " has disconnected.");
		console.log("Clients connected: " + clients.length);
		newMessageHandler({
			name : "Server",
			text : "User " + usernames[x] + " has disconnected."
		});

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
		newMessageHandler({
			name : processedInput.name,
			text : processedInput.text
		});

		// Close connection of banned user.
		if (banhammer === true) { 
			ws.close();
		}

		// Ill Chatbot responds to the messages of a lone user.
		if (clients.length === 1) {
			setTimeout(ill_chatbot, 1000);
		}
	});

});