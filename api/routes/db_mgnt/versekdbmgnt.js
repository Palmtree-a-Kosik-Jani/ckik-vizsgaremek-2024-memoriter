const express = require('express');

const router = express.Router();

const pool = require('../core/sqlconnect')

const fs = require('fs');

const authenticateTanar = (req, res, next) => {
    pool.query(
      'SELECT * FROM users WHERE username = ? AND userpassword = ? AND Tanar = 1',
      [req.body.username, req.body.password],
      (err, results) => {
        if (results.length == 1) {
          if(results[0].Tanar == "1"){
            next();
          }else{
            res.status(401).send("Authentication required");
          }
        } else {
          res.status(401).send("Authentication required");
        }
      }
    );
  };

router.put('/updatevers',authenticateTanar,(req,res) =>{
  pool.query(
      'UPDATE versek SET Kolto = ?, Cim = ?, Ev = ?, Szoveg = ?, Osztaly = ? WHERE id = ?',
      [req.body.kolto,req.body.cim,req.body.ev,req.body.szoveg,req.body.osztaly,req.body.id],
      (err,results) =>{
      if (err) {
          res.send("Hiba történt a művelet során.");
      } else {
          res.send("Sikeres művelet!");
      }
      }
  )
})

router.post('/tanardash', authenticateTanar,(req, res) => {
  fs.readFile('./Pages/dashb_beta.html', 'utf8', (err, data) => {
      if (err) {
      console.error('Error reading dashboard.html:', err);
      } else {
      res.send(data);
      }
  });
});

router.post('/dbmgmt', authenticateTanar,(req, res) => {
    switch (req.body.type) {
        case "delete":
        pool.query("DELETE FROM versek WHERE id = ?", [req.body.id], function (err, result) {
            if (err) {
            res.send("Hiba történt a művelet során.");
            } else {
            update();
            res.send("Sikeres művelet!");
            }
        });
        break;
        case "newdata":
        pool.query("INSERT INTO versek VALUES (NULL,?,?,?,?,?,?)", [req.body.kolto,req.body.cim,req.body.ev,req.body.vers,req.body.osztaly,req.body.mufaj], function (err, result) {
            if (err) {
            res.send("Hiba történt a művelet során."+err);
            } else {
            update();
            res.send("Sikeres művelet!");
            }
        });
        break;
        default:
        res.send("Érvénytelen művelettípus.");
        break;
    }
});

router.post('/dbmgnt', (req, res) => {
  const { username, password } = req.body;
  pool.query(
    'SELECT * FROM users WHERE username = ? AND userpassword = ?',
    [username, password],
    (err, results) => {
      if (results.length > 0) {
        fs.readFile('./Pages/dashboard.html', 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading dashboard.html:', err);
          } else {
            res.send(data);
          }
        });
      } else {
        res.send('Invalid login');
      }
    }
  );
});
module.exports = router