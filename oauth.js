window.onload = function () {
    document.getElementById('authorize_button').addEventListener('click', function () {
        console.log("click sign in button");
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            console.log(token);
        });
    });

    document.getElementById('signout_button').addEventListener('click', function () {
        console.log("click sign out button");
        var url = "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://www.example.com";
        chrome.tabs.create({ url: url });  
        // chrome.identity.getAuthToken({ interactive: true }, function (token) {
        //     chrome.identity.removeCachedAuthToken({ token: token, signOut: true },
        //         function () {
        //             console.log("Cached token has been removed")
        //         });
        // });     
    });
};