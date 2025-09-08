var express = require("express");
var router = express.Router({ mergeParams: true });
var Vehicle = require("../models/vehicle");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// NEW ROUTE
router.get("/new", middleware.isLoggedIn, function (req, res, next) {
  Vehicle.findById(req.params.id)
    .lean()
    .then(function (vehicle) {
      if (!vehicle) {
        req.flash("error", "Vehicle not found.");
        return res.redirect("/vehicles");
      }
      res.render("comments/new", { vehicle: vehicle });
    })
    .catch(function (err) {
      console.error(err);
      next(err);
    });
});

// CREATE ROUTE
router.post("/", middleware.isLoggedIn, function (req, res) {
  Vehicle.findById(req.params.id)
    .then(function (vehicle) {
      if (!vehicle) {
        req.flash("error", "Vehicle not found.");
        return res.redirect("/vehicles");
      }

      var payload = Object.assign({}, req.body.comment, {
        author: { id: req.user._id, username: req.user.username },
      });

      return Comment.create(payload).then(function (comment) {
        vehicle.comments.push(comment._id); // store ObjectId
        return vehicle.save().then(function () {
          req.flash("success", "Successfully added comment.");
          res.redirect("/vehicles/" + vehicle._id);
        });
      });
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Oops....something went wrong!");
      // keep original UX: go back for validation-ish errors; otherwise to /vehicles
      if (err && err.name === "ValidationError") return res.redirect("back");
      res.redirect("/vehicles");
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
  Comment.findById(req.params.comment_id)
    .then(function (foundComment) {
      if (!foundComment) {
        req.flash("error", "Oops....something went wrong!");
        return res.redirect("back");
      }
      // Provide both shapes so EJS can use `vehicle._id` or `vehicle_id`
      res.render("comments/edit", {
        vehicle: { _id: req.params.id },
        vehicle_id: req.params.id,
        comment: foundComment,
      });
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Oops....something went wrong!");
      res.redirect("back");
    });
});

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, {
    new: true,
    runValidators: true,
  })
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

// DESTROY COMMENT ROUTE (also pull ref from vehicle)
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
  var vid = req.params.id;
  var cid = req.params.comment_id;

  Comment.findByIdAndDelete(cid)
    .then(function () {
      return Vehicle.findByIdAndUpdate(vid, { $pull: { comments: cid } });
    })
    .then(function () {
      req.flash("success", "Comment successfully removed.");
      res.redirect("/vehicles/" + vid);
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Oops....something went wrong!");
      res.redirect("back");
    });
});

module.exports = router;
