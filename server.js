// server.js

//modules =====================================================================
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var methodOverride = require("method-override");

// config =====================================================================
require('dotenv').config({path:'./config/.env'});
var db = require('./config/db');

//set port
var port = Number(process.env.PORT || 8080);

//create mysql database connection pool
db.init();

// get all data of the body (POST) parameters
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("X-HTTP-Method-Override"));
app.use(express.static(__dirname + "/public"));

// routes =====================================================================
var router = require('./app/routes');
app.use('/', router);

// start app ==================================================================
app.listen(port);

// expose app
exports = module.exports = app;
