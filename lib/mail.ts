import {Resend} from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTwoFactorTokenEmail = async (
    email:string,
    token:string
) => {
    await resend.emails.send({
        from:"onboarding@resend.dev",
        to: email,
        subject: "Confirmación de dos factores",
        html: `<p> Tu código es ${token} </p>`,
    })
}


export const sendPasswordResetEmail = async (
    email:string,
    token:string
) => {
    const resetLink = `http://localhost:3000/new-password?token=${token}`;
    await resend.emails.send({
        from:"onboarding@resend.dev",
        to: email,
        subject: "Restablece tu contraseña",
        html: `<p> Click <a href="${resetLink}">aquí</a> para cambiar tu contraseña</p>`,
    });
}

export const sendVerificationEmail = async (
    email:string,
    token:string
) => {
    const confirmLink = `http://localhost:3000/verificar?token=${token}`;
    await resend.emails.send({
        from:"onboarding@resend.dev",
        to: email,
        subject: "Confirma tu correo",
        html: `<p> Click <a href="${confirmLink}">aquí</a> para confirmar tu correo</p>`,
    });
}