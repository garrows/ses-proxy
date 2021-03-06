var net = require('net'),
  SesSender = require('./SesSender.js');


var sesSender;

var createClient = function() {
  return {
    from: null,
    to: [],
    subject: '',
    isReadingData: false,
    data: ''
  };
}

var server = net.createServer(function(c) { //'connection' listener

  console.log('client connected');
  setTimeout(function() {
    c.write('220 localhost ESMTP Postfix\r\n');
  }, 100);

  var client = createClient();

  c.on('end', function() {
    console.log('client disconnected.');
  });

  c.on('error', function(error) {
    console.log('socket error', error);
  });

  c.on('drain', function() {
    console.log('socket drain', arguements);
  });

  c.on('timeout', function() {
    console.log('socket timeout', arguements);
  });

  c.on('data', function(dataRaw) {
    var data = dataRaw.toString();

    if (client.isReadingData == true) {

      client.data += data;

      var terminationIndex = client.data.indexOf('\r\n.\r\n');
      if (terminationIndex !== -1) {
        client.data = client.data.substring(0, terminationIndex);
        client.isReadingData = false;
        console.log('Message received.', client);
        sesSender.queue(client);
        client = createClient();
        c.write('250 Ok: queued as ' + sesSender.messageQueue.length() + '\r\n');
      }
    } else {

      console.log('client sent command', data);

      switch (true) {
        case data.indexOf('EHLO') === 0:
          c.write('250-localhost Hello localhost [10.253.5.75]\r\n');
          c.write('250-PIPELINING\r\n');
          c.write('250 HELP\r\n');
          break;

        case data.indexOf('HELO') === 0:
          c.write('250 localhost\r\n');
          break;

        case data.indexOf('MAIL FROM:') === 0:
          var from = data.substring('MAIL FROM:'.length);
          client.from = from;
          c.write('250 2.1.0 Sender OK\r\n');
          break;

        case data.indexOf('RCPT TO:') === 0:
          var to = data.substring('RCPT TO:'.length);
          client.to.push(to);
          c.write('250 Ok\r\n');
          break;

        case data.indexOf('DATA') === 0:
          client.isReadingData = true;
          c.write('354 End data with <CR><LF>.<CR><LF>\r\n');

          break;

        case data.indexOf('QUIT') === 0:
          c.end('221 Bye\n');

          break;

        default:
          c.write('500 unrecognized command\r\n');
          console.log('500 unrecognized command');
      }
    }

  });

});

var port = 25;
var portSpecified = false;
var options;

var start = function(port) {
  server.listen(port);
};

server.on('listening', function(err) {
  console.log('Started SES-Proxy on port', port);
  sesSender = new SesSender(options);
});

server.on('error', function(err) {
  console.log('Error starting server on port', port, err.code);
  if (err.code == 'EACCES' || err.code == 'EADDRINUSE') {
    if (portSpecified) {
      console.log('Aborting');
    } else {
      port = 2525;
      console.log('Trying port', port);
      start(port)
    }
  } else {
    throw e;
  }

});

module.exports = function(opts) {
  options = opts;
  if (options.port) {
    portSpecified = true;
    port = options.port;
  }
  start(port);
}