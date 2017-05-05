let sessionID = null;
var roomID = null;

let userName = Cookies.get("userName") || "";

  $(function () {
    let socket = io();

    //Join the room
    socket.on("connect", function() {
      socket.emit("roomID", roomID);
    });

    //Get sessionID
    socket.on("sessionID", function (session) {
      if (session.id) {
        sessionID = session.id;
        Cookies.set("sessionID", sessionID);
        socket.emit("updateOnline", {
          name: userName, 
          socketID: sessionID
        });
      }else{
        console.log("Error: Could not retrive ID");
      }
    });

    var pageURL = window.location.href;
    var rooms = "rooms/";
    var indexOfID = pageURL.indexOf(rooms) + rooms.length;
    roomID = pageURL.slice(indexOfID, pageURL.length );
    $("#roomID").text(roomID);
    document.title = "Greyscale chat - " + roomID;
    $("#chatID").attr("id",roomID);


    $("body").on("submit", "form", function(event){
      event.preventDefault();

      let messageToSend = $(".m",this).val();
      //Don't allow empty messages.
      if (!messageToSend) {return};
      messageToSend = userName + ": " + messageToSend;

      let thisChat = "#" + roomID;
      
      socket.emit("MSG", roomID, messageToSend, {
        name: userName,
        id: sessionID
      });

      //Append sent message to chatWindow
      $(thisChat).find(".messages").append($('<p class="sentMessage">').text(messageToSend));

      //Scroll to bottom
      let chatWindow = $(thisChat).find(".messages");
      chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
      //Clear input bar
      messageToSend = "";
      $(".m",this).val(messageToSend);
      return false;
    });

    //Receive MSG
    socket.on("RMSG", function(msg, sender){
      let targetChatWindow = $("#" + roomID).find(".messages");
      $(targetChatWindow).append($('<p class="receivedMessage">').text(msg));
      //Scroll to bottom
      targetChatWindow.scrollTop(targetChatWindow.prop("scrollHeight")); 
    });

  });