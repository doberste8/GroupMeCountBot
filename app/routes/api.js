// app/routes/api.js
var bot = require('../models/bot.js');
var api = require('express').Router();

// middleware for all api requests
api.use(function(req, res, next) {
    console.log('API');
    next();
});

api.route('/')

    .post(function(req, res) {
        bot.respond(req.body, res);
    })
    
module.exports = api;