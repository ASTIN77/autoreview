var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// Small helpers to keep everything in .then/.catch style
function login(req, user) {
  return new Promise(function (resolve, reject) {
    req.login(user, function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function logout(req) {
  return new Promise(function (resolve, reject) {
    req.logout(function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

// ROOT ROUTE
router.get("/", function (req, res) {
  res.render("landing");
});

// REGISTER FORM ROUTE
router.get("/register", function (req, res) {
  res.render("register");
});

// REGISTER CREATE ROUTE
router.post("/register", function (req, res) {
  var newUser = new User({ username: (req.body.username || "").trim() });

  User.register(newUser, req.body.password)
    .then(function (user) {
      return login(req, user).then(function () {
        req.flash(
          "success",
          "Welcome " + user.username + ". You have successfully registered!"
        );
        res.redirect("/vehicles");
      });
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", err && err.message ? err.message : "Registration failed.");
      res.redirect("/register");
    });
});

// LOGIN FORM ROUTE
router.get("/login", function (req, res) {
  res.render("login");
});

// LOGGING IN ROUTE
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/vehicles",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Successfully logged in!",
  })
);

// LOGOUT ROUTE
router.get("/logout", function (req, res) {
  logout(req)
    .then(function () {
      req.flash("success", "You are now logged out.");
      res.redirect("/vehicles");
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Logout failed.");
      res.redirect("/vehicles");
    });
});

module.exports = router;
