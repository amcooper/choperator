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
		processedInput = JSON.parse(input);
		for (j=0; j<bannedWords.length; j++) {
			console.log(processedInput.text + "; " + bannedWords[j] + "; " + processedInput.text.indexOf(bannedWords[j]));
			if (processedInput.text.indexOf(bannedWords[j]) > -1) {
				// Ban the user
				ws.send("Dropping the hammer on " + processedInput.name + " for using a banned word.");
				ws.close();
			}
		}
		console.log(processedInput.name + " : " + processedInput.text);
		for (i = 0; i < clients.length; i++) { clients[i].send(input); } // Should this be a forEach?
	});

	console.log("Clients connected: " + clients.length);

	clients.forEach(function(client) {
		client.send("Client connected.");
	});

});