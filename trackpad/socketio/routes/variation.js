const routes = require('express').Router();

routes.get('/', function(req, res) {
    if (!req.session.participantID) {
		res.status(403).send("Unauthorized to access resource");
		return;
    }

    if (!req.session.inProgress) {
        res.status().send("You have already submitted");
    }

    res.render("variation", {variation: req.session.variation});
});

module.exports = routes