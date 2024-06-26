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
  indexRoutes = require("./routes/index"),
  dotenv = require("dotenv");

dotenv.config();
mongoose.Promise = global.Promise;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.set("port", process.env.PORT || 3001);
app.set("views", __dirname + "/views");
// Updated connection details
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

const connectDB = async () => {
  try {
    const conn = mongoose.connect(process.env.AUTOREVIEWDATABASEURL);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen("3001", function () {
    console.log("Successfully listening on " + app.get("port"));
  });
});
