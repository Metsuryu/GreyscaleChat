const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	userName: String,
	userID: String
});

module.exports = mongoose.model("User", userSchema);