const express = require('express');

const router = express.Router();

const pool = require('./sqlconnect')

const authenticateUser = (req, res, next) => {
    pool.query(
      'SELECT * FROM users WHERE username = ? AND userpassword = ?',
      [req.body.username, req.body.password],
      (err, results) => {
        if (results.length == 1) {
            next();
        } else {
          res.status(401).send("Authentication required");
        }
      }
    );
  };
function generateRandomKey(length) {
    const characters = 'ABCDEFGHJKMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789';
    let randomKey = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomKey += characters.charAt(randomIndex);
    }

    return randomKey;
  }

router.post('/librolingofeladat', authenticateUser,(req, res) => {
    const feladatkod = generateRandomKey(25);
    switch (req.body.type) {
      case "0":
        pool.query(
          'SELECT * FROM versek '+(req.body.osztaly == "Érettségi" ? '':'WHERE Osztaly = ?')+'ORDER BY RAND() LIMIT 1',[req.body.osztaly],
          (err,r) =>{
            if(!err){
              const feladat = kiszed(r[0]); 
              createfeladat(req.body.username,feladatkod,feladat.Szavak,feladat.Szoveg);
              res.send({ Szoveg : feladat.Szoveg,Cim : r[0].Cim,Kod : feladatkod});
            }else{
              res.send(err);
            }
          }
        )
        break;
      case "1":
        pool.query(
          'SELECT * FROM librolingofeladatok ORDER BY RAND() LIMIT 1',
          (err,r) =>{
            if(!err){
              const rosszSzamok = r[0].rossz.split(';');

              const kivalasztottIndexek = [];

              while (kivalasztottIndexek.length < 2) {
                const randomIndex = Math.floor(Math.random() * rosszSzamok.length);
                if (!kivalasztottIndexek.includes(randomIndex)) {
                  kivalasztottIndexek.push(randomIndex);
                }
              }

              const kivalasztottRosszSzamok = kivalasztottIndexek.map(index => rosszSzamok[index]);

              const osszesLehetoseg = [...kivalasztottRosszSzamok, r[0].jo];

              const kevertLehetosegek = shuffle(osszesLehetoseg);

              createfeladat(req.body.username,feladatkod,r[0].jo,r[0].kerdes);

              res.send({kerdes : r[0].kerdes,opciok : kevertLehetosegek,Kod : feladatkod})
            }else{
              res.send(err);
            }
          }
        )
        break;
      default:
        res.send("Nincs ilyen feladat!");
        break;
    }
  });

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  function createfeladat(email,feladatkod,megoldas,feladat){
    pool.query('INSERT INTO librolingo (email,feladatkod,megoldas,feladat) VALUES(?,?,?,?)',[email,feladatkod,megoldas,feladat]);
  }

  function sort(arr, arr2, n) {
    var i, j, temp, swap;
    for (i = 0; i < n - 1; i++) {
        swap = false;
        for (j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                temp = arr2[j];
                arr2[j] = arr2[j + 1];
                arr2[j + 1] = temp;
                swap = true;
            }
        }
        if (swap == false) break;
    }
  }

  function kiszed(kivalasztott) {
    let szavakki = [];

    let rnds = [];

    let szavak = [];

    let db = 5;

    szavak = JSON.parse(JSON.stringify(kivalasztott.Szoveg).replace(/(?:\\[rn]|[\r\n]+)+/g, function (x) {
        return " " + x + " "
    })).split(' ');

    const maxKiszed = szavak.filter(x=> x.length <= 3 || x[0] == '\r' || x.includes("\\"));

    if (maxKiszed.length < db) {
        db = maxKiszed.length-5;
    }

    for (let index = 0; index < db; index++) {
        var rnd = Math.floor(Math.random() * szavak.length)

        while (szavak[rnd].length <= 3 || rnds.includes(rnd) || szavak[rnd][0] == '\r' || szavak[rnd].includes("\\")) {
            rnd = Math.floor(Math.random() * szavak.length)
        }

        rnds.push(rnd);

        szavakki.push(szavak[rnd].toLowerCase().replace(',', '').replace("'",'').replaceAll('.', '').replace(':', '').replace('!', '').replace('?', '').replace('\\','').replace(';', ''));
    }

    sort(rnds, szavakki, db);

    for (let index = 0; index < db; index++) {
        szavak[rnds[index]] = "<input class='inputdes szavak' type=text placeholder=" + (index + 1) + " id=" + index + " style='width:" + szavakki[index].length * 20 + "px !important'></input>";
    }

    return {Szoveg : szavak.join(' ').toString(),Szavak : szavakki.join(';').toString()};
  }
  
router.post('/librolingofeladatellenorzes', authenticateUser,(req, res) => {
    pool.query(
      'SELECT * FROM librolingo WHERE email = ? AND feladatkod = ?',[req.body.username,req.body.kod],
      (err,r) =>{
        if (r[0].Megoldva == 0) {     
          let helyes = 0;

          if (req.body.megoldas == r[0].megoldas) {
            res.json({popup : "Ezt a feladatot megoldottad sikeresen!"});

            if(req.body.osztalyozo == 0){
              xpincrease(req.body.username);
            }

            helyes = 1;
          }else {
            if(req.body.osztalyozo == 0){
              xpdecrease(req.body.username);
            }
              res.json({popup : "Feladat megoldása sikertelen!",megoldas :  r[0].megoldas});
          }      
          feladatlezaras(helyes,req.body.megoldas,req.body.kod,req.body.username);
        }else{
          res.json({popup : "Feladatot már megoldottad! :) Szép probálkozás!"})
        }
      }
    )
});
  
function feladatlezaras(helyes,bekuldott,kod,email){
  pool.query('UPDATE librolingo SET bekuldott = ?,Megoldva = 1,Helyes = ? WHERE feladatkod = ? AND email = ?',[bekuldott,helyes,kod,email]);
}

function xpincrease(username){
  pool.query('UPDATE usersdata SET xp = xp + 1 WHERE nev = ?',[username]);
}

function xpdecrease(username){
  pool.query('UPDATE usersdata SET xp = CASE WHEN xp NOT IN (0, 25, 50, 75, 100) THEN xp - 1  ELSE xp END WHERE nev = ?', [username]);
}
  
  
  
  router.get('/leaderboard',(req,res)=>{
    pool.query(
      'SELECT nev,xp FROM usersdata ORDER BY xp DESC limit 10',(e,r)=>{
        res.json(r);
      });
  });
  
module.exports = router