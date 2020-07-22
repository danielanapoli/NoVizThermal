var connection;
    
function messageReceive(port) {
    // Store the port to connect to background script
    connection = port;

    // On link clicked, wait 1 second and message the background script with the link clicked
    document.getElementById("link").addEventListener("click", () => {
        setTimeout(function() {connection.postMessage({url: document.getElementById("link").href});}, 1000);
    });
}


browser.runtime.onConnect.addListener(messageReceive);