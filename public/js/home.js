function joinRoom(roomID){
	/*Set cookie, so you are allowed to join the room.
	  If the cookie is not set (like when someone who 
	  didn't join the room from here tries to enter the room by URL)
	  the room will redirect them to the login page.
	*/
	var alreadyInRoom = Cookies.get(roomID);
	if ( alreadyInRoom === roomID ) {
		$("#message").html("You are already in that room.");
		return;
	};
	$("#message").html("Joining: "+ roomID);
	
	var preJoined = [];
	preJoined = Cookies.get("previouslyJoinedRooms") || [];
	//preJoined is a string
	var storedAry = []
	if (!preJoined) {
		storedAry = JSON.parse( preJoined );
	};
	
	//storedAry is an Array
	storedAry.push( roomID );
	Cookies.set("previouslyJoinedRooms", storedAry);
	//window.location.replace("/rooms/" + roomID); //Opens on same window
	window.open("/rooms/" + roomID);
}

function getRoomsList(){
	var roomsArray = [];
	$.get( "/roomslist", function( data ) {
		if (!data) {return};

		for (var i = data.length - 1; i >= 0; i--) {
			roomsArray.push(data[i].name);
		};

		$("#chatRoomsUL").html("");

		for (var i = roomsArray.length - 1; i >= 0; i--) {
			var roomName =roomsArray[i];
			var newRoom = '<li class="chatRoom" id="'+roomName+'">'+roomName+'</li>'
			$("#chatRoomsUL").append(newRoom);
		};
	});
}


function createRoom (roomName){
	$.ajax({
		type: "PUT",
		url: "/addRoom",
		data: {
			"roomName": roomName
		},
		success: function success(response) {
			//Set the cookie, so you are able to delete the room in the future
			Cookies.set(roomName+"CREATOR", roomName,{expires: 7}); //Lasts a week
			var newRoom = '<li class="chatRoom" id="'+roomName+'">'+roomName+'</li>'
			$("#chatRoomsUL").append(newRoom);
			$("#message").html( roomName + " created.");
		},
		error: function error(err) {
			console.log("Error: ", err);
			if (err.status === 403) {
				$("#message").html("Error: "+roomName+" already exists.");
			}else{
				$("#message").html("Error: Couldn't save room to database.");
			}			
		},
		complete: function complete(data) {}
	});
}

function sanitizeString(str){
  str = str.replace(/([/\\<>"' ])+/g,"");
  return str.trim();
};


$(document).ready(function(){
	var userName = Cookies.get("userName") || "";
	if (userName === "") {
		window.location.replace("/login");
	};
	$("#username").text(userName);

	getRoomsList();
	var roomsRefreshLoop = setInterval(getRoomsList, 5000); //Every 5 Seconds


	$("body").on("click", ".chatRoom", function(event){
		var chatRoomID = $(event.target).attr("id");
		joinRoom(chatRoomID);
	});

	$( "#createBTN" ).click(function(event) {
		event.preventDefault();
		var newRoomName = sanitizeString( $("#newRoomNameINP").val() );

		createRoom(newRoomName);
		$("#newRoomNameINP").val("");
	});
});