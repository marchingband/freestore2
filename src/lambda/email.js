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
  var transport = nodemailer.createTransport("Sendmail", "/usr/sbin/sendmail");

console.log('Sendmail Configured');

// Message object
var message = {

    // sender info
    from: 'Sender Name <sender@example.com>',

    // Comma separated list of recipients
    to: '"Receiver Name" <youthclubrecords@gmail.com>',

    // Subject of the message
    subject: 'Nodemailer is unicode friendly ✔', //

    // plaintext body
    text: 'Hello to myself!',

    // HTML body
    html:'<p><b>Hello</b> to myself <img src="cid:note@node"/></p>'+
         '<p>Here\'s a nyan cat for you as an embedded attachment:<br/><img src="cid:nyan@node"/></p>',

};

console.log('Sending Mail');

transport.sendMail(message, function(error){
    if(error){
        console.log('Error occured');
        console.log(error.message);
        return;
    }
    console.log('Message sent successfully!');
});
}

