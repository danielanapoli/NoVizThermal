const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

//arduino extras
//https://maker.pro/arduino/projects/learn-how-to-enable-communication-between-an-arduino-and-web-browser
const osc = require('osc-min');
const dgram = require('dgram');
let remote_osc_ip;
const PORT = 8080;

//middleware
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//forms
//https://flaviocopes.com/express-forms/
//https://www.tutorialspoint.com/expressjs/expressjs_form_data.htm

//serve static files
app.use(express.static(__dirname)); //current directory is root

io.on('connection', function(socket) {
  socket.on('browser', function(data) {
    if(! remote_osc_ip) {
      return;
    }
    var osc_msg = osc.toBuffer({
      oscType: 'message',
      address: '/socketio',
      args:[{ 
        type: 'integer',
        value: parseInt(data.x) || 0
      },
      {
        type: 'integer',
        value: parseInt(data.y) || 0
      }]
    });
    udp_server.send(osc_msg, 0, osc_msg.length, 9999, remote_osc_ip);
    console.log('Sent OSC message to %s:9999', remote_osc_ip);
  });
});
 
server.listen(PORT, err=>{ //app.listen(PORT) won't work
  if (err) console.log(err)
  else console.log(`=====Server listening on port ${PORT}======`)
});
