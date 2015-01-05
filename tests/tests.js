var should = require('should'),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport');



describe('Send Email', function() {

  it('should send an email successfully', function(testsDone) {

    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport(smtpTransport({
      host: 'localhost',
      port: 25,
      auth: {
        user: 'test',
        pass: 'test'
      }
    }));

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: 'Fred Foo ✔ <foo@blurdybloop.com>',
      to: 'bar@blurdybloop.com, baz@blurdybloop.com',
      subject: 'Hello ✔',
      text: 'Hello world ✔',
      html: '<b>Hello world ✔</b>'
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
      should(error).not.be.ok;
      should(info).be.ok;
      info.should.have.property('response');

      console.log('Message sent: ' + info.response);

      testsDone(error);
    });


  });

});