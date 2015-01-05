var net = require('net'),
  fs = require('fs'),
  AWS = require('aws-sdk');

var credentialsFilePath = './ses-credentials.json';

if (fs.existsSync(credentialsFilePath)) {
  AWS.config.loadFromPath('./ses-credentials.json');
} else {
  console.log('Warning: Missing credentials file.')
}









var server = net.createServer(function(c) { //'connection' listener

  console.log('client connected');
  c.write('220 example.com ESMTP Postfix\n');

  var client = {
    from: null,
    to: [],
    subject: '',
    isReadingData: false,
    data: '',
    html: null,
    text: null,
  };

  c.on('end', function() {
    console.log('client disconnected. Sending email.');

    var subjectRegEx = /[\n\r].*Subject:\s*([^\n\r]*)/;
    var boundaryRegEx = /.*boundary=\"\s*([^"]*)/;

    try {
      client.subject = subjectRegEx.exec(client.data)[1];
    } catch (e) {
      console.log('Warning: could not find subject.');
    }

    var boundary;
    try {
      boundary = boundaryRegEx.exec(client.data)[1];
      console.log('boundary', boundary);

      var split = client.data.split(boundary);

      for (var i = 2; i < split.length; i++) {

        var contentStartIndex = split[i].indexOf('\r\n\r\n');
        var content = split[i].substring(contentStartIndex);

        var isHtml = split[i].indexOf('Content-Type: text/html') !== -1;
        var isText = split[i].indexOf('Content-Type: text/plain') !== -1;

        console.log('Content\n', isHtml, isText, content);

        if (isHtml) {
          client.html = content;
        } else if (isText) {
          client.text = content;
        }
      }

    } catch (e) {
      console.log('Warning: could not find boundary.', e.stack);
      client.text = client.data;
      client.html = client.data;
    }


    var ses = new AWS.SES();

    var options = {
      Destination: {
        // ToAddresses: ["glen.arrowsmith@itoc.com.au"],
        ToAddresses: client.to,
      },
      Message: {
        Body: {
          Html: {
            Data: client.html
          },
          Text: {
            Data: client.text
          }
        },
        Subject: {
          Data: client.subject,
        },
      },
      Source: client.from,
      // Source: "glen.arrowsmith@itoc.com.au",
    };

    ses.sendEmail(options, function(err, data) {
      if (err) {
        console.log('Error sending SES email', err);
      } else {
        console.log('Successfully sent SES email.', data);
      }
    });


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
        c.write('250 Ok: queued as 12345\n');
      } else {
        client.data += data;
      }

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

        case data.indexOf('QUIT') === 0:
          c.end('221 Bye\n');

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