var should = require('should'),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport');





describe('Send Email', function() {
  this.timeout(5000);

  before(function(done) {
    var server = require('../index.js');
    server(2525);
    setTimeout(done, 200);
  });
  after(function(done) {
    //Wait a bit for the SES api call.
    setTimeout(done, 3000);
  });

  it('should send an email successfully', function(testsDone) {




    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport(smtpTransport({
      host: 'localhost',
      port: 2525,
      // debug: true
    }));

    //Turn this on with the debug:true in smtpTransport
    transporter.on('log', function(data) {
      console.log(data);
    })

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: process.env.FROM ? process.env.FROM : 'lisa@example.com',
      to: process.env.TO ? process.env.TO : 'home@example.com',
      subject: 'Hello ✔',
      text: 'Hello\nworld ✔',
      html: '<b>Hello<br>world ✔</b>'
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
      should(error).not.be.ok;
      should(info).be.ok;
      info.should.have.property('response');

      testsDone(error);
    });


  });

});