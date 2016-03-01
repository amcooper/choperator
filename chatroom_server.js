//chatroom_server.js

var WebSocketServer = require("ws").Server;
var server = new WebSocketServer({port:3001});

var fs = require("fs"), _ = require("underscore");

var clients = [];
var chatbot_name = "Ill Chatbot";
var usernames = ["Server", chatbot_name], allUserOffset = 2;
var all_messages = [];
var options = { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'numeric' };
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
    fileMessage(all_messages);
  };

  // Ill Chatbot
  var ill_chatbot = function() {
    var utterance_array = [
    "More than I imagined.", 
    "Oops sorry; that wasn't meant for you.",
    "Say what?",
    "Less of an issue.", 
    "I think it was in June or July.", 
    "Can't remember.", 
    "Well you know what they say.", 
    "I don't think I can reasonably be held responsible for that.", 
    "Well bless your heart.",
    "Oh boy. How much would *that* cost?",
    "Don't you think that's a bit much?",
    ];

    var index = Math.floor(Math.random() * utterance_array.length);

    newMessageHandler({
      timestamp: new Date(),
      userIndex: 1,
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
    timestamp: new Date(),
    userIndex: 0,
    name : "Server",
    text : "Client connected."
  });

  ws.on("close", function() { // When the user closes the connection
    var clientIndex = clients.indexOf(ws);
    var allUserIndex = clientIndex + allUserOffset;
    clients.splice(clientIndex,1); // Remove her from the clients array
    console.log("User " + usernames[allUserIndex] + " has disconnected.");
    console.log("Clients connected: " + clients.length);
    newMessageHandler({
      timestamp: new Date(),
      userIndex: 0,
      name : "Server",
      text : "User " + usernames[allUserIndex] + " has disconnected."
    });

    // Remove user from list of current usernames
    usernames.splice(allUserIndex,1);
  });

  ws.on("message", function(input) { // When the user enters a message

    // Banned word test
    var banhammerTest = function(inputHash) {
      var bannedWords = ["moist", "pamphlet", "tummy", "yummy", "gummi", "gummy", "vainglorious"];
      var banhammer = false;
      
      // Test passes if banned word is found in text
      return (_.intersection(bannedWords, inputHash.text.toLowerCase().split(' ')).length > 0);
    };    

    var processedInput = JSON.parse(input);
    var allUserIndex = clients.indexOf(ws) + allUserOffset;
    usernames[allUserIndex] = processedInput.name;
    processedInput.userIndex = processedInput.userIndex || allUserIndex;

    // Close connection of banned user.
    if (banhammerTest(processedInput)) { 
      newMessageHandler({
        timestamp: new Date(),
        userIndex: 0,
        name: "Server", 
        text: "Dropping the hammer on " + processedInput.name + " for using a banned word." 
      });
      ws.close();
    } else {
      newMessageHandler(processedInput);      
    }

    // Ill Chatbot responds to the messages of a lone user.
    if (clients.length === 1) {
      setTimeout(ill_chatbot, 1000);
    }
  });

});