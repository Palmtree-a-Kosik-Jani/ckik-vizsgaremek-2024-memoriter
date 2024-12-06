const express = require('express');
const {Users, UserVerifyToken} = require('../../models/index'); 
const crypto = require('crypto');
const router = express.Router();
const sendVerificationToken = require('./verifytoken');

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

router.post('/login', async (req, res,next) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(401).send('Érvénytelen e-mail cím vagy jelszó');
    }
    if (user.hitelesitve == 0) {
      await sendVerificationToken.sendVerificationToken(email, crypto.randomBytes(32).toString('hex'))
      return res.status(401).send('Az e-mail cím nincs ellenőrizve');
    }
    if (user.userpassword === password) {
      const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
      res. cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 60 * 60 * 1000,
      });
      return res.status(200).json({permission_level : user.permission_level, email: user.email, xp : user.xp});
    } else {
      return res.status(401).send('Érvénytelen e-mail cím vagy jelszó');
    }
  } catch (error) {
    next(new Error('Váratlan hiba történt!'));
  }
});

module.exports = router;