var express = require("express");

var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio") //jquery for backend
var bodyParser = require("body-parser");
var moment = require("moment");
var PORT = process.env.PORT || 3000;
var request = require("request");
// Initialize Express
var app = express();
app.use(logger("dev"));

// Make public a static folder
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
var db = require("./models");


// Routes
app.get("/", function(req, res) {
  res.send(index.html)
});

//Scrape route
app.get("/scrape", function(req, res) {

  request("https://news.ycombinator.com", function(error, response, html) {
  
  var $ = cheerio.load(html);
  
  
  $(".title").each(function(i, element){
    var title = $(element).children("a").text().trim();
    var link = $(element).children("a").attr("href")
    var articleCreated = moment().format("YYY MM DD hh:mm:ss");

var result = {
  title: title,
  link: link,
  articleCreated: articleCreated,
  isSaved: false
}

  console.log(result);
  db.Article.findOne({title:title}).then(function(data) {
        
    console.log(data);

    if(data === null) {

      db.Article.create(result).then(function(dbArticle) {
        res.json(dbArticle);
      });
    }
  }).catch(function(err) {
      res.json(err);
  });

});

});
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  
  db.Article
    .find({})
    .sort({articleCreated:-1})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for getting an Article by id
app.get("/articles/:id", function(req, res) {

  db.Article
    .findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's Note
app.post("/articles/:id", function(req, res) {

  db.Note
    .create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating article to be saved
app.put("/saved/:id", function(req, res) {

  db.Article
    .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: true }})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for getting saved article
app.get("/saved", function(req, res) {

  db.Article
    .find({ isSaved: true })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for deleting/updating saved article
app.put("/delete/:id", function(req, res) {

  db.Article
    .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: false }})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});