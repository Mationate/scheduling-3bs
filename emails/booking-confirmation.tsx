import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface BookingConfirmationEmailProps {
  name: string;
  service: string;
  worker: string;
  shop: string;
  address: string;
  date: Date;
  time: string;
  duration: number;
  price: number;
}

export const BookingConfirmationEmail = ({
  name,
  service,
  worker,
  shop,
  address,
  date,
  time,
  duration,
  price,
}: BookingConfirmationEmailProps) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Reserva</title>
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
          .details {
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
          .info-section {
            margin: 20px 0;
            padding: 15px;
            background-color: #fff;
            border-radius: 8px;
            text-align: left;
          }
          .info-title {
            font-weight: bold;
            color: #000;
            margin-bottom: 5px;
          }
          .info-content {
            color: #666;
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
            <h2>¡Tu reserva está confirmada!</h2>
            <p>Hola ${name},</p>
            <p>Aquí están los detalles de tu reserva:</p>
            
            <div class="info-section">
              <div class="info-title">📅 Fecha y Hora</div>
              <div class="info-content">
                ${format(date, "PPP", { locale: es })}
                <br>
                ${time} hrs (${duration} minutos)
              </div>
            </div>

            <div class="info-section">
              <div class="info-title">💇 Servicio</div>
              <div class="info-content">
                ${service}
                <br>
                Precio: $${price.toFixed(2)}
              </div>
            </div>

            <div class="info-section">
              <div class="info-title">👤 Profesional</div>
              <div class="info-content">
                ${worker}
              </div>
            </div>

            <div class="info-section">
              <div class="info-title">📍 Local</div>
              <div class="info-content">
                ${shop}
                <br>
                ${address}
              </div>
            </div>

            <div class="footer">
              <p>Si necesitas hacer cambios en tu reserva o tienes alguna pregunta, 
                 por favor contáctanos respondiendo a este correo o llamando al local.</p>
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>© ${new Date().getFullYear()} 3BS Barbershop. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export default BookingConfirmationEmail; 