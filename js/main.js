var cube = {
  location: 'house',
  happy: 0,
  leaves: 0,
  go: {},
  inventory: {}
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

function buildPrompt(value) {
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
    'You pet {{name}}{{^name}}the cube{{/name}}. It seems to like it.',
    { 'name': cube.name }
  );
  buildPrompt(value);
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
  buildPrompt(value);
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
    buildPrompt(value)
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
  buildPrompt(value);
  return value;
};

cube.car = function() {
  value = {};
  if (true) {  // TODO: make it possible to enter the car. Find keys?
    value.result = 'The car is locked.';
  }
  buildPrompt(value);
  return value;
};
cube.car.action = '<span class="word" data-word="car">enter</span> the car';

cube.mailbox = function() {
  value = {};
  value.result = '<p id="mailbox-0" style="display: none;">You slowly open the mailbox, holding your breath...</p>';
  value.result += '<p id="mailbox-1" style="display: none;">Could it be?</p>';
  value.result += '<p id="mailbox-2" style="display: none;">Is it there?</p>';
  value.result += '<div id="mailbox-3" style="display: none;"><p></p><p>...</p><p></p></div>';
  value.result += '<p id="mailbox-4" style="display: none;">IT IS! It arrived! Your 3D Creatures Association official competition and battle licensing letter! It\'s got the 3D Creatures Association logo right on the front!</p>';
  cube.inventory.letter = {
    name: 'a 3D Creatures Association licensing letter',
    quantity: 1,
    actions: ['<span class="word" data-word="open_letter">open</span> ' +
              'the letter'],
    hidden: true
  };

  value.after = function() {
    window.setTimeout($.proxy($('#mailbox-0').fadeIn, $('#mailbox-0')), 200);
    window.setTimeout($.proxy($('#mailbox-1').fadeIn, $('#mailbox-1')), 1200);
    window.setTimeout($.proxy($('#mailbox-2').fadeIn, $('#mailbox-2')), 2000);
    window.setTimeout($.proxy($('#mailbox-3').fadeIn, $('#mailbox-3')), 2800);
    window.setTimeout($.proxy($('#mailbox-4').fadeIn, $('#mailbox-4')), 4000);
    window.setTimeout(function() {
      $('.item[data-key="letter"]').fadeIn();
      cube.inventory.letter.hidden = false;
    }, 4000);
  }
  buildPrompt(value);
  return value;
}
cube.mailbox.action = '<span class="word" data-word="mailbox">check</span> the mail';

function animateGoDivs(callback) {
  callback = callback || $.noop;
  $('#result').animate({left: '100%'}, 200, function() {
    $('#description').animate({left: '100%'}, 200, function() {
      $('#prompt').animate({left: '-100%'}, 200, function() {
        $('#actions').animate({left: '100%'}, 200, function() {
          $('#directions').animate({left: '-100%'}, 200, function() {
            $('#inventory').animate({left: '100%'}, 200, function() {
              callback();
            });
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
            $('#inventory').animate({left: '0'}, 200, function() {
              callback();
            });
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

function doInventory() {
  $.each(cube.inventory, function(key, item) {
    var div = $(Mustache.render(
      '<div data-key="{{key}}" class="item"{{#hidden}} style="display:none"' +
        '{{/hidden}}><div class="name">You have {{name}}.</div>' +
        '<div class="actions"></div></div>', {
        key: key,
        name: item.name,
        hidden: item.hidden
    }));
    $('#inventory').append(div);
    $.each(item.actions, function(idx, action) {
      var span = $('<span class="action"></span>');
      span.append(action);
      $(div).children('.actions').append(span);
    });
  });
}

function setResultAndPrompt(value) {
  $('#result').html(value.result);
  $('#prompt').text(value.prompt);
  doInventory();
  if (value.after) {
    value.after();
  }
}

function doWord(word) {
  // Either the action function uses the setResultAndPrompt method as a callback
  // or it returns a value immediately which we pass to setResultAndPrompt.
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

  // The delay is calculated differently based on where you're coming from.
  var delay = (cube.go[location].delay[cube.location] ||
               cube.go[location].delay['default'] || 
               0);

  window.setTimeout(function() {
    animateGoDivs(function() {
      $('#result').html('');
      $('#description').html(cube.go[location].desc);
      clearActions();
      clearDirections();

      cube.go[location]();

      window.setTimeout(animateBackDivs(function() {
        cube.location = location;
      }), cube.go[location].pause);
    });
  }, delay);
}

cube.go.house = function() {
  appendAction(cube.pet.action);
  appendAction(cube.write.action);
  appendAction('go for a <span class="word">walk</span>');
};
cube.go.house.desc = '';
cube.go.house.delay = {};
cube.go.house.pause = 400;


cube.go.outside = function() { 
  appendAction(cube.pet.action);
  appendAction(cube.write.action);
  appendAction(cube.car.action);
  appendDirection('go back <span class="loc">inside</span>', 'house');
  appendDirection('go to the <span class="loc">sidewalk</span>');
};
cube.go.outside.desc = 'Outside it is an overcast fall day. There are a few straggling leaves in your yard, leftovers from raking. Your brother Lyle\'s <span class="object">car</span> is parked in the driveway. There is an expanse of inviting sidewalk leading from the gate in the fence.';
cube.go.outside.delay = {
  'house': 1600,
}
cube.go.outside.pause = 800;


cube.go.sidewalk = function() {
  appendAction(cube.pet.action);
  appendAction(cube.write.action);
  appendAction(cube.mailbox.action);
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
  buildPrompt(value);
  setResultAndPrompt(value);
};
cube.go.sidewalk.desc = 'From here on the sidewalk you can see most of your street. A passing poet might describe it as an idyllic street. For you, it\'s just where you live. There is a <span class="object">mailbox</span> just outside the gate to your yard.';
cube.go.sidewalk.delay = {
  'outside': 2600
}
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