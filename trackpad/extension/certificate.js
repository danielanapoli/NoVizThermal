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
    
            /****************  Print information *******************/
            // console.log("ERROR MESSAGE: " + securityInfo.errorMessage);
            // console.log("STATE: " + securityInfo.state);
            // console.log("EV: " + securityInfo.isExtendedValidation);
            // console.log("Not Valid: " + securityInfo.isNotValidAtThisTime);
            // console.log("Untrusted: " + securityInfo.isUntrusted);
            // console.log("WEAKNESS: " + securityInfo.weaknessReasons);
    
            // if (securityInfo.hasOwnProperty("certificates")) {
            //     console.log("CERTIFICATES: ");
            //     securityInfo.certificates.forEach(element => {
            //         console.log("\t" + element.issuer);
            //         let date = new Date();
    
            //         date.setTime(element.validity.start);
            //         console.log("\t" + date);
    
            //         date.setTime(element.validity.end);
            //         console.log("\t" + date);
            //     });
            // }

            /****************  Print information *******************/
    
            // Tentative process
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

    // We may not need this as we are not modifying the request (this makes it synchronous)
    ["blocking"]
);