var socket = io.connect();

socket.on('osc', function (data) {
  if (data.x == 1) {
    console.log("Heater ON")
  } else {
    console.log("Heater OFF")
  }
});

// function heaterON() {
//   console.log("heaterON() called")
//   socket.emit('browser', {
//     x: 1 || 0
//   });
// }

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

/*************************************************************************************************/
// This function is called when participant clicks on a URL
function openSiteHandler(link) {
  // Register the time the website was opened
  let currentDate = new Date();
  let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
  document.getElementById("open_site").value = time;

  linkDisable(link);

  surveyEnabler();
}

// This function takes the time when the participant is back from the test website  
function closeSiteHandler() {
  // Register the time when participant answers first question
  let currentDate = new Date();
  let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
  document.getElementById("close_site").value = time;

  heaterOFF();
}

// This function enables the questions for the clicked website
function surveyEnabler() {
  for (let i = 1; i<= 5; ++i) {
    if (i < 3) {
      document.getElementById("assessment" + i).disabled = false;
    }

    document.getElementById("confidence" + i).disabled = false;
    document.getElementById("ease" + i).disabled = false;
  }
}

// Make the Start Over button able to end the session
function endSession() {
  // Make the POST request
  let update = new XMLHttpRequest();
  update.open("POST", "/end");
  update.setRequestHeader("Content-type", "application/json")
	update.send(JSON.stringify({"participantID": ""}));
}

/*************************************************************************************************/