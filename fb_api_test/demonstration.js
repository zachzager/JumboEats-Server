// demonstration.js

// inputs.js

$(document).ready(function() {

	$("body").append ("<h1>Facebook Graph API Demonstration</h1>");

	var app_id = "711848022287819"; // JumboEats FB App
	//var account_id = "10210912889362742"; // Zach Zager - Finding Free Food at Tufts - Account ID
	var app_secret = "91320deb78f345f1458d6ef383ba7a6e";
	var short_token="EAAKHbAiApcsBAEplhanZCaCD9LHdRfkw3LSxwee5m10XgUD7kaIA2ZAXoijdZBaCIuvjvrM5FRx9qupeVTGOwMIdAxK2mZANlmqTwp8XysRXCqzjJj4pTk02pkgRloEW2IWybg1l3TUZB64O6e1ZB1kY6QVPJWUTesfCalqnarawZDZD";
	
	// token generated with app_id and app_secret
	// Received 10/12/2016
	// Expires never
	var longer_token = "EAAKHbAiApcsBAGfADZBn162cENZBiHBTqaPzHZAw3tgvIawslNV3ZAcZCvY1DjdZBR7iixhNxZBZAMTgZB4hBQTvgprZAQ8sjGaZAabCZAs6Xl4JgjTZC5TS8gAZAotzZBBPgrl8il4ZBEoO3yMnHjxu1XpmYm77";

	var FB_page_id = "TuftsFreeFood"; // Finding Free Food at Tufts (Group)

	$.ajaxSetup({ cache: true });
	$.getScript('//connect.facebook.net/en_US/sdk.js', function () {
		FB.init({
			appId: app_id,
			cookie: true,
			version: 'v2.8'
		});



		// //get permanent token for accessing the Graph API
		// function getLongerToken () {
		// 	$.get("https://graph.facebook.com/v2.2/oauth/access_token?grant_type=fb_exchange_token&client_id="+app_id+"&client_secret="+app_secret+"&fb_exchange_token="+short_token+"/",
		// 		function(data) {
		// 			console.log(data);
		// 	});
		// }
		


		getPageFeed();

		// new group
		function getPageFeed () {
			FB.api(
				"/"+FB_page_id+"/feed/?access_token="+short_token,
				//"/"+FB_page_id+"/feed/?access_token="+long+token,
				function (response) {
					if (response && !response.error) {
						console.log('API response', response);
						parsedResponse = response.data;
						showPosts(parsedResponse);
					} else {
						console.log('huh?')
						console.log(response);
					}
				}
			);
		}

	});

	function showPosts (response) {
		$("body").append ("<h2>"+FB_page_id+"</h2>");

		response.forEach(function (element, index, array) {

			var time;

			// group
			if ("updated_time" in element) {
				time = element.updated_time;
			}

			// old page
			if ("created_time" in element) {
				time = element.created_time;
			}

			console.log(new Date(time));

			$("body").append ("<h4>"+time+"</h4><p>"+index+") "+element.message+"</p>");
		});
	}

});



// CRON SCHEDULING

// '*/2 * * * *' = every two minutes
// '*/10 * * * * *' = every ten seconds
// pulls from Facebook every _____ minutes
// cron.schedule('0 */2 * * * *', function() {
// 	console.log("running every minute ");

// 	getGroupFeed(FB_group_id);

// });









