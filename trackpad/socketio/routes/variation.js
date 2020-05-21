const routes = require('express').Router();

routes.get('/:id', function(req, res) {

    // Check that the variation requested exists
    if (parseInt(req.params.id) > req.app.locals.variations.length || parseInt(req.params.id) < 1){
        res.status(404).send("Cannot GET " + req.url + "--> variation does not exist");
        return;
    }
  
    // The given id is reduced by 1 because variations start at 1 and array indexes at 0
    res.render("variation", {id: parseInt(req.params.id), variation: req.app.locals.variations[parseInt(req.params.id) - 1]});
});

module.exports = routes