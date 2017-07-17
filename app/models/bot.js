// app/models/bot.js

var HTTPS = require('https');

var botID = process.env.BOT_ID;
var groupID = process.env.GROUP_ID;
var token = process.env.TOKEN;

function respond(body, res) {
  console.log(body.text);
  var messageRegex = /count/i;
  var messageRegex2 = /(.*)\.count/;
  var messageRegex3 = /(.*)\.count\.this week/;

  if (body.text && messageRegex3.test(body.text)) {
    res.writeHead(200);
    var userName = messageRegex2.exec(body.text);
    getUserId(userName[1],getUserWeeklyMessageCount);
    res.end();
  } 
  else if (body.text && messageRegex2.test(body.text)) {
    res.writeHead(200);
    var userName = messageRegex2.exec(body.text);
    getUserId(userName[1],getUserMessageCount);
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

function postUserMessage(userName,botResponse) {
  var options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id": botID,
    "text": userName + " has posted " + botResponse + " messages."
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

function getUserMessageCount(postMessage, userName, userId, msgCount, last_id, msgs, count) {
  var options, Req;
  if (userId) {
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
      postMessage(userName + " has posted " + count + " messages.");
      Req.end();
      return;
    }
    res.setEncoding('utf8');

    res.on('data', function(chunk) {
      output += chunk;
    });

    res.on('end', function() {
      var obj = JSON.parse(output);
      if (obj.response.messages.length > 0) {
        msgCount = obj.response.count;
        msgs = obj.response.messages;
        for (var i = 0; i < msgs.length; i++) {
          if (msgs[i].user_id == userId) count++;
        }
        last_id = obj.response.messages[obj.response.messages.length - 1].id;
        getUserMessageCount(postMessage, userName, userId, msgCount, last_id, msgs, count);
      }
      else {
        //console.log("Length: "+msgs.length);
        postMessage(userName + " has posted " + count + " messages.");
      }
    });
  });

  /*Req.on('error', function(err) {
      //res.send('error: ' + err.message);
  });*/

  Req.end();
} else {
  postMessage(userName + " not found. Please use a current member name.");
}
}

function getUserWeeklyMessageCount(postMessage, userName, userId, msgCount, last_id, msgs, count) {
  var options, Req;
  if (userId) {
    var weekStart = getStartOfWeek();
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
        postMessage(userName + " has posted " + count + " messages this week.");
        Req.end();
        return;
      }
      res.setEncoding('utf8');

      res.on('data', function(chunk) {
        output += chunk;
      });

      res.on('end', function() {
        var obj = JSON.parse(output);
        if (obj.response.messages.length > 0) {
          msgCount = obj.response.count;
          msgs = obj.response.messages;
          for (var i = 0; i < msgs.length; i++) {
            if (msgs[i].created_at > weekStart/1000 && msgs[i].user_id == userId) count++;
          }
          last_id = obj.response.messages[obj.response.messages.length - 1].id;
          getUserWeeklyMessageCount(postMessage, userName, userId, msgCount, last_id, msgs, count);
        }
        else {
          //console.log("Length: "+msgs.length);
          postMessage(userName + " has posted " + count + " messages this week.");
        }
      });
    });

    /*Req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });*/

    Req.end();
  }
  else {
    postMessage(userName + " not found. Please use a current member name.");
  }
}

function getUserId(userName, callback) {
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
      for (var i=0;i<members.length;i++) {
        if (userName == members[i].nickname) {
          userId = members[i].user_id;
          console.log("User ID: " + userId);
        }
      }
      callback(postMessage,userName,userId,1,0,[],0);
    });
  });

  /*Req.on('error', function(err) {
      //res.send('error: ' + err.message);
  });*/

  Req.end();
}

function getStartOfWeek() {
    var date = new Date();
    date = new Date(date.getFullYear(),date.getMonth(),date.getDate());
    date = new Date(date.getTime()-date.getDay()*24*3600*1000);
    var dateUTC = Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate());
    return(dateUTC);
}

exports.respond = respond;
