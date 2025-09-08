var express = require("express");
var router = express.Router();
var Vehicle = require("../models/vehicle");
var Comment = require("../models/comment"); // needed for cascade delete
var middleware = require("../middleware");

// INDEX VEHICLE ROUTE
router.get("/", function (req, res, next) {
  Vehicle.find({})
    .then(function (allVehicles) {
      res.render("vehicles/index", { vehicles: allVehicles });
    })
    .catch(next);
});

// CREATE VEHICLE ROUTE
router.post("/", middleware.isLoggedIn, function (req, res) {
  var make = req.body.make;
  var model = req.body.model;
  var transmission = req.body.transmission;
  var fuel_type = req.body.fuel_type;
  var price = req.body.price;
  var image = req.body.image;
  var desc = req.body.description;

  var author = {
    id: req.user._id,
    username: req.user.username,
  };

  var newVehicle = {
    make: make,
    model: model,
    transmission: transmission,
    fuel_type: fuel_type,
    image: image,
    description: desc,
    author: author,
    price: price,
  };

  Vehicle.create(newVehicle)
    .then(function () {
      res.redirect("/vehicles");
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Oops....something went wrong!");
      res.redirect("back");
    });
});

// NEW VEHICLE ROUTE
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("vehicles/new");
});

// SEARCH VEHICLE ROUTE (form)
router.get("/search", function (req, res) {
  res.render("vehicles/search");
});

// RESULTS VEHICLE ROUTE (search submit)
router.post("/search", function (req, res) {
  // Build query from provided fields; drop empties to avoid over-filtering
  var query = {
    make: req.body.make,
    model: req.body.model,
    transmission: req.body.transmission,
    fuel_type: req.body.fuel_type,
  };

  Object.keys(query).forEach(function (k) {
    if (query[k] === undefined || query[k] === null || query[k] === "") {
      delete query[k];
    }
  });

  Vehicle.find(query)
    .then(function (searchedVehicle) {
      if (!searchedVehicle || searchedVehicle.length === 0) {
        req.flash("error", "Search criteria returned zero results");
        return res.redirect("search");
      }
      res.render("vehicles/result", { vehicle: searchedVehicle });
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Oops....something went wrong!");
      res.redirect("back");
    });
});

// SHOW VEHICLE ROUTE
router.get("/:id", function (req, res, next) {
  Vehicle.findById(req.params.id)
    .populate("comments")
    .then(function (foundVehicle) {
      if (!foundVehicle) {
        req.flash("error", "Vehicle not found!?!");
        return res.redirect("/vehicles");
      }
      res.render("vehicles/show", { vehicle: foundVehicle });
    })
    .catch(next);
});

// EDIT VEHICLE ROUTE
router.get("/:id/edit", middleware.checkVehicleOwnership, function (req, res) {
  Vehicle.findById(req.params.id)
    .then(function (editVehicle) {
      if (!editVehicle) {
        req.flash("error", "Vehicle not found!?!");
        return res.redirect("back");
      }
      res.render("vehicles/edit", { vehicle: editVehicle });
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Oops....something went wrong!");
      res.redirect("back");
    });
});

// UPDATE VEHICLE ROUTE
router.put("/:id", middleware.checkVehicleOwnership, function (req, res) {
  Vehicle.findByIdAndUpdate(req.params.id, req.body.vehicle, {
    new: true,
    runValidators: true,
  })
    .then(function () {
      res.redirect("/vehicles/" + req.params.id);
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Oops....something went wrong!");
      res.redirect("back");
    });
});

// DESTROY VEHICLE ROUTE (with comment cleanup)
router.delete("/:id", middleware.checkVehicleOwnership, function (req, res) {
  var id = req.params.id;

  Vehicle.findByIdAndDelete(id)
    .then(function (deletedVehicle) {
      if (!deletedVehicle) {
        req.flash("error", "Vehicle not found!?!");
        return res.redirect("/vehicles");
      }

      var ids = (deletedVehicle.comments || []).map(function (c) {
        return String(c);
      });

      if (ids.length === 0) {
        return; // nothing to clean
      }
      return Comment.deleteMany({ _id: { $in: ids } });
    })
    .then(function () {
      res.redirect("/vehicles");
    })
    .catch(function (err) {
      console.error(err);
      req.flash("error", "Oops....something went wrong!");
      res.redirect("back");
    });
});

module.exports = router;
