const routes = require('express').Router();

routes.post("/", (req, res) => {
    // Start survey session
    req.session.participantID = req.body.participantID;
    req.session.inProgress    = true;
    req.session.counter       = 0;
    req.session.history       = new Array();

    // shuffle array of websites and assign it to participant's session
    const shuffler = require("../resources/fisher-yates");
    req.session.variation = shuffler(require("../resources/websites.json")); 

    // Redirect users to the survey
    res.writeHead(301, {Location: '/variation'});

    res.end();
});

module.exports = routes;