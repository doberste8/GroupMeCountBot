// app/routes/api.js

var api = require('express').Router();
var list = require('../models/list');

// middleware for all api requests
api.use(function(req, res, next) {
    console.log('API');
    next();
});

api.route('/list')

    .get(function(req, res) {
        list.get(res);
    })
  
    .post(function(req, res) {
        list.create(req.body, res);
    })

    .put(function(req, res) {
        list.update(req.body, res);
    });
  
api.route('/list/all')

    .put(function(req, res) {
        list.updateAll(req.body, res);
    });  

module.exports = api;