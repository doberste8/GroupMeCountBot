// app/routes/api.js

var api = require('express').Router();
var bot = require('../models/bot');
var countDB = require('../models/countDB');

// middleware for all api requests
api.use(function(req, res, next) {
    //console.log('API');
    next();
});

api.route('/')

    .post(function(req, res) {
        bot.updateDB(req.body, res);
    });
    
api.route('/countDB')

    .get(function(req, res) {
        var id = '%';
        if (req.query.id) id = req.query.id;
        countDB.get(id, res);
    })
  
    .post(function(req, res) {
        countDB.create(req.body, res);
    })

    .put(function(req, res) {
        countDB.increment(req.query.id, res);
    });
    
api.route('/countDB/weekly')

    .get(function(req, res) {
        countDB.getWeekly(res);
    });
    
module.exports = api;