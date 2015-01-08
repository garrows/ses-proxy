var fs = require('fs'),
  async = require('async'),
  AWS = require('aws-sdk'),
  utf8 = require('utf8'),
  mimelib = require('mimelib');

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
        var chunk = split[i];

        var contentStartIndex = chunk.indexOf('\r\n\r\n') + 4;
        var contentEndIndex = chunk.indexOf('\r\n--');
        var content = chunk.substring(contentStartIndex, contentEndIndex);

        var isHtml = chunk.indexOf('Content-Type: text/html') !== -1;
        var isText = chunk.indexOf('Content-Type: text/plain') !== -1;

        if (isHtml || isText) {
          content = this.decodeMessage(chunk, content);
        }

        if (isHtml) {
          client.html = content;
        } else if (isText) {
          client.text = content;
        }
      }

    } catch (e) {
      //Could not find boundary. Probably text only.
      try {
        var content = client.data.split('\r\n\r\n')[1];
        content = this.decodeMessage(client.data, content);
        client.text = content;
        client.html = content;
      } catch (e) {
        console.warn('Warning: could not parse message without boundary.', e.stack);
        client.text = client.data;
        client.html = client.data;

      }
    }
  },

  decodeMessage: function(dataChunk, message) {
    var contentTransferEncodingRegEx = /[\n\r].*Content-Transfer-Encoding:\s*([^\n\r]*)/;
    try {
      var contentTransferEncoding = contentTransferEncodingRegEx.exec(dataChunk)[1];
      switch (contentTransferEncoding) {
        case 'quoted-printable':
          message = mimelib.decodeQuotedPrintable(message);
          break;
        case 'base64':
          message = (new Buffer(message, 'base64')).toString();
          break;
        default:
          console.warn('Unknown Content-Transfer-Encoding');
      }
      return message;
    } catch (e) {
      console.log('Couldnt find Content-Transfer-Encoding', dataChunk);
      return message;
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