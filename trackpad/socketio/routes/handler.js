const routes = require('express').Router();

 // This is the class to store a response about a single website
const Response  = require("../resources/Response.js");

// MongoDB conection stuff
const MongoClient = require('mongodb').MongoClient;
//const config      = require('../resources/config.json');


/* REMEMBER: If you want to add a new website to the survey, go through the next steps:
 *  1. Go to resources/websites.json
 *  2. Add a new array with the first element being the URL and the second element the certificate type
 */
routes.post('/', function(req, res){
    // Indicate participant is finished
    req.session.inProgress = false;

    console.log(req.body);
    
    let participantID = req.session.participantID;

    let responses = [];
    
    // Write the new reponses 
    try {
        Object.keys(req.session.variation).forEach( (value) => {
            value = parseInt(value) + 1;
            let response = new Response(req.session.variation[value - 1][0], 
                                        participantID, req.body["order" + value], 
                                        req.body['open_site' + value], 
                                        req.body['close_site' + value], 
                                        req.body['assessment_site' + value], 
                                        req.body['confidence_site' + value], 
                                        req.body['ease_site' + value]);
            // currentData["responses"].push(response.toObject());
            responses.push(response.toObject());
        });
    } catch (err) {
        res.send("Session Expired");
        return;
        // res.render('message', {error: true});
    }

    // req.app.locals.db.collection("TestData").insertMany(responses);
    sendToDatabase(responses, req);

    res.render('message', {error: false});
});

/* This function sends a group of responses to the mongoDB cluster
 * @params array of reponse objects
 */
const sendToDatabase = async(information, request) => {
    // connect to the cluster 
    const client = await MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true });

    // const client = await request.app.locals.client.connect();
  
    // Get the respective collection
    const collection = client.db("Test").collection("TestData");
    
    // Insert the array of new responses
    await collection.insertMany(information);
  
    client.close();
};

module.exports = routes;

