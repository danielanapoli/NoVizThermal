const routes = require('express').Router();
const osc    = require('osc-min');


routes.post('/', turnOffTemperature, temperature);


// This function prevents sending messages about the same Website more than once to Arduino
function temperature(req, res) {

    // Use a try/catch incase the session has expired. In that case, this code will fail.
    try {
        // Use session data to keep track of the websites that have already triggered a message to Processing
        // This control is kept due to extension signals being received at seemingly random times
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
            // messageArduino(req, res);

            // Control temperature using Johnny-five
            johnnyFiveTemperature(req);
    
            res.end();

        }

    } catch (err) {
        console.log("TEMPERATURE: " + err);

        // If it fails, turn off heating device
        req.body.code = 4;
        johnnyFiveTemperature(req);
    }
    
};

/* This middleware function sees if the incoming information is meant to shut down the Arduino.
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
            // messageArduino(req, res);

            // Turn off heating devive using johnny-five
            johnnyFiveTemperature(req);

            res.end();

        } catch (err) {
            console.log("MIDDLEWARE: " + err);
        }
    }
}

/* This function sends a message to Processing.
 * which communitcates this message to Arduino
 */
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

/** Change the colour of the terminal messages.
 *  The colours are meant to represent the URL (represented as a string)
 *      - green: EV certificates
 *      - yellow: DV certificates
 *      - red: http (no certificate)
 * 
 *  @param {string} str    - string to display in colour
 *  @param {string} colour - colour to be used when str is displayed
 * 
 *  @return {string} string in colour given
 */
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

/** This function controls the temperature of the heating device
 *  @param {}
 *  @param {number}  max - maximum temperature allowed
 *  @param {Request} req - HTTP request 
 */
function tempControl(temp, max, req) {
    if (temp.celsius > (max + 2)) {
        console.log("OFF: " + max);
        req.app.locals.arduino.yellow.off();
        req.app.locals.arduino.peltier.write(0);
    } else if (temp.celsius <= max) {
        console.log("ON: " + max);
        req.app.locals.arduino.yellow.on();
        req.app.locals.arduino.peltier.write(255);
    } else {
        console.log("OFF: " + max);
        req.app.locals.arduino.yellow.off();
        req.app.locals.arduino.peltier.write(0);
    }
}

/** This function sets up the behaviour of the thermometer.
 *  The thermometer is what decides when to turn on/off the heating device
 * 
 *  @param {Request} req - HTTP request
 */
function johnnyFiveTemperature(req) {
    // This handles no certificate (http)
    if (req.body.code === 1) {
        // req.app.locals.arduino.thermometer.on("data", temp => tempControl(temp, 40, req));
        req.app.locals.arduino.temperature = 40;

    // This handles EV certificates
    } else if (req.body.code === 2) {
        // req.app.locals.arduino.thermometer.on("data", temp => tempControl(temp, 20, req));
        req.app.locals.arduino.temperature = 20;

    // This handles DV certificates
    } else if (req.body.code === 3) {
        // req.app.locals.arduino.thermometer.on("data", temp => tempControl(temp, 30, req));
        req.app.locals.arduino.temperature = 30;

    // This handles off signals
    } else {
        // req.app.locals.arduino.thermometer.on("data", temp => tempControl(temp, 20, req));
        req.app.locals.arduino.temperature = 20;
    }
}

module.exports = routes;