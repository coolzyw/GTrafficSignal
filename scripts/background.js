var signed_in = false;
var signed_in_display = false;
var GFLAG = true;

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
<<<<<<< HEAD
  console.log(token);
  // if (!token) {
  //   if (chrome.runtime.lastError.message.match(/not signed in/)) {
  //     console.log("logged out");
  //     signed_in = false;
  //   } else {
  //     signed_in = true;
  //     google_drive_api(token);
  //   }
  // }
  if (!token) {
    console.log("logged out");
    signed_in = false;
  }
  else {
    google_drive_api(token);
    signed_in = true;
=======
  if (!token) signed_in = false;
  else signed_in = true;
  if (chrome.runtime.lastError) {
    console.log("not logged in");
  } else {
    google_drive_api(token);
>>>>>>> aa18d9527b10b18dbce5870a60fd22b33fb93da0
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
      GFLAG = true;
    } else {
      if (xhr.status != 200 && xhr.status != 0) {
        GFLAG = false;
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
// LOGIN entrance
getAuthTokenInteractive();
chrome.identity.getAuthToken({ interactive: false }, function (token) {
  if (!token) {
    console.log("!token", token);
    if (chrome.runtime.lastError) {
    //if (chrome.runtime.lastError.message.match(/not signed in/)) {
      signed_in = false;
    } else {
      signed_in = true;
    }
  }
  else{
    console.log("token: ",token);
    signed_in = true;
  }
});
console.log("sign in ", signed_in);


chrome.runtime.onInstalled.addListener(function (callback) {
  if (callback.reason == "install") {
    //call a function to handle a first install
    var message = "Extension installed at: ";
    message += timeStamp();
    console.log(message);
    addToLog(message);
  }
  else if (callback.reason == "update") {
    //call a function to handle an update
    var message = "Extension updated at: ";
    message += timeStamp();
    console.log(message);
    addToLog(message);
  }
});



var condition;
var trueCondition;
var flag = true;
var prev_condition = "grey";

var HttpClient = function () {
  this.get = function (aUrl, aCallback) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function () {
      if (anHttpRequest.readyState === 4)
        aCallback(anHttpRequest.status);
    }
    anHttpRequest.open("GET", aUrl, true);
    anHttpRequest.send();
  }
}

function timeStamp() {
  // Create a date object with the current time
  var now = new Date();
  // Create an array with the current month, day and time
  var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
  // Create an array with the current hour, minute and second
  var time = [now.getHours(), now.getMinutes(), now.getSeconds()];
  // Determine AM or PM suffix based on the hour
  var suffix = (time[0] < 12) ? "AM" : "PM";
  // Convert hour from military time
  time[0] = (time[0] < 12) ? time[0] : time[0] - 12;
  // If hour is 0, set it to 12
  time[0] = time[0] || 12;
  // If seconds and minutes are less than 10, add a zero
  for (var i = 1; i < 3; i++) {
    if (time[i] < 10) {
      time[i] = "0" + time[i];
    }
  }
  // Return the formatted string
  return date.join("/") + " " + time.join(":") + " " + suffix;
}

function addToLog(message) {
  chrome.storage.local.get(['log'], function (result) {
    var arr = result['log'];
    if (result['log'].length === 10) {
      arr.shift();
      arr.push(message);
    }
    else if (result['log'].length < 10) {
      arr.push(message);
    }
    chrome.storage.local.set({ 'log': arr });
  });
}

var client = new HttpClient();
var info = []

chrome.storage.local.get(['log'], function (result) {
  if (typeof result.log === "undefined") {
    chrome.storage.local.set({ 'log': info });
  }
  var timer = window.setInterval(() => {
    condition = navigator.onLine ? "online" : "offline";
    client.get('http://www.google.com', function (response) {
      if (response === 200) {
        console.log("internet success");
        console.log("sign in ", signed_in);
        chrome.storage.local.set({ 'sign_in': signed_in });
        flag = true;
        if (signed_in===true){
          //getAuthTokenInteractive();
        }
        else{
          console.log("logged out");
        }
      } else {
        flag = false;
      }
    });
    if (signed_in === true && signed_in_display == false) {
      var message = "User signed in at: ";
      message += timeStamp();
      console.log(message);
      addToLog(message);
      signed_in_display = true;
    }
    else if (signed_in == false) {
      //if(prev_condition === "green") getAuthToken(options);

      if (flag == true) {
        trueCondition = "grey";
        prev_condition = trueCondition;
      }
    }
    if (flag === false) {
      trueCondition = "yellow";
      if (trueCondition !== prev_condition) {
        var message = "Internet offline at: ";
        message += timeStamp();
        console.log(message);
        addToLog(message);
      }
      prev_condition = trueCondition;
    } else {
      if (signed_in == true && GFLAG === true) {
        trueCondition = "green";
        if (trueCondition !== prev_condition) {
          var message = "Google drive is up at: ";
          message += timeStamp();
          console.log(message);
          addToLog(message);
        }
        prev_condition = trueCondition;
      } else if (signed_in == true && GFLAG == false) {
        trueCondition = "red";
        if (trueCondition !== prev_condition) {
          var message = "Google drive is down at: ";
          message += timeStamp();
          console.log(message);
          addToLog(message);
        }
        prev_condition = trueCondition;
      }
    }
    chrome.browserAction.setIcon({ path: "img/" + trueCondition + ".png" });
  }, 1000);
});