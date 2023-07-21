const nodemailer = require("nodemailer");

module.exports = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
          host: process.env.HOPST,
          service: process.env.SERVICE,
          port: Number(process.env.EMAIL_PORT),
          secure: Boolean(process.env.SECURE),
          auth: {
            user: process.env.USER,
            pass: process.env.PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
        const info = await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text,
        })
        console.log("Email has been sent successfully: " + info.messageId)
    }catch (err) {
        console.log("Email not send ")
        console.log(err)
    }
}