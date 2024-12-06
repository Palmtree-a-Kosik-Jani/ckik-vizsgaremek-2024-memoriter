const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'memoriterckik@gmail.com',
    pass: 'wyzn sbze isdo eolt'
  }
});

module.exports = transporter;