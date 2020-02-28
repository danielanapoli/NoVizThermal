let http = require('http')
let socketio = require('socket.io')
let fs = require('fs')
let osc = require('osc-min')
let dgram = require('dgram')
let url = require('url')
let remote_osc_ip;

const ROOT_DIR = "socketio"; //dir to serve static files from

const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain"
}
    
function get_mime(filename) {
  for (let ext in MIME_TYPES) { //Use file extension to determine the correct response MIME type
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
        return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES["txt"]
}

var http_server = http.createServer(function(req, res) {

  let filePath = "." + req.url;
  if (filePath == './') filePath = './index.html';

  fs.readFile(filePath, function(err, content){
    if (err) {
      console.log("ERROR: " + JSON.stringify(err)); //Report error to console
      res.writeHead(404); //Respond with not found 404 to client
      res.end(JSON.stringify(err));
      return;
    }
    //Respond with file contents
    res.writeHead(200, { "Content-Type": get_mime(filePath) })
    res.end(content)
  })






  // //Handle URL parsing 
  // let urlObj = url.parse(req.url, true, false)
  // console.log("\n============================")
  // console.log("PATHNAME: " + urlObj.pathname)
  // console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  // console.log("METHOD: " + req.method)
  // if (req.method === "POST") {
  //   console.log("POST request not setup")
  // }
  // //Handle GET requests (e.g. queries for another page)
  // if (req.method === "GET"){
  //   fs.readFile(ROOT_DIR + urlObj.pathname, function(err, data) {
  //     if (err) {
  //       console.log("ERROR: " + JSON.stringify(err)) //Report error to console
  //       res.writeHead(404) //Respond with not found 404 to client
  //       res.end(JSON.stringify(err))
  //       return
  //     }
  //     //Respond with file contents
  //     res.writeHead(200, { "Content-Type": get_mime(urlObj.pathname) })
  //     res.end(data)
  //   })
  // }

});
 
let io = socketio(http_server);
io.on('connection', function(socket) {
  socket.on('browser', function(data) {
    if(! remote_osc_ip) {
      return;
    }
    var osc_msg = osc.toBuffer({
      oscType: 'message',
      address: '/socketio',
      args:[{ 
        type: 'integer',
        value: parseInt(data.x) || 0
      },
      {
        type: 'integer',
        value: parseInt(data.y) || 0
      }]
    });
    udp_server.send(osc_msg, 0, osc_msg.length, 9999, remote_osc_ip);
    console.log('Sent OSC message to %s:9999', remote_osc_ip);
  });
});
 
http_server.listen(8080);
console.log('Starting HTTP server on TCP port 8080');