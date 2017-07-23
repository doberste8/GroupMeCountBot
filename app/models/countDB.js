// app/models/countDB.js

var db = require('../../config/db');

function countDB() {

    //get list of matches, filtered by user if specified.
    this.get = function(id, res) {
        db.acquire(function(err, con) {
            if (err) throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('select * from member_count where id like ?', [id],
                function(err, result) {
                    con.release();
                    if (!err) {
                        res.send(result);
                    }
                    else {
                        res.send({
                            status: 1,
                            message: 'Failed to get user counts.'
                        });
                    }
                });
        });
    };

//get list of matches, filtered by user if specified.
    this.getWeekly = function(res) {
        db.acquire(function(err, con) {
            if (err) throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('select sum(weekly_count) as count from member_count',
                function(err, result) {
                    con.release();
                    if (!err) {
                        res.send(result);
                    }
                    else {
                        res.send({
                            status: 1,
                            message: 'Failed to get user counts.'
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
            con.query('INSERT INTO member_count(id, nickname, count, weekly_count) VALUES ? ON DUPLICATE KEY UPDATE nickname=VALUES(nickname), count=VALUES(count), weekly_count=VALUES(weekly_count)', [data],
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
            con.query('update member_count set ? where id like ?', [data, data.id],
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

    //update item with provided data.
    this.increment = function(id, res) {
        db.acquire(function(err, con) {
            if (err) throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('update member_count set count=count+1, weekly_count=weekly_count+1 where id like ?', [id],
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
            con.query('update member_count set ?', data,
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

module.exports = new countDB();
