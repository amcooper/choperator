//chatroom_server.js

var WebSocketServer = require("ws").Server;
var server = new WebSocketServer({port:3000});

var clients = [];

console.log("Listening on port 3000.");

server.on("connection", function(ws) {

	clients.push(ws);

	ws.on("close", function() {
		var x = clients.indexOf(ws);
		clients.splice(x,1);
		console.log("Clients connected: " + clients.length);
	});

	ws.on("message", function(input) {
		var y = clients.indexOf(ws);
		processedInput = JSON.parse(input);
		console.log(processedInput.name + " : " + processedInput.text);
		for (i = 0; i < clients.length; i++) {
			// if (i != y) {
				clients[i].send(input);
			// }
		}
	});

	console.log("Clients connected: " + clients.length);

	clients.forEach(function(client) {
		client.send("Client connected.");
	});

});