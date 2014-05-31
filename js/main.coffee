cube =
  location: "house"
  happy: 0
  leaves: 0
  go: {}
  inventory: {}


cube.pet = ->
  cube.happy += 10
  value = {}
  value.result = Mustache.render(
    'You pet {{name}}{{^name}}the cube{{/name}}. It seems to like it.', cube)
  buildPrompt(value)
cube.pet.action = '<span class="word">pet</span> the cube'

cube.leash = ->
  value = {}
  if cube.on_leash
    value.result = Mustache.render(
      '{{name}}{{^name}}Your cube{{/name}} is already on a leash.', cube)
  else
    cube.on_leash = true
    cube.happy -= 25
    value.result = 'You put your cube on a leash. It doesn\'t seem happy
                    about it.'
    appendAction('go for a <span class="word">walk</span>')
  buildPrompt(value)

cube.NAME_ADJ = [
  "precious", "darling", "cutesy", "cute", "radical", "hip", "happenin'",
  "cool", "neat", "gnarly", "rockin", "sweet", "boring"
]

cube.write = (callback) ->
  processWriting = ->
    cube.name = $("#cube_name").val()
    name_adj = cube.NAME_ADJ[Math.floor(Math.random() * cube.NAME_ADJ.length)]
    value = result: "You named your cube \"#{cube.name}\".
                     What a #{name_adj} name!"
    callback(buildPrompt(value))
    
  $('#result').html 'You write <input id="cube_name" maxlength="12">
                     on the cube'
  $("#cube_name").focus()
  $("#cube_name").keyup (evt) ->
    processWriting() if evt.keyCode is 13
cube.write.action = '<span class="word">write</span> on the cube'

cube.walk = ->
  value = {}
  if cube.happy < 0
    value.result = Mustache.render(
      '{{name}}{{^name}}Your cube{{/name}} is feeling too grumpy to go for a
       walk.', cube)
  else
    value.result = Mustache.render(
      'You grab your coat and head out the door with
       {{name}}{{^name}}your cube{{/name}}.', cube)
    moveTo('outside')
  buildPrompt(value)

cube.car = ->
  value = {}
  value.result = 'The car is locked.'
  buildPrompt(value)
cube.car.action = '<span class="word" data-word="car">enter</span> the car'

cube.mailbox = ->
  value = {}
  value.result = """
    <p id="mailbox-0" style="display: none;">
      You slowly open the mailbox, holding your breath...
    </p>
    <p id="mailbox-1" style="display: none;">Could it be?</p>
    <p id="mailbox-2" style="display: none;">Is it there?</p>
    <div id="mailbox-3" style="display: none;"><p></p><p>...</p><p></p></div>
    <p id="mailbox-4" style="display: none;">
      IT IS! It arrived! Your 3D Creatures Association official competition and
      battle licensing letter! It's got the 3D Creatures Association logo right
      on the front!
    </p>
  """
  cube.inventory.letter =
    name: "a 3D Creatures Association licensing letter"
    quantity: 1
    actions: [
      '<span class="word" data-word="open_letter">open</span> the letter'
    ]
    hidden: true

  value.after = ->
    window.setTimeout($.proxy($("#mailbox-0").fadeIn, $("#mailbox-0")), 200)
    window.setTimeout($.proxy($("#mailbox-1").fadeIn, $("#mailbox-1")), 1200)
    window.setTimeout($.proxy($("#mailbox-2").fadeIn, $("#mailbox-2")), 2000)
    window.setTimeout($.proxy($("#mailbox-3").fadeIn, $("#mailbox-3")), 2800)
    window.setTimeout($.proxy($("#mailbox-4").fadeIn, $("#mailbox-4")), 4000)
    window.setTimeout((->
      $(".item[data-key=\"letter\"]").fadeIn()
      cube.inventory.letter.hidden = false
    ), 4000)
  buildPrompt(value)
cube.mailbox.action = '<span class="word" data-word="mailbox">check</span>
                       the mail'

cube.go.house = ->
  appendAction(cube.pet.action)
  appendAction(cube.write.action)
  appendAction('go for a <span class="word">walk</span>')
cube.go.house.desc = ''
cube.go.house.delay = {}
cube.go.house.pause = 400

cube.go.outside = ->
  appendAction cube.pet.action
  appendAction cube.write.action
  appendAction cube.car.action
  appendDirection('go back <span class="loc">inside</span>', 'house')
  appendDirection('go to the <span class="loc">sidewalk</span>')
cube.go.outside.desc = '
  Outside it is an overcast fall day. There are a few straggling leaves in your
  yard, leftovers from raking. Your brother Lyle\'s
  <span class="object">car</span> is parked in the driveway. There is an
  expanse of inviting sidewalk leading from the gate in the fence.
'
cube.go.outside.delay = house: 1600
cube.go.outside.pause = 800

cube.go.sidewalk = ->
  appendAction(cube.pet.action)
  appendAction(cube.write.action)
  appendAction(cube.mailbox.action)
  appendDirection('re-enter the <span class="loc">yard</span>', 'outside')
cube.go.sidewalk.desc = '
  From here on the sidewalk you can see most of your street. A passing poet
  might describe it as an idyllic street. For you, it\'s just where you live.
  There is a <span class="object">mailbox</span> just outside the gate to your
  yard.
'
cube.go.sidewalk.delay = outside: 2600
cube.go.sidewalk.pause = 400
cube.go.sidewalk.pre = ->
  cube.leaves += 5
  value = {}
  value.result = Mustache.render(
    '{{name}}{{^name}}The cube{{/name}} tumbles along after you, leaves sticking
     to it.',
    name: cube.name
  )
  buildPrompt(value)
  setResultAndPrompt(value)

happinessFor = (view) ->
  view.happiness = ''
  if cube.happy >= 100
    view.happiness = 'REALLY REALLY HAPPY'
  else if cube.happy >= 80
    view.happiness = 'REALLY happy'
  else if cube.happy >= 50
    view.happiness = 'very happy'
  else if cube.happy >= 30
    view.happiness = 'happy'
  else view.happiness = 'grumpy' if cube.happy < 0

leashFor = (view) ->
  view.leash = ''
  view.leash = 'on a leash' if cube.on_leash

nameFor = (view) ->
  view.name = ''
  view.name = "named \"#{cube.name}\"" if cube.name

leavesFor = (view) ->
  view.leaves = ""
  
  # TODO: Make it so that leaves accumulate and the cube gets more leaf covered.
  view.leaves = "leaf-covered" if cube.leaves > 0

buildPrompt = (value) ->
  view = {}
  happinessFor(view)
  leashFor(view)
  nameFor(view)
  leavesFor(view)
  value.prompt = Mustache.render('
    You have a {{happiness}}{{#happiness}} {{/happiness}}
    {{leaves}}{{#leaves}} {{/leaves}}
    cube{{#name}} {{/name}}{{&name}}
    {{#leash}} {{/leash}}{{leash}}.
  ', view)
  value

animateGoDivs = (callback) ->
  callback = callback or $.noop
  $("#result").animate
    left: "100%"
  , 200, ->
    $("#description").animate
      left: "100%"
    , 200, ->
      $("#prompt").animate
        left: "-100%"
      , 200, ->
        $("#actions").animate
          left: "100%"
        , 200, ->
          $("#directions").animate
            left: "-100%"
          , 200, ->
            $("#inventory").animate
              left: "100%"
            , 200, ->
              callback()

animateBackDivs = (callback) ->
  callback = callback or $.noop
  $("#result").animate
    left: "0"
  , 200, ->
    $("#description").animate
      left: "0"
    , 200, ->
      $("#prompt").animate
        left: "0"
      , 200, ->
        $("#actions").animate
          left: "0"
        , 200, ->
          $("#directions").animate
            left: "0"
          , 200, ->
            $("#inventory").animate
              left: "0"
            , 200, ->
              callback()

appendAction = (action) ->
  action = $("<span class=\"action\" style=\"display: none\">#{action}</span>")
  attachAction(null, action)
  $("#actions").append(action)
  action.fadeIn()

removeAction = (word) ->
  $("#actions .action:contains(\"#{word}\")").fadeOut(complete: ->
      @remove())

clearActions = ->
  $('#actions').html('')

appendDirection = (direction, loc_name) ->
  direction = $("<span class=\"direction\" style=\"display: none\">#{direction}
                 </span>")
  attachDirection(null, direction, loc_name)
  $("#directions").append(direction)
  direction.fadeIn()

clearDirections = ->
  $("#directions").html ""
  return

doInventory = ->
  $.each(cube.inventory, (key, item) ->
    div = $(Mustache.render('
      <div data-key="{{key}}" class="item"{{#hidden}} style="display:none"
      {{/hidden}}>
        <div class="name">You have {{name}}.</div>
        <div class="actions"></div>
      </div>
      ',
      key: key
      name: item.name
      hidden: item.hidden
    ))
    $("#inventory").append(div)
    $.each(item.actions, (idx, action) ->
      span = $("<span class=\"action\">#{action}</span>")
      $(div).children(".actions").append(span)
    )
  )

setResultAndPrompt = (value) ->
  $('#result').html(value.result)
  $('#prompt').text(value.prompt)
  doInventory()
  value.after() if value.after

doWord = (word) ->
  # Either the action function uses the setResultAndPrompt method as a callback
  # or it returns a value immediately which we pass to setResultAndPrompt.
  value = cube[word](setResultAndPrompt)
  setResultAndPrompt value if value

moveTo = (location) ->
  if cube.go[location].pre
    $("#result").html('')
    window.setTimeout(cube.go[location].pre, 200)
  
  # The delay is calculated differently based on where you're coming from.
  delay = (cube.go[location].delay[cube.location] or
           cube.go[location].delay["default"] or
           0)
  window.setTimeout((->
    animateGoDivs ->
      $("#result").html('')
      $("#description").html(cube.go[location].desc)
      clearActions()
      clearDirections()
      cube.go[location]()
      window.setTimeout((->
        animateBackDivs(->
          cube.location = location
        )
      ), cube.go[location].pause)
  ), delay)
  return

attachAction = (i, action) ->
  $(action).click((evt) ->
    word = null
    tar = $(evt.target)
    if tar.hasClass('word')
      word = tar.data('word')
      word = tar.text() unless word
    else
      word = tar.children('.word').data('word')
      word = tar.children('.word').text() unless word
    unless word
      console.error('Could not get word: ', tar)
      return
    $('#result').text('')
    window.setTimeout((->
      doWord(word)
    ), 200)
  )

attachDirection = (i, direction, location) ->
  $(direction).click((evt) ->
    unless location
      tar = $(evt.target)
      if tar.hasClass("loc")
        location = tar.text()
      else
        location = tar.children(".loc").text()
      unless location
        console.error('Could not get location: ', tar)
        return
    moveTo(location)
  )
  
init = ->
  $("#actions").children(".action").each(attachAction)

$(init)
