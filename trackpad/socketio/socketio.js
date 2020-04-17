const http      = require('http');
const express   = require('express');
const app       = express();
const server    = http.createServer(app);
const io        = require('socket.io').listen(server);

const osc       = require('osc-min');
const dgram     = require('dgram');

let remote_osc_ip;

const PORT      = 8080;

//serve static files
app.use(express.static('./')); //current directory is root

//middleware to rerout no GET query to serve index.html
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//handle form data
const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // to support JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies

app.post('/handler', function(req, res){
    //append form data to text file
    //convert to csv file here: https://json-csv.com/
    var fs = require('fs');
    fs.appendFile("assessmentResults.txt", JSON.stringify(req.body), function(err) {
        if (err) {
            console.log(err);
        }
        res.sendFile(__dirname + '/thankyou.html') //res.send(req.body.optradio);
    });
})

//socket comms
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

// arduino comms through processing
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
server.listen(PORT, err=>{ 
  if (err) console.log(err)
  else console.log(`=====Express Server listening on port ${PORT}======`)
});

udp_server.bind(9998);
console.log(`=====UDP Server listening on port 9998=====`);
