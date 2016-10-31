// inputs.js
$(document).ready(function() {

	// add HTML content (forms, button, etc.)
	$('#main').append('<form id="inputForm">Date:<br><input type="date" name="date"><br>Time:<br><input type="time" name="time"><br>Food:<br><input type="text" name="food"><br>Sponsor:<br><input type="text" name="sponsor"><br>Location:<br><input type="text" name="location"><br>Other:<br><input type="text" name="other"></form><br><button id="submit">Submit</button><br><br><button id="fb">Finding Free Food at Tufts - Feed</button><br>');

	fetchData();

	// click event listener for submission button
	$("#submit").click(function () {

		serializedData = $("#inputForm").serialize();

		console.log(serializedData);

		$.ajax({
			type: "POST",
			// url: "http://localhost:3000/post",
			url: "https://jumboeats.herokuapp.com/post",
			dataType: "text",
			data: serializedData
		}).done(function (msg){
			console.log(msg);
			fetchData();
		});



		// $("#inputForm").trigger("reset");
		// location.reload();
	});

	// HTTP GET request to server
	function fetchData () {
		$.ajax({
			type: "GET",
			// url: "http://localhost:3000/",
			url: "https://jumboeats.herokuapp.com/",
		   	data: { format: 'json' }
		}).then (function (data) {
			JSONdata = JSON.parse(data);
			JSONdata.forEach(function (element, index, array) {
				console.log(element);
				$('#main').append("<h1>"+element.Food+"</h1><h2>"+element.Date+" "+element.Time+"</h2><h4>"
					+element.Sponsor+" "+element.Location+"</h4><p>"+element.Other+"</p>");
			});
		});
	}

		// click event listener for submission button
	$("#fb").click(function () {
		$.ajax({
			type: "GET",
			url: "http://localhost:3000/fb_check",
			// url: "https://jumboeats.herokuapp.com/fb_check",
			dataType: "text",
		}).done(function (msg){
			console.log(msg);
		});
	});

});