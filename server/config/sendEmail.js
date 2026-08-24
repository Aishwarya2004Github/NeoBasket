import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

let resend = null;

if (apiKey) {
  resend = new Resend(apiKey);
} else {
  console.log("⚠ RESEND_API_KEY not found. Email service disabled.");
}

const sendEmail = async (data) => {
  try {
    if (!resend) {
      console.log("Skipping email:", data.subject);
      return;
    }

    return await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.sendTo,
      subject: data.subject,
      html: data.html,
    });
  } catch (error) {
    console.log(error);
  }
};

export default sendEmail;