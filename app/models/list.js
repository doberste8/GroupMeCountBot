// app/models/list.js

var db = require('../../config/db');

function list() {

    //get list of matches, filtered by user if specified.
    this.get = function(res) {
        db.acquire(function(err, con) {
            if (err) throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('select * from list where count = 1',
                function(err, result) {
                    con.release();
                    if (!err) {
                        res.send(result);
                    }
                    else {
                        res.send({
                            status: 1,
                            message: 'Failed to get matches list.'
                        });
                    }
                });
        });
    };

    //create new match with provided data.
    this.create = function(data, res) {
        db.acquire(function(err, con) {
            if (err) throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('INSERT INTO list set ?', data,
                function(err, result) {
                    con.release();
                    if (err)
                        res.send({
                            status: 1,
                            message: 'Item creation failed'
                        });
                    else
                        res.send({
                            status: 0,
                            message: 'Item created successfully'
                        });
                });
        });
    };

    //update item with provided data.
    this.update = function(data, res) {
        db.acquire(function(err, con) {
            if (err) throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('update list set ? where id like ?', [data, data.id],
                function(err, result) {
                    con.release();
                    if (err)
                        res.send({
                            status: 1,
                            message: 'Item update failed'
                        });
                    else
                        res.send({
                            status: 0,
                            message: 'Item updated successfully'
                        });
                });
        });
    };

    //update all items with provided data.
    this.updateAll = function(data, res) {
        db.acquire(function(err, con) {
            if (err) throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('update list set ?', data,
                function(err, result) {
                    con.release();
                    if (err)
                        res.send({
                            status: 1,
                            message: 'Item update failed'
                        });
                    else
                        res.send({
                            status: 0,
                            message: 'Item updated successfully'
                        });
                });
        });
    };
}

module.exports = new list();
