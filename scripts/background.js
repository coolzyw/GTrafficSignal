var condition;
var trueCondition;
var flag = true;
var prev_condition = "green";

var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState === 4)
                aCallback(anHttpRequest.status);
        }
        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send();
    }
}

function timeStamp() {
  // Create a date object with the current time
  var now = new Date();
  // Create an array with the current month, day and time
  var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];
  // Create an array with the current hour, minute and second
  var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
  // Determine AM or PM suffix based on the hour
  var suffix = ( time[0] < 12 ) ? "AM" : "PM";
  // Convert hour from military time
  time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
  // If hour is 0, set it to 12
  time[0] = time[0] || 12;
  // If seconds and minutes are less than 10, add a zero
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }
  // Return the formatted string
  return date.join("/") + " " + time.join(":") + " " + suffix;
}

function addToLog(message) {
  chrome.storage.local.get(['log'], function(result) {
    var arr = result['log'];
    if (arr.length === 10) {
      arr.shift();
      arr.push(message);
    }
    else if (arr.length < 10){
      arr.push(message);
    }
    chrome.storage.local.set({'log': arr});
  });
}

var client = new HttpClient();
var info = []

chrome.storage.local.get(['log'], function() {
  if (typeof result.log === "undefined") {
    chrome.storage.local.set({'log': info});
  }
  window.setInterval(() => {
    condition = navigator.onLine ? "online" : "offline";

    client.get('http://www.google.com', function(response) {
      if (response === 200) {
        flag = true;
      } else {
        flag = false;
      }
    });
    if (condition === "offline") {
      trueCondition = "red";
      if (trueCondition !== prev_condition) {
        var message = "Offline at:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ";
        message += timeStamp();
        console.log(message);
        addToLog(message);
      }
      prev_condition = trueCondition;
    } else {
      if (flag === true) {
        trueCondition = "green";
        if (trueCondition !== prev_condition) {
          var message = "Online at: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
          message += timeStamp();
          console.log(message);
          addToLog(message);
        }
        prev_condition = trueCondition;
      } else {
        trueCondition = "yellow";
        if (trueCondition !== prev_condition) {
          var message = "Local connection at:&nbsp;&nbsp;&nbsp;";
          message += timeStamp();
          console.log(message);
          addToLog(message);
        }
        prev_condition = trueCondition;
      }
    }
    chrome.browserAction.setIcon({path: trueCondition + ".png"});
  }, 1000);
});
