import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let msg;

export const sendVerificationEmail = async (to, verificationToken) => {
  msg = {
    to,
    from: "weronika.szumigala@gmail.com",
    subject: "Verify Your Email",
    text: `Click the following link to verify your email: ${
      process.env.BASE_URL || "http://localhost:3000"
    }/users/verify/${verificationToken}`,
    html: `<p>Click the following link to verify your email: <a href="${
      process.env.BASE_URL || "http://localhost:3000"
    }/users/verify/${verificationToken}">Verify Email</a></p>`,
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
