const express = require('express');
const router = express.Router();
const { Users, UserVerifyToken } = require('../../models/index'); 
const validator = require('email-validator');
const crypto = require('crypto');
const sendVerificationToken = require('./verifytoken');

router.post('/', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!validator.validate(email)) {
            const error = new Error('Érvénytelen e-mail cím');
            error.statusCode = 400;
            return next(error);
        } 
        const user = await Users.findOne({ where: { email } });
        const token = crypto.randomBytes(32).toString('hex');
        if (!user) {
            await registerUser(email, password, token);
            return res.status(200).send("Sikeres regisztráció!");
        } 
        if (user.hitelesitve == 0) {
            await sendVerificationToken.sendVerificationToken(email, token);
            return res.status(200).send("Az e-mail már létezik, de az ellenőrzés függőben van!");
        }
        return res.status(200).send("Már regisztrált e-mail!");

    } catch (error) {
        next(new Error('Váratlan hiba történt!'));
    }
});

async function registerUser(email, password, token) {
    await Users.create({ email, userpassword: password });
    await sendVerificationToken.sendVerificationToken(email, token)
}

router.get('/verify/:token', async (req, res, next) => {
  try {
    const token = req.params.token;
    const user = await UserVerifyToken.findOne({ where: { token: token } });
    
    if (user == null) {
      return res.status(400).send(`
       <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <title>Érvénytelen Token</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    background:linear-gradient(to bottom, #0f0c29, #302b63, #24243e);; 
                    margin: 0; 
                    padding: 20px; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh;
                    overflow: hidden;
                }
                .container { 
                    background: #fff; 
                    padding: 20px; 
                    border-radius: 30px; 
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
                    text-align: center;
                    border: 3px solid red;
                    box-shadow: 1px 1px 20px red;
                }
                h1 { color: red; ;text-transform: uppercase; font-weight: 900;}
                p { font-size: 16px; }
                a { 
                    display: inline-block; 
                    padding: 10px 20px; 
                    background-color: blueviolet; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 30px; 
                    margin-top: 40px; 
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Érvénytelen Token</h1>
                <p>A megadott token érvénytelen vagy már felhasználásra került.</p>
                <p>Kérjük, ellenőrizze az e-mailjét a helyes linkért, vagy próbáljon újra regisztrálni.</p>
                <a href="https://memoriter.ckik.hu">Vissza a weboldalra</a>
            </div>
        </body>
        </html>
      `);
    } else {
      await Users.update({ hitelesitve: 1 }, { where: { email: user.email } });
      await UserVerifyToken.destroy({ where: { token: token } });
      return res.status(200).send(`
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Fiók ellenőrzése sikeres</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    background:linear-gradient(to bottom, #0f0c29, #302b63, #24243e);; 
                    margin: 0; 
                    padding: 20px; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh;
                    overflow: hidden;
                }
                .container { 
                    background: #fff; 
                    padding: 20px; 
                    border-radius: 30px; 
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
                    text-align: center;
                    border: 3px solid lime;
                    box-shadow: 1px 1px 20px lime;
                }
                h1 { color: lime;text-transform: uppercase; font-weight: 900;}
                p { font-size: 16px; }
                a { 
                    display: inline-block; 
                    padding: 10px 20px; 
                    background-color: blueviolet; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 30px; 
                    margin-top: 10px; 
                }
            </style>
        </head>
        <body>
        <div class="container">
            <h1>Fiók Ellenőrzése Sikeres!</h1>
            <p>Köszönjük, hogy megerősítette a fiókját!</p>
            <p>Most már bejelentkezhet!</p>
            <a href="https://memoriter.ckik.hu">Vissza a weboldalra</a>
        </div>
        </body>
        </html>
      `);
    }
  } catch (error) {
    next(new Error('Váratlan hiba történt!'));
  }
});

module.exports = router;