var cube = {
	happy: 0
};

function happinessFor(view) {
	view.happiness = '';
	if (cube.happy >= 100) {
		view.happiness = 'REALLY REALLY HAPPY';
	} else if (cube.happy >=80) {
		view.happiness = 'REALLY happy';
	} else if (cube.happy >= 50) {
		view.happiness = 'very happy';
  } else if (cube.happy >= 30) {
		view.happiness = 'happy';
	} else if (cube.happy < 0) {
		view.happiness = 'grumpy';
	}
}

function leashFor(view) {
	view.leash = '';
  if (cube.on_leash) {
		view.leash = 'on a leash';
  }	
}

function nameFor(view) {
  view.name = '';
	if (cube.name) {
		view.name = 'named "' + cube.name + '"';
  }
}

function addPrompt(value) {
	view = {};
	happinessFor(view);
	leashFor(view);
	nameFor(view);

	value.prompt = Mustache.render(
		'You have a {{happiness}}{{#happiness}} {{/happiness}}cube{{#name}} {{/name}}{{&name}}{{#leash}} {{/leash}}{{leash}}.', view);
}

cube.pet = function() {
	cube.happy += 10;

	value = {};
  value.result = Mustache.render(
		'You pet {{name}}{{^name}}the cube{{/name}}. It seems happy.',
		{ 'name': cube.name }
	);
	addPrompt(value);
	return value;
};

cube.leash = function() {
	var value = {};
	if (cube.on_leash) {
		value.result = Mustache.render(
			'{{name}}{{^name}}Your cube{{/name}} is already on a leash.',
			{ 'name': cube.name }
		);
	} else {
		cube.on_leash = true;
		cube.happy -= 25;
		value.result = 'You put your cube on a leash. It doesn\'t seem happy ' + 
			'about it.';
		$('.word:contains("walk")').parent().fadeIn();
	}
	addPrompt(value);
	return value;
};

cube.NAME_ADJ = [
	'precious', 'darling', 'cutesy', 'cute', 'radical', 'hip', 'happenin', 'cool', 
	'neat', 'gnarly', 'rockin', 'sweet'
];

cube.write = function(callback) {
	function processWriting() {
		cube.name = $('#cube_name').val();
		var name_adj = cube.NAME_ADJ[Math.floor(Math.random()*cube.NAME_ADJ.length)]
		value = {
			result: 'You named your cube "' + cube.name + '". What a ' + name_adj + 
				' name!'
		}
		addPrompt(value)
		callback(value)
	}

  $('#result').html('You write <input id="cube_name" maxlength="12"> on the cube');
	$('#cube_name').focus();
	$('#cube_name').keyup(function(evt){
    if(evt.keyCode == 13){
			processWriting();
    }
  });
};

cube.walk = function() {
	value = { 'result': 'All the doors and windows are barred shut, sorry!' }
	addPrompt(value);
	return value;
}

function doWord(word) {
	function callback(value) {
		$('#result').text(value.result);
		$('#prompt').text(value.prompt);
	}

	var value = cube[word](callback);
	if (value) {
		callback(value);
  }
}

function parseActions() {
	$('#actions').children('.action').each(function(i, action) {
		$(action).click(function(evt) {
			var word = null;
			var tar = $(evt.target);
			if (tar.hasClass('word')) {
				word = tar.text();
			} else {
				word = tar.children('.word').text();
			}
			if (!word) {
				console.error('Could not get word: ', tar);
				return;
			}
			$('#result').text('');
			window.setTimeout(function() { doWord(word); }, 200);
		});
	});
}
	
function init() {
  parseActions();
}

$(document).ready(init)
