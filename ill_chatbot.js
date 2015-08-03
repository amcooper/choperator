var WebSocket = require("ws");

var chatbot_client = new WebSocket("ws://localhost:3001");
// var chatbot_client = new WebSocket("ws://theadamcooper.com:3001");

var username = "Ill Chatbot";

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

var utterance = function () {
	index = Math.floor(Math.random() * utterance_array.length);
	chatbot_client.send(JSON.stringify({name:username, text:utterance_array[index]}));
};

// Testing: Setting interval for every 10 seconds, so we don't have to wait forever to ensure its operation.
setInterval( utterance, 10000 );