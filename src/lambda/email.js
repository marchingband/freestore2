var mail = require("nodemailer").mail;

exports.handler = function(event, context, callback) {

  if(event.httpMethod !== 'POST' || !event.body) {
    callback(null, {
      statusCode,
      headers,
      body: ''
    });
  }
  const data = JSON.parse(event.body);
  mail({
    from: "<foo@blurdybloop.com>", // sender address
    to: "youthclubrecords@gmail.com", // list of receivers
    subject: "Hello ", // Subject line
    text: "Hello world ", // plaintext body
    html: "<b>Hello world </b>" // html body
  });
  callback('poop')
}

