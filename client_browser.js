// client_browser.js

// 2016-03-06: Use data attributes and momentjs and setInterval to update relative timestamps.
// Pseudocode below
//
// ***
//
// var relative = function(timestamp) {
//   document.getElementByAttribute("data-timestamp").forEach(el) {
//     var stamp;
//     var diff = moment() - moment(el.data-timestamp);
//     if (diff > 6 days) { stamp = moment(el.data-timestamp).format("ddd MMM DD, YYYY hh:mm:ss a") }
//       else if (diff > 24 hours) { stamp = moment(el.data-timestamp).format("dddd hh:mm:ss a") }
//       else { stamp = moment(el.data-timestamp).fromNow() };
//     el.innerHTML = stamp;
//   }
// };
//
// ***

// The next two lines can have their commenting status toggled to cover local and server hosting.
var client = new WebSocket("ws://localhost:3001");
// var client = new WebSocket("ws://theadamcooper.com:3001");

var formatString = "ddd MMM DD, YYYY hh:mm:ss a";
var userName = "Anonymous user";
var userNameElement = document.getElementById("name_input");
var inputElement = document.getElementById("input_box");
var chatMainElement = document.getElementById("chat_main");
var userListElement = document.getElementById("user_list");
var ulElement = document.createElement("ul");
chatMainElement.appendChild(ulElement);
ulElement.style.listStyle = "none";

var htmlSanitize = function(unsafe) {
  return unsafe
   .replace(/&/g, "&amp;")
   .replace(/</g, "&lt;")
   .replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;")
   .replace(/'/g, "&#039;");
 };

var colorClass = function(index) { //builds a class name like "user3" or "user10"
  // Initial users are the server and the chatbot. New users' color classes cycle from 2 through 9.
  var allUserOffset = 2, colorTotal = 8;
  index = (index - allUserOffset) % colorTotal + allUserOffset; 
  return "user" + index.toString();
};

var addItem = function(inputHash) {
  console.log(inputHash);
  var options = { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'numeric' };
  var newLiElement = document.createElement("li");
  var timeSpanElement = document.createElement("span");
  var nameSpanElement = document.createElement("span");
  var textSpanElement = document.createElement("span");
  $( timeSpanElement ).addClass("timestamp");
  $( nameSpanElement ).addClass("username");
  $( textSpanElement ).addClass("text");
  var latestLiElement = ulElement.lastChild;
  // if lastLi's timestamp-child's timestamp.getDate === currentTimestamp.getDate {
  //      render hh:mm
  // } else {
  //      render mmm dd hh:mm
  // }
  // timeSpanElement.innerHTML = render;
  timeSpanElement.innerHTML = inputHash.timestamp + "  "; //.toLocaleDateString('en-US', options);
  nameSpanElement.innerHTML = htmlSanitize(inputHash.name + ": ");
  textSpanElement.innerHTML = htmlSanitize(inputHash.text);
  newLiElement.appendChild(timeSpanElement);
  newLiElement.appendChild(nameSpanElement);
  newLiElement.appendChild(textSpanElement);
  $( newLiElement ).addClass(colorClass(inputHash.userIndex));
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

  var thePackage = {
    timestamp : moment().format(formatString),
    name : userName,
    text : msg
  };

  console.log(thePackage); //debug

  return JSON.stringify(thePackage);
};

// EVENT LISTENERS

// Event listener for chat client input
client.addEventListener("open", function(event) {

  // 2016-03-06 This text is displayed before the chat history. It should wait for the chat history to come from the server before displaying. Check documentation of Node.js Websockets.
  addItem({timestamp:moment().format(formatString), userIndex:0, name:"Server", text:"You're connected."});
  client.addEventListener("message", function(event) {
    var hash = JSON.parse(event.data);
    addItem(hash);
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
