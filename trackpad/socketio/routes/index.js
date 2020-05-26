const routes = require('express').Router();

routes.get('/', (req, res) => {
    res.render("home", {});
})

routes.use("/login", require("./login"));

routes.use("/variation", require("./variation"));

routes.use("/handler", require("./handler"));

module.exports = routes