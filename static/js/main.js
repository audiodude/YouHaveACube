var cube = {
  happy: 0,
  leaves: 0,
  go: {}
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

function leavesFor(view) {
  view.leaves = '';
  // TODO: Make it so that leaves accumulate and the cube gets more leaf covered.
  if (cube.leaves > 0) {
    view.leaves = 'leaf-covered';
  }
}

function addPrompt(value) {
  view = {};
  happinessFor(view);
  leashFor(view);
  nameFor(view);
  leavesFor(view);

  value.prompt = Mustache.render(
    'You have a {{happiness}}{{#happiness}} {{/happiness}}{{leaves}}{{#leaves}} {{/leaves}}cube{{#name}} {{/name}}{{&name}}{{#leash}} {{/leash}}{{leash}}.', view);
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
cube.pet.action = '<span class="word">pet</span> the cube';

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
cube.write.action = '<span class="word">write</span> on the cube';

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

cube.car = function() {
  value = {};
  if (true) {  // TODO: make it possible to enter the car. Find keys?
    value.result = 'The car is locked.';
  }
  addPrompt(value);
  return value;
}
cube.car.action = '<span class="word" data-word="car">enter</span> the car';

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

function setResultAndPrompt(value) {
  $('#result').text(value.result);
  $('#prompt').text(value.prompt);
}

function doWord(word) {
  var value = cube[word](setResultAndPrompt);
  if (value) {
    setResultAndPrompt(value);
  }
}

function moveTo(location) {
  if (cube.go[location].pre) {
    $('#result').html('');
    window.setTimeout(cube.go[location].pre, 200);
  }

  window.setTimeout(function() {
    animateGoDivs(function() {
      $('#result').html('');
      $('#description').html(cube.go[location].desc);
      clearActions();
      clearDirections();

      cube.go[location]();

      window.setTimeout(animateBackDivs, cube.go[location].pause);
    });
  }, cube.go[location].delay);
}

cube.go.house = function() {
  appendAction(cube.pet.action);
  appendAction(cube.write.action);
  appendAction('go for a <span class="word">walk</span>');
};
cube.go.house.desc = '';
cube.go.house.delay = 0;
cube.go.house.pause = 400;


cube.go.outside = function() { 
  appendAction(cube.pet.action);
  appendAction(cube.write.action);
  appendAction(cube.car.action);
  appendDirection('go back <span class="loc">inside</span>', 'house');
  appendDirection('go to the <span class="loc">sidewalk</span>');
};
cube.go.outside.desc = 'Outside it is an overcast fall day. There are a few straggling leaves in your yard, leftovers from raking. Your brother Lyle\'s <span class="object">car</span> is parked outside the yard\'s white picket fence. There is an expanse of inviting sidewalk leading from the gate in the fence.';
cube.go.outside.delay = 1600;
cube.go.outside.pause = 800;


cube.go.sidewalk = function() {
  appendAction(cube.pet.action);
  appendAction(cube.write.action);
  appendDirection('re-enter the <span class="loc">yard</span>', 'outside');
};
cube.go.sidewalk.pre = function() {
  cube.leaves += 5;
  value = {}
  value.result = Mustache.render(
    '{{name}}{{^name}}The cube{{/name}} tumbles along after you, leaves ' +
      'sticking to it.',
    { 'name': cube.name }
  );
  addPrompt(value);
  setResultAndPrompt(value);
};
cube.go.sidewalk.desc = 'From here on the sidewalk you can see most of your street. A passing poet might describe it as an idyllic street. For you, it\'s just where you live. There is a <span class="object">mailbox</span> just outside the gate to your yard.';
cube.go.sidewalk.delay = 2600;
cube.go.sidewalk.pause = 400;


function attachAction(i, action) {
  $(action).click(function(evt) {
    var word = null;
    var tar = $(evt.target);
    if (tar.hasClass('word')) {
      word = tar.data('word');
      if (!word) {
        word = tar.text();
      }
    } else {
      word = tar.children('.word').data('word');
      if (!word) {
        word = tar.children('.word').text();
      }
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
