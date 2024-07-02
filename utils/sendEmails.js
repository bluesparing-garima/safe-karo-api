import nodeMailer from "nodemailer";
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sendEmail = async (options) => {
    try {
        const transporter = nodeMailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            secure: true,
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_APP_PASS,
            }
        });

        const templatePath = path.resolve(__dirname, '../templates/otpTemplate.html');
       
        
        let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        htmlTemplate = htmlTemplate.replace(`{{OTP_CODE}}`, options.otp);

        const mailOptions = {
            from: process.env.SMPT_MAIL,
            to: options.to,
            subject: options.subject,
            html: htmlTemplate,
        };

        const info = await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export default sendEmail;
