const {UserVerifyToken} = require('../../models/index'); 
const transporter = require('../../core/transporter');

module.exports.sendVerificationToken = async function sendVerificationToken(email, token) {
    await UserVerifyToken.destroy({ where: { email } });
    await UserVerifyToken.create({ email, token });
    await sendEmailToVerify(email, token);
  }

async function sendEmailToVerify(email, token) {
    const mailOptions = {
        from: 'memoriterckik@gmail.com',
        to: email,
        subject: 'Regisztráció véglegesítése!',
        html: `
        <!DOCTYPE html>
        <html lang="hu">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Regisztráció véglegesítése</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #000000; color: #ffffff;">

            <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #000000; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); text-align: center;">
                
                <h1 style="color: blueviolet; font-weight: 900; font-size: 29px; margin: 0; padding: 0;">Regisztráció véglegesítése!</h1>
                
                <p style="color: #ffffff; font-size: 16px; margin: 10px 0;">
                    Kérjük, kattintson az alábbi gombra, hogy véglegesítse fiókjának létrehozását!
                </p>
                
                <a href="https://memoriter.ckik.hu/auth/register/verify/`+token+`" style="display: inline-block; padding: 10px 20px; background-color: blueviolet; color: #ffffff; border-radius: 5px; text-decoration: none; font-weight: 900; margin: 10px 0;">
                    Fiók aktiválása
                </a>
                
                <p style="color: #ffffff; font-size: 16px; margin: 10px 0;">
                    Ha nem Ön kezdeményezte a regisztrációt, akkor figyelmen kívül hagyhatja ezt az e-mailt.
                </p>
                
                <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #777777;">
                    <p style="margin: 0;">&copy; 2024 Memoriter. Minden jog fenntartva.</p>
                </div>
            </div>

        </body>
        </html>
    `
    };     
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return reject(new Error('Váratlan hiba történt e-mail küldés közben'));
            }
            resolve(info);
        });
    });
}
