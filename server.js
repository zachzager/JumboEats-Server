// server.js

// Express initialization
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();
var cron = require('node-cron'); // Cron initialization
var FB = require('fb'); // Facebook intialization


// FACEBOOK
// token generated with app_id and app_secret
// Received 10/12/2016
// If it is a 60 day code: Expires 12/11/2016
// If it is an unlimited code: Expires never
var longer_token = "EAAKHbAiApcsBAGfADZBn162cENZBiHBTqaPzHZAw3tgvIawslNV3ZAcZCvY1DjdZBR7iixhNxZBZAMTgZB4hBQTvgprZAQ8sjGaZAabCZAs6Xl4JgjTZC5TS8gAZAotzZBBPgrl8il4ZBEoO3yMnHjxu1XpmYm77";
var FB_group_id = "884846861623513"; // Finding Free Food at Tufts (Group)
var FB_page_id = "TuftsFreeFood"; // Free Food around Tufts (Page)
//

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// get user data from app
app.post('/post', function (request, response) {

	// VALIDATE INPUT

	// get date of input
	//req_date = new Date(request.body.date);
	// req_date = Date.parse(request.body.date);
	// req_date = req_date.setDate(req_date.getDate()+1);

	// date = new Date();

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
				console.log(cursor);
				response.send(cursor);
			} else {
				console.log('bad');
				response.send([]);
			}
		});
		
	});

});

// get facebook data
// (include parsing)
/*
app.get('/fb_check', function (request, response) {
	response.set('Content-Type', 'text/html');

	// FB group call
	getGroupFeed();

	response.send("Facebook");

});
*/

// '*/2 * * * *' = every two minutes
// '*/10 * * * * *' = every ten seconds
// pulls from Facebook every 2 minutes
// cron.schedule('0 */2 * * * *', function() {

// 	getGroupFeed(FB_group_id);

// });

// app.listen(process.env.PORT || 3000);


// calls Facebook group/page to 
/*
function getGroupFeed (feedID) {

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

// list of items considered "food"
/*
var foodList = {
	pizza: "pizza",
	cookie: "cookie",
	cupcakes: "cupcakes",
	chips: "chips",
	salsa: "salsa",
	produce: "produce",
	coffee: "coffee",
	hot_chocolate: "hot chocolate",
	ice_cream: "ice cream",
	food: "food",
	breakfast: "breakfast",
	lunch: "lunch",
	dinner: "dinner",
	dessert: "dessert",
	leftovers: "leftovers",
	sandwiches: "sandwiches",
	ice_cream_sandwiches: "ice cream sandwiches",
	popcorn: "popcorn",
	fry_dough: "fried dough",
	french_toast: "french toast",
	bread: "bread",
	salad: "salad",
	chicken: "chicken",
	broccoli: "BROCCOLI",
	pasta: "pasta",
	lasagna: "lasagna",
	sushi: "sushi",
	lo_mien: "lo mien",
	soda: "soda",
	pie: "pie",
	munchkins: "munchkins",
	doughnuts: "doughnuts",
	donuts: "donuts",
	burritos: "burritos",
	chipotle: "Chipotle",
	quesadillas: "quesadillas",
	za: "pizza",
	pretzels: "pretzels",
	cider: "cider",
	apple_crisp: "apple crisp",
	hot_dogs: "hot dogs",
	bbq: "BBQ",
	barbecue: "barbecue",
	sundaes: "sundaes",
	fruit: "fruit",
	vegetables: "vegetables",
	beans: "beans"

};
*/
// REACH: get email data
// (include parsing)







