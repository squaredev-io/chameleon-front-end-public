import nodemailer, { SendMailOptions } from "nodemailer";

const EMAIL_SMTP_HOST = process.env.NEXT_PUBLIC_SMTP_SERVER_HOST;
const EMAIL_SMTP_PORT = process.env.NEXT_PUBLIC_SMTP_SERVER_PORT;
const EMAIL_USERNAME = process.env.NEXT_PUBLIC_SMTP_SERVER_USERNAME;
const EMAIL_PASSWORD = process.env.NEXT_PUBLIC_SMTP_SERVER_PASSWORD;
const EMAIL_FROM = process.env.NEXT_PUBLIC_EMAIL_FROM_NAME;
const EMAIL_SUBJECT = process.env.NEXT_PUBLIC_EMAIL_SUBJECT;

const transporter = nodemailer.createTransport({
  host: EMAIL_SMTP_HOST,
  port: Number(EMAIL_SMTP_PORT),
  secure: true,
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD
  }
});

const getEmailOptions = (to: string, subject: string, htmlContent: string): SendMailOptions => {
  return {
    from: `"${EMAIL_FROM}" <${EMAIL_USERNAME}>`,
    to: to,
    subject: `[${EMAIL_SUBJECT}] ${subject}`,
    html: htmlContent
  };
};

export { EMAIL_FROM, EMAIL_SUBJECT, EMAIL_USERNAME, getEmailOptions, transporter };
