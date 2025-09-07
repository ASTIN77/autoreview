var middlewareObj = {};
var Vehicle = require("../models/vehicle");
var Comment = require("../models/comment");

middlewareObj.checkVehicleOwnership = function (req, res, next) {
  if (!(req.isAuthenticated && req.isAuthenticated())) {
    req.flash("error", "You need to be logged in to do that!");
    return res.redirect("back");
  }

  Vehicle.findById(req.params.id)
    .then(function (foundVehicle) {
      if (!foundVehicle) {
        req.flash("error", "Vehicle not found!?!");
        return res.redirect("back");
      }

      // mirror original equality check, with a safe fallback
      var owns =
        foundVehicle.author &&
        foundVehicle.author.id &&
        (typeof foundVehicle.author.id.equals === "function"
          ? foundVehicle.author.id.equals(req.user._id)
          : String(foundVehicle.author.id) === String(req.user._id));

      if (owns) return next();

      req.flash("error", "You do not have permission to do that.");
      res.redirect("back");
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Vehicle not found!?!");
      res.redirect("back");
    });
};

middlewareObj.checkCommentOwnership = function (req, res, next) {
  if (!(req.isAuthenticated && req.isAuthenticated())) {
    req.flash("error", "You need to be logged in to do that!");
    return res.redirect("back");
  }

  Comment.findById(req.params.comment_id)
    .then(function (foundComment) {
      if (!foundComment) {
        req.flash("error", "Comment not found!?!");
        return res.redirect("back");
      }

      var owns =
        foundComment.author &&
        foundComment.author.id &&
        (typeof foundComment.author.id.equals === "function"
          ? foundComment.author.id.equals(req.user._id)
          : String(foundComment.author.id) === String(req.user._id));

      if (owns) return next();

      req.flash("error", "You do not have permission to do that.");
      res.redirect("back");
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Comment not found!?!");
      res.redirect("back");
    });
};

middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that!");
  res.redirect("/login");
};

module.exports = middlewareObj;
