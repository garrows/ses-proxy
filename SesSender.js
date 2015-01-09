var fs = require('fs'),
  async = require('async'),
  AWS = require('aws-sdk'),
  proxyAgent = require('proxy-agent'),
  path = require('path');

function SesSender(opts) {
  var credentialsFilePath = './ses-credentials.json';
  if (opts.config) {
    credentialsFilePath = opts.config;
  }

  if (fs.existsSync(credentialsFilePath)) {
    AWS.config.loadFromPath(credentialsFilePath);
  } else if (fs.existsSync(path.join(process.cwd(), credentialsFilePath))) {
    AWS.config.loadFromPath(path.join(process.cwd(), credentialsFilePath));
  } else {
    console.warn('Warning: Can not find credentials file.')
  }

  var proxy = process.env.http_proxy;
  proxy = opts.proxy ? opts.proxy : proxy;

  if (proxy) {
    console.log('Using http proxy', proxy);
    AWS.config.update({
      httpOptions: {
        agent: proxyAgent(proxy, true)
      }
    });
    AWS.config.update({
      sslEnabled: false
    });
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

    console.log('Attempting to send SES message');
    ses.sendRawEmail(options, function(err, data) {
      if (err) {
        console.error('Error sending SES email', err);
        console.error(err.stack);
        console.log(this.httpResponse.body.toString());
      } else {
        console.log('Successfully sent SES email.', data);
      }
      callback();
    });
  }
}

module.exports = SesSender;