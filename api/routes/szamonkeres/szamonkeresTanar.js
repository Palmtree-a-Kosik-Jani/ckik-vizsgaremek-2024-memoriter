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
  
function fetchDatasz(tanar) {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM szamonkeresek_tanar where Letrehozta = ?",[tanar], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
}

router.post('/datasz', async (req, res) => {
    var datasz = await fetchDatasz(req.body.tanar);
    try {
      res.json(datasz);
    } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

function checkIfKeyExists(randomKey) {
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM szamonkeresek_tanar WHERE Diakkod = ?", [randomKey], (err, result) => {
        if (err) {
          reject("Hiba történt a művelet során.");
        } else {
          resolve(result.length !== 0);
        }
      });
    });
}
  
function kodsz() {
    const randomKey = generateRandomKey(4);

    return checkIfKeyExists(randomKey)
      .then((keyExists) => {
        if (keyExists) {
          return kodsz();
        } else {
          return Promise.resolve(randomKey);
        }
      })
      .catch((err) => {
        console.error(err);
        throw err; 
      });
}

function generateRandomKey(length) {
    const characters = 'ABCDEFGHJKMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789';

    let randomKey = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomKey += characters.charAt(randomIndex);
    }

    return randomKey;
  }

  router.post('/loginsz', (req, res) => {
    const { username, password } = req.body;
    pool.query(
      'SELECT * FROM users WHERE username = ? AND userpassword = ?',
      [username, password],
      (err, results) => {
        if (results.length > 0) {
          fs.readFile('./Pages/szamonkeres.html', 'utf8', (err, data) => {
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

  router.post('/dbmgmtsz', authenticateTanar,(req, res) => {
  switch (req.body.type) {
    case "delete":
      pool.query("DELETE FROM szamonkeresek_tanar WHERE id = ?", [req.body.id], function (err, result) {
        if (err) {
          res.send("Hiba történt a művelet során.");
        } else {
          res.send("Sikeres művelet!");
        }
      });
      break;
    case "newdata":
      kodsz()
        .then((kod) =>{
          pool.query("INSERT INTO szamonkeresek_tanar VALUES (NULL,0,?,?,0,?,?,?,?)", [req.body.Osztaly,req.body.Vers,req.body.tanar,kod,req.body.Verscim,req.body.Kiszedettszavak], function (err, result) {
            if (err) {
              res.send("Hiba történt a művelet során."+err);
            } else {
              res.send("Sikeres művelet!");
            }
          });
        })
      break;
    case "status":
      pool.query("UPDATE szamonkeresek_tanar SET Elindítva = ? WHERE id = ?", [req.body.Elinditva,req.body.id], function (err, result) {
        if (err) {
          res.send("Hiba történt a művelet során.");
        } else {
          res.send("Sikeres művelet!");
        }
      });
      break;
    case "diak":
      pool.query(
        'SELECT * FROM szamonkeresek_diak WHERE szamonkereskod = ?',
        [req.body.kod],
        (err, results) => {
          if (err) {
            res.send("Hiba történt a művelet során.");
          } else {
            const formattedResult = results.map(row => {
              if (row.Bekuldesido && typeof row.Bekuldesido === 'object') {
                const formattedDate = row.Bekuldesido.toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false, // 24 órás formátum
                });
                        return { ...row, Bekuldesido: formattedDate };
              } else {
                return row;
              }
            });
            res.json(formattedResult);
          }
        }
      );
      break;
    case "deletediak":
      pool.query("DELETE FROM szamonkeresek_diak WHERE id = ?", [req.body.id], function (err, result) {
        if (err) {
          res.send("Hiba történt a művelet során.");
        } else {
          res.send("Sikeres művelet!");
        }
      });
      break;
    default:
      res.send("Érvénytelen művelettípus.");
      break;
  }
});

module.exports = router