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
      // debug: true
    }));

    //Turn this on with the debug:true in smtpTransport
    transporter.on('log', function(data) {
      console.log(data);
    })

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: 'Glen Arrowsmith ✔ <glen.arrowsmith@itoc.com.au>',
      to: 'glen.arrowsmith@itoc.com.au',
      subject: 'Hello ✔',
      text: 'Hello\nworld ✔',
      html: '<b>Hello<br>world ✔</b>'
    };

    // var mailOptions = {
    //   from: 'Homer ✔ <homer@simpsons>',
    //   to: 'homer@simpsons',
    //   subject: 'Test Subject ✔',
    //   text: 'Hi,\r\nFrom Bob ✔',
    //   html: 'Hi,<br>From <b>Bob ✔</b>'
    // };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
      should(error).not.be.ok;
      should(info).be.ok;
      info.should.have.property('response');

      testsDone(error);
    });


  });

});