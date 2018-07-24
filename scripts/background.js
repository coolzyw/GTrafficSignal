/**
* Get users access_token.
*
* @param {object} options
*   @value {boolean} interactive - If user is not authorized ext, should auth UI be displayed.
*   @value {function} callback - Async function to receive getAuthToken result.
*/
function getAuthToken(options) {
  chrome.identity.getAuthToken({ 'interactive': options.interactive }, options.callback);
}


/** use
* Get users access_token or show authorize UI if access has not been granted.
*/
function getAuthTokenInteractive() {
  getAuthToken({
      'interactive': true,
      'callback': getAuthTokenInteractiveCallback,
  });
}


/** use
* User finished authorizing, start getting Gmail count.
*
* @param {string} token - Current users access_token.
*/
function getAuthTokenInteractiveCallback(token) {
  if (chrome.runtime.lastError) {
      showAuthNotification();
  } else {
      google_drive_api(token);
  }
}



/** get api call
* Get details about the users Gmail inbox.
*
*
* @param {string} token - Current users access_token.
*/
function google_drive_api(token) {
  get({
      'url': 'https://www.googleapis.com/drive/v3/files?key={YOUR_API_KEY}',
      //'url': 'https://www.googleapis.com/drive/v3/',
      'callback': google_drive_api_callback,
      'token': token,
  });
}

/**
* Got users Google drive file details.
*
*
* @param {object} label - Gmail users.labels resource.
*/
function google_drive_api_callback(label) {
  console.log("show api response");
  console.log(label.files);
  //setBadgeCount(label.threadsUnread);
}

/**
* Make an authenticated HTTP GET request.
*
* @param {object} options
*   @value {string} url - URL to make the request to. Must be whitelisted in manifest.json
*   @value {string} token - Google access_token to authenticate request with.
*   @value {function} callback - Function to receive response.
*/
function get(options) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
          // JSON response assumed. Other APIs may have different responses.
          options.callback(JSON.parse(xhr.responseText));
          // green
      } else {
          if (xhr.status!=200 && xhr.status!=0){
              trueCondition = "red";
              console.log('get', xhr.readyState, xhr.status, xhr.responseText);
              console.log("there is a error");
          }
      }
  };
  xhr.open("GET", options.url, true);
  // Set standard Google APIs authentication header.
  xhr.setRequestHeader('Authorization', 'Bearer ' + options.token);
  xhr.send();
}


// pop up a login panel for not logged in user to log in
var token = getAuthTokenInteractive();




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

chrome.storage.local.get(['log'], function(result) {
  if (typeof result.log === "undefined") {
    chrome.storage.local.set({'log': info});
  }
  window.setInterval(() => {
    condition = navigator.onLine ? "online" : "offline";
    client.get('http://www.google.com', function(response) {
      if (response === 200) {
        getAuthToken({
          'interactive': false,
          'callback': getAuthTokenInteractiveCallback,
      });
        console.log("internet success");
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
    chrome.browserAction.setIcon({path: "img/"+trueCondition + ".png"});
  }, 1000);
});