import fetch from 'node-fetch';

export const handler = async function(event) {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify("Payload required"),
    };
  }

  const requestBody = JSON.parse(event.body);

  try {
    const response = await fetch(`${process.env.URL}/.netlify/functions/emails`, {
      headers: {
        "netlify-emails-secret": process.env.NETLIFY_EMAILS_SECRET,
      },
      method: "POST",
      body: JSON.stringify({
        from: "andysflowersohio.com", 
        to: `${requestBody.email}`, 
        subject: `New Wedding Inquiry from ${requestBody.name}`,
        parameters: {
          name: requestBody.name,
          email: requestBody.email
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Netlify Email Service Error:", errorText);
      return { statusCode: 500, body: JSON.stringify("Failed to route email") };
    }

    return {
      statusCode: 200,
      body: JSON.stringify("Email sent!"),
    };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: JSON.stringify("Internal Server Error") };
  }
};
