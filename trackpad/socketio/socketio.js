const http      = require('http');
const express   = require('express');
const app       = express();
const server    = http.createServer(app);
const io        = require('socket.io').listen(server);

const osc       = require('osc-min');
const dgram     = require('dgram');

let remote_osc_ip;

const PORT      = 8080;


const session   = require('express-session');                     // Manage the session data for a client
const MongoDBStore = require('connect-mongodb-session')(session); //require module, pass it the session module

const sessionStore = new MongoDBStore({                           // Use MongoDB to store the session data
  uri: 'mongodb://localhost:27017/Test',
  collection: 'sessiondata'
});

const config = require("./resources/config.json");

// Consider:
// resave -> https://www.npmjs.com/package/express-session#resave
// saveUninitialized -> https://www.npmjs.com/package/express-session#saveuninitialized
app.use(session({ secret: config.secret, store: sessionStore, cookie:{maxAge: 60000 * 3}, resave: true, saveUninitialized: true}));

// const MongoClient = require('mongodb').MongoClient;
// app.locals.client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });

// ---------------- TODO? ----------------- 
// Take out id="certificate" from the variations.pug
// What should be the behaviour of the button Start Over

// Logs all requests to the terminal
const logger = (req, res, next) => {
  const formatBlue = str => {
      const blueBegin = "\x1b[34m";
      const blueEnd = "\x1b[0m";
      return `${blueBegin}${str}${blueEnd}`;
  };

  console.log(formatBlue(req.method + " " + req.originalUrl));
  next();
};
app.use(logger);

// Pug
app.set('view engine', 'pug');
app.set('views', "./pug/views");

// Serve static files
app.use(express.static('./')); //current directory is root

//handle form data
const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // to support JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies

// Look inside /routes/index.js for the code that handles requests
app.use('/', require("./routes/index"));


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


// Port bindings
server.listen(PORT, err=>{ 
  if (err) console.log(err)
  else console.log(`=====Express Server listening on port ${PORT}======`)
});

udp_server.bind(9998);
console.log(`=====UDP Server listening on port 9998=====`);
