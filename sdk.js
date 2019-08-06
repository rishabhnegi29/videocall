
function SDK() {
	this.init();
	this.url = "https://localhost:8443/";
	this.signIn();
	this.inputData = "";
}
/* init function is called from the onload of the of the page */
SDK.prototype.init = function() {

	console.log("inside init")
	this.makeAjaxCall("config.json", "GET", "", "").then(this.loadJson,
			this.errorHandler);
}
SDK.prototype.makeAjaxCall = function(url, methodType, inputData, token) {
	var promiseObj = new Promise(function(resolve, reject) {

		var xhr = new XMLHttpRequest();
		console.log(methodType + " " + url)
		xhr.open(methodType, url);
		xhr.overrideMimeType("application/json");
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader('Authorization', 'Bearer ' + token);
		xhr.send(JSON.stringify(inputData));

		xhr.onreadystatechange = function() {

			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					console.log("xhr done successfully");
					var resp = xhr.responseText;
					// var respJson = JSON.parse(resp);
					resolve(resp);
				} else {
					reject(xhr.status);
					console.log("xhr failed " + xhr.responseText);
				}
			} else {
				console.log("xhr processing going on");
			}
		}
		console.log("request sent succesfully");
	});
	return promiseObj;
}
SDK.prototype.signIn = function() {
	// load config file
	this.makeAjaxCall("config.json", "GET", "", "").then(
			function(response) {
				console.log("in side signnin ");
				configData = JSON.parse(response);
				// json loaded.. now make a ajax call to signin
				SDK.prototype.makeAjaxCall.call(this,
						"https://localhost:8443/api/users/app/signin", "POST",
						configData, "").then(function(token) {
					console.log("token generated");
					console.log(token);
					// Store the token in the local storage
					localStorage.setItem("JWT_Token", token);
				}, this.errorHandler);
			}, this.errorHandler);
}

/** ****************Event handlers***************************** */

SDK.prototype.errorHandler = function(statusCode) {
	console.log("failed with status " + statusCode);
}
SDK.prototype.successHandler = function(msg) {
	console.log("success" + msg);
}

/** *********************************************************** */

/*
 * SDK.prototype.loadJson=function(response) { // Parsing JSON string into
 * object configData = JSON.parse(response); console.log(configData); }
 */

/** *****************client */
SDK.prototype.registerMeeting = function(inputData) {
	this.inputData = inputData;
	token = localStorage.getItem('JWT_Token');
	if (token === null) {
		alert("token is null");
	} else {
		console.log(token);
		this.makeAjaxCall(this.url + "/api/authToken", "POST", "", token).then(
				this.registerMeetingHandler, this.errorHandler);
	}
}
SDK.prototype.registerMeetingHandler = function(responseJson) {
	console.log("Inside register meeting");
	token = localStorage.getItem('JWT_Token');
	SDK.prototype.makeAjaxCall("https://localhost:8443/api/meeting/save",
			"POST", this.inputData, token);
}
