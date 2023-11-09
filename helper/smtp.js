import nodemailer from "nodemailer";

export default async (from, to, subject, text, attachments) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    // service: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    secure: true,
    // logger: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("Try to send email...");
    const sendEmail = await transporter.sendMail({
      from,
      to,
      subject,
      html: text,
      attachments,
    });

    if (!sendEmail.accepted && !sendEmail.accepted.length > 0) {
      throw new Error("Send email failed");
    }

    console.log("Email sended to", to);
  } catch (error) {
    throw error;
  }
};
