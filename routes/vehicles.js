var express = require("express");
var router = express.Router();
var Vehicle = require("../models/vehicle");
var middleware = require("../middleware");

// INDEX VEHICLE ROUTE
router.get("/", async (req, res) => {
  await Vehicle.find({}).then((allVehicles) => {
    res.render("vehicles/index", { vehicles: allVehicles });
  });
});

// CREATE VEHICLE ROUTE

router.post("/", middleware.isLoggedIn, async (req, res) => {
  //get data from form and add to vehicles array
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
  // Add new vehicle to database
  await Vehicle.create(newVehicle).then((err, newlyCreated) => {
    if (err) {
      console.log("Error");
    } else {
      res.redirect("/vehicles");
    }
  });
});

// NEW VEHICLE ROUTE

router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("vehicles/new");
});

// SEARCH VEHICLE ROUTE

router.get("/search", (req, res) => {
  res.render("vehicles/search");
});

// RESULTS VEHCILE ROUTE

router.post("/search", async (req, res) => {
  var query = {
    make: req.body.make,
    model: req.body.model,
    transmission: req.body.transmission,
    fuel_type: req.body.fuel_type,
  };

  await Vehicle.find(query, (err, searchedVehicle)).then(
    (err, searchedVehicle) => {
      if (err) {
        console.log(err);
      } else {
        if (!searchedVehicle.length) {
          req.flash("error", "Search criteria returned zero results");
          res.redirect("search");
        } else {
          res.render("vehicles/result", { vehicle: searchedVehicle });
        }
      }
    }
  );
});

// SHOW VEHICLE ROUTE

router.get("/:id", async (req, res) => {
  await Vehicle.findById(req.params.id)
    .populate("comments")
    .then((foundVehicle) => {
      res.render("vehicles/show", { vehicle: foundVehicle });
    });
});

//EDIT VEHICLE ROUTE

router.get("/:id/edit", middleware.checkVehicleOwnership, async (req, res) => {
  await Vehicle.findById(req.params.id).then((err, editVehicle) => {
    res.render("vehicles/edit", { vehicle: editVehicle });
  });
});

//UPDATE VEHICLE ROUTE

router.put("/:id", middleware.checkVehicleOwnership, async (req, res) => {
  // find and update the correct vehicle
  await Vehicle.findByIdAndUpdate(
    req.params.id,
    req.body.vehicle,
    (err, updatedVehicle) => {
      res.redirect("/vehicles/" + req.params.id);
    }
  );
});

// DESTROY VEHICLE ROUTE

router.delete("/:id", middleware.checkVehicleOwnership, async (req, res) => {
  await Vehicle.findByIdAndRemove(req.params.id, (err) => {
    res.redirect("/vehicles");
  });
});

module.exports = router;
