// config/db.js

var mysql = require('mysql');

var dbHost = process.env.DB_HOST;
var dbUser = process.env.DB_USER;
var dbPassword = process.env.DB_PASSWORD;
var dbDatabase = process.env.DB_DATABASE;

function Connection() {
    this.pool = null;

    this.init = function() {
        this.pool = mysql.createPool({
            connectionLimit: 20,
            host: dbHost,
            user: dbUser,
            password: dbPassword,
            database: dbDatabase
        });
    };

    this.acquire = function(callback) {
        this.pool.getConnection(function(err, connection) {
            callback(err, connection);
        });
    };
}

module.exports = new Connection();
