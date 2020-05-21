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
  let currentDate = new Date();

  let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();

  document.getElementById("open_site" + id).value = time;

  linkDisable(link);

  if (certificate === "evCert") {
    heaterOFF();
  } else if (certificate === "http") {
    heaterON();
  }

  surveyEnabler(id);
}

// This function takes the time when the participant is back from the test website  
function closeSiteHandler(id) {
  let currentDate = new Date();

  let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();

  document.getElementById("close_site" + id).value = time;

  heaterOFF();
}

// This function abilitates the questions for the clicked website
function surveyEnabler(websiteID) {
  for (let i = 1; i <= 12; ++i) {
    console.log("Result: " + i * (websiteID * length));
    if (i < 3) {
      document.getElementById( ("assessment" + i) + websiteID).disabled = false;
    } else if (3 <= i && i < 8) {
      document.getElementById( ("confidence" + i) + websiteID).disabled = false;
    } else if (8 <= i && i <= 12) {
      document.getElementById( ("ease" + i) + websiteID).disabled = false;
    }
  }
}