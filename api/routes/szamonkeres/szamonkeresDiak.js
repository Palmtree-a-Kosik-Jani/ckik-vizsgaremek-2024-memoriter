const express = require('express');

const router = express.Router();

const pool = require('../core/sqlconnect')

router.post('/diakeredmenymentes', (req, res) => {
    pool.query("UPDATE szamonkeresek_diak SET Bekuldottvers = ? ,Eredmény = ?, Bekuldesido = CURRENT_TIMESTAMP() WHERE Tanulo = ? AND szamonkereskod = ?", [req.body.Bekuldottvers,req.body.Eredmény,req.body.Tanulo,req.body.szamonkereskod], function (err, result) {
      if (err) {
        res.send("Hiba történt a művelet során.");
      } else {
        res.send("Sikeres művelet!");
      }
    });
  });
  
  router.post('/diakeredmenyellenorzes', (req, res) => {
    pool.query("SELECT Kiszedettszavak FROM szamonkeresek_tanar WHERE Diakkod = ?", [req.body.szamonkereskod], function (err, result) {
      if (err) {
        res.send("Hiba történt a művelet során.");
      } else {
        res.send(result[0].Kiszedettszavak);
      }
    });
  });
  
  router.post('/szamonkeres', (req, res) => {
    const { username, password } = req.body;
    pool.query(
      'SELECT Verscim FROM szamonkeresek_tanar WHERE Diakkod = ?',
      [password],
      (err, results) => {
        if (results.length > 0) {
          pool.query(
            "INSERT INTO szamonkeresek_diak (szamonkereskod, Tanulo) VALUES (?, ?)",
            [password, username],
            (err, results) => {
              if (err) {
                console.error('Error in INSERT query:', err);
              }
            }
          );
          res.send(results[0].Verscim);
        } else {
          res.send('Sikertelen');
        }
      }
    );
  });

  router.post('/diaktorolve', (req, res) => {
    const { username, password } = req.body;
    pool.query(
      'SELECT * FROM szamonkeresek_diak WHERE szamonkereskod = ? AND Tanulo = ?',
      [password,username],
      (err, results) => {
        if (results.length > 0) {
          res.send("Belépve");
        } else {
          res.send('Sikertelen');
        }
      }
    );
  });
  
  router.post('/szamonkeresbeleptetes', (req, res) => {
    const { username, password } = req.body;
    pool.query(
      'SELECT Vers, Elindítva FROM szamonkeresek_tanar WHERE Diakkod = ?',
      [password],
      (err, results) => {
        if (err) {
          return;
        }
        if (results.length > 0 && results[0].Elindítva === 1) {
          res.send(results[0].Vers);
        } else {
          res.send('Nincs elindítva');
        }
      }
    );
  });
  
module.exports = router