const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const {Users} = require('../models/index'); 

function authenticate(requiredPermissionLevel) {
    return function(req, res, next) {
      const token = req.cookies['token'];
  
      if (!token) return res.status(401).send('Hitelesítési hiba: Token nem található');
  
      jwt.verify(token, SECRET_KEY, function(err, decoded) {
        if (err) {
          return res.status(403).send('Hozzáférés megtagadva!');
        }
  
        const email = decoded.email;
        Users.sync().then(function() {
          Users.findOne({ where: { email } }).then(function(user) {
            if (!user) {
              return res.status(403).send('Hozzáférés megtagadva!');
            }
  
            if (user.permission_level < requiredPermissionLevel) {
              return res.status(403).send('Hozzáférés megtagadva!');
            }
  
            req.user = user;
            next();
          }).catch(function(err) {
            return res.status(403).send('Hozzáférés megtagadva!');
          });
        }).catch(function(err) {
          return res.status(403).send('Hozzáférés megtagadva!');
        });
      });
    };
  }
  
module.exports = authenticate;