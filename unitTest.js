/*
Copied snippets of code from https://github.com/orbotix/sphero.js/tree/master/examples
in order to test the general idea of how I'm going to be controlling my Sphero.
*/

"use strict";
var keypress = require("keypress");
var sphero = require("sphero");
var orb = sphero("com4");

orb.connect(function() {
  // sets color to the provided r/g/b values
  orb.getColor(function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("Color is:", data.color);
    }
  });
  
});

orb.connect(listen);

function handle(ch, key) {
  var stop = orb.roll.bind(orb, 0, 0),
      roll = orb.roll.bind(orb, 60);

  if (key.ctrl && key.name === "c") {
    process.stdin.pause();
    process.exit();
  }

  if (key.name === "e") {
    orb.startCalibration();
  }

  if (key.name === "q") {
    orb.finishCalibration();
  }

  if (key.name === "up") {
    roll(0);
  }

  if (key.name === "down") {
    roll(180);
  }

  if (key.name === "left") {
    roll(270);
  }

  if (key.name === "right") {
    roll(90);
  }

  if (key.name === "space") {
    stop();
  }
}

function listen() {
  keypress(process.stdin);
  process.stdin.on("keypress", handle);

  console.log("starting to listen for arrow key presses");

  process.stdin.setRawMode(true);
  process.stdin.resume();
}

orb.connect(function() {
  // sets color to the provided r/g/b values
  orb.color({ red: 255, green: 0, blue: 255 });

  setTimeout(function() {
    console.log("color 1");
    // sets color to the provided hex value
    orb.color(0xff0000);
  }, 1000);

  setTimeout(function() {
    console.log("color 2");
    // hex numbers can also be passed in strings
    orb.color("00ff00");
  }, 2000);

  setTimeout(function() {
    console.log("color 3");
    // sets color to the provided color name
    orb.color("magenta");
  }, 3000);
});

orb.connect(function() {
  console.log("::START CALIBRATION::");
  orb.startCalibration();
  setTimeout(function() {
    console.log("::FINISH CALIBRATION::");
    orb.finishCalibration();
  }, 5000);
});

orb.connect(function() {
  var max = 0,
      updating = false;

  // enable streaming of velocity data
  orb.setDataStreaming({
    mask1: 0x00000000,
    mask2: 0x01800000,
    n: 40,
    m: 1,
    pcnt: 0
  });

  orb.on("dataStreaming", function(data) {
    if (updating) { return; }

    var x = Math.abs(data.xVelocity.value),
        y = Math.abs(data.yVelocity.value);

    var localmax = Math.max(x, y);

    if (localmax > max) { max = localmax; }
  });

  function update() {
    updating = true;

    if (max < 10) {
      orb.color("white");
    } else if (max < 100) {
      orb.color("lightyellow");
    } else if (max < 150) {
      orb.color("yellow");
    } else if (max < 250) {
      orb.color("orange");
    } else if (max < 350) {
      orb.color("orangered");
    } else if (max < 450) {
      orb.color("red");
    } else {
      orb.color("darkred");
    }

    max = 0;
    updating = false;
  }

  setInterval(update, 600);
});
