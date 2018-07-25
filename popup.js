// pop up a login panel for not logged in user to log in
// LOGIN entrance
window.onload = function () {
	document.getElementById('drive_button').addEventListener('click', function () {
		window.open("https://drive.google.com/drive/my-drive");
	});
	document.getElementById('authorize_button').addEventListener('click', function () {
		console.log("click sign in button");
		chrome.identity.getAuthToken({ interactive: true }, function (token) {
			console.log(token);
		});
	});

	document.getElementById('signout_button').addEventListener('click', function () {
		console.log("click sign out button");
		var url = "https://www.google.com/accounts/Logout";
		chrome.tabs.create({ url: url });
		// chrome.identity.getAuthToken({ interactive: true }, function (token) {
		//     chrome.identity.removeCachedAuthToken({ token: token, signOut: true },
		//         function () {
		//             console.log("Cached token has been removed")
		//         });
		// });     
	});
	chrome.storage.local.get(['log'], function (result) {
		console.log(result['log']);
		var i;
		for (i = 0; i < result['log'].length; i++) {
			document.getElementById('log').innerHTML += "<p>"
			document.getElementById('log').innerHTML += result['log'][i];
			document.getElementById('log').innerHTML += "</p>"
		}
	});
};


