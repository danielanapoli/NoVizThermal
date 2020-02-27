var socket = io.connect();


socket.on('osc', function (data) {
    if (data.x == 1) {
    document.getElementById("output").innerHTML = "LED ON";
    }
    if (data.x == 2) {
    document.getElementById("output").innerHTML = "LED OFF";
    }
});


function myFunction() {
    socket.emit('browser', {
    x: 1 || 0
    });
}


function myFunction1() {
    socket.emit('browser', {
    x: 2 || 0
    });
}
  