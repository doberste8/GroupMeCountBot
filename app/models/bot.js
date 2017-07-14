// app/models/bot.js

var HTTPS = require('https');

var botID = process.env.BOT_ID;
var groupID = process.env.GROUP_ID;
var token = process.env.TOKEN;

function respond(body, res) {
  console.log(body.text);
  var messageRegex = /count/i;
  var messageRegex2 = /(.*)\.count/;

  if (body.text && messageRegex2.test(body.text)) {
    res.writeHead(200);
    var userName = messageRegex2.exec(body.text);
    getUserMessageCount(postUserMessage,userName[1],1,0,[]);
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
    "text": "I am message number " + botResponse
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
      postMessage(msgCount);
    });
  });

  /*Req.on('error', function(err) {
      //res.send('error: ' + err.message);
  });*/

  Req.end();
}

function getUserMessageCount(postMessage, userName, msgCount, last_id, msgs) {
  var options, Req;
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

      res.setEncoding('utf8');

      res.on('data', function(chunk) {
        output += chunk;
      });

      res.on('end', function() {
        var obj = JSON.parse(output);
        if (obj.response.messages.length>0) {
        msgCount = obj.response.count;
        msgs = msgs.concat(obj.response.messages);
        last_id = obj.response.messages[obj.response.messages.length-1].id;
        setTimeout(getUserMessageCount(postMessage,userName,msgCount,last_id,msgs),0);
        } else {
          console.log("Length: "+msgs.length);
          var count=0;
          for (var i=0;i<msgs.length;i++) {
            if (msgs[i].name==userName) count++;
          }
          postMessage(userName,count);
          }
      });
    });

    /*Req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });*/

    Req.end();

}

exports.respond = respond;
