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


	//console.log(request);
	console.log(request.body);

	db.collection('events_list', function(err, collection) {	
		collection.insert( {"Date":request.body.date, "Time":request.body.time, 
				"Food":request.body.food, "Sponsor":request.body.sponsor,
				"Location":request.body.location, "Other":request.body.other} );
	});


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
		
		//collection.find({"Food": request.query.Food}).toArray(function(err, cursor) {
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


// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3000);
















