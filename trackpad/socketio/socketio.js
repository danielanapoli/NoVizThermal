const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const ObjectsToCSV = require('objects-to-csv'); //export form data to csv

//arduino extras
//https://maker.pro/arduino/projects/learn-how-to-enable-communication-between-an-arduino-and-web-browser
const osc = require('osc-min');
const dgram = require('dgram');
let remote_osc_ip;
const PORT = 8080;

//serve static files
app.use(express.static(__dirname)); //current directory is root

//middleware
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//handle form data
const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // to support JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies


app.post('/handler', function(req, res){
  if(!req.body){
    console.log("Something went wrong with form.")
    res.sendFile(__dirname + '/error.html');
  }
  else{
    console.log(req.body); //res.send(req.body.optradio);
    let otc = new ObjectsToCSV({data, append: true});
    let csv = otc.getCSV();
    res.sendFile(__dirname + '/thankyou.html');
  }
})

//socket comms
var io = socketio(http_server);
 
var udp_server = dgram.createSocket('udp4', function(msg, rinfo) {
 
  var osc_message;
  try {
    osc_message = osc.fromBuffer(msg);
  } catch(err) {
    return console.log('Could not decode OSC message');
  }
  if(osc_message.address != '/socketio') {
    return console.log('Invalid OSC address');
  }
  remote_osc_ip = rinfo.address;
  io.emit('osc', {
    x: parseInt(osc_message.args[0].value) || 0
  });
 
});
 
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

//port bindings
server.listen(PORT, err=>{ //app.listen(PORT) won't work
  if (err) console.log(err)
  else console.log(`=====Server listening on port ${PORT}======`)
});

udp_server.bind(9998);
console.log(`=====UDP Server listening on port 9998=====`);
