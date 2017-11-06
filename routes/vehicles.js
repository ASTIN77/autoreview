// INDEX route - show all campgrounds
var express=require("express");
var router = express.Router();
var Vehicle = require("../models/vehicle");
var middleware = require("../middleware");

// INDEX ROUTE
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

// CREATE ROUTE

router.post("/", middleware.isLoggedIn, function(req, res) {
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    
    var newVehicle = { name: name, image: image, description: desc, author: author, price: price };
    // Add new campground to database
    Vehicle.create(newVehicle, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/vehicles");
        }
    });

});

// NEW ROUTE

router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("vehicles/new.ejs");
});

// SHOW ROUTE

router.get("/:id", function(req, res) {
    Vehicle.findById(req.params.id).populate("comments").exec(function(err, foundVehicle) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("vehicles/show", { campground: foundVehicle });
        }
    });
});
//EDIT CAMPGROUND ROUTE

router.get("/:id/edit", middleware.checkVehicleOwnership, function(req,res){
            Vehicle.findById(req.params.id, function(err, foundVehicle){
                        res.render("campgrounds/edit", {campground: foundVehicle});
    });
});

//UPDATE CAMPGROUND ROUTE

router.put("/:id", middleware.checkVehicleOwnership, function(req,res){
   // find and update the correct campground
        Vehicle.findByIdAndUpdate(req.params.id, req.body.vehicle, function(err, updatedVehicle){
                res.redirect("/vehicles/" + req.params.id);
    });
});

// DESTROY CAMPGROUND ROUTE

router.delete("/:id", middleware.checkVehicleOwnership, function(req,res){
    Vehicle.findByIdAndRemove(req.params.id, function(err){
            res.redirect("/vehicles");
    });
});

module.exports = router;