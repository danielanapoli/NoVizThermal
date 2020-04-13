var socket = io.connect();

socket.on('osc', function (data) {
    if (data.x == 1) {
    console.log("HEAT ON");
    }
    else {
    console.log("HEAT OFF");
    }
});

function heatOn(risk){
    console.log(`heatON() being called.`)   //troubleshooting
    if(risk == 1){
        socket.emit('browser', {x: 1 || 0}) //turn on heater
    } 
    else {
        socket.emit('browser', {x: 2 || 0}) //turn off heater
    }
}

function linkDisable(link) {
    console.log(`linkDisable() being called.`) //troubleshooting
    link.onclick = function(event) {
        event.preventDefault();
    }
} 