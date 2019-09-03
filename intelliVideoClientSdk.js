import adapter from 'webrtc-adapter';
var base_url;
var jwt_token;
var icons={
		micOn:"fa fa-microphone",
		micOff:"fa fa-microphone-slash",
		volumeOn:"fas fa-volume-up",
		volumeOff:"fas fa-volume-mute",
		screenSharingOn:"fas fa-video",
		screenSharingOff:"fas fa-video-slash",
		file_txt:"fa fa-file-text",
		file_video:"fa fa-file-video-o",
		file_audio:"fa fa-file-audio-o",
		file_pdf:"fa fa-file-pdf-o",
		file_default:"fa fa-file",
		file_zip:'fa fa-file-archive-o',
		file_img:"fa fa-file-picture-o"
		
}
// console.log(location.host+" "+location.hostname+" "+localhost);
function SDK(url) {
	this.url = url;
	base_url = this.url;
	this.inputData = "";
}

SDK.prototype.makeAjaxCall = function(url, methodType, inputData, token) {
	var promiseObj = new Promise(function(resolve, reject) {

		var xhr = new XMLHttpRequest();
		// console.log(methodType + " " + url)
		xhr.open(methodType, url);
		xhr.overrideMimeType("application/json");
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader('Authorization', 'Bearer ' + token);
		xhr.send(JSON.stringify(inputData));

		xhr.onreadystatechange = function() {

			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					// console.log("xhr done successfully");
					var resp = xhr.responseText;
					// var respJson = JSON.parse(resp);
					resolve(resp);
				} else {
					reject(xhr.status);
					// console.log("xhr failed " + xhr.responseText);
				}
			} else {
				// console.log("xhr processing going on");
			}
		}
		// console.log("request sent succesfully");
	});
	return promiseObj;
}

/** ****************Event handlers***************************** */

SDK.prototype.errorHandler = function(statusCode) {
	// console.log("failed with status " + statusCode);
}
SDK.prototype.successHandler = function(msg) {
	// console.log("success" + msg);
}

/** *********************************************************** */

/* client sdk  */

SDK.prototype.saveMeeting = function(inputData) {
	// check the local storage for token
	//token = localStorage.getItem('JWT_Token');
	token=jwt_token;
	if (token === null) {
		// alert("token is null");
		this.generateToken(function(inputData) {
			//token = localStorage.getItem('JWT_Token');
			token=jwt_token;
			SDK.prototype.makeAjaxCall("https://" + base_url
					+ "/api/meeting/save", "POST", this.inputData, token);
		});
	} else {

		this.makeAjaxCall("https://" + base_url + "/api/authToken", "POST", "",
				token).then(
				function(response) {
					// console.log(response);
					//token = localStorage.getItem('JWT_Token');
					token=jwt_token;
					SDK.prototype.makeAjaxCall("https://" + base_url
							+ "/api/meeting/save", "POST", this.inputData,
							token);
				},
				function() {
					SDK.prototype.generateToken.call(this, function(inputData) {
						//token = localStorage.getItem('JWT_Token');
						token=jwt_token;
						this.makeAjaxCall("https://" + base_url
								+ "/api/meeting/save", "POST", this.inputData,
								token);
					});
				});
	}

}

SDK.prototype.generateToken = function(callback) {
	this.makeAjaxCall("config.json", "GET", "", "").then(
			function(response) {

				configData = JSON.parse(response);
				// json loaded.. now make a ajax call to signin
				SDK.prototype.makeAjaxCall.call(this,
						"https://" + base_url + "/api/users/app/signin",
						"POST", configData, "").then(function(token) {
					// console.log("token generated");
					// console.log(token);
					// Store the token in the local storage
					//localStorage.setItem("JWT_Token", token);
					jwt_token=token;
					callback;

				}, this.errorHandler);
			}, this.errorHandler);

}
/* function to save meetng */
SDK.prototype.joinMeeting = function(username, meetingId, masterDiv) {
	this.generateToken(register(username, meetingId, masterDiv));
	// register(username,meetingId);
}

SDK.prototype.changeAudioSettingByUserName=function(name){
	changeAudioConfigrationById(name);
}
SDK.prototype.changeVideoSettingByUserName=function(name){
	changeVideoConfigrationById(name);
}




