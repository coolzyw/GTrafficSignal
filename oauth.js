window.onload = function () {
    document.getElementById('authorize_button').addEventListener('click', function () {
        console.log("click sign in button");
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            console.log(token);
        });
    });
};
