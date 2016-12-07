// inputs.js

$(document).ready(function() {

	var app_id = "711848022287819"; // JumboEats FB App

	var account_id = "10210912889362742"; // Zach Zager - Finding Free Food at Tufts - Account ID
	var app_secret = "91320deb78f345f1458d6ef383ba7a6e";
	var short_token="EAAKHbAiApcsBAJZBZAJ34hVdye2AlBYcMg1FBYQRNfgsKEVj6xy0KR4ECtD5SHZCNxjo5InEglJjlZB1XvNHok4CU3fxaOZAQ6lL63qAApkrHVkJ1ZAKaXfDkGK0SIbeHrQs9SNqrPGRcYCmGxdTLHpCIB9OhCfgfz7wbysP0bKQZDZD";

	// 2 months
	// var longer_token = "EAAKHbAiApcsBAEfJZAGQaHiQvM1CZBp13MPSCp6UwFUPZAPnMDFXxPZCr5InqgpJBiy8DXVGNUFTSX8xHY9Nja480GQ0K9RAtfFgpWlZAwpWVVQZBGjQF8HrECvWchI0AbWSLDuOW1b3JdK81ZCX7Wjx4iMUOYbfCMZD";
	
	// forever
	// var perm_token = "EAAKHbAiApcsBAJxfHRJgtIxSgslNQMgb7zVU0SywZAPsFXAnZA5Qf53vER4ZAMfjp25WYghpdieVaA2lrKp5Yn3yEZCNCoR4xQyIkxj2vY7tiFOXrlKmfbvs3RGKaR6RTwE7jqOLBA0jMjsM1J88sbQRA24djiCFgsAG2LtACQZDZD"
	
	var FB_group_id = "884846861623513"; // Finding Free Food at Tufts (Group)
	var old_page = "TuftsFreeFood"; // Free Food around Tufts (Page)

	$.ajaxSetup({ cache: true });
	$.getScript('//connect.facebook.net/en_US/sdk.js', function() {
		FB.init({
			appId: app_id,
			cookie: true,
			version: 'v2.8'
		});

		// get longer token for accessing the Graph API
		function getLongerToken () {
			$.get("https://graph.facebook.com/v2.8/oauth/access_token?grant_type=fb_exchange_token&client_id="+app_id+"&client_secret="+app_secret+"&fb_exchange_token="+short_token+"/",
				function(data) {
					console.log(data);
			});
		}
		getLongerToken();

		// trynna get permanent access code
		function getPermAccessCode () {
			FB.api(
				"/"+account_id+"/accounts/?access_token="+longer_token,
				function (response) {
					if (response && !response.error) {
						console.log('API response - trynna get perm code', response);

						perm_token = response.data[0].access_token;

						getGroupFeed();
						getPageFeed();

					} else {
						console.log('huh?')
						console.log(response);
					}
				}
			);
		}
		// getPermAccessCode();

		// get members of group
		// function getMyID () {
		// 	FB.api(
		// 		"/"+FB_group_id+"/members/?limit=400&access_token="+longer_token,
		// 		function (response) {
		// 			if (response && !response.error) {
		// 				console.log('API response', response);

		// 				findZachZager(response.data);
						
		// 				// parsedResponse = response.data;
		// 				// console.log(parsedResponse);
		// 				// showPosts(parsedResponse);
		// 			} else {
		// 				console.log('huh?')
		// 				console.log(response);
		// 			}
		// 		}
		// 	);
		// }

		// new group
		// FB.api(
		// 	"/"+account_id+"/feed/?access_token="+perm_token,
		// 	function (response) {
		// 		if (response && !response.error) {
		// 			console.log('API response', response);
		// 			parsedResponse = response.data;
		// 			console.log(parsedResponse);
		// 			showPosts(parsedResponse);
		// 		} else {
		// 			console.log('huh?')
		// 			console.log(response);
		// 		}
		// 	}
		// );
		
		// getGroupFeed();
		// getPageFeed();

		// new group
		function getGroupFeed () {
			FB.api(
				"/"+FB_group_id+"/feed/?access_token="+longer_token,
				function (response) {
					if (response && !response.error) {
						console.log('API response', response);
						parsedResponse = response.data;
						console.log(parsedResponse);
						showPosts(parsedResponse);
					} else {
						console.log('huh?')
						console.log(response);
					}
				}
			);
		}

		// old page
		function getPageFeed () {
			FB.api(
				"/"+old_page+"/feed/?access_token="+longer_token,
				function (response) {
					if (response && !response.error) {
						console.log('API response', response);
						parsedResponse = response.data;
						console.log(parsedResponse);
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

			$("body").append ("<p>"+index+" "+element.message+" | "+time+"</p>");
		});
	}

	// finds me (Zach Zager) in a list of users and prints my id
	function findZachZager (response) {
		response.forEach(function (element, index, array) {
			if (element.name === "Zach Zager") {
				console.log(element);
			}
		});
	}

});