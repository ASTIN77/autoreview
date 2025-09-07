var express = require("express");
var router = express.Router({ mergeParams: true });
var Vehicle = require("../models/vehicle");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// NEW ROUTE
router.get("/new", middleware.isLoggedIn, function (req, res, next) {
  Vehicle.findById(req.params.id).lean().then(function (vehicle) {
    if (!vehicle) {
      req.flash("error", "Vehicle not found.");
      return res.redirect("/vehicles");
    }
    res.render("comments/new", { vehicle: vehicle });
  }).catch(function (err) {
    console.error(err);
    next(err);
  });
});

// CREATE ROUTE
router.post("/", middleware.isLoggedIn, function (req, res, next) {
  Vehicle.findById(req.params.id).then(function (vehicle) {
    if (!vehicle) {
      req.flash("error", "Vehicle not found.");
      return res.redirect("/vehicles");
    }
    return Comment.create(req.body.comment).then(function (comment) {
      // add username and id to comment
      if (req.user) {
        comment.author.id = req.user._id;
        comment.author.username = req.user.username;
      }
      return comment.save().then(function () {
        vehicle.comments.push(comment); // Mongoose will cast to ObjectId
        return vehicle.save();
      }).then(function () {
        req.flash("success", "Successfully added comment.");
        res.redirect("/vehicles/" + vehicle._id);
      });
    });
  }).catch(function (err) {
    console.error(err);
    // mirror original behavior
    if (err && err.name === "ValidationError") {
      req.flash("error", "Oops....something went wrong!");
      return res.redirect("back");
    }
    req.flash("error", "Oops....something went wrong!");
    res.redirect("/vehicles");
  });
});

// COMMENT EDIT ROUTE (replace your current one)
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res, next) {
  Comment.findById(req.params.comment_id)
    .then(function (foundComment) {
      if (!foundComment) {
        req.flash("error", "Oops....something went wrong!");
        return res.redirect("back");
      }
      // Provide BOTH shapes so any template variant works:
      res.render("comments/edit", {
        vehicle: { _id: req.params.id },  // lets EJS use `vehicle._id`
        vehicle_id: req.params.id,         // lets EJS use `vehicle_id`
        comment: foundComment
      });
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Oops....something went wrong!");
      res.redirect("back");
    });
});


// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res, next) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, { new: true, runValidators: true })
    .then(function () {
      req.flash("success", "Comment successfully updated!");
      res.redirect("/vehicles/" + req.params.id);
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Oops....something went wrong!");
      res.redirect("back");
    });
});

// DESTROY COMMENT ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res, next) {
  // `findByIdAndRemove` is deprecated; this is the same effect.
  Comment.findByIdAndDelete(req.params.comment_id)
    .then(function () {
      req.flash("success", "Comment successfully removed.");
      res.redirect("/vehicles/" + req.params.id);
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Oops....something went wrong!");
      res.redirect("back");
    });
});

module.exports = router;
