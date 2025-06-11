$(document).ready(function() {

	/* constants & variables */
	const VERSION = '1.0'; 						// to keep track of changes affecting log file format
	const DEBUG = false;

	const STATUS_COMPLETE = 'complete';			// indicates complete dataset on server
	const STATUS_INCOMPLETE = 'partial';		// indicates partial dataset (contingency plan in case user refreshes website)
	const SECOND = 1000; //ms
	const COLLECT_DEMOGRAPHICS = false;			// optionally, demographics are collected
	const ENFORCE_USER_INPUT = true;
	const COUNTDOWN = 3;
	
	const RED_DOT_DURATION = 3000;
	const BREAK_BETWEEN_TRIGRAMS = 5000;
	
	// ** VISUAL SPAN SETTINGS ** //
	const TRIGRAM_SPEED = 50; // ms
	const TRIGRAM_POSITIONS = [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	const TRIGRAM_TRIALS = 5; // number of trigrams per position
	const TRIALS_PER_ROUND = 30;

	const COLORS = [
			['black', '#000000'],
			['red', '#ff0000'],
			['blue', '#3333ff'],
			['green', '#009933'],
			['orange', '#ff9900'],
			['yellow', '#ffff00']
	];
	const SPEEDS = [							// ms
			['slower', 3000],
			['slow', 2000],
			['medium', 1000, 'default'],
			['fast', 750],
			['faster', 500]
	];
	const DURATIONS = [							// [sec, ms]
		[10, 10*SECOND],
		[20, 20*SECOND],
		[30, 30*SECOND, 'default'],
		[45, 45*SECOND],
		[60, 60*SECOND]

	];

	var settings = {},
		current_round = 1,
		trigram_positions = [],
		trigram_pack = [],
		trigram_index = 0,
		current_color_item = [],
		progressbar_timer = {},
		trigram_in_progress = false,
		response_given = false,					// ensures that only first reponse is logged
		results = {
			'trigrams': new Array(),
			'trigram_positions': new Array()
		},
		start_time;

	/* INIT */

	$('#participant_id').focus();

	var item = {value: TRIGRAM_POSITIONS.length, text: TRIGRAM_POSITIONS.length, selected: 'selected'};
	$('#positions').append($('<option>', item));

	item = {value: TRIGRAM_TRIALS, text: TRIGRAM_TRIALS, selected: 'selected'};
	$('#trials').append($('<option>', item));

	var total_trials = TRIGRAM_POSITIONS.length * TRIGRAM_TRIALS;
	item = {value: (Math.round(total_trials / TRIALS_PER_ROUND)), text: (Math.round(total_trials / TRIALS_PER_ROUND)), selected: 'selected'};
	$('#total_rounds').append($('<option>', item));

	item = {value: TRIALS_PER_ROUND, text: TRIALS_PER_ROUND, selected: 'selected'};
	$('#trials_per_round').append($('<option>', item));

	item = {value: TRIGRAM_SPEED, text: TRIGRAM_SPEED, selected: 'selected'};
	$('#speed').append($('<option>', item));


	/* functions */

	/* randomly shuffle an array */

	function shuffle(array) {
		var top = array.length,
			tmp, current;

		if(top) {
			while(--top) {
				current = Math.floor(Math.random() * (top + 1));
				tmp = array[current];
				array[current] = array[top];
				array[top] = tmp;
			}
		}

		return array;
	}

	// helper function to calculate avg of array
	Math.avg = function(input) {
	  this.output = 0;
	  for (this.i = 0; this.i < input.length; this.i++) {
	    this.output+=Number(input[this.i]);
	  }
	  return this.output/input.length;
	}

	Math.twodec = function(input) {
		return Math.round(input * 100) / 100
	}

	function create_data_log(status) {

		return {
			'settings': settings,
			'data': results,
			'version': VERSION,
			'status': status 
		}
	}

	function log_partial_data() {

		data = create_data_log(STATUS_INCOMPLETE);

		$.ajax ({
	        type: "POST",
	        url: '/',
	        dataType: 'json',
	        contentType: "application/json",
	        data: JSON.stringify(data),
	        success: function (result,status,xhr) {
	        	console.log("Partial dataset saved (participant id: " + settings['participant_id'] + ")."); 
	        },
	        error: function(xhr,status,error) {
	        	console.log("Error when transmitting partial data!"); 
	        }
	    });
	}

	function log_final_results() {

		data = create_data_log(STATUS_COMPLETE);

		$.ajax ({
	        type: "POST",
	        url: '/',
	        dataType: 'json',
	        contentType: "application/json",
	        data: JSON.stringify(data),
	        success: function (result,status,xhr) {
	        	// console.log(status);
	        	// console.log(result);
	        	if(result.status == 'ok') {
	        		$(".alert").html('<h4>Success:</h4><p>Your data has been saved (participant id: ' + settings['participant_id'] + ').</p>');
	     			$(".alert").show();
	        	} else {
	        		$(".alert").html('<h3>There seems to be a problem with the log server!</h3><p>Please manually save the following data objects:</p><h4>Settings:</h4><p>' + JSON.stringify(settings) + '</p><h4>Data</h4>' + JSON.stringify(data) + '</p>');
	     			$(".alert").show();
	        	}
	        },
	        error: function(xhr,status,error) {
	        	console.log("Error when transmitting data!"); 
	        	console.log(status);
	        	console.log(error);
	        	$(".alert").html('<h3>There seems to be a problem with the log server!</h3><p>Please manually save the following data objects:</p><h4>Settings:</h4><p>' + JSON.stringify(settings) + '</p><h4>Data</h4>' + JSON.stringify(data) + '</p>');
	     		$(".alert").show();
	        }
	    });
	}

	// hier weitermachen: 
	// 1) create all trigram positions 
	// 2) check whether trial-per-round has been reached
	// 3) break or continue
	// 4) final screen

	function init_test() {

		console.log("++ init_test()");
		
		trigram_positions = TRIGRAM_POSITIONS.flatMap(position =>
			Array.from({ length: TRIGRAM_TRIALS }, () => position)
		);
		trigram_positions = shuffle(trigram_positions);

		console.log(trigram_positions);

		// $('#progressbar').hide();
		trigram_index = 0;
		trigram_pack = [];

		//request trigrams
		$.ajax({url: "/trigrams", success: function(result){
			trigram_pack = shuffle(result);
			console.log(trigram_pack);
		}});

		$('#header').hide();

		countdown(COUNTDOWN);
	}

	function show_dot() {

		console.log('++ show_dot()');
		// console.log(trigram_index);
		// console.log(trigram_pack.length);

		clearInterval(progressbar_timer);

		if(trigram_index < trigram_positions.length) {

			if (trigram_index % TRIALS_PER_ROUND == 0 && trigram_in_progress) { // take a break

				trigram_in_progress = false;

				settings['current_round'] = current_round;

				var rounds_left = parseInt(settings.rounds)-current_round;
				current_round++;
				
				// console.log('round done');
				if(rounds_left>1) {
					$('#rounds_left').html('You have ' + rounds_left + ' rounds left.');
				} else {
					$('#rounds_left').html('You have one round left. Almost there.');
				}

				log_partial_data();

				$('.break').show();

			} else { // continue

				trigram_in_progress = true;
				
				$('#red_dot').show(); 

				setTimeout(function() {
					show_trigram();
				}, RED_DOT_DURATION);
			}

		} else { // terminate experiment
			trigram_in_progress = false;
			// canvas.html('');
			// $('#progressbar').hide();
			$('.trigrams').hide();

			// finished
			console.log('finished');

			// log final results
			settings['current_round'] = current_round;
			log_final_results();

			$('.thanks').show();				

			console.log("RESULTS:");
			console.log(results);
			
		}
	}

	function show_trigram() {

		console.log('++ show_trigram()');

		var canvas = $('#text_canvas');

		$('#red_dot').hide();

		var trigram = trigram_pack[trigram_index];
		var pos = trigram_positions[trigram_index];

		console.log('trigram_index: ' + trigram_index);
		console.log('trigram: ' + trigram);
		console.log('pos: ' + pos);

		results['trigrams'].push(trigram);
		results['trigram_positions'].push(pos);
		
		// transform trigram according to position
		if(pos > 0) {
			trigram = new Array(pos+1).join('&nbsp;') + trigram;
		} else {
			trigram = trigram + new Array(Math.abs(pos)+1).join('&nbsp;');
		}
		
		canvas.html(trigram);
		// console.log('Trigram (' + trigram_index + ') ' + trigram + ' at position: ' + pos);
		start_time = Date.now();

		canvas.show();

		setTimeout(function() {
			show_nothing();
		}, settings.speed);
	}

	function show_nothing() {
		$('#text_canvas').hide(); 
		trigram_index++;
		setTimeout(function() {
			show_dot();
		}, BREAK_BETWEEN_TRIGRAMS);
	}

	function countdown(count) {

		console.log('++ countdown()');

		$('#parent_canvas').height('100vh');
		var node = $('#text_canvas');
		var txt = "Starting in <br />" + count;

		// console.log('-countdown(' + count + ')');

		if(count>0) {
			node.html(txt);
			node.show();

			setTimeout(function() {
				// console.log(count);
				countdown(--count);
			}, SECOND);

		} else {

			node.hide();
			show_dot();

		}

	}

	/* hide future steps */

	$(".demographics, .instructions, .break, .trigrams, .thanks, .alert, #red_dot").hide();

	/* SETUP */

	$(".setup button").live("click", function() {

		if($('#participant_id').val() != '') {
			settings['participant_id'] = $('#participant_id').val();
		} else {
			settings['participant_id'] = 'unspecified';
		}
		settings['rounds'] = $("#total_rounds").val();
		settings['speed'] = $("#speed").val();
		settings['trials'] = $("#trials").val();

		if (ENFORCE_USER_INPUT && (settings['participant_id'] == "unspecified")) {
		     // do something 
		     $(".alert").html('ERROR: Please provide a participant ID!');
		     $(".alert").show();

		} else {

			$(".setup").hide();
			$(".alert").hide();

			if(COLLECT_DEMOGRAPHICS) {
				$(".demographics").show();
			} else {
				$(".instructions").show();
			}

		}

		if(DEBUG) {
	     	console.log(settings);
	    }

	});

	/* step 1: Demographics */

	$(".demographics button").click(function() {

		settings['age'] = $('#age').val();
		settings['gender'] = $("input[name='gender']:checked").val();
		settings['profession'] = $('#profession').val();

		if (ENFORCE_USER_INPUT && (settings['age'] == "" || settings['gender'] == null || settings['profession'] == "")) {
		     // do something 
		     $(".alert").html('ERROR: some data has not been provided!');
		     $(".alert").show();

		} else {

		$(".demographics").hide();
		$(".instructions").show();

		}

		if(DEBUG) {
			console.log(settings);
		}
	});

	/* Navigation */

	$(".instructions button").live("click", function() {
		$(".alert").hide();

		$(".instructions").hide();
		$(".trigrams").show();

		init_test();

	});

	$(".break button").live("click", function() {
		$(".alert").hide();

		$(".break").hide();

		show_dot();

	});
});