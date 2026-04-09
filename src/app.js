require('./logs/logger');
const express = require('express');
const connect = require('./dbConnect');
const path = require('path');
const app = express();
require('dotenv').config();
const flash = require("connect-flash");
const session = require('express-session');
const customMiddleware = require('./middleware/middleware');
const bodyParser = require('body-parser');
const ejsLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const runCrons = require('./crons/index');
const constantKey = require('./config/constant')
const cluster = require('cluster');


const cors = require('cors');
const corsOptions = {
    origin: process.env.APP_FRONTEND_URL,
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '200mb' }));

app.use('/', express.static(path.join(__dirname, '../public')));
/* For access Storage */
app.use('/public/storage', express.static(path.join(__dirname, '../public/storage')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(ejsLayouts);

const isProduction = process.env.APP_MODE === 'production';
let sessionStore;
if (isProduction) {
  const { createClient } = require('redis');
  const RedisStore = require('connect-redis').default;
  const redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: { reconnectStrategy: (retries) => Math.min(retries * 50, 500) }
  });
  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  redisClient.connect().catch(console.error);

  sessionStore = new RedisStore({ client: redisClient });
} else {
  sessionStore = new session.MemoryStore();
}

app.use(
    session({
        secret: process.env.SESSION_SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: isProduction,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        },
        store: sessionStore,
    })
);


app.use(flash());
app.use([customMiddleware.setFlash]);

/* Log Each Requests */
app.use((req, res, next) => {
  logInfo(`[Tracking  Route] - ${req.method} ${req.originalUrl}`);
  next();
});

app.use((err, req, res, next) => {
  logError('Global Error:', {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    error: err.stack || err
  });
  res.status(404).render('common/pages/page-500', { 
    layout: 'layouts/pageLayout', 
  });
});

// Unhandled Promise Rejections & Exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🔴 Uncaught Exception:', err);
});

/*  */

const { localization, interpolateMessage } = require('./utils/localization');

app.use((req, res, next) => {
  const defaultLang = 'en';
  const isApiRequest = req.path.startsWith('/api/');
  
  let lang;
  if (isApiRequest) {
    lang = req.headers['accept-language'] || req.cookies.preferredLang || defaultLang;
    req.session.lang = lang;
  } else {
    lang = req.session.lang || req.cookies.preferredLang || defaultLang;
    req.session.lang = lang;
  }

  res.locals.lang = lang;

  const localizationData = localization(lang);
  if (!localizationData) {
    console.error(`Localization data could not be loaded for language: ${lang}`);
    return res.status(500).json({ error: 'Localization data missing' });
  }

  req.trans = localizationData;
  req.t = (key, params = {}) => {
    const [category, messageKey] = key.split('.');
    const message = localizationData[category]?.[messageKey] || key;
    return interpolateMessage(message, params);
  };
  
  res.locals.trans = localizationData;
  res.locals.t = req.t;

  res.locals.companyInfo = constantKey.COMPANY_DETAILS;

  /* For template color */
  if (!req.session.mode) {
    req.session.mode = req.cookies.darkMode || 'light';
  }
  res.locals.darkMode = req.session.mode;

  res.locals.currentRoute = req.path;
  next();
});

const setRouteType = require('./middleware/setRouteType');
app.use(setRouteType);
app.use('/', require('./routes'));

app.get('/', function (req, res) {
  try {
    // res.send('Welcome');
    return res.redirect('/admin/login')
  } catch (error) {
    logError('Error rendering the home view:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.use((req, res) => {
  res.status(404).render('common/pages/page-404', { 
      layout: 'layouts/pageLayout', 
      message: 'Page not found. The resource you are looking for could not be found.' 
  });
});

if (cluster.isWorker) {
  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      console.log(`Worker ${process.pid} shutting down gracefully...`);
      process.exit();
    }
  });
}

connect().then(() => {
  console.log('Database connected successfully');
  
  /* Start Crons */
  runCrons();
  /* End Crons */
}).catch((err) => {
  logError('Error connecting to database:', err);
});

module.exports = { app, connect };