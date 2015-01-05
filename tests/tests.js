var should = require('should'),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport'),
  credentials = require('./ses-credentials.json');



describe('Send Email', function() {

  it('should send an email successfully', function(testsDone) {

    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport(smtpTransport({
      host: 'localhost',
      port: 25,
      // auth: {
      //   user: credentials.accessKeyId,
      //   pass: credentials.secretAccessKey
      // },
      ignoreTLS: true
    }));

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: 'Fred Foo ✔ <foo@example.com>',
      to: 'bar@example.com, baz@example.com',
      subject: 'Hello ✔',
      text: 'Hello world ✔',
      html: '<b>Hello world ✔</b>'
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
      console.log(error);
      should(error).not.be.ok;
      should(info).be.ok;
      info.should.have.property('response');

      console.log('Message sent: ' + info.response);

      testsDone(error);
    });


  });

});