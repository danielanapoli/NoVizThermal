const http      = require('http');
const express   = require('express');
const app       = express();
const server    = http.createServer(app);
const io        = require('socket.io').listen(server); // We can eliminate this

const osc       = require('osc-min');
const dgram     = require('dgram'); 


const PORT      = 8080;


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

  if(osc_message.address != '/socketio') {
    console.log('Invalid OSC address');
  }
  
  app.locals.remote_osc_ip = rinfo.address;

  // console.log(osc_message.args[0].value);

  // io.emit('osc', {
  //   x: parseInt(osc_message.args[0].value) || 0
  // });
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
