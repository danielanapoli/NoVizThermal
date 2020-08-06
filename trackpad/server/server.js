const http     = require('http');
const express  = require('express');
const app      = express();
const server   = http.createServer(app);

const osc      = require('osc-min');
const dgram    = require('dgram');
const five     = require('johnny-five');


const PORT      = 8080;

// Representation of the Arduino board in the code
app.locals.arduino = {
  "board"      : new five.Board({debug: false}),
  "yellow"     : "",
  "green"      : "",
  "red"        : "",
  "peltier"    : "",
  "thermometer": ""
}
  

  
// Set up Arduino elements when board is connected
app.locals.arduino.board.on("ready", () => {
  
  // Set up thermometer. Notice we are using TMP102 temperature sensor
  app.locals.arduino.thermometer = new five.Thermometer({
      controller: "TMP102",
      freq: 30
  });

  // Set up leds and the peltier
  app.locals.arduino.yellow  = new five.Led(4);
  app.locals.arduino.green   = new five.Led(5);
  app.locals.arduino.red     = new five.Led(6);
  app.locals.arduino.peltier = new five.Pin({pin: 3});


  // Track temperature to warn about possible overheating
  app.locals.arduino.thermometer.on("data", temp => {
    console.log(temp.celsius);

    if (temp.celsius > 40) {
      app.locals.arduino.green.off();
      app.locals.arduino.red.on();
    } else {
      app.locals.arduino.green.on();
      app.locals.arduino.red.off();
    }
  });
});


const session   = require('express-session');                     // Manage the session data for a client
const MongoDBStore = require('connect-mongodb-session')(session); //require module, pass it the session module

const sessionStore = new MongoDBStore({                           // Use MongoDB to store the session data
  uri: 'mongodb://localhost:27017/Test',
  collection: 'sessiondata'
});

// Get settings from untracked file
const config = require("./resources/config.json");

// Consider:
// resave -> https://www.npmjs.com/package/express-session#resave
// saveUninitialized -> https://www.npmjs.com/package/express-session#saveuninitialized
app.use(session({ secret: config.secret, store: sessionStore, cookie:{maxAge: 60000 * 3}, resave: true, saveUninitialized: false}));

// Logs all requests to the terminal in colour blue
const logger = (req, res, next) => {
  const formatBlue = str => {
      const blueBegin = "\x1b[34m";
      const colorReset = "\x1b[0m";
      return `${blueBegin}${str}${colorReset}`;
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


// socket comms
app.locals.udp_server = dgram.createSocket('udp4', function(msg, rinfo) {
 
  let osc_message;
  
  try {
    osc_message = osc.fromBuffer(msg);

  } catch(err) {
    console.log('Could not decode OSC message');
  }

  if(osc_message.address != '/server') {
    console.log('Invalid OSC address');
  }
  
  app.locals.remote_osc_ip = rinfo.address;
});

/******************* Port bindings *******************/
server.listen(PORT, err=>{ 
  if (err) {
    console.log(err)
  } else{
    console.log(`=====Express Server listening on port ${PORT}======`)
  }
});

app.locals.udp_server.bind(9998);
console.log(`=====UDP Server listening on port 9998=====`);
/****************************************************/
