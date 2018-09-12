const stripe = require("stripe")(process.env.SECRET_KEY);
const mail = require("nodemailer").mail;


// var transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//          user: 'andymarch@protonmail.com',
//          pass: process.env.EMAIL_PASSWORD
//      }
//  });
//  const mailOptions = {
//   from: 'andymarch@protonmail.com', // sender address
//   to: 'youthclubrecords@gmail.com', // list of receivers
//   subject: 'someone bought a thing', // Subject line
//   html: '<p>oh fukkkkk ya</p>'// plain text body
// };

const statusCode = 200;
const headers = {
  "Access-Control-Allow-Origin" : "*",
  "Access-Control-Allow-Headers": "Content-Type"
};

exports.handler = function(event, context, callback) {

  //-- We only care to do anything if this is our POST request.
  if(event.httpMethod !== 'POST' || !event.body) {
    callback(null, {
      statusCode,
      headers,
      body: ''
    });
  }

  //-- Parse the body contents into an object.
  const data = JSON.parse(event.body);

  //-- Make sure we have all required data. Otherwise, escape.
  if(
    !data.token ||
    !data.amount ||
    !data.idempotency_key
  ) {

    console.error('Required information is missing.');

    callback(null, {
      statusCode,
      headers,
      body: JSON.stringify({status: 'missing-information'})
    });

    return;
  }

  stripe.charges.create(
    {
      currency: 'usd',
      amount: data.amount,
      source: data.token.id,
      receipt_email: data.token.email,
      description: `charge for a widget`
    },
    {
      idempotency_key: data.idempotency_key
    }, (err, charge) => {

      if(err !== null) {
        console.log(err);
      }

      let status = (charge === null || charge.status !== 'succeeded')
        ? 'failed'
        : charge.status;

      callback(null, {
        statusCode,
        headers,
        body: JSON.stringify({status,email:data.token.email})
      });

      if(status=='succeeded'){
        mail({
          from: "Fred Foo ✔ <foo@blurdybloop.com>", // sender address
          to: "youthclubrecords@gmail.com", // list of receivers
          subject: "Hello ✔", // Subject line
          text: "Hello world ✔", // plaintext body
          html: "<b>Hello world ✔</b>" // html body
        });
      //   nodemailer.mail(mailOptions, function (err, info) {
      //     if(err)
      //       console.log(err)
      //     else
      //       console.log(info);
      //  });
      }

    }
  );
}