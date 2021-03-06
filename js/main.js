// Generated by CoffeeScript 1.7.1

/*
This file is the source code for the game. It is compiled to JavaScript using
the command:

$ coffee -c js/main.coffee

You can optionally add a -w flag to that command so that the .coffee file is
'watched' and automatically recompiled when it changes. This is quite useful
in development.

Although the generated main.js file is checked into source control, it should
not be edited, because all edits will be overwritten by the coffeescript
compilation step. In fact, the file is only checked into source control because
the project is deployed to Github Pages via Jekyll, so the file needs to be
in the tree.
 */

(function() {
  var animateBackDivs, animateGoDivs, appendAction, appendDirection, attachAction, attachDirection, buildPrompt, clearActions, clearDirections, cube, doInventory, doWord, happinessFor, init, leashFor, leavesFor, moveTo, nameFor, removeAction, setResultAndPrompt;

  cube = {
    location: "house",
    happy: 0,
    leaves: 0,
    go: {},
    inventory: {}
  };

  cube.pet = function() {
    var value;
    cube.happy += 10;
    value = {};
    value.result = Mustache.render('You pet {{name}}{{^name}}the cube{{/name}}. It seems to like it.', cube);
    return buildPrompt(value);
  };

  cube.pet.action = '<span class="word">pet</span> the cube';

  cube.leash = function() {
    var value;
    value = {};
    if (cube.on_leash) {
      value.result = Mustache.render('{{name}}{{^name}}Your cube{{/name}} is already on a leash.', cube);
    } else {
      cube.on_leash = true;
      cube.happy -= 25;
      value.result = 'You put your cube on a leash. It doesn\'t seem happy about it.';
      appendAction('go for a <span class="word">walk</span>');
    }
    return buildPrompt(value);
  };

  cube.NAME_ADJ = ["precious", "darling", "cutesy", "cute", "radical", "hip", "happenin'", "cool", "neat", "gnarly", "rockin", "sweet", "boring"];

  cube.write = function(callback) {
    var processWriting;
    processWriting = function() {
      var name_adj, value;
      cube.name = $("#cube_name").val();
      name_adj = cube.NAME_ADJ[Math.floor(Math.random() * cube.NAME_ADJ.length)];
      value = {
        result: "You named your cube \"" + cube.name + "\". What a " + name_adj + " name!"
      };
      return callback(buildPrompt(value));
    };
    $('#result').html('You write <input id="cube_name" maxlength="12"> on the cube');
    $("#cube_name").focus();
    return $("#cube_name").keyup(function(evt) {
      if (evt.keyCode === 13) {
        return processWriting();
      }
    });
  };

  cube.write.action = '<span class="word">write</span> on the cube';

  cube.walk = function() {
    var value;
    value = {};
    if (cube.happy < 0) {
      value.result = Mustache.render('{{name}}{{^name}}Your cube{{/name}} is feeling too grumpy to go for a walk.', cube);
    } else {
      value.result = Mustache.render('You grab your coat and head out the door with {{name}}{{^name}}your cube{{/name}}.', cube);
      moveTo('outside');
    }
    return buildPrompt(value);
  };

  cube.car = function() {
    var value;
    value = {};
    value.result = 'The car is locked.';
    return buildPrompt(value);
  };

  cube.car.action = '<span class="word" data-word="car">enter</span> the car';

  cube.mailbox = function() {
    var value;
    value = {};
    value.result = "<p id=\"mailbox-0\" style=\"display: none;\">\n  You slowly open the mailbox, holding your breath...\n</p>\n<p id=\"mailbox-1\" style=\"display: none;\">Could it be?</p>\n<p id=\"mailbox-2\" style=\"display: none;\">Is it there?</p>\n<div id=\"mailbox-3\" style=\"display: none;\"><p></p><p>...</p><p></p></div>\n<p id=\"mailbox-4\" style=\"display: none;\">\n  IT IS! It arrived! Your 3D Creatures Association official competition and\n  battle licensing letter! It's got the 3D Creatures Association logo right\n  on the front!\n</p>";
    cube.inventory.letter = {
      name: "a 3D Creatures Association licensing letter",
      quantity: 1,
      actions: ['<span class="word" data-word="open_letter">open</span> the letter'],
      hidden: true
    };
    value.after = function() {
      window.setTimeout($.proxy($("#mailbox-0").fadeIn, $("#mailbox-0")), 200);
      window.setTimeout($.proxy($("#mailbox-1").fadeIn, $("#mailbox-1")), 1200);
      window.setTimeout($.proxy($("#mailbox-2").fadeIn, $("#mailbox-2")), 2000);
      window.setTimeout($.proxy($("#mailbox-3").fadeIn, $("#mailbox-3")), 2800);
      window.setTimeout($.proxy($("#mailbox-4").fadeIn, $("#mailbox-4")), 4000);
      return window.setTimeout((function() {
        $(".item[data-key=\"letter\"]").fadeIn();
        return cube.inventory.letter.hidden = false;
      }), 4000);
    };
    return buildPrompt(value);
  };

  cube.mailbox.action = '<span class="word" data-word="mailbox">check</span> the mail';

  cube.open_letter = function() {
    var value;
    value = {};
    value.result = "This is the contents of the letter. You're reading it! Congratulations!";
    return buildPrompt(value);
  };

  cube.go.house = function() {
    appendAction(cube.pet.action);
    appendAction(cube.write.action);
    return appendAction('go for a <span class="word">walk</span>');
  };

  cube.go.house.desc = '';

  cube.go.house.delay = {};

  cube.go.house.pause = 400;

  cube.go.outside = function() {
    appendAction(cube.pet.action);
    appendAction(cube.write.action);
    appendAction(cube.car.action);
    appendDirection('go back <span class="loc">inside</span>', 'house');
    return appendDirection('go to the <span class="loc">sidewalk</span>');
  };

  cube.go.outside.desc = 'Outside it is an overcast fall day. There are a few straggling leaves in your yard, leftovers from raking. Your brother Lyle\'s <span class="object">car</span> is parked in the driveway. There is an expanse of inviting sidewalk leading from the gate in the fence.';

  cube.go.outside.delay = {
    house: 1600
  };

  cube.go.outside.pause = 800;

  cube.go.sidewalk = function() {
    appendAction(cube.pet.action);
    appendAction(cube.write.action);
    appendAction(cube.mailbox.action);
    return appendDirection('re-enter the <span class="loc">yard</span>', 'outside');
  };

  cube.go.sidewalk.desc = 'From here on the sidewalk you can see most of your street. A passing poet might describe it as an idyllic street. For you, it\'s just where you live. There is a <span class="object">mailbox</span> just outside the gate to your yard.';

  cube.go.sidewalk.delay = {
    outside: 2600
  };

  cube.go.sidewalk.pause = 400;

  cube.go.sidewalk.pre = function() {
    var value;
    cube.leaves += 5;
    value = {};
    value.result = Mustache.render('{{name}}{{^name}}The cube{{/name}} tumbles along after you, leaves sticking to it.', {
      name: cube.name
    });
    buildPrompt(value);
    return setResultAndPrompt(value);
  };

  happinessFor = function(view) {
    view.happiness = '';
    if (cube.happy >= 100) {
      return view.happiness = 'REALLY REALLY HAPPY';
    } else if (cube.happy >= 80) {
      return view.happiness = 'REALLY happy';
    } else if (cube.happy >= 50) {
      return view.happiness = 'very happy';
    } else if (cube.happy >= 30) {
      return view.happiness = 'happy';
    } else {
      if (cube.happy < 0) {
        return view.happiness = 'grumpy';
      }
    }
  };

  leashFor = function(view) {
    view.leash = '';
    if (cube.on_leash) {
      return view.leash = 'on a leash';
    }
  };

  nameFor = function(view) {
    view.name = '';
    if (cube.name) {
      return view.name = "named \"" + cube.name + "\"";
    }
  };

  leavesFor = function(view) {
    view.leaves = "";
    if (cube.leaves > 0) {
      return view.leaves = "leaf-covered";
    }
  };

  buildPrompt = function(value) {
    var view;
    view = {};
    happinessFor(view);
    leashFor(view);
    nameFor(view);
    leavesFor(view);
    value.prompt = Mustache.render('You have a {{happiness}}{{#happiness}} {{/happiness}}{{leaves}}{{#leaves}} {{/leaves}}cube{{#name}} {{/name}}{{&name}}{{#leash}} {{/leash}}{{leash}}.', view);
    return value;
  };

  animateGoDivs = function(callback) {
    callback = callback || $.noop;
    return $("#result").animate({
      left: "100%"
    }, 200, function() {
      return $("#description").animate({
        left: "100%"
      }, 200, function() {
        return $("#prompt").animate({
          left: "-100%"
        }, 200, function() {
          return $("#actions").animate({
            left: "100%"
          }, 200, function() {
            return $("#directions").animate({
              left: "-100%"
            }, 200, function() {
              return $("#inventory").animate({
                left: "100%"
              }, 200, function() {
                return callback();
              });
            });
          });
        });
      });
    });
  };

  animateBackDivs = function(callback) {
    callback = callback || $.noop;
    return $("#result").animate({
      left: "0"
    }, 200, function() {
      return $("#description").animate({
        left: "0"
      }, 200, function() {
        return $("#prompt").animate({
          left: "0"
        }, 200, function() {
          return $("#actions").animate({
            left: "0"
          }, 200, function() {
            return $("#directions").animate({
              left: "0"
            }, 200, function() {
              return $("#inventory").animate({
                left: "0"
              }, 200, function() {
                return callback();
              });
            });
          });
        });
      });
    });
  };

  appendAction = function(action, container) {
    if (container == null) {
      container = "actions";
    }
    action = $("<span class=\"action\" style=\"display: none\">" + action + "</span>");
    attachAction(null, action);
    $("#" + container).append(action);
    return action.fadeIn();
  };

  removeAction = function(word, container) {
    if (container == null) {
      container = "actions";
    }
    return $("#" + container + (" .action:contains(\"" + word + "\")")).fadeOut({
      complete: function() {
        return this.remove();
      }
    });
  };

  clearActions = function(container) {
    if (container == null) {
      container = "actions";
    }
    return $('#' + container).html('');
  };

  appendDirection = function(direction, loc_name) {
    direction = $("<span class=\"direction\" style=\"display: none\">" + direction + " </span>");
    attachDirection(null, direction, loc_name);
    $("#directions").append(direction);
    return direction.fadeIn();
  };

  clearDirections = function() {
    $("#directions").html("");
  };

  doInventory = function() {
    $("#inventory").html('');
    return $.each(cube.inventory, function(key, item) {
      var div;
      div = $(Mustache.render('<div data-key="{{key}}" class="item"{{#hidden}} style="display:none" {{/hidden}}> <div class="name">You have {{name}}.</div> <div id="{{key}}" class="actions"></div> </div>', {
        key: key,
        name: item.name,
        hidden: item.hidden
      }));
      $("#inventory").append(div);
      return $.each(item.actions, function(idx, action) {
        var span;
        span = $("<span class=\"action\">" + action + "</span>");
        return appendAction(action, key);
      });
    });
  };

  setResultAndPrompt = function(value) {
    $('#result').html(value.result);
    $('#prompt').text(value.prompt);
    doInventory();
    if (value.after) {
      return value.after();
    }
  };

  doWord = function(word) {
    var value;
    value = cube[word](setResultAndPrompt);
    if (value) {
      return setResultAndPrompt(value);
    }
  };

  moveTo = function(location) {
    var delay;
    if (cube.go[location].pre) {
      $("#result").html('');
      window.setTimeout(cube.go[location].pre, 200);
    }
    delay = cube.go[location].delay[cube.location] || cube.go[location].delay["default"] || 0;
    window.setTimeout((function() {
      return animateGoDivs(function() {
        $("#result").html('');
        $("#description").html(cube.go[location].desc);
        clearActions();
        clearDirections();
        cube.go[location]();
        return window.setTimeout((function() {
          return animateBackDivs(function() {
            return cube.location = location;
          });
        }), cube.go[location].pause);
      });
    }), delay);
  };

  attachAction = function(i, action) {
    return $(action).click(function(evt) {
      var tar, word;
      word = null;
      tar = $(evt.target);
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
      return window.setTimeout((function() {
        return doWord(word);
      }), 200);
    });
  };

  attachDirection = function(i, direction, location) {
    return $(direction).click(function(evt) {
      var tar;
      if (!location) {
        tar = $(evt.target);
        if (tar.hasClass("loc")) {
          location = tar.text();
        } else {
          location = tar.children(".loc").text();
        }
        if (!location) {
          console.error('Could not get location: ', tar);
          return;
        }
      }
      return moveTo(location);
    });
  };

  init = function() {
    return $("#actions").children(".action").each(attachAction);
  };

  $(init);

}).call(this);
