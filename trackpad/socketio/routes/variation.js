const routes = require('express').Router();

routes.get('/', function(req, res) {
    if (!req.session.participantID) {
		  res.status(403).send("Unauthorized to access resource");
		  return;
    }

    if (!req.session.inProgress) {
      res.send("You have already submitted");
      return;
    }

    // Modification to display one website at a time
    res.render("website", {website:req.session.variation[req.session.counter], counter: (req.session.counter + 1)});

    // res.render("variation", {variation: req.session.variation});
});

module.exports = routes