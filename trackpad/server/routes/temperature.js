const routes = require('express').Router();
const osc    = require('osc-min');


routes.post('/', turnOffTemperature, temperature);


// This function prevents sending messages about the same Website more than once to Arduino
function temperature(req, res) {

    // Use a try/catch incase the session has expired. In that case, this code will fail.
    try {
        // Use session data to keep track of the websites that have already triggered a message to Processing (control for headers received randomly)
        if (!(req.session.history.includes(req.body.URL))) {
            req.session.history.push(req.body.URL);
    
    
            
            /******************* TESTING CODE *******************/
            try {
                console.log("WEBSITE: ");
                console.log("\t" + formatColour( ("URL: " + req.body.URL), req.body.colour));
            } catch (err) {
                console.log(err);
            }
            /****************************************************/
    
            // Send message to Arduino
            messageArduino(req, res);
    
            res.end();

        }

    } catch (err) {
        console.log("TEMPERATURE: " + err);
    }
    
};

/* This middleware function sees if the incoming information is meant to shut down the Arduino
 * If it is, sends the request to Arduino,
 * Otherwirse, it calls the next function
 */
function turnOffTemperature(req, res, next) {
    // Information meant to turn off Arduino, will not have a "colour" field
    if (req.body.hasOwnProperty("colour")) {
        next();

    } else {
        try {
            
            // Send message to Arduino
            messageArduino(req, res);

            res.end();

        } catch (err) {
            console.log("MIDDLEWARE: " + err);
        }
    }
}

// This function sends a message to the Arduino
function messageArduino(req, res) {
    try {

        if(! req.app.locals.remote_osc_ip) {
            return;
        }
    
        // Arduino does not yet handle Domain validated certificates (which are represented by number 3)
        if (req.body.code !== 3) {
            // Prepare the message to send 
            let osc_msg = osc.toBuffer({
                oscType: 'message',
                address: '/server',
                args:[{ 
                  type: 'integer',
                  value: parseInt(req.body.code) || 0
                }]
            });
        
            // Send message to processing
            res.app.locals.udp_server.send(osc_msg, 0, osc_msg.length, 9999, req.app.locals.remote_osc_ip);
            console.log('Sent OSC message to %s:9999', req.app.locals.remote_osc_ip);

        }
    } catch (err) {
        console.log("MESSAGE: " + err);
    }
}

// Change the colour of the terminal messages
const formatColour = (str, colour) => {
    // Turn colour back to normal at the end of the message
    const colourReset = "\x1b[0m";

    if (colour === "green") {
        return "\x1b[32m" + str + colourReset;
    } else if (colour === "red") {
        return "\x1b[31m" + str + colourReset;
    } else {
        return "\x1b[33m" + str + colourReset;
    }
};

module.exports = routes;