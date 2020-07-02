const routes = require('express').Router();
const osc    = require('osc-min');


routes.post('/', temperature);


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
    
            if(! req.app.locals.remote_osc_ip) {
                return;
            }
    
            // Arduino does not yet handle Domain validated certificates (which are represented by number 3)
            if (req.body.code !== 3) {
                // Prepare the message to send 
                let osc_msg = osc.toBuffer({
                    oscType: 'message',
                    address: '/socketio',
                    args:[{ 
                      type: 'integer',
                      value: parseInt(req.body.code) || 0
                    }]
                });
            
                // Send message to processing
                res.app.locals.udp_server.send(osc_msg, 0, osc_msg.length, 9999, req.app.locals.remote_osc_ip);
                console.log('Sent OSC message to %s:9999', req.app.locals.remote_osc_ip);
            }
    
            res.end();
        }
    } catch (err) {
        console.log("ERROR: " + err);
    }
    
};

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