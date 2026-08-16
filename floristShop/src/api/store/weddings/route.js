import FormData from "form-data";
import Mailgun from "mailgun.js";

export const POST = async (req, res) => {
  // grab form inputs
  const { name, email, weddingDate, message } = req.body;

  // initialize mailgun
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY 
  });

  try {
    // send user a confirmation email
    await mg.messages.create("andysflowersohio.com", {
      from: "Andy's Flowers <weddings@andysflowersohio.com>",
      to: [`${name} <${email}>`],
      subject: "We received your wedding inquiry!",
      text: `Hi ${name},\n\nThanks for reaching out! We received your wedding inquiry and will get back to you soon.`,
    });


    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
