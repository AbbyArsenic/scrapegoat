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
// Set mongoose to use es6 promises
mongoose.Promise = Promise;

// Initialize Express
const app = express();

// Use body parser with app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public static directory
app.use(express.static("public"));

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

// GET - scrape BBC tech news
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

    // Filter out duplicates before saving
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        } else {
          console.log(doc);
        }
      });
    });
  });
  res.send("Scrape Complete.");
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  Article
    .find({})
    .sort('-_id')
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});