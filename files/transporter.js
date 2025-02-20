const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL, // Your email
        pass: process.env.PASSWORD // Your email password or app password
    }
});

module.exports=transporter;