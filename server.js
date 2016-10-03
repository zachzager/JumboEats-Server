// server.js

// Express initialization
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all('/*', function(request, response, next) {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

// Mongo initialization, setting up a connection to a MongoDB  (on Heroku or localhost)
//var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/FOOD_EVENTS_V1';
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://heroku_h5ng6mhk:8lbubrnjqrhck82sle6t0j1856@ds049446.mlab.com:49446/heroku_h5ng6mhk';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
	var db = MongoClient.connect(mongoUri, function (error, databaseConnection) {
	db = databaseConnection;
});

// get user data from app
app.post('/post', function (request, response) {

	// VALIDATE INPUT

	// get date of input
	req_date = new Date(request.body.date);
	req_date = req_date.setDate(req_date.getDate()+1);

	date = new Date();

	// checks for proper parameters, if true insert input to database
	// Checks that:
	// - fields are strings
	// - fields (except "sponsor" and "other") are not blank strings
	// - day of event has not already passed
	if ( (typeof request.body.date === "string" && typeof request.body.time === "string" 
				&& typeof request.body.food === "string" && typeof request.body.sponsor === "string"
				&& typeof request.body.location === "string" && typeof request.body.other === "string")
		&& (request.body.date.length > 0 && request.body.time.length > 0 
				&& request.body.food.length > 0 && request.body.location.length > 0)
		&& (req_date.getMonth() > date.getMonth() || 
				(req_date.getMonth() === date.getMonth() && req_date.getDate() >= date.getDate())) ) {
		
		db.collection('events_list', function(err, collection) {	
			collection.insert( {"Date":request.body.date, "Time":request.body.time, 
					"Food":request.body.food, "Sponsor":request.body.sponsor,
					"Location":request.body.location, "Other":request.body.other} );
		});		
	}

	else { // returns error statement if improper

		response.send({"error":"Whoops, something is wrong with your data!"});
	}

	response.send();

});

// get facebook data
// (include parsing)

// REACH: get email data
// (include parsing)

// get all data
app.get('/', function (request, response) {
	response.set('Content-Type', 'text/html');

	db.collection('events_list', function(err, collection) {
		
		collection.find().toArray(function(err, cursor) {
			if (!err) {
				console.log(cursor);
				response.send(cursor);
			} else {
				console.log('bad');
				response.send([]);
			}
		});
		
	});

});

app.listen(process.env.PORT || 3000);
















