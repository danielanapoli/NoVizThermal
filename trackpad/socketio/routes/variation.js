const routes = require('express').Router();

routes.get('/', function(req, res) {

    res.render("variation", {variation: req.app.locals.variation});
});

module.exports = routes