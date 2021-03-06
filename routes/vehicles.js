var express=require("express");
var router = express.Router();
var Vehicle = require("../models/vehicle");
var middleware = require("../middleware");

// INDEX VEHICLE ROUTE
router.get("/", function(req, res) {
    Vehicle.find({}, function(err, allVehicles) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("vehicles/index", {vehicles: allVehicles});
        }
    });
});

// CREATE VEHICLE ROUTE

router.post("/", middleware.isLoggedIn, function(req, res) {
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
        username: req.user.username
    }
    
    var newVehicle = { make: make, model: model, transmission: transmission, fuel_type: fuel_type, image: image, description: desc, author: author, price: price };
    // Add new vehicle to database
    Vehicle.create(newVehicle, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/vehicles");
        }
    });

});

// NEW VEHICLE ROUTE

router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("vehicles/new");
});

// SEARCH VEHICLE ROUTE

router.get("/search", function(req, res) {
    res.render("vehicles/search");
});

// RESULTS VEHCILE ROUTE

router.post ("/search", function(req,res) {
    var query = {'make': req.body.make, 'model': req.body.model, 
                   'transmission': req.body.transmission,
                    'fuel_type': req.body.fuel_type};

    Vehicle.find(query, function(err, searchedVehicle) {
        if (err) {
            console.log(err);
        } else {
            if (!searchedVehicle.length){
                req.flash("error", "Search criteria returned zero results");
                res.redirect("search");
        } else {
            console.log(searchedVehicle);
            }
            }
            console.log(searchedVehicle.length);
            res.render("vehicles/result", {vehicle:searchedVehicle});  
        });

    });

// SHOW VEHICLE ROUTE

router.get("/:id", function(req, res) {
    Vehicle.findById(req.params.id).populate("comments").exec(function(err, foundVehicle) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("vehicles/show", { vehicle: foundVehicle });
        }
    });
});

//EDIT VEHICLE ROUTE

router.get("/:id/edit", middleware.checkVehicleOwnership, function(req,res){
            Vehicle.findById(req.params.id, function(err, foundVehicle){
                        res.render("vehicles/edit", {vehicle: foundVehicle});
    });
});

//UPDATE VEHICLE ROUTE

router.put("/:id", middleware.checkVehicleOwnership, function(req,res){
   // find and update the correct vehicle
        Vehicle.findByIdAndUpdate(req.params.id, req.body.vehicle, function(err, updatedVehicle){
                res.redirect("/vehicles/" + req.params.id);
    });
});

// DESTROY VEHICLE ROUTE

router.delete("/:id", middleware.checkVehicleOwnership, function(req,res){
    Vehicle.findByIdAndRemove(req.params.id, function(err){
            res.redirect("/vehicles");
    });
});

module.exports = router;