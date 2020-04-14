var socket = io.connect();

socket.on('osc', function (data) {
  if (data.x == 1) {
    console.log("Heater ON")
  } else {
    console.log("Heater OFF")
  }
});

function heaterON() {
  console.log("heaterON() called")
  socket.emit('browser', {
    x: 1 || 0
  });
}

function heaterOFF() {
  console.log("heaterOFF() called")
  socket.emit('browser', {
    x: 2 || 0
  });
}

// disable subsequent clicks
function linkDisable(link) {
 link.onclick = function(event) {
    event.preventDefault();
 }
}  