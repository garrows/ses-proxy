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

The AWS-SDK will pickup your servers IAM credentials if it has them. Otherwise use a config file in the following format.
```
{
  "accessKeyId": "your-access-key",
  "secretAccessKey": "your-secret-key",
  "region": "us-east-1"
}
```
Call the filename `ses-credentials.json`.

Run
---

```
[sudo] ses-proxy --config ./ses-credentials.json --port 25
```
Note you don't need sudo if you're using a high port number.


Testing
-------

This will actually send a test email to the specified account so make sure they are a verified sender in the AWS SES console
```
TO=homer@example.com FROM=lisa@example.com npm test
```
