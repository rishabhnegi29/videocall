/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const PARTICIPANT_MAIN_CLASS = 'participant main';
const PARTICIPANT_CLASS = 'participant';

/**
 * Creates a video element for a new participant
 * 
 * @param {String}
 *            name - the name of the new participant, to be used as tag name of
 *            the video element. The tag of the new element will be 'video<name>'
 * @return
 */
function Participant(name, admin) {
	this.name = name;
	this.admin = admin;
	var container = document.createElement('div');
	
	// container.className = isPresentMainParticipant() ? PARTICIPANT_CLASS :
	// PARTICIPANT_MAIN_CLASS;
	container.className = PARTICIPANT_MAIN_CLASS;
	container.id = name;
	container.setAttribute("style","position:relative;width: auto;margin: 10px;");
	var span = document.createElement('span');
	var video = document.createElement('video');
	var rtcPeer;
	video.id = 'video-' + name;
	video.autoplay = true;
	video.controls = true;
	video.style.height="150px"
	video.setAttribute("playsinline", true);

	
	container.appendChild(video);
	document.getElementById('participants').appendChild(container);
	
	//<div id="overlay"></div>
	videoOverlay=document.createElement('div')
	videoOverlay.id="overlay";
	videoOverlay.onclick=off;
	document.getElementById('participants').appendChild(videoOverlay);

	
	
	
	
	if (admin === name) {
		tooldiv = document.createElement('div');
		tooldiv.id = "tooldiv";
		document.getElementById('participants').appendChild(tooldiv);
		tooldiv = document.getElementById('tooldiv');
		videoBtn = createButton("vid-" + admin, 'fas fa-video',
				changeVideoConfigration);
		videoBtn.title="enable/disbale video sharing"
		micBtn = createButton("mic-" + admin, 'fa fa-microphone',
				changeAudioConfigration);
		micBtn.title="Change Audio Setting";
		recordingBtn = createButton("rec-btn-" + admin,
				'glyphicon glyphicon-record', onRecordStartStop);
		
		recordingBtn.title="Video Recording";
		
		shareScreenBtn = createButton("btn-id-" + admin, 'fa fa-share-square',
				onScreenShareConfig);
		
		shareScreenBtn.title="Screen Sharing";
		
		endCall = createButton("button-leave", 'fa fa-phone', leaveRoom);
		endCall.title="End call";
		
		chatBtn = createButton('chatBtn','fas fa-comment-alt',toggleMsgBox);
		//chatBtn.innerHTML='<span class="badge">19</span>';
		msgCount=document.createElement('span');
		msgCount.className="badge";
		msgCount.id="msgCount";
		msgCount.innerText="19";
		msgCount.setAttribute("style","display:none ;position: absolute;left: 340px;top:11px;width:22px;font-size: 7px; background:red;");
		chatBtn.appendChild(msgCount);
		chatBtn.title="Show ChatBox";
		
		tooldiv.appendChild(videoBtn);
		tooldiv.appendChild(micBtn);
		tooldiv.appendChild(endCall);
		tooldiv.appendChild(recordingBtn);
		tooldiv.appendChild(shareScreenBtn);
		tooldiv.appendChild(chatBtn);
		document.getElementById('participants').appendChild(createChatBox());
		
	} else {
		
		
		participantToolDiv=document.createElement('div');
		div=document.createElement('div');
		div.setAttribute("style","position: absolute; pointer-events:auto;  display: none;  width: 100%; background: rgba(255,255,255,0.5); bottom: 0;    margin-bottom: 10px;");
		//div.style,"pointer-events:none;");
		div.id="ptd-"+name;
		participantToolDiv.appendChild(div);
		//participantToolDiv.setAttribute("style","display: block;position: absolute;top: 0px;left: 0;z-index: 1;width: 100%; height: 100%;");
		
		
		video.setAttribute("style","pointer-events:none; height:150px;");
		
		videoBtn=document.createElement('i');
		videoBtn.id="vid-"+name;
		videoBtn.className="toolDivIcn fas fa-video";
		videoBtn.setAttribute("style","margin:5px;float:left;margin-left: 12px");
		videoBtn.onclick=changeVideoConfigration;
		
		
		
		volumeBtn=document.createElement('i');
		volumeBtn.id="mic-"+name;
		volumeBtn.className="toolDivIcn fas fa-volume-up";
		volumeBtn.setAttribute("style","margin:5px;float:left");
		volumeBtn.onclick=changeAudioConfigration;
		
		fullScreenBtn=document.createElement('i');
		fullScreenBtn.id="ssb-"+name;
		fullScreenBtn.className="glyphicon glyphicon-fullscreen";
		fullScreenBtn.setAttribute("style","margin:5px;float:right;margin-right: 12px");
		
		fullScreenBtn.onclick=on;
		
		div.appendChild(videoBtn);
		div.appendChild(volumeBtn);
		div.appendChild(fullScreenBtn);
		container.appendChild(participantToolDiv);
		
		container.onmouseout=function(event){
			//console.log("out");
			//console.log(event.target);
			name=event.target.id;
			name=name.substring(name.indexOf("-")+1,name.length);
			//console.log(name);
			document.getElementById("ptd-"+name).style.display="none";
		}
		container.onmouseover=function(event){
			//console.log("in");
			//console.log(event.target);
			//div.style.display="block"
			name=event.target.id;
			name=name.substring(name.indexOf("-")+1,name.length);
			//console.log(name);
			document.getElementById("ptd-"+name).style.display="block";

		}
	}

	this.getElement = function() {
		return container;
	}

	this.getVideoElement = function() {
		return video;
	}

	function switchContainerClass() {
		if (container.className === PARTICIPANT_CLASS) {
			var elements = Array.prototype.slice.call(document
					.getElementsByClassName(PARTICIPANT_MAIN_CLASS));
			elements.forEach(function(item) {
				item.className = PARTICIPANT_CLASS;
			});

			container.className = PARTICIPANT_MAIN_CLASS;
		} else {
			container.className = PARTICIPANT_CLASS;
		}
	}

	function isPresentMainParticipant() {
		return ((document.getElementsByClassName(PARTICIPANT_MAIN_CLASS)).length != 0);
	}

	this.offerToReceiveVideo = function(error, offerSdp, wp) {
		if (error)
			return console.error("sdp offer error")
		console.log('Invoking SDP offer callback function');
		var msg = {
			id : "receiveVideoFrom",
			sender : name,
			sdpOffer : offerSdp
		};
		sendMessage(msg);
	}

	// <i class="fa fa-microphone-slash"></i>
	this.onIceCandidate = function(candidate, wp) {
		console.log("Local candidate" + JSON.stringify(candidate));

		var message = {
			id : 'onIceCandidate',
			candidate : candidate,
			name : name
		};
		sendMessage(message);
	}

	Object.defineProperty(this, 'rtcPeer', {
		writable : true
	});

	this.dispose = function() {
		console.log('Disposing participant ' + this.name);
		this.rtcPeer.dispose();
		container.parentNode.removeChild(container);
	};
}
function createButton(id, className, eventlistnername) {
	btn = document.createElement('button');
	btn.id = id;
	btn.className = "btn btn-default btn-circle btn-xl";

	// btn.onclick=changeAudioConfigration;
	icon = document.createElement('i');
	icon.className = className;
	icon.setAttribute("style", "pointer-events:none;");
	btn.onclick = eventlistnername;
	btn.appendChild(icon);
	return btn;
}
function createChatBox() {
	var chatDiv = document.createElement('div');
	chatDiv.id='myForm';
	chatDiv.className="chat-popup";
	chatDiv.setAttribute("style","display:none;");

	document.getElementById(masterDiv).appendChild(chatDiv);
	chatDiv.innerHTML = "<div class='panel-success'><div class='panel-heading' onclick='closeForm();'>Chat</div><div class='panel-body'><form action='' onsubmit='sendTextMsg(); return false;' class='form-container'><div id='msgBox' class='msgArea'></div><div class='form-group'> <input class='form-control required' type='text' id='msg-text-field' placeholder='Send a Message' autocomplete='off' required> <a href='#'> <span	class='glyphicon' id='get_file'>&#xe142;</span></a> <input type='file' id='singleFileUploadInput' style='display: none;'><div class='upload-response'><div id='singleFileUploadError'></div><div id='singleFileUploadSuccess'></div></div></div><button type='submit' class='btn btn-primary btn-md btn-block' id='send-btn' value='Send' style='float: right; margin-bottom: 5px;'><span class='glyphicon glyphicon-send'></span> Send </button><button type='button' class='btn btn-danger btn-md btn-block'	onclick='closeForm()'>Close</button></form></div></div>";
	//span.appendChild(document.createTextNode(name));
	document.getElementById('singleFileUploadInput').addEventListener('change',
			handleFileSelect, false);
	document.getElementById('get_file').onclick = function() {
		document.getElementById('singleFileUploadInput').click();
	}
	return chatDiv;
}
