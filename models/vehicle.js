var mongoose = require("mongoose");

// SCHEMA SETUP

var vehicleSchema = new mongoose.Schema({
   make: String,
   model: String,
   transmission: String,
   fuel_Type: String,
   price: String,
   image: String,
   description: String,
   author: {
      id: {type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: String
   },
   comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
   }]
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
