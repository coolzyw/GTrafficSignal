window.onload = function(){
	chrome.storage.local.get(['log'], function(result) {
		console.log(result['log']);
		var i;
		for (i = 0; i < result['log'].length; i++) {
			document.getElementById('log').innerHTML += "<p>"
			document.getElementById('log').innerHTML += result['log'][i];
			document.getElementById('log').innerHTML += "</p>"
		}
	});
};