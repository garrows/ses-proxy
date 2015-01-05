var should = require('should'),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport');



describe('Send Email', function() {

  it('should send an email successfully', function(testsDone) {
    this.timeout(5000);

    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport(smtpTransport({
      host: 'localhost',
      port: 25,
      debug: true
    }));

    transporter.on('log', function(data) {
      console.log('LOG!!!!', data);
    })

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
      should(error).not.be.ok;
      should(info).be.ok;
      info.should.have.property('response');

      console.log('Message sent: ' + info.response);

      testsDone(error);
    });


  });

});