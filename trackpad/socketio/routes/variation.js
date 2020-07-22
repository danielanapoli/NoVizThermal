const routes = require('express').Router();

routes.get('/', function(req, res) {
  // Redirect participant to home page if no session is open
  if (!req.session.participantID) {
    res.writeHead(301, {Location: '/'});
    res.end();
		return;
  }

  // Modification to display one website at a time
  res.render("website", {website:req.session.variation[req.session.counter], counter: (req.session.counter + 1)});

});

module.exports = routes