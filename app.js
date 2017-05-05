const express = require("express");
const port = process.env.PORT || 3000;
const app     = express();
const server  = require("http").createServer(app);
const io      = require("socket.io").listen(server);
const cookieParser = require("cookie-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
//Random secret generated at server startup
const randSecret = require("crypto").randomBytes(8).toString("hex");
const path = require("path");
const configDB = require("./config/database.js");
//To fix the deprecated promise issue use native promises here, like so:
//global.Promise is only supported in ES6
mongoose.Promise = global.Promise; 
mongoose.connect(configDB.url);
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: randSecret,
				 saveUninitialized: true,
				 resave: true}));

app.use(express.static(path.join(__dirname, "/public")));
app.set("views", __dirname + "/public/views");
app.set("view engine", "ejs");

const User = require("./app/models/user");

require("./app/routes.js")(app, User);


function addOnlineUser (userData) {
	if (!userData) {
		console.log("Error: Can't get userData");
		return;
	};
	User.findOne({"userID": userData.socketID}, function(err, user){
		if(err)
			return err;
		if(user)
			return;
		else {
			let newUser = new User();
			newUser.userID = userData.socketID;
			newUser.userName = userData.name;

			newUser.save(function(err){
				if(err) { console.log(err); }
				return;
			})
		}
		//console.log("User added.");
	});
}

function removeOnlineUser (socket) {
	const idToRemove = socket.id;
	//Add users to online by userID, and remove them by userName (unique), to avoid duplicates
	User.findOne({"userID": idToRemove}, function(err, user){
		if(err)
			return err;
		if(user){
			/*Remove user from online by userName, to remove all
			potential duplicates with same userName but different sessionID
			that can remain when the server is restarted*/
			User.remove({"userName": user.userName}, function(err, results){
				if (err) {
					console.log(err); 
					return;
				};
				//console.log("User removed.");
				return;
			});
		} else {
			return;
		}
	});
}

//Whenever someone connects this gets executed
io.on("connection", function(socket){

	socket.on("roomID", function(roomID){
		socket.join(roomID);
	});
	//console.log("A user connected");
	//Gives the connected user their sessionID
	socket.emit("sessionID", { id: socket.id });

  	socket.on("updateOnline", function (userData) {
  		//Adds user to "online" users
  		addOnlineUser (userData);
  		});

  	socket.on("disconnect", function () {
  		//Removes user from "online" users
  		//console.log("A user disconnected");
  		removeOnlineUser(socket);
  		});

  	socket.on("MSG", function(id, msg, sender){
  		// Sends a message to the room with the given id
  		socket.to(id).emit("RMSG", msg, sender);
    	});
  	});

//Do not use app.listen(port);
server.listen(port);

console.log("Server running on port: " + port);