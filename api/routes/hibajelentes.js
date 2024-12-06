const express = require('express');

const router = express.Router();

const pool = require('./sqlconnect')

router.post('/hibajelent', async (req, res) => {
    try {
      const { username, title, szoveg } = req.body;

      const adminEmailQueryResult = await pool.query("SELECT username FROM users WHERE Admin = 1");

      const adminRows = adminEmailQueryResult.rows || [];

      const adminEmails = adminRows.map(row => row.username);

      const adminPromises = adminEmails.map(adminEmail => {
        const mailOptions = {
          from: 'memoriterckik@gmail.com',
          to: adminEmail,
          subject: 'Hibabejelentés',
          text: `Új jelentés érkezett!\n\n${title}\n\n${szoveg}`
        };
        return transporter.sendMail(mailOptions);
      });

      await Promise.all(adminPromises);

      const reporterMailOptions = {
        from: 'memoriterckik@gmail.com',
        to: username,
        subject: 'Hibabejelentés Memoriter',
        text: `Jelentését sikeresen elküldtük!\n\n${title}\n\n${szoveg}`
      };

      await transporter.sendMail(reporterMailOptions);

      await pool.query("INSERT INTO jelentesek VALUES(null,?,?,?,0)", [username, title, szoveg]);

      res.send("Sikeres beküldés!");
    } catch (error) {
      console.error(error);
      
      res.status(500).send("Sikertelen beküldés!");
    }
  });
  
module.exports = router