// --- AutoReview (Node 22 + Mongoose 8 friendly) ---

// ---- kill util.isArray deprecation (DEP0044) globally ----
const util = require("util");
try {
  // replace the deprecated function before any other module loads
  Object.defineProperty(util, "isArray", {
    value: Array.isArray,
    writable: true,
    configurable: true,
    enumerable: false
  });
} catch (_) {
  // ignore if something froze util (rare)
}
// ----------------------------------------------------------


// 1) Load env first
require('dotenv').config();

// 2) Core deps
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');

// 3) Auth/session deps
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// 4) App deps / routes / models
const User = require('./models/user');
const commentsRoutes = require('./routes/comments');
const vehiclesRoutes = require('./routes/vehicles');
const indexRoutes = require('./routes/index');

// 5) Utilities & middleware
const methodOverride = require('method-override');
const flash = require('connect-flash');

// --- Express basics ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use express' built-in body parser
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Respect PORT from env; fall back to 3001
const PORT = Number(process.env.PORT) || 3001;
app.set('port', PORT);

// --- Mongo connection (Mongoose 8 style) ---
const MONGO_URI =
  process.env.AUTOREVIEWDATABASEURL;

if (!MONGO_URI) {
  throw new Error(
    'Failure to connect to MongoDB URI'
  );
}

async function connectDB() {
  // No legacy options needed in Mongoose 8
  await mongoose.connect(MONGO_URI);
  console.log('✅ Mongo connected');
}

// --- Session store (production-grade, not MemoryStore) ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'IrnBru32Phenomonal',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      // Behind Cloudflare/NGINX the hop to Node is HTTP; leave secure=false.
      // If you terminate TLS directly in Node, flip this to true.
      secure: false,
    },
  })
);

// --- Passport setup ---
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// --- Template globals ---
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.confirm = req.flash('confirm');
  next();
});

// --- Routes ---
app.use(indexRoutes);
app.use('/vehicles', vehiclesRoutes);
app.use('/vehicles/:id/comments', commentsRoutes);

// --- Boot ---
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 AutoReview listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Mongo connection error:', err);
    process.exit(1);
  });
