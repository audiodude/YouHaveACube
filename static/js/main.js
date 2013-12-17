var cube = {
  happy: 0,
  go: {}
};

cube.DESCS = {
  'house': '',
  'outside': 'Outside it is an overcast fall day. There are a few straggling leaves in your yard, leftovers from raking. Your brother Lyle\'s <span class="object">car</span> is parked outside the yard\'s white picket fence. There is an expanse of inviting sidewalk leading from the gate in the fence.'
}


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
    appendAction('go for a <span class="word">walk</span>');
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
  value = {};
  if (cube.happy < 0) {
    value.result = Mustache.render(
      '{{name}}{{^name}}Your cube{{/name}} is feeling too grumpy to go for a '+
        'walk.',
      { 'name': cube.name }
    );
  } else {
    value.result = Mustache.render(
      'You grab your coat and head out the door with ' + 
        '{{name}}{{^name}}your cube{{/name}}.',
      { 'name': cube.name }
    );
    moveTo('outside');
  }
  addPrompt(value);
  return value;
}

function animateGoDivs(callback) {
  callback = callback || $.noop;
  $('#result').animate({left: '100%'}, 200, function() {
    $('#description').animate({left: '100%'}, 200, function() {
      $('#prompt').animate({left: '-100%'}, 200, function() {
        $('#actions').animate({left: '100%'}, 200, function() {
          $('#directions').animate({left: '-100%'}, 200, function() {
            callback();
          });
        });
      });
    });
  });
}

function animateBackDivs(callback) {
  callback = callback || $.noop;
  $('#result').animate({left: '0'}, 200, function() {
    $('#description').animate({left: '0'}, 200, function() {
      $('#prompt').animate({left: '0'}, 200, function() {
        $('#actions').animate({left: '0'}, 200, function() {
          $('#directions').animate({left: '0'}, 200, function() {
            callback();
          });
        });
      });
    });
  });
}

function appendAction(action) {
  action = $('<span class="action" style="display: none">' + action + '</span>');
  attachAction(undefined, action);
  $('#actions').append(action);
  action.fadeIn();
}

function removeAction(word) {
  $('#actions .action:contains("' + word + '")').fadeOut({
    complete: function() { this.remove(); }
  });
}

function clearActions() {
  $('#actions').html('');
}

function appendDirection(direction, loc_name) {
  direction = $('<span class="direction" style="display: none">' + direction +
                '</span>');
  attachDirection(undefined, direction, loc_name);
  $('#directions').append(direction);
  direction.fadeIn();
}

function clearDirections() {
  $('#directions').html('');
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

function moveTo(location) {
  window.setTimeout(function() {
    animateGoDivs(cube.go[location].bind(undefined, animateBackDivs))
  }, 1600);
}

cube.go.house = function(callback) {
  $('#result').html('');
  $('#description').html(cube.DESCS['house']);

  clearActions();
  appendAction('<span class="word">pet</span> the cube');
  appendAction('<span class="word">write</span> on the cube');
  appendAction('go for a <span class="word">walk</span>');
 
  clearDirections();

  window.setTimeout(callback, 800);
}

cube.go.outside = function(callback) {
  $('#result').html('');
  $('#description').html(cube.DESCS['outside']);
 
  clearActions();
  appendAction('<span class="word">pet</span> the cube');
  appendAction('<span class="word">write</span> on the cube');

  clearDirections();
  appendDirection('go back <span class="loc">inside</span>', 'house');
  appendDirection('go to the <span class="loc">sidewalk</span>');

  window.setTimeout(callback, 800);
}

function attachAction(i, action) {
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
}

function attachDirection(i, direction, location) {
  $(direction).click(function(evt) {
    if (!location) {
      var tar = $(evt.target);
      if (tar.hasClass('loc')) {
        location = tar.text();
      } else {
        location = tar.children('.loc').text();
      }
      if (!location) {
        console.error('Could not get location: ', tar);
        return;
      }
    }
    moveTo(location);
  });
}

function init() {
  $('#actions').children('.action').each(attachAction);
}

$(document).ready(init)
