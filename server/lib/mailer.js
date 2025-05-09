// mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'celebrationstationofficial@gmail.com',
    pass: 'hetm mhnt ulhv klhm'
  }
});

const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: 'celebrationstationofficial@gmail.com',
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendMail };
