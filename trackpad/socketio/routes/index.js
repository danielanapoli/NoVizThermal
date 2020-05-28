const routes = require('express').Router();

routes.get('/', (req, res) => {
    res.render("home", {validSession: req.session.inProgress});
});

routes.use("/login", require("./login"));

routes.use("/variation", require("./variation"));

routes.use("/handler", require("./handler"));

routes.use("/responseHandler", require("./responseHandler"));

module.exports = routes