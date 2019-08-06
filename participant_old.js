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
//var masterDiv='participants';
/**
 * Creates a video element for a new participant
 *
 * @param {String} name - the name of the new participant, to be used as tag
 *                        name of the video element.
 *                        The tag of the new element will be 'video<name>'
 * @return
 */
function Participant(name,admin) {
	this.name = name;
	this.admin=admin;
	var container = document.createElement('div');
	//container.className = isPresentMainParticipant() ? PARTICIPANT_CLASS : PARTICIPANT_MAIN_CLASS;
	container.className =PARTICIPANT_MAIN_CLASS;
	container.id = name;
	var span = document.createElement('span');
	var video = document.createElement('video');
	var audioBtn=document.createElement('i');
	var videoBtn=document.createElement('i');
	var screenShareBtn=document.createElement('button')
	
	
	var rtcPeer;

	container.appendChild(video);
	container.appendChild(span);
	container.appendChild(audioBtn);
	container.appendChild(videoBtn);
	//container.onclick = switchContainerClass;
	
	var chatDiv=document.createElement('div');
	document.getElementById(masterDiv).appendChild(container);
	
	/*<button class="open-button" id="chatBtn" onclick="openForm()"
		style="display: none;">Chat</button>
	*/
		
		
	var chatBtn=document.createElement('button');
	chatBtn.id='chatBtn';
	chatBtn.className='open-button';
	chatBtn.onclick=openForm;
	chatBtn.setAttribute("style", "display: block;");
	chatBtn.innerHTML="Chat";
	
	
	
	document.getElementById(masterDiv).appendChild(chatBtn);
	document.getElementById(masterDiv).appendChild(chatDiv);
	
	
	
	chatDiv.innerHTML ="<div class='chat-popup' id='myForm' style='display: none;'><div class='panel panel-success'><div class='panel-heading' onclick='closeForm();'>Chat</div><div class='panel-body'><form action='' onsubmit='sendTextMsg(); return false;' class='form-container'><div id='msgBox' class='msgArea'></div><div class='form-group'> <input class='form-control required' type='text' id='msg-text-field' placeholder='Send a Message' autocomplete='off' required> <a href='#'> <span	class='glyphicon' id='get_file'>&#xe142;</span></a> <input type='file' id='singleFileUploadInput' style='display: none;'><div class='upload-response'><div id='singleFileUploadError'></div><div id='singleFileUploadSuccess'></div></div></div><button type='submit' class='btn btn-primary btn-md btn-block' id='send-btn' value='Send' style='float: right; margin-bottom: 5px;'><span class='glyphicon glyphicon-send'></span> Send </button><button type='button' class='btn btn-danger btn-md btn-block'	onclick='closeForm()'>Close</button></form></div></div></div>" ;
	span.appendChild(document.createTextNode(name));

	document.getElementById('singleFileUploadInput').addEventListener('change', handleFileSelect, false);

	document.getElementById('get_file').onclick = function() {
	    document.getElementById('singleFileUploadInput').click();
	}
	
	
	
	if(admin===name){
		container.appendChild(screenShareBtn);
		soundIcon='fa fa-microphone';
		screenShareBtn.innerHTML="Screen Share"
		screenShareBtn.id="btn-id-"+name;
		screenShareBtn.onclick=onScreenShareConfig;
	}
	else
		soundIcon="glyphicon glyphicon-volume-up";
	//muteBtn.innerText="&#xf6a9;";
	audioBtn.id="mic-"+name;
	audioBtn.className=soundIcon;
	audioBtn.setAttribute("style", "font-size:30 px");
	audioBtn.onclick=changeAudioConfigration;
	
	//video button
	
	videoBtn.id="vid-"+name;
	videoBtn.className='fas fa-video';
	videoBtn.setAttribute("style", "font-size:30 px");
	videoBtn.onclick=changeVideoConfigration;
	
	video.id = 'video-' + name;
	video.autoplay = true;
	video.controls = false;

	
	this.getElement = function() {
		return container;
	}

	this.getVideoElement = function() {
		return video;
	}

	function switchContainerClass() {
		if (container.className === PARTICIPANT_CLASS) {
			var elements = Array.prototype.slice.call(document.getElementsByClassName(PARTICIPANT_MAIN_CLASS));
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

	this.offerToReceiveVideo = function(error, offerSdp, wp){
		if (error) return console.error ("sdp offer error")
		console.log('Invoking SDP offer callback function');
		var msg =  { id : "receiveVideoFrom",
				sender : name,
				sdpOffer : offerSdp
			};
		sendMessage(msg);
	}
	

//	<i class="fa fa-microphone-slash"></i>
	this.onIceCandidate = function (candidate, wp) {
		  console.log("Local candidate" + JSON.stringify(candidate));

		  var message = {
		    id: 'onIceCandidate',
		    candidate: candidate,
		    name: name
		  };
		  sendMessage(message);
	}

	Object.defineProperty(this, 'rtcPeer', { writable: true});

	this.dispose = function() {
		console.log('Disposing participant ' + this.name);
		this.rtcPeer.dispose();
		container.parentNode.removeChild(container);
	};
}
