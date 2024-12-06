const express = require('express');

const fs = require('fs');

const env = require('dotenv').config();

const https = require('https');

const app = require('./app');

const minify = require('./api/core/minify');

//minify()

//app.use(express.static('../public_minify'));

const options = {
  key: fs.readFileSync(__dirname +"/HTTPS_CERT/MemoriterCert.key"),
  cert: fs.readFileSync(__dirname +"/HTTPS_CERT/MemoriterCert.crt"),
};

const httpsServer = https.createServer(options, app);

const PORT = process.env.API_PORT;

function requireHTTPS(req, res, next) {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

app.use(requireHTTPS);

httpsServer.listen(PORT, function () {
  console.log(`Server running at ${PORT}`);
});