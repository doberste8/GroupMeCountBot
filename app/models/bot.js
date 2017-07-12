// app/models/bot.js

var HTTPS = require('https');

var botID = process.env.BOT_ID;
var groupID = process.env.GROUP_ID;
var token = process.env.TOKEN;

function respond(body,res) {
  console.log(body.text);
//  var messageRegex = /^Message Count\?$/;
  var messageRegex = /count/i;
 
 if (body.text && messageRegex.test(body.text)) {
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

function getMessageCount(postMessage) {
  var options, Req;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/groups/' + groupID + '/messages?token=' + token,
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
            var obj = JSON.stringify(output);
            var countRegex = /{\\"count\\":(\d*)/;
            var count = countRegex.exec(obj);
            postMessage(count[1]);
        });
    });

    /*Req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });*/

    Req.end();
}

exports.respond = respond;
