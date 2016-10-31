// foodtest.js

$(document).ready(function() {

	$("body").append("<h1>Food Parsing APIs Test</h1>");

	food_list = [];

	// spoonacular credentials
	var XMashapeKey = "0atm2jxrnFmshGsjqilnw6RdP876p19vfWwjsnbHov0EhTGVAK";

	// method URLs
	var classifyURL = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/cuisine";
	var ingredientSearchURL = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/food/ingredients/autocomplete";
	var recipeSearchURL = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/autocomplete"

	// sample list of foods
	var cuisines = [
		"sushi", "bagels", "salad", "lettuce", "lo mein",
		"pizza", "spaghetti", "tacos", "nachos", 
		"burritos", "applesauce", "from", "farmers", "sheep",
		"cookies", "ice cream", "sandwiches", "popcorn",
		"cupcake", "salsa", "chicken", "doughnuts", "donuts",
		"barbecue", "soda", "pie", "boot", "ice cream sandwiches",
		"mango salad", "farmer", "the", "through"
	];

	// FFF@Tufts examples
	var example_1 = "Interested in Law? Come meet the Tufts Pre-Law Society Board and get to know fellow pre-law students at our GIM, this Sunday, today at noon! We'll be talking about the pre-law process, our events on campus, and we'll be raffling off an ~LSAT prep course~ too. P.S. We'll have pizza"
	var example_2 = "Cookie decorating + AO GIM is tonight! Come to campus center at 7:00 because cookies and cupcakes runs out fast! Learn more about us and hang out with us on the weekends to come"
	var example_3 = "Free danish homemade ice cream sandwiches! Tamper Danish Pastry House apple juice juice orange juice pineapple pineapple juice ice cream sandwich! ice cream! fries french fries cream! sandwiches! SoGo @ 7pm hot dogs hot dog";
	var example_4 = "Fat boxes of dank produce at 33 teele ave, come and get it people// awaits you on the porch";
	
	findFood(example_3);

	// Zomato API Key: 8eb908d1e6003b1c7643c94c50ecd283
	// Tufts coordinates (Lat: 42.4074843, Long: -71.11902320000002)
	function restaurantCheck (post) {

		var zomatoKey = "8eb908d1e6003b1c7643c94c50ecd283";
		$.ajax ({
			method: "GET",
			url: "https://developers.zomato.com/api/v2.1/search?apikey="+zomatoKey+"&count=500&lat=42.4074843&lon=-71.11902320000002&radius=5000",
		}).done(function (data) {
			data.restaurants.forEach(function(element,index) {
				if (post.includes(element.restaurant.name)) {
					food_list.push(element.restaurant.name);
				}
			});
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
			"your", "our", "and", "about", "process", "more", "less", "of",
			"people", "person", "box", "boxes"
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

	// looks 
	function combineFoods(post) {

		for (var i = 0; i < post.length; i++) {
			combineTwoConsecutive(post, i, "ice", "cream");
			combineTwoConsecutive(post, i, "ice cream", "sandwich");
			combineTwoConsecutive(post, i, "hot", "dog");
			combineTwoConsecutive(post, i, "french", "fries");

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

	// combine two consecutive (1 ... 2)
	function combineTwoConsecutive (post, i, word_1, word_2) {
		if (post[i] === word_1 && post[i+1].includes(word_2)) {
			post[i] += " " + post[i+1];
			post.splice(i+1, 1); // remove following index
		}
		return post;
	}

	// runs API methods on split_example_1
	function findFood(post) {
		console.log(post);
		restaurantCheck(post);
		post = filterPost(post); // filters posts

		// checks spoonacular API to find foods
		post.forEach(function (element, index) {
			classifyCuisine(element);
			ingredientSearch(element);
		});
	}

	// POST Classify Cuisine
	function classifyCuisine (food) {
		$.ajax ({
			method: "POST",
			url: classifyURL+"?ingredientList=<required>&title="+food,
		    headers: {
		        'X-Mashape-Key': XMashapeKey,
		        'Content-Type': "application/x-www-form-urlencoded",
		        "Accept": "application/json"
		    }
		}).done(function (data) {
			// console.log(data);
			// ensures confidence is adequate and item not already in list
			if (data.confidence > 0.6 && food_list.indexOf(food) === -1) {
				food_list.push(food);
			}
		});
	}

	// GET Autocomplete Ingredient Search
	function ingredientSearch (food) {
		$.ajax ({
			method: "GET",
			url: ingredientSearchURL+"?metaInformation=false&number=10&query="+food,
		    headers: {
		        'X-Mashape-Key': XMashapeKey,
		        'Content-Type': "application/x-www-form-urlencoded",
		        "Accept": "application/json"
		    }
		}).done(function (data) {
			// check each returned ingredient for complete instance of passed in food
			for (var i = 0; i < data.length; i++) {
				var word_list = getWords(data[i].name);
				// ensures food is an ingredient and not already in the food list
				if (word_list.indexOf(food) !== -1 && food_list.indexOf(food) === -1) {
					// console.log(food);
					food_list.push(food);
					break;
				}
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


});