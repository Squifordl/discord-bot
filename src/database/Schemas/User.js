const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    idU: String
});

const User = mongoose.model("User", userSchema);
module.exports = User;