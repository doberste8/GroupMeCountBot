// app/routes/index.js

var path = require('path');
var router = require('express').Router();

router.use(function(req, res, next) {
    next();
});

// server routes ============================================================
var api = require('./api');
router.use('/api', api);

module.exports = router;
