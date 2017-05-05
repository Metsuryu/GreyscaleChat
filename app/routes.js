const Room = require("./models/rooms");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });


function isRoomIDInArray(inputArray, roomID) {
  for (var i = inputArray.length - 1; i >= 0; i--) {
    if (inputArray[i] === roomID) {
      return true;
    }
  }
  return false;
}

module.exports = function(app, User){

	app.get("/login", function(req, res){
		res.render("index.ejs");
	});

	app.get("/", urlencodedParser, function(req, res){
		var cookies = req.cookies;
		var cookiesUserName = cookies.userName;
		if (! cookiesUserName) {
			res.redirect("/login");
		}else{
			res.render("home.ejs");
		};
	});

	app.put("/addUser", urlencodedParser, function(req, res){

		const newUserName = req.body.userName;

		console.log(newUserName);

		User.findOne({"userName": newUserName}, function(err, user){
			if(err){
				console.log(err);
				 res.sendStatus(500);
				 return;
			}
			if(user){
				//User must be unique
				res.sendStatus(403);
				return;
			} else {
				//Add new user
				let newUser = new User();
				newUser.userName = newUserName;

				newUser.save(function(err){
					if(err){
						throw err;
					}
					console.log(newUser);
					res.sendStatus(200);
					return;
				});
				//Login to home
			}
		});
	});

	app.put("/addRoom", urlencodedParser, function(req, res){
		const newRoomName = req.body.roomName;

		console.log(newRoomName);

		Room.findOne({"roomID": newRoomName}, function(err, room){
			if(err){
				console.log(err);
				res.sendStatus(500);
				return;
			}
			if(room){
				//Rooms should be unique
				res.sendStatus(403);
				return;
			} else {
				//Add new room
				let newRoom = new Room();
				newRoom.roomID = newRoomName;

				newRoom.save(function(err){
					if(err){
						throw err;
					}
					console.log(newRoom);
					res.sendStatus(200);
					return;
				});
			}
		});
	});

	app.put("/deleteRoom", urlencodedParser, function(req, res){
		const roomNameToRemove = req.body.roomName;

		Room.findOne({"roomID": roomNameToRemove}, function(err, room){
			if(err){
				console.log(err);
				res.sendStatus(500);
				return;
			}
			if(room){
				//Delete here
				Room.remove({"roomID": roomNameToRemove}, function(err, results){
					if (err) {
						console.log(err);
						res.sendStatus(500);
						return;
					};
				res.sendStatus(200);
				return;
			});

			} else {
				res.sendStatus(404);
				return;
			}
		});
	});

	//Returns the list of rooms
	app.get("/roomslist",function(req, res){
		let roomsArray = [];

    	Room.find(function(err, rooms) {
    		if(err) return console.error(err);
    		//JSON
    		rooms.forEach(function (room, i) {
    			roomsArray.push({
    				name: room.roomID
    				});
    			});
    		res.json( roomsArray );
    		});
    	});


	//Returns the list of online users
	app.get("/users",function(req, res){
		let usersArray = [];

    	User.find(function(err, users) {
    		if(err) return console.error(err);
    		//JSON
    		users.forEach(function (user, i) {
    			usersArray.push({
    				name: user.userName,
    				sessionID: user.userID
    				});
    			});
    		res.json( usersArray );
    		});
    	});


	app.get("/rooms/:id", urlencodedParser, function(req, res) {
		var targetRoomID = req.params.id;
		const cookies = req.cookies;
		if (!cookies) {
			res.redirect("/login");
			return;
		};
		const prevJoined = cookies.previouslyJoinedRooms;
		if (! prevJoined) {
			res.redirect("/login");
			return;
		};
		var storedAry = JSON.parse( prevJoined );
		if (! isRoomIDInArray(storedAry, targetRoomID) ) {
			res.redirect("/login");
			return;
		}else{
			res.render("chatroom");
		}		
	});

	app.get("/logout", function(req, res){
		res.redirect("/login");
	})

	app.get("*", function(req, res){
		//res.send(404);
		res.sendStatus(404);
	})

};