const http      = require('http');
const express   = require('express');
const app       = express();
const server    = http.createServer(app);
const io        = require('socket.io').listen(server);
const fs        = require('fs');
const converter = require('json-2-csv');    // This is what allows the conversion of JSON to CSV

const osc       = require('osc-min');
const dgram     = require('dgram');

const Response  = require("./Response.js"); // This is the class to store a response about a single website

// MongoDB conection stuff
const MongoClient = require('mongodb').MongoClient;
const config      = require('./resources/config.json');


let remote_osc_ip;

const PORT      = 8080;

let variations = [];  // Store variations

// ---------------- TODO? ----------------- 
// Take out id="certificate" from the variations.pug



//serve static files
app.use(express.static('./')); //current directory is root
app.set('view engine', 'pug');

// Read the variations folder to get the different website orderings
fs.readdir("./variations/", (err, files) => {
  // Here, each json object is transformed into a js object and pushed to my restaurantData array
  files.forEach(filename => {
      const jsonToJs = require("./variations/" + filename);
      variations.push(jsonToJs);
  });
});

//handle form data
const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // to support JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies

//middleware to rerout no GET query to serve index.html
app.get('/', function(req, res) {
  // res.sendFile(__dirname + '/index.html');
  res.render('index', {});
});

// Serve variations
app.get('/variation/:id', function(req, res) {

  // Check that the variation requested exists
  if (parseInt(req.params.id) > variations.length || parseInt(req.params.id) < 1){
    res.status(404).send("Cannot GET " + req.url + "--> variation does not exist");
    return;
  }

  // The given id is reduced by 1 because variations start at 1 and array indexes at 0
  res.render("variation", {id: parseInt(req.params.id), variation: variations[parseInt(req.params.id) - 1]});
});


/* REMEMBER: If you want to add a new website to the survey, go through the next steps:
 *  1. Go to results.json
 *  2. Create a new key/value pair where key is the website URL and the value is an empy array
 */
app.post('/handler', function(req, res){
  let participantID = req.body.participantID;
  let variation = parseInt(req.body.variation);

  fs.readFile('results/results2.json', 'utf8', (err, data) => {
    if (err){

      res.render('message', {error: true});

    } else {
      //let currentData = JSON.parse(data); // Get the data into JSON format

      let responses = [];
      // Write the new reponses 
      Object.keys(variations[variation - 1]).forEach( (value) => {
        let response = new Response(variations[variation - 1][value][0], 
                                    participantID, variation, req.body["order" + value], 
                                    req.body['open_site' + value], 
                                    req.body['close_site' + value], 
                                    req.body['assessment_site' + value], 
                                    req.body['confidence_site' + value], 
                                    req.body['ease_site' + value]);
        // currentData["responses"].push(response.toObject());
        responses.push(response.toObject());
      });

      sendToDatabase(responses);

      res.render('message', {error: false});

      

      // // Remember that json2csv takes an array of JS objects
      // converter.json2csv(currentData["responses"], (err, csv) => {
      //   // if (err) throw err;
      //   fs.writeFile('results/results.csv', csv, 'utf8', (err) => { // write it back 
      //     if (err) {
      //       res.render('message', {error: true});
      //     }
      //     // TODO: When the CSV part is working, rememeber that res.render() can't happen twice (causes: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client)
      //     // } else {
      //     //   res.render('message', {error: false}); //res.send(req.body.optradio);
      //     // }
      //   });
      // });

      // currentData = JSON.stringify(currentData);

      // // Overwrite the JSON file
      // fs.writeFile('results/results2.json', currentData, 'utf8', (err) => { // write it back
      //   if (err) {
      //     res.render('message', {error: true});
      //   } else {
      //     res.render('message', {error: false});
      //   }
      // }); 
    }
  });
});

/* This function send a group of responses to the mongoDB cluster
 * @params array of reponse objects
 */
const sendToDatabase = async(information) => {
  // connect to the cluster 
  const client = await MongoClient.connect(config.uri, { useUnifiedTopology: true });

  // Get the respective collection
  const collection = client.db("Test").collection("TestData");
  
  // Insert the array of new responses
  await collection.insertMany(information);

  client.close();
};



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
