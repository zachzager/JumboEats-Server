

$(document).ready(function() {

	$("body").append("<h1>Time and Date Parsing Test</h1>");

	var timeKeyWords = ["noon", "midnight", "tonight", "midday", "this morning",
		"this afternoon", "now", "open block"];

	var dateKeyWords = ["today", "now", "tomorrow", "Monday", "Tuesday", "Wednesday", 
	"Thursday", "Friday", "Saturday", "Sunday", "Mon", "Tues", "Wed", "Thurs", "Fri",
	"Sat", "Sun", 'this weekend'];

	var example_1 = "Interested in Law? Come meet the Tufts Pre-Law Society Board and get to know fellow pre-law students at our GIM, this Sunday, today at noon! We'll be talking about the pre-law process, our events on campus, and we'll be raffling off an ~LSAT prep course~ too. P.S. We'll have pizza at 5:30pm";

	var example_2 = "6am 5AM and stuff and 6:30 and 7:43pm and 30am";

	var example_3 = "Come at noon for dank produce!";

	var example_4 = "Today at 7 come get some stuff!"

	parseTime(example_4);
	parseDate(example_4);

	/////////////////////////////////////////////

	function parseTime(text) {
		let words = text.split(" "); // split post into an array of its words
		console.log(words);


		let timeWords = [];
		for (let i = 0; i < words.length; i++) {

			if (words[i].match(/(\d+):(\d+)/)) { // get times of type "5:30pm", "6:00", etc
				timeWords.push(words[i]);
			}

			else if (words[i].match(/[\s\S]*(am|pm|AM|PM)/)) { // get words with am or pm in them
				timeWords.push(words[i]);
			}

			else if (eqTimeWord(words[i])) {
				timeWords.push(words[i]);
			}

			else if (words[i].match(/\d/)) {
				timeWords.push(words[i]);
			}

		}
		console.log(timeWords);
	}

	function eqTimeWord(word) {
		for (let i = 0; i < timeKeyWords.length; i++) {
			if (word == timeKeyWords[i]) {
				return true;
			}
		}
		return false;
	}

	////////////////////////////////////////////////
	function parseDate(text) {
		let words = text.split(" ");
		let dateWords = [];

		for (let i = 0; i < words.length; i++) {
			if (eqDateWords(words[i])) {
				dateWords.push(words[i])
			}
		}

		sugarDate = Sugar.Date.create(dateWords[0]);
		// console.log(sugarDate.raw);

		newDate = new Date();
		newDate = sugarDate;

		console.log(newDate.medium());

		// console.log(new Date() = sugarDate);

		dateToPost = sugarDate.split(/\s+/).slice(0,3).join(" ");

				console.log(sugarDate);
				console.log(typeof JSON.stringify(sugarDate));
								console.log(typeof "hello asdfkj sdf ");



		console.log(dateToPost);
	}

	function eqDateWords(word) {
		for (let i = 0; i < dateKeyWords.length; i++) {
			if (word == dateKeyWords[i]) {
				return true;
			}
		}
		return false;
	}








		// var timesInPost = [];
		// timesInPost.push(parseDigitalTime(text)); 
		// timesInPost.push(parseAMPMTime(text));
		// timesInPost.push(parseAlphaTime(text)); 

		// console.log(timesInPost);

		// function parseDigitalTime(text) {

		// function parseAMPMTime(text) {
		// 	let timeWords = [];
		// 	for (let i = 0; i < words.length; i++) {
		// 		if (words[i].match(/[\s\S]*(am|pm)/)) {
		// 			console.log(words[i]);
		// 			timeWords.push(words[i]);
		// 		}
		// 	}
		// 	return timeWords;
		// }

		// function parseAlphaTime(text) {
		// 	return "alpha parse";
		// }
	// }
});