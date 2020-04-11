const mailer = require('nodemailer');
const { welcome } = require('./welcome_template');
require('dotenv').config();

const getEmailData = (to, name, token, template) => {
    let data = null;

    switch (template) {
        case "welcome":
            data = {
                from: "ShopApp <markofilipovicsd@gmail.com",
                to,
                subject: `Welcome to ShopApp ${name}`,
                html: welcome()
            }
            break;

        default:
            data;
    }

    return data;
}

const sendEmail = (to, name, token, type) => {

    const smtpTransport = mailer.createTransport({
        service: "Gmail",
        auth: {
            user: "markofilipovicsd@gmail.com",
            pass: process.env.EMAIL_PASS
        }
    });

    const mail = getEmailData(to, name, token, type);

    smtpTransport.sendMail(mail, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            console.log('email sent');
        }
        smtpTransport.close();
    })
}

module.exports = { sendEmail }