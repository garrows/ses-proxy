var fs = require('fs'),
  async = require('async'),
  AWS = require('aws-sdk');

function SesSender() {

  var credentialsFilePath = './ses-credentials.json';

  if (fs.existsSync(credentialsFilePath)) {
    AWS.config.loadFromPath('./ses-credentials.json');
  } else {
    console.log('Warning: Missing credentials file.')
  }

  this.messageQueue = async.queue(this.send.bind(this), 1);

}

SesSender.prototype = {

  queue: function(client) {
    this.messageQueue.push(client);
  },

  send: function(client, callback) {

    var subjectRegEx = /[\n\r].*Subject:\s*([^\n\r]*)/;
    var boundaryRegEx = /.*boundary=\"\s*([^"]*)/;

    try {
      client.subject = subjectRegEx.exec(client.data)[1];
    } catch (e) {
      console.log('Warning: could not find subject.');
    }

    if (client.data == '') {
      console.log('Warning: no email body. Aborting.');
      return;
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
      callback();
    });
  }
}

module.exports = SesSender;