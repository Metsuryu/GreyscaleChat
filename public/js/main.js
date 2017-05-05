$(document).ready(function(){

	$( "button" ).click(function(event) {
		event.preventDefault();
		//Make sure the value is not empty.
		var usernameValue = $("input").val();
		if (usernameValue === "") {return};

		$.get( "/users", function( data ) {
			if (data) {
				for (var i = data.length - 1; i >= 0; i--) {
					if (data[i].name === usernameValue) {
						$("#message").html("Error: "+ usernameValue +" is already taken. <br>Please use another username.");
						return;
					};
				};
				//If the usernameValue doesn't exist yet, it is allowed. 
				//Enter the chatRoom page, and add it to the db.
				$("#message").html("Entering as "+ usernameValue +"...");
				//Enter chat page
				//Set username in cookie so it's accessible to every page of the website
				Cookies.set("userName", usernameValue);
				window.location.replace("/");			
			}else{
				$("#message").html("Error: Couldn't retrive data from database.");
			}
		});
	});
});
