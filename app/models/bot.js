// app/models/bot.js

var HTTPS = require('https');
var HTTP = require('http');

  var botID = process.env.BOT_ID;
  var groupID = process.env.GROUP_ID;
  var token = process.env.TOKEN;
  
  getMemberList(populateCounts);
 var timer = setInterval(getMemberList,86400000,populateCounts);

function bot() {
  
  this.updateDB = function(body, res) {
    incrementUserCount(body, res, respond);
  };
  
}

function respond(body, res) {
    console.log(body.text);
    console.log(body.sender_id);

    var messageRegex = /poop/i;
    var messageRegex2 = /(.*)\.count/;
    var messageRegex3 = /(.*)\.count\.this week/;
    var userName;
    var weekly = 0;

    if (body.text && messageRegex3.test(body.text)) {
      res.writeHead(200);
      userName = messageRegex2.exec(body.text);
      weekly = 1;
      getUserId(userName[1], getUserMessageCount, weekly);
      res.end();
    }
    else if (body.text && messageRegex2.test(body.text)) {
      res.writeHead(200);
      userName = messageRegex2.exec(body.text);
      getUserId(userName[1], getUserMessageCount, weekly);
      res.end();
    }
    else if (body.text && messageRegex.test(body.text)) {
      res.writeHead(200);
      getMessageCount(postMessage);
      res.end();
    }
    else {
      console.log("don't care");
      res.writeHead(200);
      res.end();
    }
  }
  
function postMessage(botResponse) {
  var options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id": botID,
    "text": botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
    if (res.statusCode == 202) {
      //neat
    }
    else {
      console.log('rejecting bad status code ' + res.statusCode);
    }
  });

  botReq.on('error', function(err) {
    console.log('error posting message ' + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message ' + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

function getMessageCount(postMessage) {
  var options, Req;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/groups/' + groupID + '/messages?token=' + token + '&limit=100',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  Req = HTTPS.request(options, function(res) {
    var output = '';
    //console.log('statusCode:', res.statusCode);
    //console.log('headers:', res.headers);

    res.setEncoding('utf8');

    res.on('data', function(chunk) {
      output += chunk;
    });

    res.on('end', function() {
      var obj = JSON.parse(output);
      var msgCount = obj.response.count;
      postMessage("I am message number " + msgCount);
    });
  });

  /*Req.on('error', function(err) {
      //res.send('error: ' + err.message);
  });*/

  Req.end();
}

function getUserMessageCount(postMessage, userName, userId, weekly) {
  var options, Req;

    options = {
    hostname: process.env.HOST_NAME,
    port: process.env.PORT,
    path: '/api/countDB' + '?id=' + userId,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
    Req = HTTP.request(options, function(res) {
      var output = '';
      //console.log('statusCode:', res.statusCode);
      //console.log('headers:', res.headers);
      res.setEncoding('utf8');

      res.on('data', function(chunk) {
        output += chunk;
      });

      res.on('end', function() {
        var obj = JSON.parse(output);
        console.log(obj);
          postMessage(userName + " has posted " + (weekly ? obj[0].weekly_count : obj[0].count) + " messages" + (weekly ? " this week." : "."));
      });
    });

    /*Req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });*/

    Req.end();
  }

function populateCounts(memberList, last_id) {
  var options, Req;
    var weekStart = getStartOfWeek();
    var memberListLength = memberList.length;
    var pathAdd = "";
    if (last_id) pathAdd = "&before_id=" + last_id;

    options = {
      hostname: 'api.groupme.com',
      path: '/v3/groups/' + groupID + '/messages?token=' + token + '&limit=100' + pathAdd,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    Req = HTTPS.request(options, function(res) {
      var output = '';
      //console.log('statusCode:', res.statusCode);
      //console.log('headers:', res.headers);
      if (res.statusCode == 304) {
        //insert into database here
        memberList = ObjToArray(memberList);
        //console.log(memberList);
        databaseUpdate(memberList);
        Req.end();
        return;
      }
      res.setEncoding('utf8');

      res.on('data', function(chunk) {
        output += chunk;
      });

      res.on('end', function() {
        var obj = JSON.parse(output);
        //if (obj.response.messages.length > 0) {
          var msgs = obj.response.messages;
          var msgsLength = msgs.length;
          for (var i = 0; i < memberListLength; i++) {
            for (var j = 0; j < msgsLength; j++) {
            if (msgs[j].created_at > weekStart / 1000 && msgs[j].user_id == memberList[i].id) memberList[i].weekly_count++;
            if (msgs[j].user_id == memberList[i].id) memberList[i].count++;
          }
          }
          last_id = msgs[msgsLength - 1].id;
          populateCounts(memberList, last_id);
        //}
        /*else {
          console.log(memberList);
          //console.log("Length: "+msgs.length);
          //postMessage(userName + " has posted " + count + " messages this week.");
        }*/
      });
    });

    /*Req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });*/

    Req.end();
}

function getUserId(userName, callback, weekly) {
  var options, Req, userId;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/groups/' + groupID + '?token=' + token,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  Req = HTTPS.request(options, function(res) {
    var output = '';
    //console.log('statusCode:', res.statusCode);
    //console.log('headers:', res.headers);

    res.setEncoding('utf8');

    res.on('data', function(chunk) {
      output += chunk;
    });

    res.on('end', function() {
      var obj = JSON.parse(output);
      var members = obj.response.members;
      for (var i = 0; i < members.length; i++) {
        if (userName == members[i].nickname) {
          userId = members[i].user_id;
          console.log("User ID: " + userId);
        }
      }
      if (userId) {
      callback(postMessage, userName, userId, weekly);
      } else {
        postMessage(userName + " not found. Please use a current member name.")
      }
        
      });
  });

  /*Req.on('error', function(err) {
      //res.send('error: ' + err.message);
  });*/

  Req.end();
}

function getMemberList(callback) {
  var options, Req;
  var memberList = [];

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/groups/' + groupID + '?token=' + token,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  Req = HTTPS.request(options, function(res) {
    var output = '';
    //console.log('statusCode:', res.statusCode);
    //console.log('headers:', res.headers);

    res.setEncoding('utf8');

    res.on('data', function(chunk) {
      output += chunk;
    });

    res.on('end', function() {
      var obj = JSON.parse(output);
      var members = obj.response.members;
      for (var i = 0; i < members.length; i++) {
        
         memberList.push({"id":parseInt(members[i].user_id,10),"nickname":members[i].nickname,"count":0,"weekly_count":0});
        }
      //console.log(memberList);
      callback(memberList,0);
    });
  });

  /*Req.on('error', function(err) {
      //res.send('error: ' + err.message);
  });*/

  Req.end();
}

function getStartOfWeek() {
  var date = new Date();
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  date = new Date(date.getTime() - date.getDay() * 24 * 3600 * 1000);
  var dateUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return (dateUTC);
}

function incrementUserCount(body, res1, callback) {
  var options, Req;

  options = {
    hostname: process.env.HOST_NAME,
    port: process.env.PORT,
    path: '/api/countDB' + '?id=' + body.sender_id,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  Req = HTTP.request(options, function(res) {
    var output = '';
    //console.log('statusCode:', res.statusCode);
    //console.log('headers:', res.headers);

    res.setEncoding('utf8');

    res.on('data', function(chunk) {
      output += chunk;
    });

    res.on('end', function() {
      var obj = JSON.parse(output);
      //var msgCount = obj.response.count;
      console.log(obj);
      callback(body, res1);
    });
  });

  /*Req.on('error', function(err) {
      //res.send('error: ' + err.message);
  });*/

  Req.end();
}

function databaseUpdate(data) {
  var options, Req;

  options = {
    hostname: process.env.HOST_NAME,
    port: process.env.PORT,
    path: '/api/countDB',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

Req = HTTP.request(options, function(res) {
    if (res.statusCode == 202 || 200) {
      //neat
      console.log("Member count database updated successfully.")
    }
    else {
      console.log('rejecting bad status code ' + res.statusCode);
    }
  });

  Req.on('error', function(err) {
    console.log('error posting message ' + JSON.stringify(err));
  });
  Req.on('timeout', function(err) {
    console.log('timeout posting message ' + JSON.stringify(err));
  });
  Req.end(JSON.stringify(data));
  
  /*Req.on('error', function(err) {
      //res.send('error: ' + err.message);
  });*/
}

function ObjToArray(obj) {
  var arr = obj instanceof Array;

  return (arr ? obj : Object.keys(obj)).map(function(i) {
    var val = arr ? i : obj[i];
    if(typeof val === 'object')
      return ObjToArray(val);
    else
      return val;
  });
}

module.exports = new bot();
