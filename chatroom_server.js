//chatroom_server.js

var WebSocketServer = require("ws").Server;
var server = new WebSocketServer({port:3000});

var clients = [];
var bannedWords = ["moist", "pamphlet", "tummy", "yummy", "gummi", "gummy"];

console.log("Listening on port 3000.");

server.on("connection", function(ws) {

	clients.push(ws);

	ws.on("close", function() {
		var x = clients.indexOf(ws);
		clients.splice(x,1);
		console.log("Clients connected: " + clients.length);
	});

	ws.on("message", function(input) {
		//var y = clients.indexOf(ws);
		var banhammer = false;
		processedInput = JSON.parse(input);
		for (j=0; j<bannedWords.length; j++) {
			if (processedInput.text.toLowerCase().indexOf(bannedWords[j]) > -1) {
				// Ban the user
				console.log("Dropping the hammer on " + processedInput.name + " for using a banned word.");
				ws.send("Dropping the hammer on " + processedInput.name + " for using a banned word."); // This notification doesn't work.
				banhammer = true;
			}
		}
		if (banhammer === true) { 
			ws.close(); 
		} else {
			console.log(processedInput.name + " : " + processedInput.text);
			for (i = 0; i < clients.length; i++) { clients[i].send(input); } // Should this be a forEach?
		}
	});

	console.log("Clients connected: " + clients.length);

	//This segment doesn't work.
	clients.forEach(function(client) {
		client.send("Client connected.");
	});

});