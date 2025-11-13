import { resendClient, sender } from "../lib/resend.js"
import { createWelcomeEmailTemplate } from "./emailTemplate.js"

export const sendWelcomeEmail = async (email: string, name: string, cliendURL: string) => {
    const {data, error} = await resendClient.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: "Welcome to Nextchat",
        html: createWelcomeEmailTemplate(name, cliendURL),
    });

    if (error){
        console.log(`Error sending welcome email ${error}`);
        throw new Error("Failed to send welcome email")
    }

    console.log(`Welcome email sent successfully ${data}`)
}