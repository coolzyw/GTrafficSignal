/**
 * Create a basic Desktop notification.
 *
 * @param {object} options
 *   @value {string} iconUrl - Image URL to display in notification.
 *   @value {string} title - Notification header.
 *   @value {string} message - Notification message.
 */

function createBasicNotification(options) {
  var notificationOptions = {
      'type': 'basic',
      'iconUrl': options.iconUrl, // Relative to Chrome dir or remote URL must be whitelisted in manifest.
      'title': options.title,
      'message': options.message,
      'isClickable': true,
  };
  chrome.notifications.create(options.id, notificationOptions, function (notificationId) { });
}

/**
* Show a notification that prompts the user to authenticate their Google account.
*/
function showAuthNotification() {
  var options = {
      'id': 'start-auth',
      'iconUrl': 'img/developers-logo.png',
      'title': 'GDE Sample: Chrome extension Google APIs',
      'message': 'Click here to authorize access to Gmail',
  };
  createBasicNotification(options);
}

/**
* Show a notification that authentication was completed successfully.
*
* @param {object} profile
*   @value {string} imageUrl - Google+ profile image URL.
*   @value {string} displayName - Google+ profile full name.
*/
function showProfileNotification(profile) {
  var options = {
      'id': 'show-profile',
      'iconUrl': profile.imageUrl,
      'title': 'Welcome ' + profile.displayName,
      'message': 'Gmail checker is now active',
  };
  createBasicNotification(options);
}

/**
* Triggered anytime user clicks on a desktop notification.
*/
function notificationClicked(notificationId) {
  // User clicked on notification to start auth flow.
  if (notificationId === 'start-auth') {
      getAuthTokenInteractive();
  }
  clearNotification(notificationId);
}

/**
* Clear a desktop notification.
*
* @param {string} notificationId - Id of notification to clear.
*/
function clearNotification(notificationId) {
  chrome.notifications.clear(notificationId, function (wasCleared) { });
}

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

/**
* Get users access_token in background with now UI prompts.
*/
function getAuthTokenSilent() {
  getAuthToken({
      'interactive': false,
      'callback': getAuthTokenSilentCallback,
  });
}

/**
* Get users access_token or show authorize UI if access has not been granted.
*/
function getAuthTokenInteractive() {
  getAuthToken({
      'interactive': true,
      'callback': getAuthTokenInteractiveCallback,
  });
}

/**
* If user is authorized, start getting Gmail count.
*
* @param {string} token - Users access_token.
*/
function getAuthTokenSilentCallback(token) {
  // Catch chrome error if user is not authorized.
  if (chrome.runtime.lastError) {
      showAuthNotification();
  } else {
      updateLabelCount(token);
  }
}

/**
* User finished authorizing, start getting Gmail count.
*
* @param {string} token - Current users access_token.
*/
function getAuthTokenInteractiveCallback(token) {
  // Catch chrome error if user is not authorized.
  if (chrome.runtime.lastError) {
      showAuthNotification();
  } else {
      updateLabelCount(token);
      //getProfile(token);
  }
}

/**
* Get the current users Google+ profile to welcome them.
*
* https://developers.google.com/+/api/latest/people/get
*
* @param {string} token - Current users access_token.
*/
function getProfile(token) {
  get({
      // 'url':'https://www.googleapis.com/',
      'url': 'https://www.googleapis.com/drive/v3/files?key={YOUR_API_KEY}',
      'callback': getProfileCallback,
      'token': token,
  });
}

/**
* Got users Google+ profile, show welcome desktop notification.
*
* https://developers.google.com/+/api/latest/people/get
*
* @param {object} person - Google+ person resource.
*/
function getProfileCallback(person) {
  var filenames = person.files;
  // var options = {
  //     'displayName': person.displayName,
  //     'imageUrl': person.image.url + '0',
  // };
  //showProfileNotification(options);
}

/**
* Get details about the users Gmail inbox.
*
* https://developers.google.com/gmail/api/v1/reference/users/labels/get
*
* @param {string} token - Current users access_token.
*/
function updateLabelCount(token) {
  get({
      'url': 'https://www.googleapis.com/drive/v3/files?key={YOUR_API_KEY}',
      //'url': 'https://www.googleapis.com/drive/v3/',
      'callback': updateLabelCountCallback,
      'token': token,
  });
}

/**
* Got users Gmail inbox details.
*
* https://developers.google.com/gmail/api/v1/reference/users/labels/get
*
* @param {object} label - Gmail users.labels resource.
*/
function updateLabelCountCallback(label) {
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
          // red
          console.log('get', xhr.readyState, xhr.status, xhr.responseText);
          console.log("there is a error");
      }
  };
  xhr.open("GET", options.url, true);
  // Set standard Google APIs authentication header.
  xhr.setRequestHeader('Authorization', 'Bearer ' + options.token);
  xhr.send();
}

/**
* Set browserAction status.
*
* @param {object} options
*   @value {string} text - Up to four letters to be visible on browserAction.
*   @value {string} color - Text background color. E.g. #FF0000
*   @value {string} title - The hover tooltip.
*/
function setBadge(options) {
  chrome.browserAction.setBadgeText({ 'text': options.text });
  chrome.browserAction.setBadgeBackgroundColor({ 'color': options.color });
  chrome.browserAction.setTitle({ 'title': options.title });
}

/**
* Set the browserAction status for unauthenticated user.
*/
function setBadgeNoAuth() {
  setBadge({
      'text': '?',
      'color': '#9E9E9E',
      'title': 'Click to authorize Gmail',
  });
}

/**
* Set the browserAction status for Gmail label count.
*
* @param {int} count - The count of unread emails in label.
*/
function setBadgeCount(count) {
  var color = '#9E9E9E';
  var title = 'No unread mail';
  if (count > 0) {
      color = '#F44336';
      title = count + ' unread mail';
  }
  setBadge({
      'text': count + '', // Cast count int to string.
      'color': color,
      'title': title,
  });
}

/**
* User clicked on browserAction button. Check if user is authenticated.
*
* @param {object} tab - Chrome tab resource.
*/
function browserActionClicked(tab) {
  getAuthToken({
      'interactive': false,
      'callback': getBrowserActionAuthTokenCallback,
  });
}

/**
* If user is authenticated open Gmail in new tab or start auth flow.
*
* @param {string} token - Current users access_token.
*/
function getBrowserActionAuthTokenCallback(token) {
  if (chrome.runtime.lastError) {
      getAuthTokenInteractive();
  } else {
      chrome.tabs.create({ 'url': 'https://drive.google.com' });
  }

}

/**
* Chrome alarm has triggered.
*
* @param {object} alarm - Chrome alarm resource.
*/
function onAlarm(alarm) {
  // Check Gmail for current unread count.
  if (alarm.name === 'update-count') {
      getAuthTokenSilent();
  }
}

/**
* Wire up Chrome event listeners.
*/
//chrome.notifications.onClicked.addListener(notificationClicked);
chrome.browserAction.onClicked.addListener(browserActionClicked);
chrome.alarms.onAlarm.addListener(onAlarm);

/**
* Perform initial auth checks and set alarm for periodic updates.
*/
setBadgeNoAuth();
getAuthTokenInteractive();
chrome.alarms.create('update-count', { 'delayInMinutes': 15, 'periodInMinutes': 15 });




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
        //getAuthTokenInteractive();
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