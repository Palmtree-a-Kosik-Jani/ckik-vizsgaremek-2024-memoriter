const express = require('express');

const router = express.Router();

const fs = require('fs');

const pool = require('../core/sqlconnect')

router.post('/usermgnt', (req, res) => {
    pool.query(
      'SELECT * FROM users WHERE username = ? AND userpassword = ? AND Admin = 1',
      [req.body.username, req.body.password],
      (err, results) => {
        if (results.length == 1) {
          switch (req.body.type) {
            case "load":
              fs.readFile('./Pages/admin.html', 'utf8', (err, data) => {
                if (err) {
                  console.error('Error reading admin.html:', err);
                } else {
                  res.send(data);
                }
              });
            break;
            case "deletetanar":
              pool.query("DELETE FROM users WHERE id = ?", [req.body.id], function (err, result) {
                if (err) {
                  res.send("Hiba történt a művelet során.");
                } else {
                  res.send("Sikeres művelet!");
                }
              });
              break;
              case "gettanar":
                pool.query("SELECT * FROM users", function (err, result) {
                  if (err) {
                    res.send("Hiba történt a művelet során.");
                  } else {
                    const formattedResult = result.map(row => {
                      if (row.Date && typeof row.Date === 'object') {
                        const formattedDate = row.Date.toLocaleString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false, // 24 órás formátum
                        });
                                return { ...row, Date: formattedDate };
                      } else {
                        return row;
                      }
                    });
                    res.send(formattedResult);
                  }
                });
            break;
            case "addtanar":
              pool.query("UPDATE users SET Tanar = ? WHERE id=?", [req.body.istanar,req.body.id], function (err, result) {
                if (err) {
                  res.send("Hiba történt a művelet során.");
                } else {
                  res.send("Sikeres művelet!");
                  if(req.body.istanar == "1"){
                    var mailOptions = {
                      from: 'memoriterckik@gmail.com',
                      to: req.body.tanaremail,
                      subject: 'Jóváhagyva',
                      text: "Fiókját sikeresen jováhagyták!\nBejelentkezés után hozzáférhet a tanároknak lértrehozott kezelő felületekhez!\nSegítségért forduljon hozzánk az alábbi elérhetőségen!\nmemoriterckik@gmail.com\nJóváhagyta: "+req.body.username
                    };       
                    transporter.sendMail(mailOptions, function(error, info){
                      if (error) {
                        console.log(error);
                      } else {
                        res.send("Jelszavát megváltoztattuk és e-mailba kiküldtük!");
                        console.log('Email sent: ' + info.response);
                      }
                    });
                  }
                }
              });
              break;
            default:
              res.send("Érvénytelen művelettípus.");
              break;
          }
        } else {
          res.send('Invalid permission');
        }
      }
    );
  });
  
module.exports = router