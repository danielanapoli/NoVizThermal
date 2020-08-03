const routes = require('express').Router();

routes.post("/", (req, res) => {
    // Invalidate session
    req.session.participantID = req.body.participantID;
    req.session.inProgress    = false;

    res.status(200).end()
});

module.exports = routes;