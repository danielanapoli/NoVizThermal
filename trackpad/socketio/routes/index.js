const routes = require('express').Router();

routes.get('/', (req, res) => {
    res.render("index", {});
})

routes.use("/variation", require("./variation"));

routes.use("/handler", require("./handler"));

module.exports = routes