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
    this.sendRaw(client, callback);
  },

  sendRaw: function(client, callback) {

    var ses = new AWS.SES();

    var options = {
      RawMessage: {
        Data: client.data
      },
      Destinations: client.to
    };

    ses.sendRawEmail(options, function(err, data) {
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