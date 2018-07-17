var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = "https://apis.google.com/js/api.js";
head.appendChild(script);

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

var CLIENT_ID = '630133507196-7ul37fut1n49u3ik6b71a9s18l5t165u.apps.googleusercontent.com';
var CLIENT_SECRET = '0eRqWj5lk5zESf_QPrTMuHpb';
var API_KEY = 'AIzaSyB5MWulmdu1sXzj9p6fQ4UGGsucQZ4HwAU';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';


window.onload = function(){
	
    //handleClientLoad();

	/*
	chrome.storage.local.get(['log'], function(result) {
		console.log(result['log']);
		var i;
		for (i = 0; i < result['log'].length; i++) {
			document.getElementById('log').innerHTML += "<p>"
			document.getElementById('log').innerHTML += result['log'][i];
			document.getElementById('log').innerHTML += "</p>"
		}
	});
	*/
};

function listFiles() {
	gapi.client.drive.files.list({
	  'pageSize': 10,
	  'fields': "nextPageToken, files(id, name)"
	}).then(function(response) {
	  appendPre('Files:');
	  var files = response.result.files;
	  if (files && files.length > 0) {
		for (var i = 0; i < files.length; i++) {
		  var file = files[i];
		  appendPre(file.name + ' (' + file.id + ')');
		}
	  } else {
		appendPre('No files found.');
	  }
	});
  }

document.onreadystatechange = function () {
	if (document.readyState === "complete") {
		handleClientLoad();
	}
  }

function appendPre(message) {
	var pre = document.getElementById('content');
	var textContent = document.createTextNode(message + '\n');
	pre.appendChild(textContent);
}

function handleClientLoad() {
	console.log("here is handle client load");
	gapi.load('client:auth2', initClient);
}

var googleAuth = new OAuth2('google', {
	client_id: CLIENT_ID,
	client_secret: CLIENT_SECRET,
	api_scope: SCOPES
  });
  
  googleAuth.authorize(function() {
	initClient();
  });

function initClient() {
	console.log("very beginning of client init");
	gapi.client.init({
	  apiKey: API_KEY,
	  clientId: CLIENT_ID,
	  discoveryDocs: DISCOVERY_DOCS,
	  scope: SCOPES
	}).then(function () {
	  console.log("here is client init");
	  // Listen for sign-in state changes.
	  gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

	  // Handle the initial sign-in state.
	  updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
	  authorizeButton.onclick = handleAuthClick;
	  signoutButton.onclick = handleSignoutClick;
	}).catch((error)=>{
		console.log("error in init", error);
	});
  }

  function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
	  authorizeButton.style.display = 'none';
	  signoutButton.style.display = 'block';
	  listFiles();
	} else {
	  authorizeButton.style.display = 'block';
	  signoutButton.style.display = 'none';
	}
  }

  function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn();
  }

  function handleSignoutClick(event) {
	gapi.auth2.getAuthInstance().signOut();
  }
