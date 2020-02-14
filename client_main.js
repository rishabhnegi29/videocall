/**
 * 
 */



localStorage.clear();
var obj;


$('#loginForm').on('submit', function(e) {
	e.preventDefault();
	console.log("clicked");
	var resp;
	obj = new SDK("localhost:8443");
	inputData = {
		"appKey" : "demdoomoemomdeod",
		"endTime" : "12-05-2019",
		"meetingId" : "12144323",
		"meetingUsers" : [ {
			"username" : "m1"
		}, {
			"username" : "m2"
		}, {
			"username" : "m3"
		}

		],
		"startTime" : "12-04-2019",
		"username" : "Rishabh Negi"
	}

	// obj.saveMeeting(inputData);//function to save meeting
	name = document.getElementById('name').value;
	room = document.getElementById('roomID').value;
	obj.joinMeeting(name, room, 'participants');
	
});

