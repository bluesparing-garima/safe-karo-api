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

        const templatePath = path.resolve(__dirname, '../templates/bookedPolicy.html');
        let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        htmlTemplate = htmlTemplate
            .replace(`{{PARTNER_NAME}}`, options.partnerName || '')
            .replace(`{{MAKE}}`, options.make || '')
            .replace(`{{MODEL}}`, options.model || '')
            .replace(`{{VEHICLE_NUMBER}}`, options.vehicleNumber || '')
            .replace(`{{POLICY_NUMBER}}`, options.policyNumber || '')
            .replace(`{{COMPANY_NAME}}`, options.companyName || '')
            .replace(`{{FULL_NAME}}`, options.fullName || '');

        const logoPath = path.resolve(__dirname, '../assets/safekaroLogo.png');

        const mailOptions = {
            from: process.env.SMPT_MAIL,
            to: options.to,
            subject: options.subject,
            html: htmlTemplate,
            attachments: [
                {
                    filename: 'safekaroLogo.png',
                    path: logoPath,
                    cid: 'logo'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};


export default sendEmail;
