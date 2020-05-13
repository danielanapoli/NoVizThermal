var socket = io.connect();

socket.on('osc', function (data) {
  if (data.x == 1) {
    console.log("Heater ON")
  } else {
    console.log("Heater OFF")
  }
});

function heaterON() {
  console.log("heaterON() called")
  socket.emit('browser', {
    x: 1 || 0
  });
}

function heaterOFF() {
  console.log("heaterOFF() called")
  socket.emit('browser', {
    x: 2 || 0
  });
}

// disable subsequent clicks
function linkDisable(link) {
  link.onclick = function(event) {
     event.preventDefault();
  }
 }  

// This function is called when participant clicks on a URL
function openSiteHandler(link, certificate, id) {
  document.getElementById("open_site" + id).value = Date();

  linkDisable(link);

  if (certificate === "evCert") {
    heaterOFF();
  } else if (certificate === "http") {
    heaterON();
  }
}

// This function takes the time when the participant is back from the test website  
function closeSiteHandler(id) {
  document.getElementById("close_site" + id).value = Date();

  heaterOFF();
}