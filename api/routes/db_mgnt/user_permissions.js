const express = require('express');
const router = express.Router();
const transporter = require('../../core/transporter');
const authenticate = require('../../middleware/authenticateMiddleware');


const {Users,UserVerifyToken} = require('../../models/index'); 
const crypto = require('crypto');

const sharp = require('sharp');
const sizeOf = require('image-size');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../ppictures/')
  },
  filename: function (req, file, cb) {
    const originalFileName = file.originalname.split('.').slice(0, -1).join('.');
    const newFileName = `${originalFileName}.png`;
    cb(null, newFileName);
  }
});
const upload = multer({ storage: storage });

router.post('/uploadpicture',authenticate(0), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('Kép feldolgozása sikertelen!');
    }
    const newFilename = `ppictures/${req.file.filename}.png`;
    const buffer = await sharp(req.file.path)
      .resize({
        width: 400,
        height: 400,
        fit: 'cover',
        position: 'center'
      })
      .toBuffer();
    await Users.update({
      picture: buffer
    }, {
      where: {
        email: req.user.email
      }
    });
    res.status(200).send('Sikeresen megváltoztatta a profil képét!');
  } catch (err) {
    res.status(500).send('Kép feldolgozása sikertelen!');
  }
});

router.get('/getpicture/:username', authenticate(0),async (req, res) => {
  try {
    const username = req.params.username;
    const user = await UsersData.findOne({
      where: {
        nev: username
      }
    });
    if (!user) {
      return res.status(404).send('Felhasználó nem található!');
    }
    const picture = user.picture;
    res.set('Content-Type', 'image/png');
    res.status(200).send(picture);
  } catch (error) {
    res.status(500).send('Hiba történt a kép lekérése közben!');
  }
});
  
router.post('/passwordreset', async (req, res,next) => {
  try {
    const user = await Users.findOne({
      where: {
        email: req.body.email
      }
    });

    if (!user) {
      return res.status(200).send("Megerősítő kódot kiküldtük!");
    }

    const token = crypto.randomBytes(32).toString('hex');
    const mailOptions = {
      from: 'memoriterckik@gmail.com',
      to: req.body.email,
      subject: 'Új jelszó',      
      html: `
      <!DOCTYPE html>
      <html lang="hu">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #000000; color: #ffffff;">

          <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #000000; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); text-align: center;">
              
              <h1 style="color: blueviolet; font-weight: 900; font-size: 29px; line-height: 1.2; margin: 0;">Tisztelt ${req.body.email.split('@')[0]}!</h1>
              
              <p style="color: #ffffff; font-size: 16px; margin: 10px 0;">
                  Jelszava megváltoztatásához kattintson az alábbi gombra:
              </p>
              
              <a href="https://memoriter.ckik.hu/user/passwordreset?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: blueviolet; color: #ffffff; border-radius: 5px; text-decoration: none; font-weight: 900; margin: 10px 0;">
                  Jelszó megváltoztatása
              </a>
              
              <p style="color: #ffffff; font-size: 16px; margin: 10px 0;">
                  Ha nem ön kezdeményezte, kérjük vegye fel velünk a kapcsolatot!
              </p>
              
              <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #777777;">
                  <p>&copy; 2024 Memoriter. Minden jog fenntartva.</p>
              </div>
          </div>

      </body>
      </html>
          `
    };

    await UserVerifyToken.destroy({
      where: {
        email: req.body.email
      }
    });
    await UserVerifyToken.create({
      email: req.body.email,
      token: token
    });

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        next(new Error('Váratlan hiba történt!'));
      } else {
        res.status(200).send("Megerősítő kódot kiküldtük!");
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Hiba történt a jelszó megváltoztatása közben');
  }
});

router.get('/passwordreset', async (req, res) => {
  try {
    const token = req.query.token;
    const userVerify = await UserVerifyToken.findOne({
      where: {
        token: token
      }
    });
    if (!userVerify) {
      return res.status(401).send(`
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
                <p>Kérjük, ellenőrizze az e-mailjét a helyes linkért, vagy kezdje újra a folyamatot.</p>
                <a href="https://memoriter.ckik.hu">Vissza a weboldalra</a>
            </div>
        </body>
        </html>
        `);
    }
    res.send(`
<html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
            font-size: large;
        }
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(to bottom, #0f0c29, #302b63, #24243e);
          height: 120vh;
          overflow: hidden;
        }
        form {
          top: 30%;
          position: relative;
          width: 330px;
          height: 210px;
          margin: auto;
          padding: 20px;
          border-radius: 30px;
          background-color: #fff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        label {
          display: block;
          margin-bottom: 10px;
          text-align: center;
        }
        ::placeholder {
            text-align: center; 
        }
        input[type="password"] {
          width: 100%;
          height: 40px;
          margin-bottom: 20px;
          padding: 10px;
          border: 1px solid black;
          border-radius: 30px;
        }
        button[type="submit"] {
          width: 100%;
          height: 40px;
          background-color: blueviolet;
          color: #fff;
          padding: 10px;
          border: none;
          border-radius: 30px;
          cursor: pointer;
        }
        button[type="submit"]:hover {
          background-color: lime;
        }

        #popup {
        position: fixed;
        top: 8%;
        left: 50%;
        width: 330px;
        transform: translate(-50%, -50%);
        padding: 20px;
        display: none;
        border-radius: 30px;
        }

        .popup-content {
        text-align: center;
        }

        .popup-message {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        }

        .success {
        background-color: #4CAF50;
        color: #fff;
        }

        .error {
        background-color: #f44336;
        color: #fff;
        }
        @media only screen and (max-width: 600px) {

        }
      </style>
    </head>

    <body>
        <div id="popup" class="">
            <div class="popup-content">
              <span id="popup-message"></span>
            </div>
        </div>
      <form id="myForm">
        <label for="password">Új jelszó</label>
        <input type="password" id="password" name="password" placeholder="Új jelszó">
        <label for="confirmPassword">Jelszó megerősítése</label>
        <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Jelszó megerősítése">
        <input type="hidden" id="token" name="token" value="${token}">
        <button type="submit" id="submit-btn"> Jelszó megváltoztatása</button>
      </form>

      <script>
        const form = document.getElementById('myForm');
        form.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const token = document.getElementById('token').value;

        validatePassword(password, confirmPassword);

        return false;
        });
        function validatePassword(password, confirmPassword) {
            const errors = [];
            if (password !== confirmPassword) {
                errors.push('A jelszó nem egyezik meg a megerésitett jelszóval!');
            }
            if (password.length < 8) {
                errors.push('A jelszó túl rövid (minimum 8 karakter)');
            }
            if (!/[A-Z]/.test(password)) {
                errors.push('A jelszó nem tartalmaz nagybetűt');
            }
            if (!/[0-9]/.test(password)) {
                errors.push('A jelszó nem tartalmaz számot');
            }
            if (errors.length > 0) {
                showPopup(errors.join('<br>'), 'error');
            }
            if (errors.length === 0) {
                handleSubmit();
            }
        }

        function showPopup(message, type) {
            const popup = document.getElementById('popup');
            const popupMessage = document.getElementById('popup-message');
            const popupClose = document.getElementById('popup-close');

            popupMessage.innerHTML = message;
            popup.classList = type;

            popup.style.display = 'block';

            setTimeout(() => {
                popup.style.display = 'none';
            }, 3000);
        }

        function handleSubmit (){
          event.preventDefault();
          const token = document.getElementById("token").value;
          const password = document.getElementById('password').value;
          const encoder = new TextEncoder();
          const passwordBuffer = encoder.encode(password);
          crypto.subtle.digest("SHA-256", passwordBuffer).then((hash) => {
            const hashedPassword = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
            const data = {
              password: hashedPassword,
              token: token
            };
            fetch("/user/passwordreset", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(data)
            })
            .then(response => response.text()) 
            .then((data) => {
                if (data === "Jelszó megváltoztatva!") {
                    showPopup(data, 'success');
                } else {
                    showPopup(data, 'error');
                }
            })
            .catch((error) => showPopup('Sikertelen jelszóváltoztatás! <br>'+error, 'error'));
          });
        };
      </script>
    </body>
  </html>
    `);
} catch (error) {
  res.status(500).send('Hiba történt a jelszó megváltoztatása közben');
}});

router.patch('/passwordreset', async (req, res) => {
  try {
    const token = req.body.token;
    const hashedPassword = req.body.password;
    const userVerify = await UserVerifyToken.findOne({
      where: {
        token: token
      }
    });
    if (!userVerify) {
      return res.status(401).send('Érvénytelen token');
    }
    const user = await Users.findOne({
      where: {
        email: userVerify.email
      }
    });

    await user.update({
      userpassword: hashedPassword
    });
    await UserVerifyToken.destroy({
      where: {
        email: userVerify.email
      }
    });
    res.status(200).send('Jelszó megváltoztatva!');
  } catch (error) {
    console.log(error);
    res.status(500).send('Hiba történt a jelszó megváltoztatása közben');
  }
});
  
module.exports = router