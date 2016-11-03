// server.js

// Express initialization
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();
var helmet = require ('helmet'); // Helmet intialization
var cron = require('node-cron'); // Cron initialization
var FB = require('fb'); // Facebook intialization
var RateLimit = require('express-rate-limit'); // express-rate-limit initialization
 
// limits the rate pathway calls can be made at
var limiter = new RateLimit({
  windowMs: 5*60*1000, // 5 minutes 
  max: 100, // limit each IP to 100 requests per windowMs 
  delayMs: 0 // disable delaying - full speed until the max limit is reached 
});
app.use(limiter); //  apply to all requests 

app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet()); // Helmet module security

// Allow Cross Origin 
app.all('/*', function(request, response, next) {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

// Mongo initialization, setting up a connection to a MongoDB  (on Heroku or localhost)
// var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/FOOD_EVENTS_V1';
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://heroku_h5ng6mhk:8lbubrnjqrhck82sle6t0j1856@ds049446.mlab.com:49446/heroku_h5ng6mhk';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
	var db = MongoClient.connect(mongoUri, function (error, databaseConnection) {
	db = databaseConnection;
});

// FACEBOOK
// token generated with app_id and app_secret
// Received 10/12/2016
// If it is a 60 day code: Expires 12/11/2016
// If it is an unlimited code: Expires never
var longer_token = "EAAKHbAiApcsBAGfADZBn162cENZBiHBTqaPzHZAw3tgvIawslNV3ZAcZCvY1DjdZBR7iixhNxZBZAMTgZB4hBQTvgprZAQ8sjGaZAabCZAs6Xl4JgjTZC5TS8gAZAotzZBBPgrl8il4ZBEoO3yMnHjxu1XpmYm77";
var FB_group_id = "884846861623513"; // Finding Free Food at Tufts (Group)
var FB_page_id = "TuftsFreeFood"; // Free Food around Tufts (Page)
//

// get user data from app
app.post('/post', function (request, response) {

	// TODO: CHECK DATE

	// checks for proper parameters, if true insert input to database
	// Checks that:
	// - fields are strings
	// - fields (except "sponsor" and "other") are not blank strings
	// - [UNDER CONSTRUCTION] day of event has not already passed
	if ( (typeof request.body.date === "string" && typeof request.body.time === "string" 
				&& typeof request.body.food === "string" && typeof request.body.sponsor === "string"
				&& typeof request.body.location === "string" && typeof request.body.other === "string")
		&& (request.body.date.length > 0 && request.body.time.length > 0 
				&& request.body.food.length > 0 && request.body.location.length > 0) ) {
		// && (req_date.getMonth() > date.getMonth() || 
		// 		(req_date.getMonth() === date.getMonth() && req_date.getDate() >= date.getDate())) ) {
		
		db.collection('events_list', function(err, collection) {	
			collection.insert( {"Date":request.body.date, "Time":request.body.time, 
					"Food":request.body.food, "Sponsor":request.body.sponsor,
					"Location":request.body.location, "Other":request.body.other} );
		});

		// TODO: SEND DATA TO USER
		// sends data to user
		// db.collection('events_list', function(err, collection) {
		// 	collection.find().toArray(function(err, cursor) {
		// 		if (!err) {
		// 			console.log(cursor);
		// 			response.send(cursor);
		// 		} else {
		// 			console.log('bad');
		// 			response.send([]);
		// 		}
		// 	});
		// });
	}

	else {
		// returns error statement if improper input
		response.send({"error":"Whoops, something is wrong with your data!"});
	}

	response.send();

});

// get data from mongodb, send to app
app.get('/', function (request, response) {
	response.set('Content-Type', 'text/html');

	db.collection('events_list', function(err, collection) {
		
		collection.find().toArray(function(err, cursor) {
			if (!err) {
				response.send(cursor);
			} else {
				response.send([]);
			}
		});
		
	});

});

app.listen(process.env.PORT || 3000);

// '*/2 * * * *' = every two minutes
// '*/10 * * * * *' = every ten seconds
// pulls from Facebook every 2 minutes
// cron.schedule('0 */2 * * * *', function() {

// 	getGroupFeed(FB_group_id);

// });


// pulls feed from Facebook group/page to extract individual events
/*
function getGroupFeed () {

	FB.api(
		"/"+feedID+"/feed/?access_token="+longer_token,
		function (response) {
			if (response && !response.error) {
				// console.log('API response', response);
				parsedResponse = response.data;
				//console.log(parsedResponse);
				parsedResponse.forEach(function (element, index, array) {
					console.log(element);
					//console.log(element.message);
					// var message = element.message;
					// if (typeof message === "string") {
					// 	message = message.toLowerCase();
					// 	//console.log(message.split(" "));
					// 	message = message.split(" ");

					// 	message.forEach(function (element, index, array) {
					// 		if (element in foodList) {
					// 			console.log(element+" "+foodList[element]);
					// 		}
					// 	});
					// }

				});
			} else {
				console.log('huh?')
				console.log(response);
			}
		}
	);
}
*/







