"use strict";

/*
Get the background page to access the information variable (indicates colour for the background)
*/

const backgroundPage = browser.runtime.getBackgroundPage()

backgroundPage.then(changeColour).catch((message) => {
    console.log("Something is wrong: " + message);
});

function changeColour(background) {
    document.getElementById("indicator").style.backgroundColor = background.information.colour;
}