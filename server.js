// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
// Models for articles and notes
const Article = require("./models/Article.js");
const Note = require("./models/Note.js");
// Scraping tools
const request = require('request');
const cheerio = require('cheerio');

// Initialize Express
const app = express();

// Make public static directory
app.use(express.static("public"));

// Use body parser with app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Set mongoose to use es6 promises
mongoose.Promise = Promise;
// Configure mongoose database
mongoose.connect("mongodb://localhost/scrapegoatdb");
const db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged into mongoose db, log success
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// =====================
// Serve index.handlebars to the root route
app.get("/", function(req, res) {
  Article
    .find({})
    .sort('-_id')
    .then(function(dbArticle) {
      res.render("index", { articles: dbArticle });
    })
    .catch(function(err) {
      res.json(err);
    });
});

// GET - scrape cracked.com articles
app.get("/scrape", function(req, res) {
  request("http://www.cracked.com/funny-articles.html", function(err, res, body) {
    const $ = cheerio.load(body);
    $("div.content-card-content").each(function(i, element) {
      // Save an empty result object
      const result = {};

      result.title = $(this)
        .children("h3")
        .children("a")
        .text();
      result.link = $(this)
        .children("h3")
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children("p")
        .children("a")
        .text();

      const entry = new Article(result);

    // Save unique entries to database (model filters)
      // TODO: Handle cases of duplicate entries
      // TODO: refresh page so it updates live
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        } else {
          console.log(doc);
        }
      });
    });
  });
  res.render("Scrape Complete.");
});

// Route to view all saved articles
app.get("/saved", function(req, res) {
  Article
    .find({
      'saved': true
    })
    .sort('-savedAt')
    .then(function(dbArticle) {
      res.render("saved", { articles: dbArticle });
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for updating an article to saved
// BROKEN
app.put("/save/:id", function(req, res) {
  console.log(req.params.id);
  Article.findOneAndUpdate({ _id: req.params.id}, {$set: { saved: true }},
    // .update({
    //   _id: ObjectId("${req.params.id}")
    // }, {$set: {
    //   'saved': true
    // }}
    function (err, raw) {
      if (err) {"Error:",console.log(err)}
      console.log('The raw response from Mongo was ', raw);
      res.send("successful");
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/article/:id", function(req, res) {

});

// Route for saving/updating an Article's associated Note

// Start server; Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});