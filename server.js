var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio") //jquery for backend
var bodyParser = require("body-parser")
var axios = require("axios");
var expressHandlebars = require("express-handlebars")

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();
// Set up Express Router
var router = express.Router();
//require routes file pass router object
require("./config/routes")(router);
// Make public a static folder
app.use(express.static(__dirname + "/public"));
app.use(router);
app.use(bodyParser.urlencoded({ extended: false }));
app.engine("handlebars", expressHandlebars({defaultLayout: "main"}));
app.set("view engine", "handlebars");
var db = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(db, function(error) {
  if (error) {
    console.log(error);
  } else {
    console.log("mongoose is loose")
  }
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});