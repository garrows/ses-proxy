var fs = require('fs'),
  async = require('async'),
  AWS = require('aws-sdk'),
  path = require('path');

function SesSender(optConfig) {
  var credentialsFilePath = './ses-credentials.json';
  if (optConfig) {
    credentialsFilePath = optConfig;
  }

  if (fs.existsSync(credentialsFilePath)) {
    AWS.config.loadFromPath(credentialsFilePath);
  } else if (fs.existsSync(path.join(process.cwd(), credentialsFilePath))) {
    AWS.config.loadFromPath(path.join(process.cwd(), credentialsFilePath));
  } else {
    console.warn('Warning: Can not find credentials file.')
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