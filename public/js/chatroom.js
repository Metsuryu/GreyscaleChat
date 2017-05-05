function enableDelBTN(){
    var ownerStr = roomID+"CREATOR";
    var roomOwner = Cookies.get(ownerStr);
    if (roomOwner) {
        var delButton = '<button id="deleteBTN">Delete Room</button>'
        $("#deleteRoomDiv").append(delButton);
    };
}

function deleteRoom (roomName){
    $.ajax({
        type: "PUT",
        url: "/deleteRoom",
        data: {
            "roomName": roomName
        },
        success: function success(response) {
            Cookies.remove(roomName+"CREATOR");//Delete creator cookie
            window.location.replace("/");
        },
        error: function error(err) {
            console.log("Error: ", err);        
        },
        complete: function complete(data) {}
    });
}
$(document).ready(function(){
	var userName = Cookies.get("userName") || "";
	if (userName === "") {
		window.location.replace("/login");
	};
	$("#username").text(userName);

    function checkRoomID(){
        if (!roomID) {
             setTimeout(checkRoomID, 2000);
        }else{
            $("#chatRoomName").html(roomID);
            enableDelBTN();
        }
    }
    checkRoomID();

    /*
    Continuously refresh cookie duration while in room, 
    so it expires after 4 seconds when exiting room.
    */
    function refreshCookie(){
        var inFourSeconds = new Date(new Date().getTime() + 4 * 1000);
        Cookies.set(roomID, roomID, {
        expires: inFourSeconds
        });
    }
    refreshCookie();
    var cookieRefreshLoop = setInterval(refreshCookie, 3000); //Every 3 Seconds

    //Deletes the room without warnings
    $("body").on("click", "#deleteBTN", function(event){
        deleteRoom (roomID);
    });

});