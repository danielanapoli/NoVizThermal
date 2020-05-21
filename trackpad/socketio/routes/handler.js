const routes = require('express').Router();

 // This is the class to store a response about a single website
const Response  = require("../resources/Response.js");

// MongoDB conection stuff
const MongoClient = require('mongodb').MongoClient;
const config      = require('../resources/config.json');


/* REMEMBER: If you want to add a new website to the survey, go through the next steps:
 *  1. Go to results.json
 *  2. Create a new key/value pair where key is the website URL and the value is an empy array
 */
routes.post('/', function(req, res){
    let participantID = req.body.participantID;
    let variation = parseInt(req.body.variation);

    //let currentData = JSON.parse(data); // Get the data into JSON format
    let responses = [];
    
    // Write the new reponses 
    Object.keys(req.app.locals.variations[variation - 1]).forEach( (value) => {
    let response = new Response(req.app.locals.variations[variation - 1][value][0], 
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
});

/* This function sends a group of responses to the mongoDB cluster
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

module.exports = routes;

