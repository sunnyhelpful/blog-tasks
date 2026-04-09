const nodemailer = require('nodemailer');
const path = require('path');
// require('dotenv').config();

let transporter;
if (process.env.EMAIL_SERVICE_TYPE == 'gmail') {
    transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.EMAIL_USER_FOR_GMAIL,
            pass: process.env.EMAIL_PASS_FOR_GMAIL
        }
    });
} else {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVICE,
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

const sender = {
    name: "Kanzy",
    address: "admin@kanzy.com",
};

module.exports = { transporter, sender };
