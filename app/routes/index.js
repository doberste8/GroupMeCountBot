// app/routes/index.js

var path = require('path');
var router = require('express').Router();

router.use(function(req, res, next) {
    next();
});

// server routes ============================================================
var api = require('./api');
router.use('/api', api);

// frontend routes ==========================================================
// route to handle all angular requests
router.get('*', function(req, res) {
    res.sendFile('views/index.html', {
        root: path.join(__dirname, '../../public')
    });
});

module.exports = router;
