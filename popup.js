function convertToCSV(args) {
	console.log("test", args);

	var result, lineDelimiter, data, i;

	data = args.data || null;
	if (data == null || !data.length) {
		return null;
	}

	lineDelimiter = '\n';
	result = '';
	console.log("length ", data.length);

	for (i = 0; i < data.length; i++) {
		result += data[i];
		result += lineDelimiter;
	}
	console.log(result);
	return result;
}

function downloadCSV(args) {
	var data, filename, link;

	var csv = convertToCSV({ data: args });
	data = args.data;
	if (csv == null) return;

	filename = 'export.csv';

	if (!csv.match(/^data:text\/csv/i)) {
		csv = 'data:text/csv;charset=utf-8,' + csv;
	}
	data = encodeURI(csv);

	link = document.createElement('a');
	link.setAttribute('href', data);
	link.setAttribute('download', filename);
	link.click();
}

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

	document.getElementById('POPUP').addEventListener('click', function () {
		var popup = document.getElementById("myPopup");
		popup.classList.toggle("show");
	});


	/*
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
	*/

	chrome.storage.local.get(['log'], function (result) {
		console.log(result['log']);
		var i;
		var length = Math.min(result['log'].length, 10);

		for (i = 0; i < length; i++) {
			document.getElementById('log').innerHTML += "<p>"
			document.getElementById('log').innerHTML += result['log'][i];
			document.getElementById('log').innerHTML += "</p>"
		}

		document.getElementById('export_button').addEventListener('click', function () {
			console.log("test", result['log']);
			downloadCSV(result['log']);
		})
	});
};



