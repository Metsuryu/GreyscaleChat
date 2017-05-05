const mongoose = require("mongoose");

const roomsSchema = mongoose.Schema({
	roomID: String
});

module.exports = mongoose.model("Room", roomsSchema);