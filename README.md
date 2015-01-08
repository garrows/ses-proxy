ses-proxy
=========

Proxy SMTP emails to Amazon's SES (Simple Email Service)

This is particularly useful if your server only has internet access via a HTTP proxy.


Setup
-----
Install command
```
npm install -g ses-proxy
```

Export http proxy variable if required
```
export http_proxy=http://proxy.example.com:3128/
```


Testing
-------

This will actually send a test email to the specified account so make sure they are a verified sender in the AWS SES console
```
TO=homer@example.com FROM=lisa@example.com npm test
```
