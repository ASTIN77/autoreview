const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  User = require("./models/user"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  flash = require("connect-flash"),
  commentsRoutes = require("./routes/comments"),
  vehiclesRoutes = require("./routes/vehicles"),
  indexRoutes = require("./routes/index");
mongoose.Promise = global.Promise;

require("dotenv").config();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.set("port", process.env.PORT || 3000);
// Updated connection details
mongoose.connect(process.env.AUTOREVIEWDATABASEURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// SeedDB();
// PASSPORT CONFIG
app.use(
  require("express-session")({
    secret: "TheRealMcCoyCheddarAndOnion",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.confirm = req.flash("confirm");
  next();
});
app.use(indexRoutes);
app.use("/vehicles", vehiclesRoutes);
app.use("/vehicles/:id/comments", commentsRoutes);

app.listen(app.get("port"), process.env.IP, function () {
  console.log("Application Server Running on PORT " + app.get("port"));
});
