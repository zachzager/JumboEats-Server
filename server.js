// server.js

// Express initialization
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();
var request = require('request');
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
var longer_token = "EAAKHbAiApcsBAF3hhID0rkgoNJBgDZCQO9870DXzJFZCADLOTQyHOOJhpZAiZAPksXe3z5TnSdNZAonkiO5ktMzt4va39pJW9WHa0zelcACPC3nf4t2cUIFtSoLZAmkj4oZBZBHjB6hwZC67MUxTGB4ig";
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
// pulls from Facebook every minute
// cron.schedule('0 */1 * * * *', function() {
cron.schedule('*/10 * * * * *', function() {
	getGroupFeed(FB_group_id);
	// getGroupFeed(FB_page_id);
	// restaurantCheck();
	console.log("cron");
	parsePosts();
});


									//						//
									//  PULL FROM FACEBOOK  //
									//						//

// pulls feed from Facebook group/page to extract individual events
function getGroupFeed (feedID) {

	FB.api(
		"/"+feedID+"/feed/?access_token="+longer_token,
		function (response) {
			if (response && !response.error) {

				var parsedResponse = response.data
				console.log(parsedResponse);

				parsedResponse.forEach(function (element, index, array) {
					console.log(element);
					
					// updated_time => group
					// created_time => page
					var time;
					if ("updated_time" in element) {
						console.log("group");
						time = element.updated_time;
					}
					else if ("created_time" in element) {
						console.log("page");
						time = element.created_time;
					}

					var elements = {"message":element.message, "time":time, "id":element.id};

					db.collection('raw_fb_posts', function(err, collection) {	
						collection.update(elements, elements, {upsert: true});
					});


				});
			} else {
				console.log('huh?')
				console.log(response);
			}
		}
	);
}


									//						//
									// FOOD PARSING METHODS //
									//						//

// gets parsed posts
function parsePosts() {
	db.collection('raw_fb_posts', function(err, collection) {
		
		collection.find().toArray(function(err, cursor) {
			if (!err) {
				// console.log(cursor);
				cursor.forEach(function (element, index) {

					if (typeof element.message === "string") {
						// console.log(element.message);
						detectFood(element);
					}

					console.log("\n\n");
				});
			} else {
				console.log("huh?");
			}
		});
	});
}

// POST Detect Food in Text
function detectFood(post) {
	// console.log(post);

	var XMashapeKey = "0atm2jxrnFmshGsjqilnw6RdP876p19vfWwjsnbHov0EhTGVAK";
	var detectURL = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/food/detect";

	var options = {
		url: detectURL+"?text="+post.message,
		method: "POST",
		headers: {
		    'X-Mashape-Key': XMashapeKey,
	        'Content-Type': "application/x-www-form-urlencoded",
	        "Accept": "application/json"
		}
	};

	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			organizeDetectedFood(JSON.parse(body), post.time);
		}
		else {
			console.log("...what?");
		}
	});
}

// organizes the retrieved food data
function organizeDetectedFood (res, time) {

	var annotations = res.annotations;
	annotations = annotations.map (function (element, index) {
		return element.annotation;
	});
	
	for (var i = 0; i < annotations.length; i++) {
		for (var j = 0; j < annotations.length; j++) {
			if (i !== j) {
				if (annotations[j].includes(annotations[i])) {
					annotations[i] = "";
				}
			}
		}
	}

	annotations = annotations.filter (function (element, index) {
		return element !== "";
	});

	console.log(annotations);
	console.log(time);
	console.log("");

	if (annotations.length > 0) {
		var elements = {"Date":time, "Time":time, "Food": annotations.toString(), 
						"Sponsor": "", "Location": "", "Other": ""};
		db.collection("events_list", function(err, collection) {	
			collection.update(elements, elements, {upsert: true});
		});
	}

// var elements = {"message":element.message, "time":time, "id":element.id};

// db.collection('raw_fb_posts', function(err, collection) {	
// 	collection.update(elements, elements, {upsert: true});
// });

	// console.log(food_list);

	// food_list = [];

}

// initiates food parsing methods
function findFood(post) {
	// console.log(post);
	console.log("sup");
	// restaurantCheck(post);
	post = filterPost(post); // filters posts

	// checks spoonacular API to find foods
	post.forEach(function (element, index) {
		classifyCuisine(element);
		ingredientSearch(element);
	});
}

food_list = [];

// checks post for local restaurants
function restaurantCheck () {
	var zomatoKey = "8eb908d1e6003b1c7643c94c50ecd283";
	var tuftsLat = "42.4074843";
	var tuftsLon = "-71.11902320000002";
	var url = "https://developers.zomato.com/api/v2.1/search?apikey="+zomatoKey+"&count=500&lat="+tuftsLat+"+&lon="+tuftsLon+"+&radius=5000";

	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			// console.log(body);
			body = JSON.parse(body);
			// console.log(body);
		}
	});
}

// breaks posts into lists of words.
// removes punctuation and common non-food words.
function filterPost(post) {

	// English language words to be filtered out
	var filter_words = [
		"the", "a", "an", "one", "some", "few", "on", "off", "at", "since",
		"before", "to", "past", "until", "by", "in", "out", "ago", "over",
		"through", "towards", "into", "onto", "from", "between", "under",
		"underneath", "with", "without", "me", "i", "you", "us", "them",
		"we", "we'll", "well", "too", "also", "against", "after", "among",
		"your", "our", "and", "about", "process", "people", "person",
		"more", "less", "of", "box", "boxes", "new", "for", "food", "any",
		"winter", "spring", "summer", "fall", "free", "use", "its", "great",
		"extra", "club", "back", "meal", "conversation", "crisp", "little",
		"kids", "active"
	];

	// punctuation list
	// Answer: StackOverflow user Joseph, edited by nhahtdh
	// (http://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex)
	var punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
	var spaceRE = /\s+/g;
	post = post.replace(punctRE, '').replace(spaceRE, ' '); // remove punctuation

	var post = post.split(" ");	// break string into list

	// BEFORE BREAKING INTO LIST, FIND WAY TO IDENTIFY COMPOUND WORDS 
	// (ICE+CREAM, ICE+CREAM+SANDWICH, HOT+DOG, etc.)
	post = combineFoods(post);

	// remove filter words, numbers, etc.
	var post = post.filter (function (value) {
		return filter_words.indexOf(value) === -1 && isNaN(value);
	});

	return post;
};

// looks for food words to combine
function combineFoods(post) {

	for (var i = 0; i < post.length; i++) {
		combineTwoConsecutive(post, i, "ice", "cream");
		combineTwoConsecutive(post, i, "ice cream", "sandwich");
		combineTwoConsecutive(post, i, "hot", "dog");
		combineTwoConsecutive(post, i, "french", "fries");
		combineTwoConsecutive(post, i, "sparkling", "water");

		// check if "_________ juice"
		// THIS ONE'S SPECIAL
		if (post[i] === "juice" && (post[i-1] === "orange" || post[i-1] === "apple" || post[i-1] === "cranberry" ||
				post[i-1] === "mango" || post[i-1] === "pineapple" || post[i-1] === "grape")) {
			post[i] = post[i-1] + " " + post[i];
			post.splice(i-1, 1);
			i--;
		}
	}
	return post;
}

// combine two consecutive (1 ... 2) food items
function combineTwoConsecutive (post, i, word_1, word_2) {
	if (post[i] === word_1 && post[i+1].includes(word_2)) {
		post[i] += " " + post[i+1];
		post.splice(i+1, 1); // remove following index
	}
	return post;
}

// POST Classify Cuisine
function classifyCuisine (food) {
	var XMashapeKey = "0atm2jxrnFmshGsjqilnw6RdP876p19vfWwjsnbHov0EhTGVAK";
	var classifyURL = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/cuisine";

	var options = {
		url: classifyURL+"?ingredientList=<required>&title="+food,
		method: "POST",
		headers: {
		    'X-Mashape-Key': XMashapeKey,
	        'Content-Type': "application/x-www-form-urlencoded",
	        "Accept": "application/json"
		}
	};

	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			body = JSON.parse(body);
			if (body.confidence > 0.6) { 
				console.log(food + " " + body.confidence);
				food_list.push(food);
			}
		}
		else {
			// console.log("classify...what?");
		}
	});
}

// GET Autocomplete Ingredient Search
function ingredientSearch (food) {
	var XMashapeKey = "0atm2jxrnFmshGsjqilnw6RdP876p19vfWwjsnbHov0EhTGVAK";
	var ingredientSearchURL = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/food/ingredients/autocomplete";
	
	var options = {
		url: ingredientSearchURL+"?metaInformation=false&number=10&query="+food,
		method: "GET",
		headers: {
		    'X-Mashape-Key': XMashapeKey,
	        'Content-Type': "application/x-www-form-urlencoded",
	        "Accept": "application/json"
		}
	};

	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			body = JSON.parse(body);
			// 	check each returned ingredient for complete instance of passed in food
			for (var i = 0; i < body.length; i++) {
				var word_list = getWords(body[i].name);
				// ensures food is an ingredient and not already in the food list
				if (word_list.indexOf(food) !== -1 && food_list.indexOf(food) === -1) {
					console.log(food);
					food_list.push(food);
					break;
				}
			}
		}
		else {
			// console.log("ingredients...what?");
		}
	});

}

// returns a list of all the words including the full string
function getWords(food) {
	var list = [];
	list.push(food);
	var food_parts = food.split(" ");	// break string into list
	if (food_parts.length > 1) {
		food_parts.forEach(function (element, index) {
			list.push(element);
		});
	}
	return list;
}

var food_dictionary = [
	"barbecue", "pizza", "cookies",
	"pizza", "coffee", "Indian","chocolate", "salsa",
	"apple", "cupcakes", "cinnamon", "salsa", "hot dogs",
	"soda", "cider", "apples", "cupcakes", "caramel", 
	"bbq", "ice cream"
];

