var should = require('should'),
  SesSender = require('../SesSender.js');

var sesSender = new SesSender();

var createClient = function() {
  return {
    from: null,
    to: [],
    subject: '',
    isReadingData: false,
    data: '',
    html: null,
    text: null,
  };
}

describe('Parse email', function() {

  it('should parse nodemailer email correctly', function() {

    var client = createClient();
    client.data = 'Content-Type: multipart/alternative;\r\n boundary="----sinikael-?=_1-14206797303500.6098026318941265"\r\nFrom: =?UTF-8?Q?Homer_=E2=9C=94?= <homer@simpsons>\r\nTo: homer@simpsons\r\nSubject: Test Subject =?UTF-8?Q?=E2=9C=94?=\r\nX-Mailer: nodemailer (1.3.0; +http://www.nodemailer.com;\r\n SMTP/0.1.13[client:1.1.0])\r\nDate: Thu, 08 Jan 2015 01:15:30 +0000\r\nMessage-Id: <1420679730473-1f3a6100-a127dac5-1044659f@simpsons>\r\nMIME-Version: 1.0\r\n\r\n------sinikael-?=_1-14206797303500.6098026318941265\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\nHi,\r\nFrom Bob =E2=9C=94\r\n------sinikael-?=_1-14206797303500.6098026318941265\r\nContent-Type: text/html; charset=utf-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\nHi,<br>From <b>Bob =E2=9C=94</b>\r\n------sinikael-?=_1-14206797303500.6098026318941265--';

    sesSender.parseData(client);

    should(client.data).be.ok;
    client.subject.should.eql('Test Subject =?UTF-8?Q?=E2=9C=94?=');
    client.html.should.eql('Hi,<br>From <b>Bob =E2=9C=94</b>');
    client.text.should.eql('Hi,\r\nFrom Bob =E2=9C=94');

  });

  it('should parse imail email correctly', function() {

    var client = createClient();
    client.data = 'From: Glen Arrowsmith <glen.arrowsmith@itoc.com.au>\r\nContent-Type: multipart/alternative; boundary="Apple-Mail=_D2B0CA59-2A86-4B14-81DA-AA7F3B5FD85F"\r\nSubject: =?utf-8?Q?Test_Subject_=E2=9C=94?=\r\nMessage-Id: <86AC74D3-BE59-45C0-ACB4-A5CA515FD339@itoc.com.au>\r\nDate: Thu, 8 Jan 2015 11:30:51 +1000\r\nTo: glen.arrowsmith@itoc.com.au\r\nMime-Version: 1.0 (Mac OS X Mail 8.1 \\(1993\\))\r\nX-Mailer: Apple Mail (2.1993)\r\n\r\n\r\n--Apple-Mail=_D2B0CA59-2A86-4B14-81DA-AA7F3B5FD85F\r\nContent-Transfer-Encoding: quoted-printable\r\nContent-Type: text/plain;\r\n\tcharset=utf-8\r\n\r\nHi,\r\n=46rom Bob =E2=9C=94=\r\n\r\n--Apple-Mail=_D2B0CA59-2A86-4B14-81DA-AA7F3B5FD85F\r\nContent-Transfer-Encoding: quoted-printable\r\nContent-Type: text/html;\r\n\tcharset=utf-8\r\n\r\n<html><head><meta http-equiv=3D"Content-Type" content=3D"text/html =\r\ncharset=3Dutf-8"></head><body style=3D"word-wrap: break-word; =\r\n-webkit-nbsp-mode: space; -webkit-line-break: after-white-space;" =\r\nclass=3D"">Hi,<div class=3D"">=46rom <b =\r\nclass=3D"">Bob&nbsp;=E2=9C=94</b></div></body></html>=\r\n\r\n--Apple-Mail=_D2B0CA59-2A86-4B14-81DA-AA7F3B5FD85F--';

    sesSender.parseData(client);

    should(client.data).be.ok;
    client.subject.should.eql('=?utf-8?Q?Test_Subject_=E2=9C=94?=');
    client.text.should.eql('Hi,\r\n=46rom Bob =E2=9C=94=\r\n');
    client.html.should.eql('<html><head><meta http-equiv=3D"Content-Type" content=3D"text/html =\r\ncharset=3Dutf-8"></head><body style=3D"word-wrap: break-word; =\r\n-webkit-nbsp-mode: space; -webkit-line-break: after-white-space;" =\r\nclass=3D"">Hi,<div class=3D"">=46rom <b =\r\nclass=3D"">Bob&nbsp;=E2=9C=94</b></div></body></html>=\r\n');

  });

});