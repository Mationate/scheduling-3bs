import {Resend} from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTwoFactorTokenEmail = async (
    email:string,
    token:string
) => {
    await resend.emails.send({
        from:"onboarding@resend.dev",
        to: email,
        subject: "Tu código de verificación - 3BS Barbershop",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Código de Verificación</title>
              <style>
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                }
                .header {
                  background-color: #000;
                  padding: 20px;
                  text-align: center;
                  border-radius: 8px 8px 0 0;
                }
                .content {
                  background-color: #f9f9f9;
                  padding: 30px;
                  border-radius: 0 0 8px 8px;
                  text-align: center;
                }
                .logo {
                  color: #fff;
                  font-size: 24px;
                  font-weight: bold;
                  margin: 0;
                }
                .code {
                  font-size: 32px;
                  font-weight: bold;
                  color: #000;
                  letter-spacing: 8px;
                  margin: 30px 0;
                  padding: 20px;
                  background-color: #fff;
                  border-radius: 8px;
                  border: 2px dashed #ccc;
                }
                .footer {
                  margin-top: 30px;
                  font-size: 12px;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 class="logo">3BS Barbershop</h1>
                </div>
                <div class="content">
                  <h2>Tu código de verificación</h2>
                  <p>Usa el siguiente código para verificar tu identidad:</p>
                  <div class="code">${token}</div>
                  <p>Este código expirará en 5 minutos.</p>
                  <p>Si no solicitaste este código, puedes ignorar este correo.</p>
                  <div class="footer">
                    <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                    <p>© ${new Date().getFullYear()} 3BS Barbershop. Todos los derechos reservados.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
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