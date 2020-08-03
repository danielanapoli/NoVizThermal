const routes = require('express').Router();

routes.get('/', (req, res) => {
    res.render("home", {validSession: req.session.inProgress});
});

// This route handles the creation of new sessions
routes.use("/login", require("./login"));

// This route serves a form about one website
routes.use("/variation", require("./variation"));

// This route handles messages to Arduino depending on a website's risk
routes.use("/temperature", require("./temperature"));

// This route writes responses to MongoDB
routes.use("/handler", require("./handler"));

// This route invalidates a session
routes.use("/end", require("./end"));

module.exports = routes