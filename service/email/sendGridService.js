import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let msg;
const baseUrl = "http://localhost:3000/api";
export const sendVerificationEmail = async (to, verificationToken) => {
  const verificationLink = `${baseUrl}/users/verify/${verificationToken}`;

  msg = {
    to,
    from: "weronika.szumigala@gmail.com",
    subject: "Verify Your Email",
    text: `Click the following link to verify your email:${verificationLink}`,
    html: `<p>Click the following link to verify your email: <a href="${verificationLink}">Verify Email</a></p>`,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

export { msg };
