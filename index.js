var net = require('net');

var server = net.createServer(function(c) { //'connection' listener

  console.log('client connected');
  c.write('220 example.com ESMTP Postfix\n');

  var client = {
    from: null,
    to: [],
    isReadingData: false,
    data: ''
  };

  c.on('end', function() {
    console.log('client disconnected');
  });


  c.on('data', function(dataRaw) {
    var data = dataRaw.toString();

    console.log('client sent', data);


    // var commandRegEx = /[A-Za-z]+/;
    // var command = commandRegEx.exec(data)[0];
    // console.log('command', command);

    if (client.isReadingData == true) {

      if (data == '.\r\n') {
        console.log('Done sending.')
        client.isReadingData = false;
        return;
      }

      client.data += data;


    } else {

      switch (true) {
        case data.indexOf('EHLO') === 0:
          c.write('250-example.com Hello example.com [10.253.5.75]\n');
          c.write('250-PIPELINING\n');
          c.write('250 HELP\n');
          break;

        case data.indexOf('HELO') === 0:
          c.write('250 example.com\n');
          break;

        case data.indexOf('MAIL FROM:') === 0:
          var from = data.substring('MAIL FROM:'.length);
          console.log('Mail from', from);
          client.from = from;
          c.write('250 2.1.0 Sender OK\n');
          break;

        case data.indexOf('RCPT TO:') === 0:
          var to = data.substring('RCPT TO:'.length);
          console.log('Mail to', to);
          client.to.push(to);
          c.write('250 Ok\n');
          break;

        case data.indexOf('DATA') === 0:
          client.isReadingData = true;
          c.write('354 End data with <CR><LF>.<CR><LF>\n');

          break;

          // case data.indexOf('AUTH') === 0:
          //   console.log("AUTHTHHHHTHTHTH")
          //   c.write('250 example.com\n');
          //   break;

        default:
          c.write('500 unrecognized command\n');
          console.log('500 unrecognized command');
      }
    }

  });

});
server.listen(25, function() { //'listening' listener
  console.log('server bound');
});





console.log('Started SES-Proxy');