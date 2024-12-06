const express = require('express');

const fs = require('fs');

const path = require('path');

const app = express();

const cookieParser = require('cookie-parser');

app.use(cookieParser()); 

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000,
	limit: 15,
  keyGenerator: (req) => req.ip,
  standardHeaders: true, 
	legacyHeaders: false,
});

const cors = require('cors');

const compression = require('compression');

const bodyParser = require('body-parser');

app.set('etag', false);

app.set('trust proxy', true);

app.use(cors());

app.use(express.json());

app.use(compression());

app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (
    req.path !== '/auth/login' &&
    req.path !== '/auth/register'
  )
  {
    return next();
  } else {
    limiter(req, res, next);
  }
});

var geoip = require('geoip-lite');
app.use((req, res, next) => {
    const currentDate = new Date().toISOString().split('T')[0];

    const logDir = path.join(__dirname, 'log');
    
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    const logFilePath = path.join(logDir, `${currentDate}.log`);

    const clientIp = req.ip;

    const logEntry = `[${new Date().toISOString()}]\n` +
                     `Method: ${req.method}\n` +
                     `URL: ${req.url}\n` +
                     `IP: ${clientIp}\n` +
                     `GEO: ${JSON.stringify(geoip.lookup(clientIp),null,2)}\n\n` +
                     `Body: ${JSON.stringify(req.body, null, 2)}\n\n`;

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to write log:', err);
        }
    });

    next();
});

//Database initialization
const {sequelize} = require('./api/models/index'); 

//Routes Auth
app.use('/auth/register', require('./api/routes/auth/register'));
app.use('/auth', require('./api/routes/auth/login'));

//Routes User Management
app.use('/user',require('./api/routes/db_mgnt/user_permissions'))

//Error handling middleware
app.use(require('./api/middleware/error_handling'));

module.exports = app