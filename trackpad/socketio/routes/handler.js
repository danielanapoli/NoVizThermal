const routes = require('express').Router();

 // This is the class to store a response about a single website
const Response  = require("../resources/Response.js");

// MongoDB conection stuff
const MongoClient = require('mongodb').MongoClient;
const config      = require('../resources/config.json');


/* REMEMBER: If you want to add a new website to the survey, go through the next steps:
 *  1. Go to resources/websites.json
 *  2. Add a new array with the first element being the URL and the second element the certificate type
 */
routes.post('/', function(req, res){
    let participantID = req.body.participantID;

    console.log(req.body);

    let responses = [];
    
    // Write the new reponses 
    Object.keys(req.app.locals.variation).forEach( (value) => {
        value = parseInt(value) + 1;
        let response = new Response(req.app.locals.variation[value - 1][0], 
                                    participantID, req.body["order" + value], 
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
    // const client = await MongoClient.connect(config.uri, { useUnifiedTopology: true });

    const client = await MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true });
  
    // Get the respective collection
    const collection = client.db("Test").collection("TestData");
    
    // Insert the array of new responses
    await collection.insertMany(information);
  
    client.close();
};

module.exports = routes;

