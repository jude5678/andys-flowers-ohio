const fetch = require('node-fetch');

const handler = async function(event) {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify("Payload required"),
    };
  }

  const requestBody = JSON.parse(event.body);

  await fetch(`${process.env.URL}/.netlify/functions/emails/weddings`, {
    headers: {
      "netlify-emails-secret": process.env.NETLIFY_EMAILS_SECRET,
    },
    method: "POST",
    body: JSON.stringify({
      from: "sender@example.com",
      to: requestBody.email,
      subject: "Wedding Inquiry",
      parameters: {
        name: requestBody.name, // this gets injected into {{name}} in your template
      },
    }),
  });

  return {
    statusCode: 200,
    body: JSON.stringify("Email sent!"),
  };
};

module.exports = { handler };