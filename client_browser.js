// client_browser.js

// The next two lines can have their commenting status toggled to cover local and server hosting.
var client = new WebSocket("ws://localhost:3001");
// var client = new WebSocket("ws://theadamcooper.com:3001");

var userName = "Anonymous user";
var userNameElement = document.getElementById("name_input");
var inputElement = document.getElementById("input_box");
var chatElement = document.getElementById("chat");
var ulElement = document.createElement("ul");
chatElement.appendChild(ulElement);
ulElement.style.listStyle = "none";

var addItem = function(inputText) {
	var newLiElement = document.createElement("li");
	newLiElement.innerHTML = inputText + "<br />";
	ulElement.appendChild(newLiElement);
	chatElement.scrollTop = chatElement.scrollHeight;
};

var tableFlip = function(matchData) {
	console.log("function tableFlip : start"); //debug
	return "(╯°□°）╯︵ ┻━┻";
};

var yell = function(matchData) {
	console.log("function yell : start"); //debug
	var yellText = matchData[1] ? matchData[1].toUpperCase() : "ARGGHHH!";
	return yellText;
};

var substituteText = function(txt) {
	var matchers = [
		{regex: /^\(table flip\)$/, processor: tableFlip},
		{regex: /^\/yell\s*(.*)/, processor: yell}
	];
	var matchData;
	for (var i=0; i < matchers.length; i=i+1) {
		matchData = txt.match(matchers[i].regex);
		console.log("regex : " + matchers[i].regex.toString() + "; match data : " + matchData); //debug
		if (matchData) {
			return matchers[i].processor(matchData);
		}
	}

	return txt;
};

var linkHandler = function(txt) {
	// Save For Later : var regex = /.*(\.bmp|\.gif|\.jpeg|\.jpg|\.png)$/i; 
	var linkedText = Autolinker.link(txt, { stripPrefix:false });
	return linkedText;
};

var processText = function(txt) {
	var subTxt = substituteText(txt);
	console.log("substitute : " + subTxt); //debug
//	txt = linkHandler(txt);
//	console.log("link handler : " + txt); //debug
	var linkedTxt = Autolinker.link(subTxt); 
	return linkedTxt;
};

// 	//Special parsings
// 	txt = txt + " "; //This hack provides for detection of the end of the URL.
// 	if ((txt.indexOf("http://") > -1) || (txt.indexOf("https://") > -1)) {
// 		//Convert URL to <a href="URL">URL</a>
// 		var index01 = txt.indexOf("http");
// 		var substrLength = txt.substr(index01).indexOf(" ");
// 		var urlString = txt.substr(index01, substrLength);
// 		//Image handling
// 		var extension = urlString.substr(urlString.length - 4);
// 		if ((extension === ".png") || (extension === ".bmp") || (extension === ".jpg") || (extension === ".gif")) {
// 			txt = txt.replace(urlString, "<img width=\"200px\" src=\"" + urlString + "\">");
// 		} else {
// 			txt = txt.replace(urlString, "<a href=\"" + urlString + "\">" + urlString + "</a>");
// 		}
// 	}
// 	return txt;
// }; 

var packageMsg = function(input) {
	var msg = input.toString().trim();

	msg = processText(msg);

	var package = {
		name : userName,
		text : msg
	};

	console.log(package); //debug

	return JSON.stringify(package);
};

// EVENT LISTENERS

// Event listener for chat client input
client.addEventListener("open", function(event) {
	addItem("Connected.");
	client.addEventListener("message", function(event) {
		var hash = JSON.parse(event.data);
		addItem(hash.name + ": " + hash.text);
	});
});

// event listener for username
name_input.addEventListener('blur', function() {
	userName = this.value;
});

// On Enter/Return keypress, send contents of input box to chat server
inputElement.addEventListener("keydown", function(event) {
	if (event.keyCode === 13) { 
		console.log("input box : " + this.value); //debug
		var packaged = packageMsg(this.value);
		client.send(packaged);
		this.value = "";
	}
});
