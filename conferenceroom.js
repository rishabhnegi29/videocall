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

var appKey="demdoomoemomdeod";
var appName="demoApp";
var appSecret="172451b2e917d6e08b52bc0d4324ee39c738b259";
var password= "12345678";
var username= "test123";
var masterDiv='participants';
console.log(location.host+" "+location.port);
var ws=null;
var participants = {};
var admin;
var name;
var room;
var parsedMessage;
var JWT_TOKEN;
/*
 * window.onbeforeunload = function() { ws.close(); };
 */
var vedioDeviceCount=0;
var videoFlag=true;
navigator.mediaDevices.enumerateDevices()
.then(function(devices) {
	// console.log(devices);
  devices.forEach(function(device) {
   
	  if(device.kind==="videoinput")
		  vedioDeviceCount=+1;
  });
  console.log(vedioDeviceCount);
  if(vedioDeviceCount==0){
	  videoFlag=false;
  }
})
.catch(function(err) {
  console.log(err.name + ": " + err.message);
});

function handler(message) {
	parsedMessage = JSON.parse(message.data);
	console.info('Received message: ' + message.data);

	switch (parsedMessage.id) {
	case 'existingParticipants':
		disable(true);
		document.getElementById('errorMsg').innerText='';
		onExistingParticipants(parsedMessage);
		break;
	case 'newParticipantArrived':
		onNewParticipant(parsedMessage);
		break;
	case 'participantLeft':
		onParticipantLeft(parsedMessage);
		break;
	case 'receiveVideoAnswer':
		receiveVideoResponse(parsedMessage);
		break;
	case 'iceCandidate':
		participants[parsedMessage.name].rtcPeer.addIceCandidate(parsedMessage.candidate, function (error) {
	        if (error) {
		      console.error("Error adding candidate: " + error);
		      return;
	        }
	    });
	    break;
	case 'chatStart':
		onTextMessageReceived(parsedMessage.sender,parsedMessage.body);
		break;
	case 'fileShared':
		onFileSharingMessageReceived(parsedMessage.sender,parsedMessage.fileName,parsedMessage.url);
		break;
	default:
		// document.getElementById('join').style.display = 'block';
		// document.getElementById('room').style.display = 'none';
		// document.getElementById('chatBtn').style.display='none';
		document.getElementById('errorMsg').innerText=parsedMessage.message;
	}
}

function register(name,room,mDiv) {
	
	ws= new WebSocket('wss://'+base_url+'/groupcall');
	ws.onmessage=handler;
	ws.onclose=function(event) {console.log("socket cloased "+event.code);};
	ws.onerror=function(error){console.log(error);};
	ws.onopen=function(){
	// alert("socket open");
	console.log(name+" "+room+" "+masterDiv);
	masterDiv=mDiv
	admin=name;
	var message = {
		id : 'joinRoom',
		name : name,
		room : room,
	}
	sendMessage(message);
	}
}

function onNewParticipant(request) {
	receiveVideo(request.name);
}

function receiveVideoResponse(result) {
	participants[result.name].rtcPeer.processAnswer (result.sdpAnswer, function (error) {
		if (error){
			return console.error (error);
		}
	});
}

function callResponse(message) {
	if (message.response != 'accepted') {
		console.info('Call not accepted by peer. Closing call');
		stop();
	} else {
		webRtcPeer.processAnswer(message.sdpAnswer, function (error) {
			if (error) return console.error (error);
		});
	}
}

function onExistingParticipants(msg) {
	var constraints = {
		audio : true,
		// video:false,
		video : {
			mandatory : {
				maxWidth : 320,
				maxFrameRate : 15,
				minFrameRate : 15
			}
		}
	};
	

	console.log(name + " registered in room " + room);
	var participant = new Participant(name,admin);
	participants[name] = participant;
	var video = participant.getVideoElement();

	console.log(videoFlag);
	promise=navigator.mediaDevices.getUserMedia({ audio: true, video: videoFlag })
	promise.then(function(stream) {
	var options = {
    	localVideo: video,// local video element
		// mediaConstraints: constraints,
		onicecandidate: participant.onIceCandidate.bind(participant),
		videoStream:stream
			      
	}
	appKey,appName,appSecret,password,username
	/* ############### Send User ################### */
			participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
				function (error) {
				  if(error) {
					  console.error(error);
				  }
				  this.generateOffer (participant.offerToReceiveVideo.bind(participant));
			});
	})

	

	 msg.data.forEach(receiveVideo);
}

function leaveRoom() {
	disable(false);
	document.getElementById('tooldiv').parentNode.removeChild(document.getElementById('tooldiv'));
	document.getElementById('overlay').parentNode.removeChild(document.getElementById('overlay'));
	document.getElementById('myForm').parentNode.removeChild(document.getElementById('myForm'));

	
	sendMessage({
		id : 'leaveRoom'
	});

	for ( var key in participants) {
		participants[key].dispose();
	}
	ws.close();
	console.log(document.getElementById(masterDiv).childNodes);
	
	/*
	 * document.getElementById(masterDiv).childNodes.forEach(function(child){
	 * document.getElementById(masterDiv).removeChild(child); });
	 */
}

function receiveVideo(sender) {
	console.log("<<<<< recieve video >>>>>");
	var participant = new Participant(sender,admin);
	participants[sender] = participant;
	var video = participant.getVideoElement();
	var constraints = {
			audio : true,
			video: {
			    width: { min: 1024, ideal: 1280, max: 1920 },
			    height: { min: 776, ideal: 720, max: 1080 }
			  },
	};
	var options = {
      // remoteVideo: video,
      mediaConstraints:constraints,
      onicecandidate: participant.onIceCandidate.bind(participant)


    }
    /* ###############Receive Video ##################### */
	participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
			function (error) {
			  if(error) {
				  return console.error(error);
			  }
			  this.generateOffer (participant.offerToReceiveVideo.bind(participant));
			  console.log("hahahaha");
			  
			  console.log(participant.rtcPeer.peerConnection.getReceivers()[0].track);
			  
			  console.log(participant.rtcPeer.peerConnection.getReceivers()[1].track);

			  const stream = new MediaStream()
			  stream.addTrack(participant.rtcPeer.peerConnection.getReceivers()[0].track);// add
																							// audio
			  
			  
			
			  participant.rtcPeer.peerConnection.getReceivers()[1].track.addEventListener("mute",
			  event => { console.log(" video muted"); }, false);
			 
			  participant.rtcPeer.peerConnection.getReceivers()[1].track.addEventListener("unmute", event => {
				  console.log(" video un muted");
				  stream.addTrack(participant.rtcPeer.peerConnection.getReceivers()[1].track);
				}, false);
			  
			  
			  video.srcObject=stream;
			  
			  video.addEventListener("error", function(e) {
			        //console.error("<video> error");
			        //console.error(e.target.error);
				//alert();
			        alert(e.target.error);
			        // e.target would be the <video> element
			        // e.target.error --
					// https://html.spec.whatwg.org/multipage/media.html#mediaerror
			    });
				
	});
	
	
}

function onParticipantLeft(request) {
	console.log('Participant ' + request.name + ' left');
	var participant = participants[request.name];
	participant.dispose();
	delete participants[request.name];
}

function sendMessage(message) {
	var jsonMessage = JSON.stringify(message);
	console.log('Senging message: ' + jsonMessage);

	ws.send(jsonMessage);

	/*
	 * if (ws.readyState === ws.OPEN) { // open ws.send(jsonMessage); } else{ //
	 * document.getElementById('show-msg-window').style.display='none';
	 * alert("Socket Closed."); }
	 */
	
}
/*
 * function onClose(evt) { document.getElementById('join').style.display =
 * 'block'; document.getElementById('room').style.display = 'none'; //
 * document.getElementById('show-msg-window').style.display='none';
 * document.getElementById('errorMsg').innerText="Web socket closed"; }
 */

function showHideMsgWindow(){
	if ($('#msg-area').css('display') == 'none') {
		document.getElementById('msg-area').style.display = 'block';
		$("#room").removeClass('col-sm-12').addClass('col-sm-8');
		$("#msg-area").addClass("col-sm-4");
	 } 
	else{
		$("#room").removeClass('col-sm-8').addClass('col-sm-12');
		$("#msg-area").addClass("col-sm-0");
		document.getElementById('msg-area').style.display = 'none';	
		
	}
}

function sendTextMsg()
{
	var msgBody=document.getElementById("msg-text-field").value;
	document.getElementById("msg-text-field").value="";// clear text
	// document.getElementById("msgBox").innerText=msgBody;
	var message = {
			id : 'chatStart',
			sender :name,
			body : msgBody,
			room : room,
	}
	sendMessage(message);
	return true;
}
var messageCount=0;
function onTextMessageReceived(sender,msgBody)
{	
	
	var mydiv = document.getElementById("msgBox");
	var div = document.createElement('div');
	var msgBodyContaier=document.createElement('div');
	msgBodyContaier.className='msgBodyContaier';
	
	var titleDiv=document.createElement('div');
	titleDiv.style.color="#da534f"
	var msgBodyDiv=document.createElement('div');
	
	msgBodyContaier.appendChild(titleDiv);
	msgBodyContaier.appendChild(msgBodyDiv);
	
	div.appendChild(msgBodyContaier);
	div.setAttribute("style","width:100%;text-align:right;font-size: 15px;color: grey;padding:5px;");
	if(sender===admin){
		msgBodyDiv.innerText = msgBody+"\n";
		msgBodyContaier.style.left="350px";
		mydiv.appendChild(div);
	}
	else{
		titleDiv.innerText=sender;
		msgBodyDiv.innerText = msgBody+"\n";
		mydiv.appendChild(div);
		msgBodyContaier.style.left="0px";
		messageCount+=1;
		document.getElementById('msgCount').style.display='block';
		document.getElementById('msgCount').innerText=messageCount;
		
		
	}
	
	
	
	// document.getElementById("msgBox").innerText+=sender+" - "+msgBody+"\n";
}

function onFileSharingMessageReceived(sender,filename,url)
{
	var mydiv = document.getElementById("msgBox");
	var aTag = document.createElement('div');
	var link = document.createElement('a');
	
	
	icon=getIcon(filename);
	icon.setAttribute('style','font-size:70px;');
	
	if(sender===admin){
		link.setAttribute('href',url);
		aTag.setAttribute("style","width:100%;text-align:right;font-size: 15px;color: grey;padding:5px;");
		// link.innerHTML = filename;
		
		link.appendChild(icon);
		aTag.appendChild(link);
		mydiv.appendChild(aTag);
	}
	else{
		link.setAttribute('href',url);
		aTag.setAttribute("style","width:100%;text-align:left;font-size: 15px;color: grey;padding:5px;");
		// link.innerHTML = sender+" - "+filename;
		link.appendChild(icon);
		aTag.appendChild(link);
		mydiv.appendChild(aTag);

		messageCount+=1;
		document.getElementById('msgCount').style.display='block';
		document.getElementById('msgCount').innerText=messageCount;
		
	}
	
}

/** *** File upload method *** * */



var singleUploadForm = document.querySelector('#singleUploadForm');
function uploadSingleFile(file) {
	// validateToken();
	// alert("2 "+localStorage.getItem("JWT_Token"));
    var formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("room", room);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://192.168.1.128:8443/api/uploadFile");
    // xhr.setRequestHeader('token',"Bearer
	// "+localStorage.getItem("JWT_Token"));
    xhr.setRequestHeader('token',"Bearer "+jwt_token);
    xhr.onload = function() {
        /*
		 * console.log(xhr.responseText); var response =
		 * JSON.parse(xhr.responseText); alert(response);
		 */
    	console.log("file upload")
    	
        if(xhr.status == 200) {
        	console.log("status 200");
            
        } else {
            console.log("file upload error");
        }
    }

    xhr.send(formData);
}
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    uploadSingleFile(files[0]);
	
}

function changeAudioConfigration(event){
	var target=event.target;
	var name=target.id.substring(4);
	changeAudioConfigrationById(name);
	console.log(target);
}

function changeAudioConfigrationById(name)
{
	target=document.getElementById("mic-"+name);
	console.log(target);
	if(name===admin){
		if (target.childNodes[0].className === icons.micOff) {
		    target.childNodes[0].className = icons.micOn;
		    // participants[name].rtcPeer.peerConnection.getLocalStreams()[0].getVideoTracks()[0].enabled
			// = true;
		    participants[name].rtcPeer.audioEnabled = true;

		} 
		else {
		    target.childNodes[0].className = icons.micOff;
		    // participants[name].rtcPeer.peerConnection.getLocalStreams()[0].getVideoTracks()[0].enabled
			// = false;
		    participants[name].rtcPeer.audioEnabled = false;

		}}else{
			if (target.className === icons.volumeOff) {
			    target.className = icons.volumeOn;
			    document.getElementById("video-"+name).muted=false;
			    // document.getElementById("video-"+name).play();
			} 
			else {
			    target.className = icons.volumeOff;
			    document.getElementById("video-"+name).muted=true;
			    // document.getElementById("video-"+name).pause();
			    
			}
	}
}
function changeVideoConfigration(event){
	var target=event.target;
	console.log(target);
	var name=target.id.substring(4);
	changeVideoConfigrationById(name)
}

function changeVideoConfigrationById(name)
{
	target=document.getElementById("vid-"+name);
	console.log(target);
	if(name===admin){
		if (target.childNodes[0].className === icons.screenSharingOff) {
		    target.childNodes[0].className = icons.screenSharingOn;
		    // participants[name].rtcPeer.peerConnection.getLocalStreams()[0].getVideoTracks()[0].enabled
			// = true;
		    
		    participants[name].rtcPeer.peerConnection.getLocalStreams().forEach(function(device){
		    	device.getVideoTracks()[0].enabled = true;
		    });
		    
		} 
		else {
		    target.childNodes[0].className = icons.screenSharingOff;
		    // participants[name].rtcPeer.peerConnection.getLocalStreams()[0].getVideoTracks()[0].enabled
			// = false;

		    participants[name].rtcPeer.peerConnection.getLocalStreams().forEach(function(device){
		    	device.getVideoTracks()[0].enabled = false;
		    });
		    
		}}else{
			if (target.className === icons.screenSharingOff) {
			    target.className = icons.screenSharingOn;
			
			    console.log(document.getElementById("video-"+name).srcObject.getVideoTracks()[0].enabled);
			    document.getElementById("video-"+name).srcObject.getVideoTracks()[0].enabled=true;
			} 
			else {
				console.log(name);
			    target.className = icons.screenSharingOff;
			    
			    console.log(document.getElementById("video-"+name).srcObject.getVideoTracks()[0].enabled);
			    document.getElementById("video-"+name).srcObject.getVideoTracks()[0].enabled=false;
			}
	}	
}

/*------------------------------------------------------*/


/* video recorder start */
var recordingStatus=false;// true for recording and false for not recording
function onRecordStartStop(){
	if(recordingStatus==false){
    	captureScreen(function(screen) {
    		console.log(screen);
    		recorder =new MediaRecorder(screen);
    		recorder.ondataavailable = handleDataAvailable;
    		recorder.start();
    		recordingStatus=true;
	});
    	
	}else{
		// recorder.requestData();
		recorder.stream.getTracks()[1].stop();
		// recorder.stream.stop();
		recorder.stop();
		recordingStatus=true;
	}
}
function handleDataAvailable(event) {
	  console.log("handelData");
	  console.log(event)
	  download(event.data);
	  
	}
function download(blob) {
	  var url = URL.createObjectURL(blob);
	  var a = document.createElement('a');
	  document.body.appendChild(a);
	  a.style = 'display: none';
	  a.href = url;
	  a.download = 'savedVideo.webm';
	  a.click();
	  window.URL.revokeObjectURL(url);
}
/* Video recorder end */

function invokeGetDisplayMedia(success, error) {
    var displaymediastreamconstraints = {
        video: {
            displaySurface: 'window', // monitor, window, application, browser
            logicalSurface: true,
            cursor: 'always' // never, always, motion
           
        }
    };
    displaymediastreamconstraints = {
    	video: true
    	};
    if(navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
    else {
        navigator.getDisplayMedia(displaymediastreamconstraints).then(success).catch(error);
    }
}
function captureScreen(callback) {
    invokeGetDisplayMedia(function(screen) {
    	/* Add audio Stream into the Stream from the source */
    	navigator.mediaDevices.getUserMedia({audio: true}).then(function(mic) {
            screen.addTrack(mic.getTracks()[0]);
            callback(screen);
            
            }).catch(function(error) {
            alert('Unable to access your microphone.');
            console.log(error);
        });
    	
    	
        
    }, function(error) {
        console.log(error);
        alert('Unable to capture your screen. Please check console logs.\n' + error);
    });
}

/** *** SCREEN SHARING ****** */
var screenShareStatus=false;// false for active screen sharing and true for
							// active webCam stream sharing
function onScreenShareConfig(event)// executed on click of a button start/stop
									// screen sharing
									 
{
	var target=event.target;
	var name=target.id.substring(7);
	var sender=participants[name].rtcPeer.peerConnection.getSenders()[1];
	console.log("sender")
	console.log(participants[name].rtcPeer.peerConnection.getSenders());
	console.log(sender);
	console.log(participants[name].rtcPeer.peerConnection.getSenders()[0]);

	if(screenShareStatus===false){
		var displaymediastreamconstraints = { video: 
	 	{

			displaySurface: 'browser', // monitor, window, application, browser
		 logicalSurface: true, cursor: 'never' // never, always, motion
	 	} }; 
		displaymediastreamconstraints = { video: true }; 
		var promise=navigator.mediaDevices.getDisplayMedia(displaymediastreamconstraints);
	 
		promise.then(function(stream) {
			try{
				sender.replaceTrack(stream.getVideoTracks()[0]);// replace//
																// weccam
																// stream// with
																// screen
				
				participants[name].rtcPeer.peerConnection.addStream(stream);//
				// participants[name].rtcPeer.peerConnection.removeStream(participants[name].rtcPeer.peerConnection.getLocalStreams()[0]);
				
				
			}
			catch(error){
				console.log(error);
			}
			participants[name].getVideoElement().srcObject=stream;
			screenShareStatus=true;
		},function(){});
		
	}
	else{
		sender.replaceTrack(participants[name].rtcPeer.peerConnection.getLocalStreams()[0].getVideoTracks()[0]); // replace
		participants[name].getVideoElement().srcObject=participants[name].rtcPeer.peerConnection.getLocalStreams()[0];// change
		
		
		
		participants[name].rtcPeer.peerConnection.getLocalStreams()[1].getTracks()[0].stop();// stop
		participants[name].rtcPeer.peerConnection.removeStream(participants[name].rtcPeer.peerConnection.getLocalStreams()[1]); // r
		screenShareStatus=false;
	}
}
/** **** Screen Sharing ends **** */

function openForm() {
	document.getElementById("myForm").style.display = "block";
	console.log("open form")
}

function closeForm() {
	console.log(document.getElementById("myForm"));
	document.getElementById("myForm").style.display = "none";
	console.log("close form ");
	document.getElementById('msgCount').style.display='none';
	messageCount=0;
}
visible=false;
function toggleMsgBox(){
	if(!visible){
		openForm();
		visible=true;
	}else{
		closeForm();
		visible=false;
		
		}
}



function on(event) {
	  console.log(event);

	  document.getElementById("overlay").style.display = "block";
	  var target=event.target;
	  var name=target.id.substring(4);
	  console.log(name);
	  stream=document.getElementById("video-"+name).srcObject;
	  video=document.createElement('video');
	  video.autoplay = true;
	  video.controls = false;
	  video.setAttribute("style","left:50%;right:50%;top:50% ;width:100%;");

	  video.srcObject=stream;
	  document.getElementById("overlay").appendChild(video);
	}

function off() {
		list=document.getElementById("overlay").childNodes;
		console.log(list);
		document.getElementById("overlay").removeChild(list[0]);
		document.getElementById("overlay").style.display = "none";
	  
	}
function disable(flag){
	document.getElementById('roomID').disabled=flag;
	document.getElementById('name').disabled=flag;
	document.getElementById('submit').disabled=flag;
	
}
function getIcon(fileName){
	icon=document.createElement('i');
	type=fileName.substring(fileName.lastIndexOf('.')+1);
	console.log(type);
	switch (type) {
	case 'txt':
		icon.className=icons.file_txt;
		break;
	case 'png': case 'jpg': case 'jpeg':
		icon.className=icons.file_img;
		break;
		
	case 'zip': case 'tz':
		icon.className=icons.file_zip;
		break;
	case 'pdf':
		icon.className=icons.file_pdf;
		break;
	case 'mp3':
		icon.className=icons.file_audio;
		break;
	case 'mp4': case 'webm':
		icon.className=icons.file_video;
	    break;
	default:
		icon.className=icons.file_default
	}
	
	return icon;
}


