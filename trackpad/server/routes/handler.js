const routes = require('express').Router();

 // This is the class to store a response about a single website
const Response  = require("../resources/Response.js");

// MongoDB conection stuff
const MongoClient = require('mongodb').MongoClient;


/* REMEMBER: If you want to add a new website to the survey, go through the next steps:
 *  1. Go to resources/websites.json
 *  2. Add the new URL as a string
 */
routes.post('/', function(req, res){  
    let participantID = req.session.participantID;
    let counter       = req.session.counter;
    let response;

    // Write the new reponses 
    try {

        response = new Response(req.session.variation[counter], 
                                        participantID, req.body["order"], 
                                        req.body['open_site'], 
                                        req.body['close_site'], 
                                        req.body['assessment_site'], 
                                        req.body['confidence_site'], 
                                        req.body['ease_site']);

        sendToDatabase(response.toObject());

        // Adjust counter to move on to the next website
        req.session.counter += 1;

        // Redirect to next website or terminate 
        if (req.session.counter >= req.session.variation.length) {
            // Invalidate session when participant is done
            req.session.inProgress = false;
            req.session.participantID = "";
            res.render('message', {error: false});
        } else {
            res.redirect('/variation');
        }

    } catch (err) {
        // At this point, the session must have expired
        res.render('message', {error: true});
        return;
    }
});

/** This function sends the response to the local mongoDB.
 *  Each response represents the information given for a single website
 *  @param {JSON} information - participant's response as JSON
 */
const sendToDatabase = async(information) => {
    // connect to the cluster 
    const client = await MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true });
  
    // Get the respective collection
    const collection = client.db("Test").collection("TestData");
    
    // Insert the new response 
    await collection.insertOne(information);
  
    client.close();
};

module.exports = routes;