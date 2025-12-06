import { transporter } from "./email.js";
import {RESET_PASSWORD_TEMPLATE} from "./templates/email.js"
export const sendPasswordResetEmail = async (toEmail, resetURL) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetURL}`;
  const htmlContent = RESET_PASSWORD_TEMPLATE.replace("{{resetURL}}", resetLink);
  const mailOptions = {
    from: '"DevOx Syndicate" <noreply@devox-syndicate.com>',
    to: toEmail,
    subject: "Reset Your Password",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent to:", toEmail);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};