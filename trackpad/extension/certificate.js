"use strict"; // Enable strict mode (Change previously accepted bad syntax into errors)

// const or let variables won't appear in the window returned in popup.js
var information = {
    "colour": "green"
}

async function logSubject(details) {
    console.log("ORIGIN: " + details.originUrl);
    console.log("URL:" + details.url);
    console.log("TYPE:" + details.type);

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

/******************************** Tabs testing  ********************************/
let importantTab;

browser.tabs.onCreated.addListener( tab => {
    console.log("TabID: " + tab.id);

    importantTab = tab.id;
});

browser.tabs.onRemoved.addListener( (tabID, removeInfo) => {
    if (tabID == importantTab) {
        console.log("Send message to take the time");
    } else {
        console.log("Don't do anything");
    }
});

/*******************************************************************************/