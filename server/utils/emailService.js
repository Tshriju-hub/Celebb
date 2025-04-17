const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send booking confirmation email
const sendBookingConfirmation = async (user, booking) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@celebrations.com',
      to: user.email,
      subject: 'Booking Confirmation',
      html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <ul>
          <li>Service: ${booking.service}</li>
          <li>Date: ${new Date(booking.date).toLocaleDateString()}</li>
          <li>Time: ${booking.time}</li>
          <li>Points Earned: ${booking.pointsEarned}</li>
        </ul>
        <p>Thank you for choosing our services!</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendBookingConfirmation
}; 