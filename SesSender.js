var fs = require('fs'),
  async = require('async'),
  AWS = require('aws-sdk');

function SesSender() {

  var credentialsFilePath = './ses-credentials.json';

  if (fs.existsSync(credentialsFilePath)) {
    AWS.config.loadFromPath('./ses-credentials.json');
  } else {
    console.warn('Warning: Missing credentials file.')
  }

  this.messageQueue = async.queue(this.processClient.bind(this), 1);

}

SesSender.prototype = {

  queue: function(client) {
    this.messageQueue.push(client);
  },

  processClient: function(client, callback) {
    this.parseData(client);
    this.send(client, callback);
  },

  parseData: function(client) {
    var subjectRegEx = /[\n\r].*Subject:\s*([^\n\r]*)/;
    var boundaryRegEx = /.*boundary=\"\s*([^"]*)/;

    try {
      client.subject = subjectRegEx.exec(client.data)[1];
    } catch (e) {
      console.warn('Warning: could not find subject.');
    }

    if (client.data == '') {
      console.warn('Warning: no email body. Aborting.');
      return;
    }

    var boundary;
    try {
      boundary = boundaryRegEx.exec(client.data)[1];

      var split = client.data.split(boundary);

      for (var i = 2; i < split.length; i++) {

        var contentStartIndex = split[i].indexOf('\r\n\r\n') + 4;
        var contentEndIndex = split[i].indexOf('\r\n--');
        var content = split[i].substring(contentStartIndex, contentEndIndex);


        var isHtml = split[i].indexOf('Content-Type: text/html') !== -1;
        var isText = split[i].indexOf('Content-Type: text/plain') !== -1;

        if (isHtml) {
          client.html = content;
        } else if (isText) {
          client.text = content;
        }
      }

    } catch (e) {
      console.warn('Warning: could not find boundary.', e.stack);
      client.text = client.data;
      client.html = client.data;
    }
  },

  send: function(client, callback) {




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
        console.error('Error sending SES email', err);
      } else {
        console.log('Successfully sent SES email.', data);
      }
      callback();
    });
  }
}

module.exports = SesSender;