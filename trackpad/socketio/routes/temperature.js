const routes = require('express').Router();

routes.post('/', (req, res) => {
    try {
        console.log(req.body);
    } catch (err) {
        console.log(err);
    }
});

module.exports = routes;