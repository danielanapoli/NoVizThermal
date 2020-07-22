"use strict"; // Enable strict mode (Change previously accepted bad syntax into errors)

// const or let variables won't appear in the window returned in popup.js
var information = {
    "colour": "green"
}

async function logSubject(details) {
    // Avoid being triggered when dealing with our own page
    if (!details.url.startsWith("http://localhost:8080/")) {
        try {
            let securityInfo = await browser.webRequest.getSecurityInfo(
                details.requestId,
                {"certificateChain": true}
            );
    
            // Determine the risk level of the website's certificate
            if (securityInfo.state === "insecure") {
                information["URL"]  = details.url;
                information.colour  = "red";
                information["code"] = 1;
            } else if (securityInfo.isExtendedValidation === true) {
                information["URL"]  = details.url;
                information.colour  = "green";
                information["code"] = 2;
            } else {
                information["URL"] = details.url;
                information.colour = "yellow";
                information["code"] = 3;
            }

            
            // Send colour to the web app server
            try {
                let xhr = new XMLHttpRequest();
                xhr.open("POST", "http://localhost:8080/temperature");
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(JSON.stringify(information));
            } catch (err) {
                console.log("ERROR: " + err);
            }
    
        }
            catch(error) {
            console.error("ERROR: " + error);
        }
    }
}

browser.webRequest.onHeadersReceived.addListener(logSubject,
    // Trigger events for all the main pages (not their resources)
    {urls: ["<all_urls>"], types: ["main_frame"]},

    ["blocking"]
);

/*
 * ALGORITHM
 * 1. Find our VARIATIONS page -> we can use the onUpdate() event listener ( :) )
 * 2. Inject content script
 * 3. Start conversation with the content script
 * 4. Wait to receive a clicked URL
 * 5. Get the tab with that URL opened
 * 6. Let Arduino know when the tab is closed to shut down the heater
 * 
 * NOTES
 * 1. Filter for onUpdated doesn't seem to work
 */

let myPort;

// This is our callback for onUpdated event. It will serve as a "main" function for our purposes
function stepsToShutDownTemperature(tabID, changeInfo, tabInfo) {
    // Get the tab where the web app is (possibly)
    let webAppTabID = getWebAppTab(tabID, changeInfo);

    // If we are dealing with our web app, move on with the next steps
    if (webAppTabID) {
        // Load content script
        let execution = executeScript(webAppTabID);

        // Once the promise resolves, we can wait communicate with the content script (Notice we ignore the return value of the promise)
        execution.then( result => messaging(webAppTabID)).catch( error => {
            console.log("AT EXECUTING: " + error);
        });
    }

}

// This function determines the tab where our web app is
function getWebAppTab(tabID, changeInfo) {
    if (changeInfo.url === "http://localhost:8080/variation") {
        return tabID;
    } else {
        return false;
    }
};

/* This function loads the content-script into our web app
 * NOTE: This returns a Promise
 */
function executeScript(tabID) {
    return browser.tabs.executeScript(
        tabID,
        {file: "contentScripts/timeTransfer.js"}
    );
}

// This function sets up a connection with the content script
function messaging(tabID) {
    try {
        myPort = browser.tabs.connect(tabID, {name:"port-from-background"});
    
        myPort.onMessage.addListener( (incomingMessage) => {
            getTestWebsite(incomingMessage);
        });

    } catch (e) {
        console.log("CONNECT ERROR: " + e);
    }

}

/* This function will get the tab of the website openend by the participant
 * @param object with a "url" field
 */
function getTestWebsite(urlObject) {
    // NOTE: it seems like the url file for the query function doesn't work without match patters.
    //       However, we know exactly what we want in this case.
    browser.tabs.query({}).then( results => {
        for (let i = 0; i < results.length; ++i) {
            if (results[i].url === urlObject.url) {

                // Place event listener to send signal to Arduino when tab is closed
                browser.tabs.onRemoved.addListener( (tabID, removeInfo) => checkWebsite(tabID, removeInfo, results[i].id));
            }
        }
    })
}

// This function checks that the closed tab is the current website being tested
function checkWebsite(tabID, removeInfo, testTabID) {
    console.log("Closed TabID: " + tabID);
    console.log("Test Website ID: " + testTabID);

    if (tabID === testTabID) {
        shutDownArduino();
    }
}

// This function sends a XMLHttpRequest to the Web app to shut down Arduino
function shutDownArduino() {

    // Object to be send
    let information = {
        "code" : 4,
    }
    
    // Send request to shut down arduino
    try {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8080/temperature");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(information));
    } catch (err) {
        console.log("ERROR: " + err);
    }
}

// This event will be triggered each time the participant moves to a different question
browser.tabs.onUpdated.addListener(stepsToShutDownTemperature);

/*******************************************************************************************/
