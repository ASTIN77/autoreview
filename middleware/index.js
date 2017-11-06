var middlewareObj = {};
var Vehicle = require("../models/vehicle");
var Comment = require("../models/comment");
middlewareObj.checkVehicleOwnership = function(req,res,next){
    if(req.isAuthenticated()){
            Vehicle.findById(req.params.id, function(err, foundVehicle){
        if(err){
                req.flash("error", "Vehicle not found!?!");
                res.redirect("back");
            } else {
                if(foundVehicle.author.id.equals(req.user._id)){
                        next();
                    } else {
                        req.flash("error", "You do not have permission to do that.");
                        res.redirect("back");
                    }
            }
            });

            } else {
                req.flash("error", "You need to be logged in to do that!");
                res.redirect("back");
            }
}

middlewareObj.checkCommentOwnership = function(req,res,next){
    if(req.isAuthenticated()){
            Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
                req.flash("error", "Comment not found!?!");
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id)){
                        next();
                    } else {
                        req.flash("error", "You do not have permission to do that.");
                        res.redirect("back");
                    }
            }
            });

            } else {
                req.flash("error", "You need to be logged in to do that!");
                res.redirect("back");
            }
}

middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
}


module.exports = middlewareObj