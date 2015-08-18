// client_browser.js

// The next two lines can have their commenting status toggled to cover local and server hosting.
// var client = new WebSocket("ws://localhost:3001");
var client = new WebSocket("ws://theadamcooper.com:3001");

var userName = "Anonymous user";
var userNameElement = document.getElementById("name_input");
var inputElement = document.getElementById("input_box");
var chatMainElement = document.getElementById("chat_main");
var userListElement = document.getElementById("user_list");
var ulElement = document.createElement("ul");
chatMainElement.appendChild(ulElement);
ulElement.style.listStyle = "none";

var addItem = function(inputText) {
  var newLiElement = document.createElement("li");
  newLiElement.innerHTML = inputText + "<br />";
  ulElement.appendChild(newLiElement);
  chatMainElement.scrollTop = chatMainElement.scrollHeight;
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
  var matchData, subbedText;
  // A version of the for loop with forEach; couldn't get this working earlier.
  matchers.forEach(function(matcher) {
    matchData = txt.match(matcher.regex);
    console.log("regex : " + matcher.regex.toString() + "; match data : " + matchData); //debug
    if (matchData) {
      subbedText = matcher.processor(matchData);
    }
  });
  console.log("subbedText : " + subbedText); //debug
  return subbedText || txt;
};

var linkHandler = function(txt) {
  var autolinkedText = Autolinker.link(txt, { 
    stripPrefix: false,
    replaceFn: function( autolinker, match ) {
      if ( match.getType() === 'url' ) {
        var url = match.getUrl();
        var imgRegex = /.*(\.bmp|\.gif|\.jpeg|\.jpg|\.png)$/i; 
        if ( url.match(imgRegex) ) {
          return '<br /><img width="200px" alt="User-supplied image link" src="' + url + '"><br />';
        } else {
          return true;
        }
      } else {
        return true;
      }
    }
  });
  return autolinkedText;
};

var processText = function(txt) {
  var subTxt = substituteText(txt);
  console.log("substitute : " + subTxt); //debug
  var processedText = linkHandler(subTxt); 
  console.log("link handler : " + processedText); //debug
  return processedText;
};

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
userNameElement.addEventListener('blur', function() {
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
